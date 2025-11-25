import { log_interaction_data, request_sales_callback, generate_interior_render } from './geminiTools';
// @ts-ignore
import ragText from '../data/baza_wiedzy_mdm.txt?raw';

export const SYSTEM_PROMPT = `
Jesteś Wirtualnym Pomocnikiem Klienta MDM Energy.
Twoja wiedza pochodzi WYŁĄCZNIE z załączonego pliku tekstowego [KNOWLEDGE_BASE].
ZASADY ODPOWIADANIA:
1. **Ceny:** Jeśli klient pyta o cenę (np. MDM74), znajdź ją w pliku i PODAJ (np. 'Ok. 393 920 PLN'). Dodaj dopisek: 'To cena orientacyjna. Faktyczną wycenę uzyskasz tutaj: [Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)'.
2. **Linki:** ZAWSZE używaj formatu Markdown:
   - [Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)
   - [Napisz e-mail](mailto:prefab@mdmenergy.pl)
3. **Brak wiedzy:** Jeśli w pliku nie ma odpowiedzi, nie zmyślaj. Napisz: 'To wymaga konsultacji z ekspertem. Proszę o kontakt: [Napisz e-mail](mailto:prefab@mdmenergy.pl)'.
4. **Styl:** Bądź pomocny, krótki i konkretny.
`;

export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    content: string;
}

/**
 * Simulates the Gemini interaction loop with Pure RAG logic.
 * It searches the imported text file for answers locally.
 */
export const processUserMessage = async (userMessage: string): Promise<string> => {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerMsg = userMessage.toLowerCase();

    // Log the query attempt
    log_interaction_data('RAG_QUERY_ATTEMPT', `Searching knowledge base for: "${userMessage}"`);

    // --- 1. LOGIKA CENOWA (Model Price Query) ---
    // Szuka wzorców typu "MDM 74", "MDM74", "Optimal 58", "Z273"
    const modelMatch = userMessage.match(/MDM\s?(\d+)|Optimal\s?(\d+)|Stodoła\s?(\d+)|Z(\d+)[A-Z]?/i);

    if (modelMatch || lowerMsg.includes('cena') || lowerMsg.includes('koszt') || lowerMsg.includes('ile kosztuje')) {
        // Wyciągnięcie nazwy modelu do wyszukania
        let searchModel = "";
        if (modelMatch) {
            // Normalizacja: np. z "MDM74" robi "MDM 74" bo tak jest w pliku TXT
            searchModel = modelMatch[0].replace(/MDM(\d+)/i, "MDM $1").toUpperCase(); 
        }

        if (searchModel) {
            const lines = ragText.split('\n');
            let foundSection = "";
            let capturing = false;

            for (const line of lines) {
                // Start capturing when model name is found in a Header or line
                if (line.toUpperCase().includes(searchModel)) {
                    capturing = true;
                }
                
                if (capturing) {
                    // Stop capturing if we hit another model header or new main section
                    if ((line.startsWith('===') || line.includes('Model MDM')) && !line.includes(searchModel)) {
                        break;
                    }
                    if (line.trim() !== "") {
                        foundSection += line + "\n";
                    }
                }
            }

            if (foundSection.trim().length > 0) {
                log_interaction_data('RAG_QUERY_SUCCESS', `Found price data for ${searchModel}`);
                return `Znalazłem informacje o modelu **${searchModel}**:\n\n${foundSection.trim()}\n\nTo cena orientacyjna. Faktyczną wycenę uzyskasz tutaj: [Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)`;
            }
        }
        
        // Jeśli pytano o cenę, ale nie znaleziono modelu
        return "Aby podać orientacyjną cenę, potrzebuję numeru modelu (np. MDM 74, MDM 58). Pełny cennik i wycena indywidualna dostępna jest tutaj: [Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)";
    }

    // --- 2. LOGIKA TECHNICZNA (Słowa Kluczowe) ---
    // Szuka pytań o technologie, które są zdefiniowane w pliku
    const keywords = [
        { key: 'rei', section: 'TECHNOLOGIA' },
        { key: 'ognio', section: 'TECHNOLOGIA' },
        { key: 'paln', section: 'TECHNOLOGIA' },
        { key: 'kvh', section: 'TECHNOLOGIA' },
        { key: 'drewn', section: 'TECHNOLOGIA' },
        { key: 'ścian', section: 'TECHNOLOGIA' },
        { key: 'oddych', section: 'TECHNOLOGIA' },
        { key: 'okna', section: 'TECHNOLOGIA' },
        { key: 'szyb', section: 'TECHNOLOGIA' },
        { key: 'fundament', section: 'ZAKRES PRAC' },
        { key: 'płyt', section: 'ZAKRES PRAC' },
        { key: 'gładzi', section: 'ZAKRES PRAC' },
        { key: 'malowan', section: 'ZAKRES PRAC' },
        { key: 'instalacj', section: 'ZAKRES PRAC' },
        { key: 'prąd', section: 'ZAKRES PRAC' },
        { key: 'wod', section: 'ZAKRES PRAC' },
        { key: 'pozwolen', section: 'FORMALNOŚCI' },
        { key: 'zgłoszen', section: 'FORMALNOŚCI' },
        { key: 'kierownik', section: 'FORMALNOŚCI' },
        { key: '70', section: 'FORMALNOŚCI' }
    ];

    for (const item of keywords) {
        if (lowerMsg.includes(item.key)) {
            const lines = ragText.split('\n');
            let bestAnswer = "";
            
            // Proste wyszukiwanie pasującego pytania (P:)
            for (let i = 0; i < lines.length; i++) {
                // Jeśli linia zawiera słowo kluczowe ORAZ jest pytaniem lub odpowiedzią
                if (lines[i].toLowerCase().includes(item.key) && (lines[i].startsWith('P:') || lines[i].startsWith('O:'))) {
                    // Pobierz kontekst (pytanie + odpowiedź)
                    // Szukamy w górę początku P:
                    let startIdx = i;
                    while(startIdx > 0 && !lines[startIdx].startsWith('P:')) {
                        startIdx--;
                    }
                    // Szukamy w dół końca O:
                    let endIdx = startIdx + 1;
                    while(endIdx < lines.length && !lines[endIdx].startsWith('P:') && !lines[endIdx].startsWith('===')) {
                        endIdx++;
                    }
                    
                    const chunk = lines.slice(startIdx, endIdx).join('\n');
                    if (chunk.length > 20) {
                        bestAnswer = chunk;
                        break; 
                    }
                }
            }

            if (bestAnswer) {
                log_interaction_data('RAG_QUERY_SUCCESS', `Found info for keyword: ${item.key}`);
                return `${bestAnswer.trim()}\n\n[Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)`;
            }
        }
    }

    // --- 3. WIZUALIZACJE (Mock) ---
    if (lowerMsg.includes('wizualizacj') || lowerMsg.includes('wygląda')) {
        log_interaction_data('VISUALIZATION_GENERATED', `User asked for visualization`);
        // Symulacja wywołania narzędzia
        const mockResult = JSON.parse(generate_interior_render('salon', 'nowoczesny'));
        return `${mockResult.message}\n\n(To jest funkcja demonstracyjna. W pełnej wersji tutaj pojawiłby się render).`;
    }

    // --- 4. ESKALACJA / KONTAKT ---
    if (lowerMsg.includes('kontakt') || lowerMsg.includes('doradc') || lowerMsg.includes('człowiek') || lowerMsg.includes('handlowc')) {
        request_sales_callback("User requested contact", userMessage);
        return "Możesz skontaktować się z naszym ekspertem bezpośrednio:\n\n📞 +48 533 989 987\n📧 [Napisz e-mail](mailto:prefab@mdmenergy.pl)";
    }

    // --- 5. FALLBACK (Brak Wiedzy) ---
    log_interaction_data('RAG_QUERY_FAILURE', `No info found for: "${userMessage}"`);
    return "Jako Wirtualny Pomocnik Klienta MDM Energy, służę pomocą w kwestiach dotyczących naszych domów. To pytanie jest bardzo szczegółowe – proszę o kontakt z ekspertem: [Napisz e-mail](mailto:prefab@mdmenergy.pl).";
};