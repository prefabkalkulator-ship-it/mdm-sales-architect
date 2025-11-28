import React, { useState, useEffect } from 'react';
import '../styles/global.css';

const Header: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Seasonal Logic
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    const isHolidaySeason = month === 11 || (month === 0 && day <= 4);

    useEffect(() => {
        if (isHolidaySeason) {
            document.body.classList.add('snow-bg');
        } else {
            document.body.classList.remove('snow-bg');
        }
        return () => {
            document.body.classList.remove('snow-bg');
        };
    }, [isHolidaySeason]);

    const handleInfoClick = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <header style={{
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                // Background: #4D4D4F (Ciemny Antracyt)
                backgroundColor: '#4D4D4F',
                // Text: #FFFFFF (Biały)
                color: '#FFFFFF',
                borderBottom: '1px solid var(--glass-border)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                boxShadow: 'var(--shadow-lg)',
                gap: '10px' // Added gap
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src="/pwa-192x192.png"
                        alt="MDM Energy Logo"
                        style={{ height: '40px', marginRight: '15px' }}
                    />
                    <h1 style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#FFFFFF', // White text
                        margin: 0
                    }}>
                        Wirtualny Pomocnik MDM Energy {isHolidaySeason && <span style={{ fontSize: '1.2em' }}>🎄</span>}
                    </h1>
                </div>

                <button
                    onClick={handleInfoClick}
                    style={{
                        backgroundColor: '#9ACA3C', // Limonka
                        color: '#FFFFFF',           // White text
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        padding: 0,
                        flexShrink: 0 // Prevent shrinking
                    }}
                    title="Informacje"
                >
                    i
                </button>
            </header>

            {/* Custom Modal Overlay */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={closeModal}>
                    {/* Modal Content */}
                    <div style={{
                        backgroundColor: '#FFFFFF', // White background
                        color: '#4D4D4F',           // Dark text for readability
                        padding: '25px',
                        borderRadius: '16px',       // Rounded corners
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Shadow
                        maxWidth: '90%',
                        width: '400px',
                        position: 'relative',
                        textAlign: 'left'
                    }} onClick={(e) => e.stopPropagation()}>

                        <h2 style={{
                            marginTop: 0,
                            marginBottom: '15px',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#4D4D4F'
                        }}>
                            O co możesz zapytać?
                        </h2>

                        <ul style={{
                            paddingLeft: '20px',
                            lineHeight: '1.6',
                            marginBottom: '25px'
                        }}>
                            <li><strong>Ceny i modele:</strong> O cenach naszych typowych domów</li>
                            <li><strong>Wizualizacje:</strong> O tym, jak wyglądają nasze domy</li>
                            <li><strong>Technologia:</strong> O technologii, jaką stosujemy</li>
                            <li><strong>Formalności:</strong> O formalnościach, które musimy załatwić</li>
                            <li><strong>Kontakt:</strong> Gdzie można zobaczyć nasze domy</li>
                            <li><strong>Spotkanie:</strong> Jak zamówić wycenę albo umówić się na spotkanie</li>
                        </ul>

                        <button
                            onClick={closeModal}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: '#9ACA3C', // Limonka
                                color: '#FFFFFF',           // White text
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
