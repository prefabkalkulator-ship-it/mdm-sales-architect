"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUserMessage = exports.SYSTEM_PROMPT = void 0;
var geminiTools_1 = require("./geminiTools");
exports.SYSTEM_PROMPT = "\nJeste\u015B 'Wirtualny Architekt Sprzeda\u017Cy' (Sales Architect) dla firmy 'MDM EnErgy', specjalizuj\u0105cej si\u0119 w budowie dom\u00F3w prefabrykowanych. Twoja misja to rygorystyczna kwalifikacja klienta w lejkach sprzeda\u017Cowych.\n\nKONTEKST DANYCH (RAG):\n1. **[DOCS_MDM]:** Oficjalna dokumentacja techniczna (REI, KVH C24).\n2. **[PRICING_DATA]:** Tabela cenowa z modelami i kosztami transportu.\n3. **[VISUAL_ASSETS]:** Baza obraz\u00F3w i predefiniowanych styl\u00F3w aran\u017Cacji.\n\n\uD83D\uDD25 OGRANICZENIA KWALIFIKACYJNE (MUST-FOLLOW CONSTRAINTS):\n1. **Pytania Merytoryczne:** Odpowiadaj **wy\u0142\u0105cznie** na podstawie [DOCS_MDM]. B\u0105d\u017A precyzyjny i ekspercki.\n2. **Pytania o Cen\u0119 (CENOWY BOT):** Wymagaj 3 parametr\u00F3w (Model, Opcja, Odleg\u0142o\u015B\u0107). U\u017Cyj `calculate_base_cost_estimate`, a nast\u0119pnie linku do formularza: [https://forms.gle/cUXUqb9E51UHf6vU8].\n3. **Pytania Wizualne (RENDER BOT):** Wymagaj 2 atrybut\u00F3w (Widok, Styl), a nast\u0119pnie u\u017Cyj funkcji `generate_interior_render`.\n4. **Dyrektywa Eskalacji:** U\u017Cyj funkcji `request_sales_callback` po pozytywnej kwalifikacji LUB po 3 nieudanych pr\u00F3bach uzyskania kluczowych danych (Impas/Blokada).\n5. **Dyrektywa Statystyk (Ciche Logowanie):** ZAWSZE, przed zwr\u00F3ceniem odpowiedzi do klienta, u\u017Cyj funkcji `log_interaction_data` do rejestracji nast\u0119puj\u0105cych zdarze\u0144: PRICE_REQUEST_ATTEMPT, VISUALIZATION_GENERATED, ESCALATION_INITIATED, RAG_QUERY_SUCCESS.\n\n[TON_OF_VOICE]: Rygorystyczny profesjonalista, ekspert.\n";
/**
 * Simulates the Gemini interaction loop.
 * In a real app, this would send the message to the Gemini API.
 * Here, we simulate the logic and the "Silent Logging" tool calls.
 */
var processUserMessage = function (userMessage) { return __awaiter(void 0, void 0, void 0, function () {
    var ragFiles, ragLoaded, lowerMsg, modelMatch, optionMatch, distanceMatch, model, option, distNumMatch, distance, price, model, option, distance, price, model, option, distance, price;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ragFiles = ['docs_mdm.pdf', 'pricing_data.csv'];
                ragLoaded = true;
                if (ragLoaded) {
                    (0, geminiTools_1.log_interaction_data)('RAG_QUERY_SUCCESS', "Context loaded from ".concat(ragFiles.join(', '), ". User query: \"").concat(userMessage, "\""));
                }
                else {
                    console.warn("RAG files not found");
                }
                // Simulate network delay
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 800); })];
            case 1:
                // Simulate network delay
                _a.sent();
                lowerMsg = userMessage.toLowerCase();
                // 0. Check for Escalation/Impasse (User refuses to provide data)
                if (lowerMsg.includes('nie chcę') || lowerMsg.includes('nie podam') || lowerMsg.includes('nie będę') || lowerMsg.includes('po prostu powiedz') || lowerMsg.includes('nie lubię formularzy') || lowerMsg.includes('natychmiast') || lowerMsg.includes('nie wypełniam')) {
                    (0, geminiTools_1.request_sales_callback)("Client Refusal/Impasse", userMessage);
                    (0, geminiTools_1.log_interaction_data)('ESCALATION_INITIATED', "User refused to provide data: \"".concat(userMessage, "\""));
                    return [2 /*return*/, "Rozumiem, \u017Ce wolisz szybsz\u0105 \u015Bcie\u017Ck\u0119. Jako AI musz\u0119 trzyma\u0107 si\u0119 procedur, ale szanuj\u0119 Tw\u00F3j czas. Przekazuj\u0119 Twoj\u0105 spraw\u0119 bezpo\u015Brednio do Starszego Doradcy.\n\nAby przyspieszy\u0107 kontakt, prosz\u0119 podaj sw\u00F3j numer telefonu.\n\nMo\u017Cesz te\u017C skontaktowa\u0107 si\u0119 z nami bezpo\u015Brednio:\n\uD83D\uDCDE +48 533 989 987\n\uD83D\uDCE7 prefab@mdmenergy.pl"];
                }
                modelMatch = userMessage.match(/MDM\s?(\d+)/i);
                optionMatch = lowerMsg.includes('deweloperski') ? 'Stan Deweloperski' :
                    lowerMsg.includes('surowy') ? 'Stan Surowy' : null;
                distanceMatch = lowerMsg.includes('odległość') || lowerMsg.includes('km') || lowerMsg.includes('budowa');
                // 0. Immediate match for all 3 parameters (Model + Option + Distance)
                if (modelMatch && optionMatch && distanceMatch) {
                    model = "MDM".concat(modelMatch[1]);
                    option = optionMatch;
                    distNumMatch = userMessage.match(/(\d+)\s?km/i);
                    distance = distNumMatch ? "".concat(distNumMatch[1], " km") : "100 km";
                    price = (0, geminiTools_1.calculate_base_cost_estimate)(model, option, distance);
                    (0, geminiTools_1.log_interaction_data)('PRICE_CALCULATED', "Price calculated for ".concat(model, ", ").concat(option, ", ").concat(distance));
                    return [2 /*return*/, "Dzi\u0119kuj\u0119. Mam ju\u017C komplet danych:\n- Model: **".concat(model, "**\n- Opcja: **").concat(option, "**\n- Odleg\u0142o\u015B\u0107: **").concat(distance, "**\n\nSzacunkowa cena bazowa to: **").concat(price.toLocaleString(), " PLN**.\n\nAby otrzyma\u0107 wi\u0105\u017C\u0105c\u0105 ofert\u0119, wype\u0142nij formularz: [https://forms.gle/cUXUqb9E51UHf6vU8]")];
                }
                if (lowerMsg.includes('cena') || lowerMsg.includes('koszt') || lowerMsg.includes('ile kosztuje')) {
                    (0, geminiTools_1.log_interaction_data)('PRICE_REQUEST_ATTEMPT', "User asked for price info: \"".concat(userMessage, "\""));
                    if (modelMatch && optionMatch && !distanceMatch) {
                        return [2 /*return*/, "Widz\u0119, \u017Ce interesuje Ci\u0119 model **MDM".concat(modelMatch[1], "** w opcji **").concat(optionMatch, "**. Aby poda\u0107 finaln\u0105 cen\u0119, potrzebuj\u0119 jeszcze jednej informacji: **Kategoria odleg\u0142o\u015Bci** placu budowy (np. do 100km, 100-200km, itd.).")];
                    }
                    return [2 /*return*/, "Aby przygotować precyzyjną wycenę, potrzebuję od Ciebie trzech informacji: jaki Model domu Cię interesuje, jaką Opcję wykończenia wybierasz oraz jaka jest Kategoria odległości placu budowy?"];
                }
                // Handle follow-up for distance (Heuristic for demo flow)
                if (distanceMatch && !lowerMsg.includes('bez stanu deweloperskiego')) {
                    model = "MDM74";
                    option = "Stan Deweloperski";
                    distance = "100 km";
                    price = (0, geminiTools_1.calculate_base_cost_estimate)(model, option, distance);
                    (0, geminiTools_1.log_interaction_data)('PRICE_CALCULATED', "Price calculated for ".concat(model, ", ").concat(option, ", ").concat(distance));
                    return [2 /*return*/, "Dzi\u0119kuj\u0119. Mam ju\u017C komplet danych:\n- Model: **".concat(model, "**\n- Opcja: **").concat(option, "**\n- Odleg\u0142o\u015B\u0107: **").concat(distance, "**\n\nSzacunkowa cena bazowa to: **").concat(price.toLocaleString(), " PLN**.\n\nAby otrzyma\u0107 wi\u0105\u017C\u0105c\u0105 ofert\u0119, wype\u0142nij formularz: [https://forms.gle/cUXUqb9E51UHf6vU8]")];
                }
                // Handle follow-up for changing option (Context: MDM74, 100km)
                if (lowerMsg.includes('bez stanu deweloperskiego') || lowerMsg.includes('stan surowy') || lowerMsg.includes('inna opcja')) {
                    model = "MDM74";
                    option = "Stan Surowy Zamknięty";
                    distance = "100 km";
                    price = (0, geminiTools_1.calculate_base_cost_estimate)(model, option, distance);
                    (0, geminiTools_1.log_interaction_data)('PRICE_CALCULATED', "Price calculated for ".concat(model, ", ").concat(option, ", ").concat(distance));
                    return [2 /*return*/, "Rozumiem, sprawdzam opcj\u0119 **".concat(option, "** dla modelu **").concat(model, "** (odleg\u0142o\u015B\u0107: ").concat(distance, ").\n\nSzacunkowa cena bazowa to: **").concat(price.toLocaleString(), " PLN**.\n\nAby otrzyma\u0107 wi\u0105\u017C\u0105c\u0105 ofert\u0119, wype\u0142nij formularz: [https://forms.gle/cUXUqb9E51UHf6vU8]")];
                }
                if (lowerMsg.includes('wizualizacj') || lowerMsg.includes('wygląda') || lowerMsg.includes('zdjęcie')) {
                    (0, geminiTools_1.log_interaction_data)('VISUALIZATION_GENERATED', "User asked for visualization: \"".concat(userMessage, "\""));
                    // Note: In a real flow, we might call generate_interior_render here too if we had params.
                    return [2 /*return*/, "Chętnie przygotuję wizualizację. Proszę podaj jaki Widok (np. salon, kuchnia) oraz Styl (np. nowoczesny, skandynawski) Cię interesuje?"];
                }
                if (lowerMsg.includes('kontakt') || lowerMsg.includes('człowiek') || lowerMsg.includes('doradc')) {
                    (0, geminiTools_1.log_interaction_data)('ESCALATION_INITIATED', "User requested human contact: \"".concat(userMessage, "\""));
                    return [2 /*return*/, "Rozumiem. Przekazuję Twoje zgłoszenie do naszego działu sprzedaży. Skontaktujemy się z Tobą wkrótce."];
                }
                if (lowerMsg.includes('rei') || lowerMsg.includes('kvh') || lowerMsg.includes('drewn') || lowerMsg.includes('technolog')) {
                    (0, geminiTools_1.log_interaction_data)('RAG_QUERY_SUCCESS', "Technical query matched in [DOCS_MDM]. User query: \"".concat(userMessage, "\""));
                    return [2 /*return*/, "Zgodnie z dokumentacją techniczną [DOCS_MDM]:\n1. Nasze panele ścienne posiadają klasę odporności ogniowej **REI 60**.\n2. Konstrukcja szkieletowa oparta jest wyłącznie na certyfikowanym, suszonym komorowo i struganym czterostronnie drewnie **KVH C24**."];
                }
                // Default response falling back to "Rygorystyczny profesjonalista" persona
                return [2 /*return*/, "Jako Wirtualny Architekt Sprzedaży MDM Energy, służę pomocą w kwestiach technicznych dotyczących naszych domów prefabrykowanych (REI, KVH C24). Proszę o sprecyzowanie pytania."];
        }
    });
}); };
exports.processUserMessage = processUserMessage;
