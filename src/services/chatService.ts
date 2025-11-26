import { GoogleGenerativeAI } from "@google/generative-ai";
import { log_interaction_data, request_sales_callback } from './geminiTools';
// @ts-ignore
import ragText from '../data/baza_wiedzy_mdm.txt?raw';

// 🔥 HARDCODED KEY - OSTATECZNA PRÓBA 🔥
// Wklej tu swój klucz (zachowaj cudzysłowy!)
const API_KEY = "AIzaSyDGmaZpOb8pD0FDwqTqsuPCOi4xkyHJsgE"; 

export const processUserMessage = async (userMessage: string): Promise<string> => {
    // Diagnostyka widoczna w odpowiedzi bota (żebyś wiedział, że to nowa wersja)
    console.log("Uruchamiam z kluczem hardcoded...");

    if (!API_KEY || API_KEY.includes("TU_WKLEJ")) {
        return "BŁĄD KRYTYCZNY: Nie wkleiłeś klucza do pliku chatService.ts!";
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Używamy Flash dla szybkości i pewności
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Jesteś Wirtualnym Pomocnikiem Klienta MDM Energy.
        Baza wiedzy:
        ${ragText}
        
        Zasady:
        1. Odpowiadaj tylko na podstawie bazy.
        2. Ceny są orientacyjne.
        3. Linki Markdown: [Tekst](URL).
        4. Styl: Krótko, po polsku.

        Pytanie: "${userMessage}"
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();

    } catch (error: any) {
        console.error("Błąd Gemini:", error);
        return `Błąd połączenia z AI: ${error.message}. Sprawdź czy klucz jest aktywny.`;
    }
};