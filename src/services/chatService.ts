import { log_interaction_data, calculate_base_cost_estimate, request_sales_callback } from './geminiTools';

// Ten prompt jest tu dla dokumentacji - w symulacji używamy logiki if/else
export const SYSTEM_PROMPT = `
Jesteś 'Wirtualny Architekt Sprzedaży' (Sales Architect) dla firmy 'MDM EnErgy', specjalizującej się w budowie domów prefabrykowanych. Twoja misja to rygorystyczna kwalifikacja klienta w lejkach sprzedażowych.

KONTEKST DANYCH (RAG):
1. **[KNOWLEDGE_BASE]:** baza_wiedzy_mdm.txt (JEDYNE ŹRÓDŁO PRAWDY).

🔥 OGRANICZENIA KWALIFIKACYJNE (MUST-FOLLOW CONSTRAINTS):
1. **PRIORYTET WIEDZY (RAG ENFORCEMENT):** TWOIM ABSOLUTNYM PRIORYTETEM jest szukanie odpowiedzi w pliku [KNOWLEDGE_BASE]. Jeśli pytanie dotyczy technologii, budowy, materiałów (np. KVH, REI, ściany) – MUSISZ zacytować informacje z tego dokumentu. Użycie standardowej odpowiedzi ("Służę pomocą...") w przypadku pytań technicznych jest ZABRONIONE.

2. **Pytania o Cenę (CENOWY BOT):**
    - Wymagaj 3 parametrów (Model, Opcja, Odległość).
    - **ZAKAZ LICZENIA (NO-MATH RULE):** Jeśli użytkownik prosi o sumowanie kosztów (np. 'Ile to będzie razem z fundamentem?'), ODMÓW grzecznie wykonania obliczeń.
    - **Wzorzec odpowiedzi:** 'Jako Wirtualny Pomocnik nie wykonuję precyzyjnych kalkulacji matematycznych, ponieważ ostateczna cena zależy od zbyt wielu zmiennych (warunki gruntowe, lokalizacja). Mogę podać ceny składowe, ale po faktyczną wycenę zapraszam do formularza.'
    - **Prezentacja Cen:** Podawaj ceny z [KNOWLEDGE_BASE] wyłącznie jako informacje o "możliwych dopłatach" lub "cenie bazowej", a nie jako ostateczną sumę.
    - **Obowiązkowy Disclaimer:** Do KAŻDEJ odpowiedzi zawierającej jakąkolwiek kwotę, musisz dokleić formułkę:
      *'Pamiętaj, że podane ceny są orientacyjne i zależą od wielu zmiennych. Faktyczną, wiążącą wycenę możesz uzyskać tylko wypełniając Formularz Wyceny MDM.'*
    - **Form Link**: ALWAYS use `[Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)`.
    - ** Email Link **: ALWAYS use`[prefab@mdmenergy.pl](mailto:prefab@mdmenergy.pl)`(especially in escalation).

3. ** Pytania Wizualne(RENDER BOT):** Wymagaj 2 atrybutów(Widok, Styl), a następnie użyj funkcji`generate_interior_render`.

4. ** Dyrektywa Eskalacji:** Użyj funkcji `request_sales_callback` po pozytywnej kwalifikacji LUB po 3 nieudanych próbach uzyskania kluczowych danych(Impas / Blokada).

5. ** Dyrektywa Statystyk(Ciche Logowanie):** ZAWSZE, przed zwróceniem odpowiedzi do klienta, użyj funkcji`log_interaction_data` do rejestracji następujących zdarzeń: PRICE_REQUEST_ATTEMPT, VISUALIZATION_GENERATED, ESCALATION_INITIATED, RAG_QUERY_SUCCESS.

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
    const ragFiles = ['baza_wiedzy_mdm.txt'];
    // In a real app, we would check if these files exist or are loaded in the context
    const ragLoaded = true;

    if (ragLoaded) {
        log_interaction_data('RAG_QUERY_SUCCESS', `Context loaded from ${ ragFiles.join(', ') }. User query: "${userMessage}"`);
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
        return `Rozumiem, że wolisz szybszą ścieżkę.Jako AI muszę trzymać się procedur, ale szanuję Twój czas.Przekazuję Twoją sprawę bezpośrednio do Starszego Doradcy.

Aby przyspieszyć kontakt, proszę podaj swój numer telefonu.

Możesz też skontaktować się z nami bezpośrednio:
📞 +48 533 989 987
📧 prefab @mdmenergy.pl`;
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
        const model = `MDM${ modelMatch[1] } `;
        const option = optionMatch;
        const distNumMatch = userMessage.match(/(\d+)\s?km/i);
        const distance = distNumMatch ? `${ distNumMatch[1] } km` : "100 km";

        // NO-MATH RULE: We do NOT calculate price here anymore.
        // We rely on the model to use RAG data to provide base prices or surcharges.
        // For simulation purposes, we just log and return a placeholder that invites the model to answer from RAG.
        
        log_interaction_data('PRICE_CALCULATED', `Price request for ${ model }, ${ option }, ${ distance } (No - Math Strategy)`);

        // In a real RAG system, the model would generate the text based on the txt file.
        // Since we are mocking the response here, we return a generic "found data" response
        // that adheres to the new guidelines.
        
        return `Dziękuję.Mam już komplet danych:
- Model: ** ${ model }**
    - Opcja: ** ${ option }**
        - Odległość: ** ${ distance }**

            Jako Wirtualny Pomocnik nie wykonuję precyzyjnych kalkulacji matematycznych, ponieważ ostateczna cena zależy od zbyt wielu zmiennych(warunki gruntowe, lokalizacja).Mogę podać ceny składowe z naszej bazy wiedzy, ale po faktyczną wycenę zapraszam do formularza.

* Pamiętaj, że podane ceny są orientacyjne i zależą od wielu zmiennych.Faktyczną, wiążącą wycenę możesz uzyskać tylko wypełniając Formularz Wyceny MDM.*

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
    const model = "MDM74";
    const option = "Stan Deweloperski";
    const distance = "100 km";

    log_interaction_data('PRICE_CALCULATED', `Price request for ${model}, ${option}, ${distance} (No-Math Strategy)`);

    return `Dziękuję. Mam już komplet danych:
- Model: **${model}**
- Opcja: **${option}**
- Odległość: **${distance}**

Jako Wirtualny Pomocnik nie wykonuję precyzyjnych kalkulacji matematycznych, ponieważ ostateczna cena zależy od zbyt wielu zmiennych.

*Pamiętaj, że podane ceny są orientacyjne i zależą od wielu zmiennych. Faktyczną, wiążącą wycenę możesz uzyskać tylko wypełniając Formularz Wyceny MDM.*

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
    log_interaction_data('RAG_QUERY_SUCCESS', `Technical query matched in [KNOWLEDGE_BASE]. User query: "${userMessage}"`);
    return "Zgodnie z dokumentacją techniczną [KNOWLEDGE_BASE]:\n1. Nasze panele ścienne posiadają klasę odporności ogniowej **REI 60**.\n2. Konstrukcja szkieletowa oparta jest wyłącznie na certyfikowanym, suszonym komorowo i struganym czterostronnie drewnie **KVH C24**.";
}

// Default response falling back to "Rygorystyczny profesjonalista" persona
return "Jako Wirtualny Pomocnik Klienta MDM Energy, służę pomocą w kwestiach dotyczących naszych domów. Proszę o sprecyzowanie pytania.";
};