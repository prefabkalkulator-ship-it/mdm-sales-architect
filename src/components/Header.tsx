import React from 'react';
import '../styles/global.css';

const Header: React.FC = () => {
    return (
        <header style={{
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            backgroundColor: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--glass-border)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            boxShadow: 'var(--shadow-lg)'
        }}>
            <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                Wirtualny Pomocnik MDM Energy (Wersja V6)
            </h1>
        </header>
    );
};

export default Header;
