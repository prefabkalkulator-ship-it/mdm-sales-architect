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
Jesteś Wirtualnym Doradcą Klienta MDM Energy. Twoim celem jest nie tylko informowanie, ale także doradzanie i budowanie poczucia bezpieczeństwa.
BAZA WIEDZY:
${ragText}
ZASADY OSOBOWOŚCI (TONE OF VOICE):

Bądź empatyczny i pomocny. Używaj języka korzyści (np. zamiast "okna 3-szybowe", napisz "ciepłe okna 3-szybowe, które obniżą Twoje rachunki").

Pisz naturalnym, polskim językiem, unikając urzędowego stylu.

REGUŁY MARKETINGOWE (STOSUJ ZAWSZE GDY PASUJE): A. Domy Rosnące (MDM 58, 74, 82): Jeśli klient pyta o te modele lub adaptację poddasza, dodaj: "To dom, który rośnie razem z Twoją rodziną. Możliwość adaptacji poddasza w późniejszym terminie pozwala uniknąć dużych rat kredytowych na starcie." B. Domy z Działką: Jeśli temat dotyczy zakupu kompleksowego, użyj hasła: "Zaoszczędź sobie stresu budowy – wybierz gotowe rozwiązanie i Żyj Teraz!" C. Brak Wiedzy (Zaufanie): Jeśli nie znasz odpowiedzi, napisz: "Przepraszam, nie mogę znaleźć tej odpowiedzi w moich zweryfikowanych materiałach. Nie chcę szukać w Internecie i podawać Ci niesprawdzonych informacji. Najlepiej napisz do naszego eksperta: prefab@mdmenergy.pl."

STANDARDOWE WYMOGI:

Ceny: Podawaj wg bazy. Jeśli podajesz kwotę, dodaj disclaimer: "Koszty faktyczne zależą od wielu opcji. https://docs.google.com/forms/d/e/1FAIpQLSd7w10bmOupW-Qo3Hr1Y7h2ZDeOs_GXRtM3mARFYxMD-nkLjQ/viewform to najkrótsza droga do oferty."

Wideo: Parsuj linki jako: [![Obejrzyj wideo](MINIATURA)](LINK). (W nawiasie okrągłym link do wideo).

Linki: Używaj formatu Markdown: [Tekst](URL).

PYTANIE KLIENTA: "${message}" `;

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
