import React, { useState, useEffect } from 'react';

interface InputAreaProps {
    onSend: (message: string) => void;
}

// Type definition for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const InputArea: React.FC<InputAreaProps> = ({ onSend }) => {
    const [message, setMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const FACTORY_LAT = 50.70266245532505;
    const FACTORY_LON = 18.99406848017555;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d.toFixed(1);
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    const handleLocationClick = () => {
        if (!navigator.geolocation) {
            alert("Twoja przeglądarka nie obsługuje geolokalizacji.");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const distance = calculateDistance(lat, lon, FACTORY_LAT, FACTORY_LON);

                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const precisionNote = isMobile ? "" : " (Uwaga: Lokalizacja z komputera może być przybliżona)";

                const locationMessage = `Sprawdziłem lokalizację GPS: Znajduję się ok. ${distance} km w linii prostej od Waszego zakładu produkcyjnego.${precisionNote}`;

                onSend(locationMessage);
                setIsLocating(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Proszę włączyć lokalizację, aby obliczyć odległość.");
                setIsLocating(false);
            }
        );
    };

    const handleVoiceInput = () => {
        // Wybierz standardową wersję LUB wersję Apple (webkit)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Twoja przeglądarka nie obsługuje rozpoznawania mowy. Spróbuj Safari lub Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = 'pl-PL';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setMessage(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') {
                alert("Brak dostępu do mikrofonu. Sprawdź Ustawienia -> Safari -> Mikrofon");
            }
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <footer style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            // Reduced padding for mobile responsiveness
            padding: '0 10px',
            display: 'flex',
            alignItems: 'center',
            // Footer BG: #656668 (Stalowy Szary)
            backgroundColor: '#656668',
            borderTop: '1px solid var(--glass-border)',
            zIndex: 10
        }}>
            <form onSubmit={handleSubmit} style={{
                width: '100%',
                display: 'flex',
                // Flex layout fix
                flexWrap: 'nowrap',
                gap: '12px',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                {/* Voice Input Button */}
                <button
                    type="button"
                    onClick={handleVoiceInput}
                    style={{
                        padding: '12px',
                        borderRadius: '50%',
                        border: 'none',
                        // Mic Button: Lime Green (#9ACA3C) BG, White Icon (#FFFFFF)
                        backgroundColor: isListening ? '#ef4444' : '#9ACA3C',
                        color: '#FFFFFF', // White Icon
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        boxShadow: 'var(--shadow-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // Fixed width and no shrink
                        width: '48px',
                        height: '48px',
                        flexShrink: 0
                    }}
                    title="Nagraj wiadomość"
                >
                    {/* Microphone SVG Icon (Heroicons MicrophoneIcon) */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FFFFFF" style={{ width: '24px', height: '24px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                </button>

                {/* GPS Location Button */}
                <button
                    type="button"
                    onClick={handleLocationClick}
                    disabled={isLocating}
                    style={{
                        padding: '12px',
                        borderRadius: '50%',
                        border: 'none',
                        // MapPin Button: Lime Green (#9ACA3C) BG, White Icon (#FFFFFF)
                        backgroundColor: isLocating ? '#656668' : '#9ACA3C',
                        color: '#FFFFFF', // White Icon
                        cursor: isLocating ? 'wait' : 'pointer',
                        transition: 'background-color 0.2s',
                        boxShadow: 'var(--shadow-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // Fixed width and no shrink
                        width: '48px',
                        height: '48px',
                        flexShrink: 0
                    }}
                    title="Oblicz odległość od fabryki"
                >
                    {/* MapPin SVG Icon (Heroicons) */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                </button>

                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Wpisz wiadomość..."
                    style={{
                        // Flex 1 to take available space
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '24px',
                        border: '1px solid var(--border-color)',
                        // Input BG: #4D4D4F (Ciemny Antracyt)
                        backgroundColor: '#4D4D4F',
                        // Input Text: #FFFFFF (Biały)
                        color: '#FFFFFF',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        // Ensure it doesn't overflow
                        minWidth: 0
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#9ACA3C'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                <button
                    type="submit"
                    style={{
                        padding: '12px 24px',
                        borderRadius: '24px',
                        border: 'none',
                        // Send Button: Lime BG, White Text
                        backgroundColor: '#9ACA3C',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        boxShadow: 'var(--shadow-lg)',
                        // Fixed width/shrink prevention if needed, but text button usually adapts. 
                        // User asked for fixed width or min-width. Let's use min-width to be safe for text.
                        minWidth: '80px',
                        flexShrink: 0
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#8ab535'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#9ACA3C'}
                >
                    Wyślij
                </button>
            </form>
        </footer>
    );
};

export default InputArea;
