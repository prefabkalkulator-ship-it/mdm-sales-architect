import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSpeak = (text: string, index: number) => {
        if (speakingMessageId === index) {
            // Stop speaking if clicked again
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
            return;
        }

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pl-PL';

        utterance.onend = () => {
            setSpeakingMessageId(null);
        };

        utterance.onerror = () => {
            setSpeakingMessageId(null);
        };

        setSpeakingMessageId(index);
        window.speechSynthesis.speak(utterance);
    };

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
                        // Forced Colors:
                        // User: #9ACA3C (Limonka)
                        // Bot: #656668 (Stalowy Szary)
                        backgroundColor: msg.role === 'user' ? '#9ACA3C' : '#656668',
                        // Text: #FFFFFF (Biały) - CRITICAL
                        color: '#FFFFFF',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '0.95rem',
                        lineHeight: '1.5',
                        position: 'relative' // For positioning elements if needed
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ flex: 1, overflowX: 'auto' }}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    a: ({ node, ...props }) => {
                                        // Check if it's a video link (YouTube or .mp4) and contains an image
                                        const isVideoLink = props.href && (props.href.includes('youtube.com') || props.href.includes('youtu.be') || props.href.endsWith('.mp4'));
                                        const hasImageChild = node.children.some(child => child.type === 'element' && child.tagName === 'img');

                                        if (isVideoLink && hasImageChild) {
                                            return (
                                                <a {...props} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
                                                    <div className="video-thumbnail-wrapper">
                                                        {props.children}
                                                    </div>
                                                </a>
                                            );
                                        }

                                        return (
                                            <a
                                                {...props}
                                                style={{
                                                    // Links: #9ACA3C (Limonka) - CRITICAL
                                                    color: msg.role === 'user' ? '#FFFFFF' : '#9ACA3C',
                                                    textDecoration: 'underline',
                                                    fontWeight: 'bold'
                                                }}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            />
                                        );
                                    },
                                    p: ({ node, ...props }) => {
                                        // Check if paragraph contains only images (or mostly images)
                                        // Simple heuristic: if children has more than 1 image, treat as gallery
                                        const hasImages = node.children.some(child => child.type === 'element' && child.tagName === 'img');
                                        const isGallery = hasImages && node.children.length > 1;

                                        return (
                                            <p
                                                style={{
                                                    margin: 0,
                                                    display: isGallery ? 'flex' : 'block',
                                                    overflowX: isGallery ? 'auto' : 'visible',
                                                    gap: isGallery ? '10px' : '0',
                                                    paddingBottom: isGallery ? '10px' : '0',
                                                    marginBottom: '10px',
                                                    color: '#FFFFFF',
                                                    fontSize: '0.9em'
                                                }} {...props} />
                                        );
                                    },
                                    img: ({ node, ...props }) => {
                                        // Check if it's a video thumbnail based on alt text
                                        const isVideo = props.alt?.toLowerCase().includes('wideo') ||
                                            props.alt?.toLowerCase().includes('film') ||
                                            props.alt?.toLowerCase().includes('zobacz');

                                        if (isVideo) {
                                            return (
                                                <img
                                                    {...props}
                                                    style={{
                                                        maxHeight: '200px',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                        cursor: 'pointer',
                                                        maxWidth: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                // No onClick handler for lightbox, let parent <a> handle navigation
                                                />
                                            );
                                        }

                                        return (
                                            <img
                                                {...props}
                                                style={{
                                                    maxHeight: '200px',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                    cursor: 'pointer',
                                                    maxWidth: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                onClick={() => window.open(props.src, '_blank')}
                                                title="Kliknij, aby powiększyć"
                                            />
                                        );
                                    },
                                    // Table Styles
                                    table: ({ node, ...props }) => (
                                        <table style={{
                                            borderCollapse: 'collapse',
                                            width: '100%',
                                            marginTop: '10px',
                                            marginBottom: '10px',
                                            color: '#FFFFFF',
                                            fontSize: '0.9em'
                                        }} {...props} />
                                    ),
                                    th: ({ node, ...props }) => (
                                        <th style={{
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            padding: '8px',
                                            textAlign: 'left',
                                            backgroundColor: 'rgba(0,0,0,0.2)'
                                        }} {...props} />
                                    ),
                                    td: ({ node, ...props }) => (
                                        <td style={{
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            padding: '8px'
                                        }} {...props} />
                                    )
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>

                        {/* TTS Button for Bot Messages */}
                        {msg.role === 'model' && (
                            <button
                                onClick={() => handleSpeak(msg.content, index)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0',
                                    marginLeft: '8px',
                                    color: '#9ACA3C', // Limonka for visibility on dark gray
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '24px'
                                }}
                                title={speakingMessageId === index ? "Zatrzymaj czytanie" : "Przeczytaj wiadomość"}
                            >
                                {speakingMessageId === index ? (
                                    // Stop Icon (Square)
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
                                        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    // Speaker Icon
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
                                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                                        <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                                    </svg>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {isLoading && (
                <div style={{ alignSelf: 'flex-start', color: '#656668', paddingLeft: '10px', fontStyle: 'italic' }}>
                    Piszę...
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatArea;