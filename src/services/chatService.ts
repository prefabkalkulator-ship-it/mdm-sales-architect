import { GoogleGenerativeAI } from "@google/generative-ai";
import { log_interaction_data, request_sales_callback } from './geminiTools';
// @ts-ignore
import ragText from '../data/baza_wiedzy_mdm.txt?raw';

// Pobieramy klucz API z Cloud Run lub używamy zmiennej lokalnej
const API_KEY = process.env.GEMINI_API_KEY || "";

export const processUserMessage = async (userMessage: string): Promise<string> => {
    // 1. Weryfikacja klucza
    if (!API_KEY || API_KEY.includes("TU_WPISZ")) {
        console.error("Brak klucza API Gemini!");
        return "Przepraszam, wystąpił błąd konfiguracji systemu. Proszę o kontakt telefoniczny.";
    }

    try {
        // 2. Inicjalizacja Gemini - ZMIANA NA MODEL PRO
        // Używamy wersji 'pro' dla lepszego rozumienia cenników i technikalii
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // 3. Konstrukcja Promptu z PEŁNYM PLIKIEM WIEDZY
        // Nie tniemy pliku - wrzucamy go w całości, Gemini Pro sobie poradzi.
        const prompt = `
        Jesteś Wirtualnym Pomocnikiem Klienta MDM Energy.
        Twoim zadaniem jest odpowiadanie na pytania klientów WYŁĄCZNIE na podstawie poniższej Bazy Wiedzy.

        --- POCZĄTEK BAZY WIEDZY ---
        ${ragText}
        --- KONIEC BAZY WIEDZY ---

        INSTRUKCJE DLA MODELU:
        1. **Analiza Cennika:** Jeśli klient pyta o cenę (np. MDM 74), znajdź odpowiednią sekcję w bazie. Zwróć uwagę na warianty (30km/100km/300km) i opcje (Stan Deweloperski vs Zestaw Podstawowy). Jeśli klient nie podał odległości, podaj widełki lub zapytaj o lokalizację.
        2. **Zakaz Liczenia:** Nie sumuj cen samodzielnie, chyba że są podane wprost. Podawaj wartości z tabeli. Dodaj zawsze: "To cena orientacyjna. Dokładna wycena w formularzu."
        3. **Linki:** ZAWSZE formatuj linki w Markdown:
           - Formularz: [Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)
           - Email: [Napisz e-mail](mailto:prefab@mdmenergy.pl)
        4. **Eskalacja:** Jeśli klient chce "kontakt", "człowieka" lub "rozmowę", podaj numer telefonu (+48 533 989 987) i link mailto.
        5. **Styl:** Odpowiadaj konkretnie, po polsku. Nie wymyślaj faktów spoza bazy. Jeśli czegoś nie ma w tekście -> odeślij do maila.

        PYTANIE UŻYTKOWNIKA: "${userMessage}"
        `;

        // 4. Wywołanie AI
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        // Logowanie
        log_interaction_data('AI_RESPONSE_GENERATED', `Query: ${userMessage} | Model: gemini-1.5-pro`);
        
        return response;

    } catch (error) {
        console.error("Błąd Gemini:", error);
        return "Przepraszam, mam chwilowe problemy z połączeniem z bazą wiedzy. Proszę o kontakt bezpośredni: [prefab@mdmenergy.pl](mailto:prefab@mdmenergy.pl)";
    }
};