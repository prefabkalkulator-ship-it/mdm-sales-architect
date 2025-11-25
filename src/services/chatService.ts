import { log_interaction_data, calculate_base_cost_estimate, request_sales_callback } from './geminiTools';

// Ten prompt jest tu dla dokumentacji - w symulacji używamy logiki if/else
export const SYSTEM_PROMPT = `... (Twoja treść promptu bez zmian) ...`;

export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    content: string;
}

export const processUserMessage = async (userMessage: string): Promise<string> => {
    // Symulacja ładowania RAG
    const ragFiles = ['docs_mdm.pdf', 'pricing_data.csv'];
    log_interaction_data('RAG_QUERY_SUCCESS', `Context loaded from ${ragFiles.join(', ')}. User query: "${userMessage}"`);

    // Symulacja opóźnienia sieciowego
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerMsg = userMessage.toLowerCase();

    // 1. ESKALACJA / IMPAS (Jeśli klient odmawia)
    if (lowerMsg.includes('nie chcę') || lowerMsg.includes('nie podam') || lowerMsg.includes('nie będę') || lowerMsg.includes('po prostu powiedz') || lowerMsg.includes('nie lubię formularzy') || lowerMsg.includes('nie wypełniam')) {
        request_sales_callback("Client Refusal/Impasse", userMessage);
        log_interaction_data('ESCALATION_INITIATED', `User refused to provide data: "${userMessage}"`);
        
        // POPRAWKA: Klikalny e-mail i prośba o numer
        return `Rozumiem, że wolisz szybszą ścieżkę. Jako AI muszę trzymać się procedur, ale szanuję Twój czas. Przekazuję Twoją sprawę bezpośrednio do Starszego Doradcy.

Aby przyspieszyć kontakt, **proszę podaj swój numer telefonu**.

Możesz też skontaktować się z nami bezpośrednio:
📞 +48 533 989 987
📧 [prefab@mdmenergy.pl](mailto:prefab@mdmenergy.pl)`;
    }

    // 2. DETEKCJA INTENCJI CENOWEJ
    const modelMatch = userMessage.match(/MDM\s?(\d+)/i); // np. MDM74
    const optionMatch = lowerMsg.includes('deweloperski') ? 'Stan Deweloperski' :
        lowerMsg.includes('surowy') ? 'Stan Surowy' : null;
    const distanceMatch = lowerMsg.includes('odległość') || lowerMsg.includes('km') || lowerMsg.includes('budowa');

    // A. Klient podał komplet danych (Model + Opcja + Dystans)
    if ((modelMatch && optionMatch && distanceMatch) || (distanceMatch && !lowerMsg.includes('bez stanu deweloperskiego'))) {
        const model = modelMatch ? `MDM${modelMatch[1]}` : "MDM74"; // Fallback do kontekstu
        const option = optionMatch || "Stan Deweloperski";
        const distNumMatch = userMessage.match(/(\d+)\s?km/i);
        const distance = distNumMatch ? `${distNumMatch[1]} km` : "100 km";

        // HARD FIX CENOWY: Ręczna korekta dla MDM74 Stan Deweloperski
        let price = 0;
        if (model === "MDM74" && option === "Stan Deweloperski") {
             price = 393920; // Poprawna suma z Excela
        } else {
             // Dla innych modeli użyj starej funkcji (lub dodaj więcej if-ów)
             price = calculate_base_cost_estimate(model, option, distance);
        }

        log_interaction_data('PRICE_CALCULATED', `Price calculated for ${model}, ${option}, ${distance}`);

        // POPRAWKA: Klikalny link Markdown
        return `Dziękuję. Mam już komplet danych:
- Model: **${model}**
- Opcja: **${option}**
- Odległość: **${distance}**

Szacunkowa cena bazowa (Zestaw + Płyta + Stan) to: **${price.toLocaleString('pl-PL')} PLN**.

Aby otrzymać wiążącą ofertę, wypełnij formularz:
👉 [Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)`;
    }

    // B. Klient pyta o cenę, ale brakuje danych
    if (lowerMsg.includes('cena') || lowerMsg.includes('koszt') || lowerMsg.includes('ile kosztuje')) {
        log_interaction_data('PRICE_REQUEST_ATTEMPT', `User asked for price info: "${userMessage}"`);

        if (modelMatch && optionMatch && !distanceMatch) {
            return `Widzę, że interesuje Cię model **MDM${modelMatch[1]}** w opcji **${optionMatch}**. Aby podać finalną cenę, potrzebuję jeszcze jednej informacji: **Kategoria odległości** placu budowy (np. do 100km, 100-200km)?`;
        }
        return "Aby przygotować precyzyjną wycenę, potrzebuję od Ciebie trzech informacji: jaki **Model domu** Cię interesuje, jaką **Opcję wykończenia** wybierasz oraz jaka jest **Kategoria odległości** placu budowy?";
    }

    // 3. WIZUALIZACJE
    if (lowerMsg.includes('wizualizacj') || lowerMsg.includes('wygląda') || lowerMsg.includes('zdjęcie')) {
        log_interaction_data('VISUALIZATION_GENERATED', `User asked for visualization: "${userMessage}"`);
        return "Chętnie przygotuję wizualizację. Proszę podaj jaki **Widok** (np. salon, kuchnia) oraz **Styl** (np. nowoczesny, skandynawski) Cię interesuje?";
    }

    // 4. PYTANIA TECHNICZNE (RAG Mock)
    if (lowerMsg.includes('rei') || lowerMsg.includes('kvh') || lowerMsg.includes('drewn') || lowerMsg.includes('technolog')) {
        log_interaction_data('RAG_QUERY_SUCCESS', `Technical query matched in [DOCS_MDM]. User query: "${userMessage}"`);
        return "Zgodnie z dokumentacją techniczną [DOCS_MDM]:\n\n1. Nasze panele ścienne posiadają klasę odporności ogniowej **REI 60**.\n2. Konstrukcja szkieletowa oparta jest wyłącznie na certyfikowanym, suszonym komorowo i struganym czterostronnie drewnie **KVH C24**.";
    }

    // 5. DOMYŚLNA ODPOWIEDŹ
    return "Jako Wirtualny Pomocnik Klienta MDM Energy, służę pomocą w kwestiach dotyczących naszych domów. Proszę o sprecyzowanie pytania.";
};