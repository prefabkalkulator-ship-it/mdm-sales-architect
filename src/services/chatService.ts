import { log_interaction_data } from './geminiTools';

export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    content: string;
}

/**
 * Sends the user message to the backend proxy /api/chat.
 * The backend handles the Gemini API call and RAG logic.
 */
export const processUserMessage = async (userMessage: string, history: any[] = []): Promise<string> => {
    try {
        log_interaction_data('PROXY_API_CALL', `Sending query to backend proxy: "${userMessage}"`);

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage, history: history })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Backend Error:", response.status, errorData);
            throw new Error(errorData.error || `Błąd serwera: ${response.status}`);
        }

        const data = await response.json();

        log_interaction_data('PROXY_API_SUCCESS', `Received response from backend`);
        return data.reply;

    } catch (error: any) {
        console.error("Proxy Request Failed:", error);
        log_interaction_data('PROXY_API_ERROR', `Backend proxy failed: ${error.message}`);
        return "Przepraszam, mam problem z połączeniem z serwerem. Spróbuj później.";
    }
};