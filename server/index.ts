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



// --- API ENDPOINTS ---

app.post('/api/chat', async (req: Request, res: Response) => {
    try {
        const { message, history } = req.body;
        console.log(`[USER_QUERY] Pytanie klienta: "${message}"`);
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            console.error("BRAK KLUCZA API w process.env");
            res.status(500).json({ error: "Server misconfiguration: Missing API Key" });
            return;
        }

        const genAI = new GoogleGenerativeAI(API_KEY);

        // Format history (last 10 messages)
        let formattedHistory = "";
        if (history && Array.isArray(history)) {
            formattedHistory = history.slice(-10).map((msg: any) => {
                const role = msg.role === 'user' ? 'User' : 'Model';
                return `${role}: ${msg.content}`;
            }).join('\n');
        }

        const fullPrompt = `
Jesteś Wirtualnym Doradcą Klienta MDM Energy.
BAZA WIEDZY:
${ragText}
ZASADY KOMUNIKACJI (MOBILE FIRST):
1. **BEZWZGLĘDNY ZAKAZ POWITAŃ:** Jeśli to nie jest pierwsza wiadomość w sesji, NIE WOLNO Ci pisać "Witaj", "Dzień dobry", "Cieszę się", "Jako Wirtualny Doradca".
   * Przechodź do odpowiedzi natychmiast. Traktuj to jak czat SMS z kolegą - konkret.
2. **ZASADA STRESZCZENIA:**
   * Twoja odpowiedź NIE MOŻE być dłuższa niż ekran telefonu (max 3-4 zdania merytoryczne).
   * Jeśli temat jest szeroki (np. "opisz technologię"), podaj tylko najważniejszy fakt (np. "Budujemy w szkielecie drewnianym KVH C24 z gwarancją na 30 lat.") i zapytaj: "Chcesz wiedzieć więcej o izolacji, czy o grubości ścian?"
3. **INTERAKCJA ZAMIAST WYKŁADU:**
   * Nie wyrzucaj wszystkich informacji naraz.
   * Zawsze kończ wypowiedź pytaniem zwrotnym lub propozycją wyboru (A czy B?).
4. **WYJĄTKI (KIEDY MOŻNA PISAĆ WIĘCEJ):**
   * Tylko wtedy, gdy klient wyraźnie poprosi: "podaj szczegóły", "opisz dokładnie", "więcej info".

TWOJE ZADANIA I FORMATOWANIE (CRITICAL RULES):

PORÓWNANIA = TABELA: Jeśli klient pyta o różnice między modelami (np. "porównaj MDM 58 i 74"), MUSISZ wygenerować odpowiedź w formie TABELI MARKDOWN. | Cecha | Model A | Model B | |-------|---------|---------| | Cena | ... | ... |

GALERIA ZDJĘĆ: Jeśli w bazie są linki do zdjęć/rzutów, wypisz je WSZYSTKIE używając składni obrazkowej: ![Opis](URL) ZAKAZ: Nie używaj składni linku [Opis](URL) dla obrazków. Musi być wykrzyknik ! na początku.

WIDEO: Linki do wideo parsuj tak: [![Obejrzyj wideo](MINIATURA)](LINK).

BEZPIECZEŃSTWO CENOWE (CRITICAL):
   * **ZAKAZ:** Nigdy nie podawaj ceny jako ostatecznej (np. "Cena wynosi 300 000 zł").
   * **NAKAZ:** ZAWSZE poprzedzaj kwotę słowami: *"około"*, *"szacunkowo"*, *"zaczyna się od"* lub *"orientacyjnie"*.
   * **PRZYKŁAD:** Zamiast "Koszt to 200 tys.", napisz "Szacunkowy koszt zaczyna się od ok. 200 tys. zł".
   * **DISCLAIMER:** Po podaniu kwoty dodaj obowiązkowo:
     _"Koszty faktyczne zależą od wielu zmiennych. [👉 Wypełnij Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8), aby otrzymać ofertę."_
     *(Oraz dodaj sugestię: "Sprawdź też odległość od fabryki klikając ikonę lokalizacji (zieloną pinezkę) w pasku na dole").*

STYL: Bądź pomocny, używaj języka korzyści (marketingowego), ale trzymaj się faktów z bazy.

HISTORIA ROZMOWY:
${formattedHistory}

AKTUALNE PYTANIE: "${message}" `;

        try {
            // PRÓBA 1: GEMINI 2.5 FLASH (PRIMARY)
            console.log("Próba użycia: gemini-2.5-flash");
            const modelPrimary = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await modelPrimary.generateContent(fullPrompt);
            const response = result.response;
            let text = response.text();

            // 🛡️ LINK SAFETY PATCH:
            const CORRECT_FORM_URL = "https://forms.gle/cUXUqb9E51UHf6vU8";
            text = text.replace(/https:\/\/forms\.gle\/[a-zA-Z0-9]+/g, CORRECT_FORM_URL);

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
                let text = response.text();

                // 🛡️ LINK SAFETY PATCH (Fallback):
                const CORRECT_FORM_URL = "https://forms.gle/cUXUqb9E51UHf6vU8";
                text = text.replace(/https:\/\/forms\.gle\/[a-zA-Z0-9]+/g, CORRECT_FORM_URL);

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
