"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
require("../styles/global.css");
var Header = function () {
    return (<header style={{
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
                MDM Sales Architect
            </h1>
        </header>);
};
exports.default = Header;
