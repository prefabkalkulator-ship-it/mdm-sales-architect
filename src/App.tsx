import { useState } from 'react';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import { processUserMessage } from './services/chatService';
import './styles/global.css';

interface Message {
  role: 'user' | 'model';
  content: string;
}

// Logika Świąteczna
const getInitialGreeting = (): Message => {
  const now = new Date();
  const month = now.getMonth(); // 0 = Styczeń, 11 = Grudzień
  const day = now.getDate();

  // Sprawdź czy jest Grudzień LUB (Styczeń i dzień <= 4)
  const isHolidaySeason = month === 11 || (month === 0 && day <= 4);
  const text = isHolidaySeason
    ? "Witaj! Jestem Wirtualnym Pomocnikiem MDM Energy. Na wstępie: Wesołych Świąt i Szczęśliwego Nowego Roku! 🎄 W czym mogę pomóc?"
    : "Witaj! Jestem Wirtualnym Pomocnikiem MDM Energy. W czym mogę pomóc?";
  return { role: 'model', content: text };
};

function App() {
  // Forced Greeting Update
  const [messages, setMessages] = useState<Message[]>([getInitialGreeting()]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text: string) => {
    // Add user message immediately
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Process with simulated Gemini service
    try {
      // Filter history: remove errors, loading states, and keep only role/content
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'model')
        .map(m => ({ role: m.role, content: m.content }));

      const responseText = await processUserMessage(text, history);
      const modelMsg: Message = { role: 'model', content: responseText };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <ChatArea messages={messages} isLoading={isLoading} />
      <InputArea onSend={handleSend} />
    </>
  );
}

export default App;
