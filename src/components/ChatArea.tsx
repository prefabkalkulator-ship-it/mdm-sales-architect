import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'model' | 'system';
    content: string;
}

interface ChatAreaProps {
    messages: Message[];
    isLoading: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginBottom: '80px', // Space for input area
            marginTop: '60px'     // Space for header
        }}>
            {messages.map((msg, index) => (
                <div
                    key={index}
                    style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: msg.role === 'user' ? '#3b82f6' : '#374151', // Blue for user, Dark Gray for bot
                        color: '#ffffff',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '0.95rem',
                        lineHeight: '1.5'
                    }}
                >
                    {/* TO JEST KLUCZOWA ZMIANA: Użycie ReactMarkdown */}
                    <ReactMarkdown
                        components={{
                            a: ({node, ...props}) => (
                                <a 
                                    {...props} 
                                    style={{ color: '#60a5fa', textDecoration: 'underline', fontWeight: 'bold' }} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                />
                            ),
                            p: ({node, ...props}) => <p style={{ margin: 0 }} {...props} />
                        }}
                    >
                        {msg.content}
                    </ReactMarkdown>
                </div>
            ))}
            
            {isLoading && (
                <div style={{ alignSelf: 'flex-start', color: '#9ca3af', paddingLeft: '10px', fontStyle: 'italic' }}>
                    Piszę...
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatArea;