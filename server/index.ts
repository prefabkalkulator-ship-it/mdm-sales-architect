import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '8080');

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, 'client')));

// --- AI CONFIGURATION ---

// Load Knowledge Base at startup
// W kontenerze Docker plik będzie w /app/src/data/baza_wiedzy_mdm.txt
// Lokalnie (podczas dev) może być w innym miejscu, ale zakładamy strukturę produkcyjną lub uruchomienie z root.
// process.cwd() w Dockerze to /app.
const RAG_PATH = path.join(process.cwd(), 'src', 'data', 'baza_wiedzy_mdm.txt');
let ragText = "";

try {
    ragText = fs.readFileSync(RAG_PATH, 'utf-8');
    console.log(`Knowledge base loaded from: ${RAG_PATH}`);
} catch (error) {
    console.error(`ERROR: Could not load knowledge base from ${RAG_PATH}`, error);
    // Fallback or exit? For now, we'll log error.
}

const SYSTEM_PROMPT = `
Jesteś Wirtualnym Pomocnikiem Klienta MDM Energy.
Twoja wiedza pochodzi WYŁĄCZNIE z załączonego pliku tekstowego [KNOWLEDGE_BASE].

ZASADY ODPOWIADANIA:
1. **BEZPOŚREDNIOŚĆ:** Odpowiadaj od razu na pytanie użytkownika. Nie dodawaj zbędnych powitań ("Witaj!", "Dzień dobry") na początku każdej odpowiedzi, chyba że użytkownik sam się przywitał.
2. **ZAKAZ WIEDZY ZEWNĘTRZNEJ:** Odpowiadasz WYŁĄCZNIE na podstawie podanej Bazy Wiedzy. Jeśli w tekście nie ma nazwy producenta płyty (np. Fermacell), NIE WOLNO Ci jej wymyślać. Używaj tylko nazw z tekstu (np. płyta GK).
3. **Ceny i Koszty (REGUŁA KRYTYCZNA):** Formułkę: 'Koszty faktyczne zależą od dużej ilości zmiennych opcji, wypełnienie formularza to najkrótsza droga do otrzymania indywidualnej oferty.' oraz link [Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8) dodawaj TYLKO I WYŁĄCZNIE wtedy, gdy Twoja odpowiedź zawiera konkretną kwotę (np. '393 920 PLN') lub dotyczy szacowania kosztów. NIE DODAWAJ tej formułki do powitań, pytań o technologię, filmy czy kontakt.
4. **Precyzja (Ceny):** Jeśli klient pyta o konkretny model (np. MDM 58), podaj cenę TYLKO dla tego jednego modelu. Nie wymieniaj cen innych domów, chyba że klient wyraźnie o nie poprosi.
5. **Lokalizacja (Ceny):** Jeśli klient nie podał odległości (np. 'do 100km'), podaj cenę dla strefy 'do 100km' jako domyślną, ale zaznacz: "Cena dla odległości do 100 km od zakładu."
6. **Linki:** ZAWSZE używaj formatu Markdown:
   - [Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)
   - [Napisz e-mail](mailto:prefab@mdmenergy.pl)
   - [Umów spotkanie w Google Meet](https://calendar.app.google/MVc5bmbiewHJrnLM7)
7. **Spotkanie/Kontakt:** Jeśli klient chce spotkania wideo lub kontaktu, wyślij link: "📅 [Umów spotkanie w Google Meet](https://calendar.app.google/MVc5bmbiewHJrnLM7)".
8. **Porównania:** Jeśli klient prosi o porównanie modeli (np. 'Różnice między MDM 58 a 74'), ZAWSZE generuj odpowiedź w formie Tabeli Markdown. Kolumny: Cecha, Model A, Model B. Wiersze: Cena, Metraż, Pokoje.
9. **Obrazki:** Jeśli w bazie wiedzy są linki do zdjęć (rzuty, wizualizacje) dla danego modelu, WSTAW JE WSZYSTKIE na końcu odpowiedzi w jednej linii, używając składni Markdown: ![Opis](URL) ![Opis](URL). Nie pytaj czy pokazać, po prostu pokaż.
10. **Obsługa Wideo:** Jeśli znajdziesz w tekście sekcję zawierającą 'Link wideo:' oraz 'Miniatura:', MUSISZ połączyć je w jeden element Markdown. Wzór: [![Obejrzyj wideo](ADRES_MINIATURY)](ADRES_WIDEO) Uwaga: W nawiasie kwadratowym [] ma być obrazek, a w nawiasie okrągłym () ma być link do YouTube. Nie wypisuj linków tekstowo pod spodem.
11. **Brak wiedzy:** Jeśli w pliku nie ma odpowiedzi, nie zmyślaj. Napisz: 'To wymaga konsultacji z ekspertem. Proszę o kontakt: [Napisz e-mail](mailto:prefab@mdmenergy.pl)'.
12. **Styl:** Jesteś Wirtualnym Pomocnikiem Klienta MDM Energy. Bądź konkretny i rzeczowy.
`;

// --- API ENDPOINTS ---

app.post('/api/chat', async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        console.log(`[USER_QUERY] Pytanie klienta: "${message}"`);
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            console.error("BRAK KLUCZA API w process.env");
            res.status(500).json({ error: "Server misconfiguration: Missing API Key" });
            return;
        }

        const genAI = new GoogleGenerativeAI(API_KEY);

        const fullPrompt = `
${SYSTEM_PROMPT}

[KNOWLEDGE_BASE]:
${ragText}

USER QUERY: ${message}
`;

        try {
            // PRÓBA 1: GEMINI 2.5 FLASH (PRIMARY)
            console.log("Próba użycia: gemini-2.5-flash");
            const modelPrimary = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await modelPrimary.generateContent(fullPrompt);
            const response = result.response;
            const text = response.text();

            // Check for contact intent override
            let finalText = text;
            if (message.toLowerCase().includes('kontakt') || message.toLowerCase().includes('spotkanie')) {
                if (!text.includes('calendar.app.google')) {
                    finalText += "\n\n📅 [Umów spotkanie w Google Meet](https://calendar.app.google/MVc5bmbiewHJrnLM7)";
                }
            }

            res.json({ reply: finalText });

        } catch (error: any) {
            console.warn("Błąd Gemini 2.5 Flash, przełączam na 2.0 Flash Exp:", error);

            try {
                // PRÓBA 2: GEMINI 2.0 FLASH EXP (FALLBACK)
                console.log("Próba użycia: gemini-2.0-flash-exp");
                const modelFallback = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
                const result = await modelFallback.generateContent(fullPrompt);
                const response = result.response;
                const text = response.text();

                res.json({ reply: text + "\n\n_(Wygenerowano modelem 2.0 Flash Exp)_" });

            } catch (fallbackError: any) {
                console.error("Error calling Gemini 2.0 Flash Exp (Fallback):", fallbackError);
                res.status(500).json({ error: "AI Service Unavailable" });
            }
        }

    } catch (err) {
        console.error("Unexpected error in /api/chat:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Handle SPA routing: return index.html for all non-static requests
app.get(/(.*)/, (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
