import { GoogleGenerativeAI } from "@google/generative-ai";
import { log_interaction_data, request_sales_callback } from './geminiTools';
// @ts-ignore
import ragText from '../data/baza_wiedzy_mdm.txt?raw';

// 🔥 KLUCZ API (HARDCODED) 🔥
const API_KEY = "AIzaSyDGmaZpOb8pD0FDwqTqsuPCOi4xkyHJsgE";

export const processUserMessage = async (userMessage: string): Promise<string> => {
    // 1. Diagnostyka klucza
    if (!API_KEY || API_KEY.includes("TU_WKLEJ")) {
        console.error("BŁĄD: Klucz API nie został wklejony do kodu.");
        return "BŁĄD KRYTYCZNY: Brak klucza API w kodzie. Proszę wpisać klucz w pliku chatService.ts.";
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        // Definicja Promptu
        const fullPrompt = `
        Jesteś Wirtualnym Pomocnikiem Klienta MDM Energy.
        Twoja wiedza pochodzi WYŁĄCZNIE z poniższej Bazy Wiedzy.
        
        --- BAZA WIEDZY ---
        ${ragText}
        --- KONIEC BAZY ---

        ZASADY:
        1. **Ceny:** Podawaj dokładnie według bazy (np. 393 920 PLN). Dodaj: "Cena orientacyjna. Dokładna wycena: [Formularz](https://forms.gle/cUXUqb9E51UHf6vU8)".
        2. **Linki:** Używaj Markdown: [Tekst](URL).
        3. **Kontakt:** Jeśli klient chce człowieka - odeślij do maila: [prefab@mdmenergy.pl](mailto:prefab@mdmenergy.pl) i podaj telefon.
        4. **Styl:** Krótko, rzeczowo, po polsku.

        PYTANIE UŻYTKOWNIKA: "${userMessage}"
        `;

        // 2. Logika Modeli (Tylko seria 2.5)
        try {
            // PRÓBA 1: GEMINI 2.5 PRO (Główny)
            const modelPro = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
            const result = await modelPro.generateContent(fullPrompt);
            const response = result.response.text();
            
            log_interaction_data('AI_RESPONSE_GENERATED', `Query: ${userMessage} | Model: Gemini 2.5 Pro`);
            return response;

        } catch (proError: any) {
            console.warn("Błąd Gemini 2.5 Pro, próba fallbacku na Flash:", proError);
            
            // PRÓBA 2: GEMINI 2.5 FLASH (Zapasowy)
            // Wersja 1.5-flash została wycofana, używamy 2.5-flash
            const modelFlash = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await modelFlash.generateContent(fullPrompt);
            
            log_interaction_data('AI_RESPONSE_GENERATED', `Query: ${userMessage} | Model: Gemini 2.5 Flash (Fallback)`);
            return result.response.text();
        }

    } catch (error: any) {
        console.error("Błąd krytyczny Gemini (wszystkie modele):", error);
        return `Przepraszam, wystąpił problem z połączeniem do AI (${error.message}). Proszę o kontakt mailowy: [prefab@mdmenergy.pl](mailto:prefab@mdmenergy.pl)`;
    }
};