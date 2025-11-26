import { GoogleGenerativeAI } from "@google/generative-ai";
import { log_interaction_data, request_sales_callback, generate_interior_render } from './geminiTools';
// @ts-ignore
import ragText from '../data/baza_wiedzy_mdm.txt?raw';

// 🔥 KLUCZ API (HARDCODED) 🔥
// Klucz wpisany na sztywno dla wdrożenia serwerowego.
const API_KEY = "PLACEHOLDER_DLA_BEZPIECZENSTWA";

export const SYSTEM_PROMPT = `
Jesteś Wirtualnym Pomocnikiem Klienta MDM Energy.
Twoja wiedza pochodzi WYŁĄCZNIE z załączonego pliku tekstowego [KNOWLEDGE_BASE].

ZASADY ODPOWIADANIA:
1. **ZAKAZ WIEDZY ZEWNĘTRZNEJ:** Odpowiadasz WYŁĄCZNIE na podstawie podanej Bazy Wiedzy. Jeśli w tekście nie ma nazwy producenta płyty (np. Fermacell), NIE WOLNO Ci jej wymyślać. Używaj tylko nazw z tekstu (np. płyta GK).
2. **Ceny:** Podawaj ceny dokładnie tak, jak są w tekście. Zawsze dodawaj, że są orientacyjne. Przykład: "Cena wynosi ok. 393 920 PLN (cena orientacyjna)".
3. **Linki:** ZAWSZE używaj formatu Markdown:
   - [Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)
   - [Napisz e-mail](mailto:prefab@mdmenergy.pl)
4. **Brak wiedzy:** Jeśli w pliku nie ma odpowiedzi, nie zmyślaj. Napisz: 'To wymaga konsultacji z ekspertem. Proszę o kontakt: [Napisz e-mail](mailto:prefab@mdmenergy.pl)'.
5. **Styl:** Jesteś Wirtualnym Pomocnikiem Klienta MDM Energy. Bądź konkretny.
`;

export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    content: string;
}

/**
 * Uses Gemini API to process the message with the hardcoded knowledge base.
 */
export const processUserMessage = async (userMessage: string): Promise<string> => {
    // Weryfikacja klucza
    if (!API_KEY || API_KEY.includes("TU_WKLEJ")) {
        console.error("BRAK KLUCZA API");
        return "BŁĄD KRYTYCZNY: Brak klucza API. Proszę sprawdzić konfigurację.";
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    // Construct the full prompt
    const fullPrompt = `
${SYSTEM_PROMPT}

[KNOWLEDGE_BASE]:
${ragText}

USER QUERY: ${userMessage}
`;

    try {
        // PRÓBA 1: GEMINI 2.5 FLASH (PRIMARY)
        console.log("Próba użycia: gemini-2.5-flash");
        log_interaction_data('GEMINI_API_CALL', `Sending query to Gemini 2.5 Flash: "${userMessage}"`);

        const modelPrimary = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await modelPrimary.generateContent(fullPrompt);
        const response = result.response;
        const text = response.text();

        log_interaction_data('GEMINI_API_SUCCESS', `Received response from Gemini 2.5 Flash`);

        // Check for visualization intent
        if (userMessage.toLowerCase().includes('wizualizacj') || userMessage.toLowerCase().includes('wygląda')) {
            log_interaction_data('VISUALIZATION_GENERATED', `User asked for visualization`);
            return text + "\n\n" + generate_interior_render('salon', 'nowoczesny');
        }

        return text;

    } catch (error: any) {
        console.warn("Błąd Gemini 2.5 Flash, przełączam na 2.0 Flash Exp:", error);
        log_interaction_data('GEMINI_API_ERROR', `Gemini 2.5 Flash failed: ${error.message}. Attempting fallback.`);

        try {
            // PRÓBA 2: GEMINI 2.0 FLASH EXP (FALLBACK)
            console.log("Próba użycia: gemini-2.0-flash-exp");
            log_interaction_data('GEMINI_FALLBACK_CALL', `Sending query to Gemini 2.0 Flash Exp (Fallback): "${userMessage}"`);

            const modelFallback = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const result = await modelFallback.generateContent(fullPrompt);
            const response = result.response;
            const text = response.text();

            log_interaction_data('GEMINI_FALLBACK_SUCCESS', `Received response from Gemini 2.0 Flash Exp`);
            return text + "\n\n_(Wygenerowano modelem 2.0 Flash Exp)_";

        } catch (fallbackError: any) {
            console.error("Error calling Gemini 2.0 Flash Exp (Fallback):", fallbackError);
            log_interaction_data('GEMINI_FALLBACK_ERROR', `Gemini 2.0 Flash Exp failed: ${fallbackError.message}`);
            return "Przepraszam, oba modele (2.5 Flash i 2.0 Flash Exp) nie odpowiadają. Proszę o kontakt mailowy.";
        }
    }
};