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
 * It searches the imported text file for answers.
 */
export const processUserMessage = async (userMessage: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerMsg = userMessage.toLowerCase();

    // Log the query attempt
    log_interaction_data('RAG_QUERY_ATTEMPT', `Searching knowledge base for: "${userMessage}"`);

    // 1. Check for specific Model Price Query (e.g., "Cena MDM 74", "MDM74")
    const modelMatch = userMessage.match(/MDM\s?(\d+|Optimal\s?\d+|Stodoła\s?\d+|Z\d+[A-Z]?)/i);

    if (modelMatch || lowerMsg.includes('cena') || lowerMsg.includes('koszt')) {
        // Try to find the specific model section in the RAG text
        const modelName = modelMatch ? modelMatch[0].replace(/\s+/g, ' ') : null;

        if (modelName) {
            // Simple search strategy: Find the line containing the model name and "cena"
            const lines = ragText.split('\n');
            let foundSection = "";
            let capturing = false;

            // Normalize search term (e.g. MDM74 -> MDM 74 or MDM Optimal 74)
            // We search for the number mainly if it's MDM
            const numberMatch = modelName.match(/\d+/);
            const searchNumber = numberMatch ? numberMatch[0] : "";

            for (const line of lines) {
                if (line.toLowerCase().includes(`mdm`) && line.includes(searchNumber) && line.toLowerCase().includes('cena')) {
                    capturing = true;
                    foundSection += line + "\n";
                    continue;
                }
                if (capturing) {
                    if (line.startsWith('###') || line.startsWith('Pytanie:')) {
                        capturing = false;
                        break; // Stop capturing at next section
                    }
                    foundSection += line + "\n";
                }
            }

            if (foundSection.trim().length > 0) {
                log_interaction_data('RAG_QUERY_SUCCESS', `Found price data for ${modelName}`);
                return `Znalazłem informacje o modelu **${modelName}**:\n\n${foundSection.trim()}\n\nTo cena orientacyjna. Faktyczną wycenę uzyskasz tutaj: [Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)`;
            }
        }
    }

    // 2. Technical/General Questions (Search by keywords)
    const keywords = ['rei', 'kvh', 'ściany', 'strop', 'czas', 'gwarancja', 'ogni', 'akusty', 'technolog', 'standard', 'deweloperski'];
    for (const keyword of keywords) {
        if (lowerMsg.includes(keyword)) {
            const lines = ragText.split('\n');
            let bestAnswer = "";

            // Find a Q&A section containing the keyword
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].toLowerCase().includes(keyword)) {
                    // Look backwards for the start of the Question
                    let startIdx = i;
                    while (startIdx > 0 && !lines[startIdx].startsWith('###') && !lines[startIdx].startsWith('Pytanie:')) {
                        startIdx--;
                    }

                    // Capture until next section
                    let endIdx = startIdx + 1;
                    while (endIdx < lines.length && !lines[endIdx].startsWith('###') && !lines[endIdx].startsWith('Pytanie:')) {
                        endIdx++;
                    }

                    const section = lines.slice(startIdx, endIdx).join('\n');
                    if (section.length > 20) { // meaningful length
                        bestAnswer = section;
                        break; // Return first good match
                    }
                }
            }

            if (bestAnswer) {
                log_interaction_data('RAG_QUERY_SUCCESS', `Found technical info for keyword: ${keyword}`);
                return `${bestAnswer.trim()}\n\n[Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)`;
            }
        }
    }

    // 3. Visualization Request
    if (lowerMsg.includes('wizualizacj') || lowerMsg.includes('wygląda')) {
        log_interaction_data('VISUALIZATION_GENERATED', `User asked for visualization`);
        return generate_interior_render('salon', 'nowoczesny');
    }

    // 4. Escalation/Contact
    if (lowerMsg.includes('kontakt') || lowerMsg.includes('doradc') || lowerMsg.includes('człowiek')) {
        request_sales_callback("User requested contact", userMessage);
        return "To wymaga konsultacji z ekspertem. Proszę o kontakt: [Napisz e-mail](mailto:prefab@mdmenergy.pl)";
    }

    // 5. Fallback (No knowledge found)
    log_interaction_data('RAG_QUERY_FAILURE', `No info found for: "${userMessage}"`);
    return "To wymaga konsultacji z ekspertem. Proszę o kontakt: [Napisz e-mail](mailto:prefab@mdmenergy.pl)";
};