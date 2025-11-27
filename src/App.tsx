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

function App() {
  // Forced Greeting Update
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Witaj! Jestem Wirtualnym Pomocnikiem MDM Energy. W czym mogę pomóc?' }
  ]);

  const handleSend = async (text: string) => {
    // Add user message immediately
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    // Process with simulated Gemini service
    try {
      const responseText = await processUserMessage(text);
      const modelMsg: Message = { role: 'model', content: responseText };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  return (
    <>
      <Header />
      <ChatArea messages={messages} />
      <InputArea onSend={handleSend} />
    </>
  );
}

export default App;
