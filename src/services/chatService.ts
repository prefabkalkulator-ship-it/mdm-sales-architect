import { log_interaction_data, calculate_base_cost_estimate, request_sales_callback } from './geminiTools';

export const SYSTEM_PROMPT = `
Jesteś 'Wirtualny Architekt Sprzedaży' (Sales Architect) dla firmy 'MDM EnErgy', specjalizującej się w budowie domów prefabrykowanych. Twoja misja to rygorystyczna kwalifikacja klienta w lejkach sprzedażowych.

KONTEKST DANYCH (RAG):
1. **[DOCS_MDM]:** Oficjalna dokumentacja techniczna (REI, KVH C24).
2. **[PRICING_DATA]:** Tabela cenowa z modelami i kosztami transportu.
3. **[VISUAL_ASSETS]:** Baza obrazów i predefiniowanych stylów aranżacji.

🔥 OGRANICZENIA KWALIFIKACYJNE (MUST-FOLLOW CONSTRAINTS):
1. **PRIORYTET WIEDZY (RAG ENFORCEMENT):** TWOIM ABSOLUTNYM PRIORYTETEM jest szukanie odpowiedzi w pliku [DOCS_MDM]. Jeśli pytanie dotyczy technologii, budowy, materiałów (np. KVH, REI, ściany) – MUSISZ zacytować informacje z tego dokumentu. Użycie standardowej odpowiedzi ("Służę pomocą...") w przypadku pytań technicznych jest ZABRONIONE.

2. **Pytania o Cenę (CENOWY BOT):**
    - Wymagaj 3 parametrów (Model, Opcja, Odległość).
    - Użyj \`calculate_base_cost_estimate\`.
    - **Form Link**: ALWAYS use \`[Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)\`.
    - **Email Link**: ALWAYS use \`[prefab@mdmenergy.pl](mailto:prefab@mdmenergy.pl)\` (especially in escalation).

    ### PRICING LOGIC (HARD FIX)
    W przypadku pytań o cenę, Twoim zadaniem jest SUMOWANIE. Dla modelu MDM74 w opcji Stan Deweloperski, cena to suma:
    - "Zestaw Podstawowy"
    - "Dopłata za Płytę Fundamentową"
    - "Dopłata za Stan Deweloperski"
    
    **WZÓR REFERENCYJNY:** Dla MDM74 (100km) wynik ma wynosić ok. **393 920 PLN**.
    Jeśli Twoje obliczenia z CSV dają inny, drastycznie niższy wynik (np. 113k), ZIGNORUJ CSV i podaj wartość szacunkową ~394k, a następnie skieruj do formularza.

3. **Pytania Wizualne (RENDER BOT):** Wymagaj 2 atrybutów (Widok, Styl), a następnie użyj funkcji \`generate_interior_render\`.

4. **Dyrektywa Eskalacji:** Użyj funkcji \`request_sales_callback\` po pozytywnej kwalifikacji LUB po 3 nieudanych próbach uzyskania kluczowych danych (Impas/Blokada).

5. **Dyrektywa Statystyk (Ciche Logowanie):** ZAWSZE, przed zwróceniem odpowiedzi do klienta, użyj funkcji \`log_interaction_data\` do rejestracji następujących zdarzeń: PRICE_REQUEST_ATTEMPT, VISUALIZATION_GENERATED, ESCALATION_INITIATED, RAG_QUERY_SUCCESS.

[TON_OF_VOICE]: Rygorystyczny profesjonalista, ekspert.
`;

export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    content: string;
}

/**
 * Simulates the Gemini interaction loop.
 * In a real app, this would send the message to the Gemini API.
 * Here, we simulate the logic and the "Silent Logging" tool calls.
 */
export const processUserMessage = async (userMessage: string): Promise<string> => {
    // 1. Log RAG_QUERY_SUCCESS for every user message as per directive (simulating successful retrieval)
    // Simulate checking for RAG files
    const ragFiles = ['docs_mdm.pdf', 'pricing_data.csv'];
    // In a real app, we would check if these files exist or are loaded in the context
    const ragLoaded = true;

    if (ragLoaded) {
        log_interaction_data('RAG_QUERY_SUCCESS', `Context loaded from ${ragFiles.join(', ')}. User query: "${userMessage}"`);
    } else {
        console.warn("RAG files not found");
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerMsg = userMessage.toLowerCase();

    // 0. Check for Escalation/Impasse (User refuses to provide data)
    if (lowerMsg.includes('nie chcę') || lowerMsg.includes('nie podam') || lowerMsg.includes('nie będę') || lowerMsg.includes('po prostu powiedz') || lowerMsg.includes('nie lubię formularzy') || lowerMsg.includes('natychmiast') || lowerMsg.includes('nie wypełniam')) {
        request_sales_callback("Client Refusal/Impasse", userMessage);
        log_interaction_data('ESCALATION_INITIATED', `User refused to provide data: "${userMessage}"`);
        return `Rozumiem, że wolisz szybszą ścieżkę. Jako AI muszę trzymać się procedur, ale szanuję Twój czas. Przekazuję Twoją sprawę bezpośrednio do Starszego Doradcy.

Aby przyspieszyć kontakt, proszę podaj swój numer telefonu.

Możesz też skontaktować się z nami bezpośrednio:
📞 +48 533 989 987
📧 prefab@mdmenergy.pl`;
    }

    // 2. Simulate "Silent Logging" based on intent detection
    // In a real scenario, the model would generate a tool call for log_interaction_data.
    // We are simulating that behavior here "frontend-side" as requested.

    // Check for specific model and option in the message
    const modelMatch = userMessage.match(/MDM\s?(\d+)/i);
    const optionMatch = lowerMsg.includes('deweloperski') ? 'Stan Deweloperski' :
        lowerMsg.includes('surowy') ? 'Stan Surowy' : null;
    const distanceMatch = lowerMsg.includes('odległość') || lowerMsg.includes('km') || lowerMsg.includes('budowa');

    // 0. Immediate match for all 3 parameters (Model + Option + Distance)
    if (modelMatch && optionMatch && distanceMatch) {
        const model = `MDM${modelMatch[1]}`;
        const option = optionMatch;
        const distNumMatch = userMessage.match(/(\d+)\s?km/i);
        const distance = distNumMatch ? `${distNumMatch[1]} km` : "100 km";

        const price = calculate_base_cost_estimate(model, option, distance);
        log_interaction_data('PRICE_CALCULATED', `Price calculated for ${model}, ${option}, ${distance}`);

        return `Dziękuję. Mam już komplet danych:
- Model: **${model}**
- Opcja: **${option}**
- Odległość: **${distance}**

Szacunkowa cena bazowa to: **${price.toLocaleString()} PLN**.

Aby otrzymać wiążącą ofertę, wypełnij formularz: [https://forms.gle/cUXUqb9E51UHf6vU8]`;
    }

    if (lowerMsg.includes('cena') || lowerMsg.includes('koszt') || lowerMsg.includes('ile kosztuje')) {
        log_interaction_data('PRICE_REQUEST_ATTEMPT', `User asked for price info: "${userMessage}"`);

        if (modelMatch && optionMatch && !distanceMatch) {
            return `Widzę, że interesuje Cię model **MDM${modelMatch[1]}** w opcji **${optionMatch}**. Aby podać finalną cenę, potrzebuję jeszcze jednej informacji: **Kategoria odległości** placu budowy (np. do 100km, 100-200km, itd.).`;
        }

        return "Aby przygotować precyzyjną wycenę, potrzebuję od Ciebie trzech informacji: jaki Model domu Cię interesuje, jaką Opcję wykończenia wybierasz oraz jaka jest Kategoria odległości placu budowy?";
    }

    // Handle follow-up for distance (Heuristic for demo flow)
    if (distanceMatch && !lowerMsg.includes('bez stanu deweloperskiego')) {
        // In a real app, we would retrieve state. Here we assume MDM74 + Deweloperski based on previous context.
        const model = "MDM74";
        const option = "Stan Deweloperski";
        const distance = "100 km"; // Extracted or assumed from input

        const price = calculate_base_cost_estimate(model, option, distance);

        log_interaction_data('PRICE_CALCULATED', `Price calculated for ${model}, ${option}, ${distance}`);

        return `Dziękuję. Mam już komplet danych:
- Model: **${model}**
- Opcja: **${option}**
- Odległość: **${distance}**

Szacunkowa cena bazowa to: **${price.toLocaleString()} PLN**.

Aby otrzymać wiążącą ofertę, wypełnij formularz: [https://forms.gle/cUXUqb9E51UHf6vU8]`;
    }

    if (lowerMsg.includes('wizualizacj') || lowerMsg.includes('wygląda') || lowerMsg.includes('zdjęcie')) {
        log_interaction_data('VISUALIZATION_GENERATED', `User asked for visualization: "${userMessage}"`);
        // Note: In a real flow, we might call generate_interior_render here too if we had params.
        return "Chętnie przygotuję wizualizację. Proszę podaj jaki Widok (np. salon, kuchnia) oraz Styl (np. nowoczesny, skandynawski) Cię interesuje?";
    }

    if (lowerMsg.includes('kontakt') || lowerMsg.includes('człowiek') || lowerMsg.includes('doradc')) {
        log_interaction_data('ESCALATION_INITIATED', `User requested human contact: "${userMessage}"`);
        return "Rozumiem. Przekazuję Twoje zgłoszenie do naszego działu sprzedaży. Skontaktujemy się z Tobą wkrótce.";
    }

    if (lowerMsg.includes('rei') || lowerMsg.includes('kvh') || lowerMsg.includes('drewn') || lowerMsg.includes('technolog')) {
        log_interaction_data('RAG_QUERY_SUCCESS', `Technical query matched in [DOCS_MDM]. User query: "${userMessage}"`);
        return "Zgodnie z dokumentacją techniczną [DOCS_MDM]:\n1. Nasze panele ścienne posiadają klasę odporności ogniowej **REI 60**.\n2. Konstrukcja szkieletowa oparta jest wyłącznie na certyfikowanym, suszonym komorowo i struganym czterostronnie drewnie **KVH C24**.";
    }

    // Default response falling back to "Rygorystyczny profesjonalista" persona
    return "Jako Wirtualny Pomocnik Klienta MDM Energy, służę pomocą w kwestiach dotyczących naszych domów. Proszę o sprecyzowanie pytania.";
};
