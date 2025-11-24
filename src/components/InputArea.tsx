import React, { useState } from 'react';

interface InputAreaProps {
    onSend: (message: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    return (
        <footer style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid var(--glass-border)',
            zIndex: 10
        }}>
            <form onSubmit={handleSubmit} style={{
                width: '100%',
                display: 'flex',
                gap: '12px',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '24px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                <button
                    type="submit"
                    style={{
                        padding: '12px 24px',
                        borderRadius: '24px',
                        border: 'none',
                        backgroundColor: 'var(--accent-primary)',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
                >
                    Send
                </button>
            </form>
        </footer>
    );
};

export default InputArea;
