import { GoogleGenerativeAI } from "@google/generative-ai";
import { log_interaction_data, request_sales_callback } from './geminiTools';
import * as fs from 'fs';
import * as path from 'path';

// --- WCZYTYWANIE BAZY WIEDZY (Node.js Safe) ---
let ragText = "";
try {
    // Ścieżka do pliku w kontenerze Docker (/app/src/data/...)
    // Używamy process.cwd() aby być niezależnym od miejsca wywołania
    const filePath = path.join(process.cwd(), 'src', 'data', 'baza_wiedzy_mdm.txt');
    ragText = fs.readFileSync(filePath, 'utf-8');
} catch (error) {
    console.error("BŁĄD: Nie udało się wczytać bazy wiedzy!", error);
    ragText = "Brak bazy wiedzy. Proszę o kontakt z administratorem.";
}

const API_KEY = process.env.GEMINI_API_KEY || "";

export const processUserMessage = async (userMessage: string): Promise<string> => {
    if (!API_KEY || API_KEY.includes("TU_WPISZ")) {
        console.error("Brak klucza API Gemini!");
        return "Przepraszam, wystąpił błąd konfiguracji systemu (brak API Key).";
    }

    try {
        // Używamy modelu PRO dla lepszej analizy tekstu
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
        Jesteś Wirtualnym Pomocnikiem Klienta MDM Energy.
        Odpowiadasz WYŁĄCZNIE na podstawie poniższej Bazy Wiedzy.

        --- BAZA WIEDZY ---
        ${ragText}
        --- KONIEC BAZY ---

        ZASADY:
        1. **Ceny:** Jeśli są w bazie, podaj je jako "orientacyjne". Jeśli nie ma - nie zmyślaj.
           DODAJ: "To cena szacunkowa. Dokładna wycena: [Formularz Wyceny](https://forms.gle/cUXUqb9E51UHf6vU8)".
        2. **Linki:** Używaj Markdown: [Tekst](URL) i [Email](mailto:...).
        3. **Styl:** Konkretny, polski język.
        4. **Eskalacja:** Jeśli klient chce "człowieka", podaj telefon i email.

        PYTANIE: "${userMessage}"
        `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        log_interaction_data('AI_RESPONSE_GENERATED', `Query: ${userMessage}`);
        return response;

    } catch (error) {
        console.error("Błąd Gemini:", error);
        return "Mam chwilowy problem z połączeniem. Proszę o maila: [prefab@mdmenergy.pl](mailto:prefab@mdmenergy.pl)";
    }
};