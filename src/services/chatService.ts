import { GoogleGenerativeAI } from "@google/generative-ai";
import { log_interaction_data, request_sales_callback } from './geminiTools';
// @ts-ignore
import ragText from '../data/baza_wiedzy_mdm.txt?raw';

// 🔥 POPRAWKA: Klucz wpisany na sztywno, bez process.env 🔥
const API_KEY = "AIzaSyDGmaZpOb8pD0FDwqTqsuPCOi4xkyHJsgE";

export const processUserMessage = async (userMessage: string): Promise<string> => {
    // Diagnostyka w konsoli przeglądarki (F12)
    console.log("ChatService: Inicjalizacja. Długość klucza:", API_KEY ? API_KEY.length : 0);

    // 1. Weryfikacja klucza
    if (!API_KEY || API_KEY.includes("TU_WKLEJ")) {
        console.error("Błąd: Brak klucza API w zmiennej API_KEY");
        return "BŁĄD KRYTYCZNY: Brak klucza API w kodzie. Proszę skonfigurować zmienną środowiskową lub wpisać klucz.";
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        // Definicja Promptu Systemowego z wbetonowaną bazą wiedzy
        const fullPrompt = `
        Jesteś Wirtualnym Pomocnikiem Klienta MDM Energy.
        Twoja wiedza pochodzi WYŁĄCZNIE z poniższej Bazy Wiedzy.
        
        --- BAZA WIEDZY ---
        ${ragText}
        --- KONIEC BAZY ---

        ZASADY:
        1. **Ceny:** Podawaj dokładnie według bazy. Dodaj: "To cena orientacyjna. Dokładna wycena: [Formularz](https://forms.gle/cUXUqb9E51UHf6vU8)".
        2. **Linki:** Używaj Markdown: [Tekst](URL).
        3. **Kontakt:** Jeśli klient chce człowieka - odeślij do maila: [prefab@mdmenergy.pl](mailto:prefab@mdmenergy.pl) i podaj telefon.
        4. **Styl:** Krótko, rzeczowo, po polsku.

        PYTANIE UŻYTKOWNIKA: "${userMessage}"
        `;

        // 2. Logika "Failover" (Próba Pro -> Fallback Flash)
        try {
            // Próba 1: Gemini 2.5 Pro (Najnowszy)
            // Uwaga: Jeśli 2.5 Pro jest niedostępny na Twoim kluczu, przejdzie do catch
            const modelPro = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); 
            // Zmieniłem na 1.5 Pro dla pewności (jest najbardziej stabilny), 
            // ale możesz zmienić na "gemini-2.5-pro" jeśli masz pewność dostępu.
            
            const result = await modelPro.generateContent(fullPrompt);
            const response = result.response.text();
            
            log_interaction_data('AI_RESPONSE_GENERATED', `Query: ${userMessage} | Model: Primary`);
            return response;

        } catch (proError: any) {
            console.warn("Błąd głównego modelu, próba fallbacku:", proError);
            
            // Próba 2: Gemini 1.5 Flash (Szybki i tani)
            const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await modelFlash.generateContent(fullPrompt);
            
            log_interaction_data('AI_RESPONSE_GENERATED', `Query: ${userMessage} | Model: Fallback (Flash)`);
            return result.response.text();
        }

    } catch (error: any) {
        console.error("Błąd krytyczny Gemini:", error);
        return `Przepraszam, wystąpił problem z połączeniem do AI (${error.message}). Proszę o kontakt mailowy: [prefab@mdmenergy.pl](mailto:prefab@mdmenergy.pl)`;
    }
};