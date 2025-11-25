import { GoogleGenerativeAI } from "@google/generative-ai";
import { log_interaction_data, request_sales_callback } from './geminiTools';
import * as fs from 'fs';
import * as path from 'path';

// --- WCZYTYWANIE BAZY WIEDZY (Metoda bezpieczna dla Node.js) ---
let ragText = "";
try {
    // W kontenerze Docker plik ląduje w /app/src/data/...
    // Używamy process.cwd() aby znaleźć ścieżkę względną w kontenerze
    const filePath = path.join(process.cwd(), 'src', 'data', 'baza_wiedzy_mdm.txt');
    ragText = fs.readFileSync(filePath, 'utf-8');
} catch (error) {
    console.error("BŁĄD KRYTYCZNY: Nie udało się wczytać pliku bazy wiedzy!", error);
    ragText = "Przepraszam, baza wiedzy jest chwilowo niedostępna. Proszę o kontakt telefoniczny.";
}

const API_KEY = process.env.GEMINI_API_KEY || "";

export const processUserMessage = async (userMessage: string): Promise<string> => {
    // 1. Weryfikacja klucza
    if (!API_KEY || API_KEY.includes("TU_WPISZ")) {
        console.error("Brak klucza API Gemini!");
        return "Przepraszam, wystąpił błąd konfiguracji systemu. Proszę o kontakt telefoniczny.";
    }

    try {
        // 2. Inicjalizacja Gemini 1.5 Pro (Najlepszy do analizy tekstu)
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // 3. Konstrukcja Promptu
        const prompt = `
        Jesteś Wirtualnym Pomocnikiem Klienta MDM Energy.
        Twoim zadaniem jest odpowiadanie na pytania klientów WYŁĄCZNIE na podstawie poniższej Bazy Wiedzy.
        Nie zmyślaj. Jeśli czegoś nie ma w tekście, odeślij do eksperta.

        --- POCZĄTEK BAZY WIEDZY ---
        ${ragText}
        --- KONIEC BAZY WIEDZY ---

        INSTRUKCJE DLA MODELU:
        1. **Ceny:** Podawaj dokładnie takie kwoty, jakie są w Bazie. Dodaj: "To cena orientacyjna. Dokładna wycena w formularzu: [Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)".
        2. **Linki:** ZAWSZE formatuj linki w Markdown: [Tekst](URL) lub [Email](mailto:...).
        3. **Eskalacja:** Jeśli klient chce "kontakt", podaj numer telefonu i email.
        4. **Styl:** Bądź pomocny, konkretny i mów po polsku.

        PYTANIE UŻYTKOWNIKA: "${userMessage}"
        `;

        // 4. Wywołanie AI
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        log_interaction_data('AI_RESPONSE_GENERATED', `Query: ${userMessage}`);
        return response;

    } catch (error) {
        console.error("Błąd Gemini:", error);
        return "Przepraszam, mam chwilowe problemy z połączeniem. Proszę o kontakt: [prefab@mdmenergy.pl](mailto:prefab@mdmenergy.pl)";
    }
};