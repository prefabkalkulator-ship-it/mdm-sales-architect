"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var InputArea = function (_a) {
    var onSend = _a.onSend;
    var _b = (0, react_1.useState)(''), message = _b[0], setMessage = _b[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };
    return (<footer style={{
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
                <input type="text" value={message} onChange={function (e) { return setMessage(e.target.value); }} placeholder="Type your message..." style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s'
        }} onFocus={function (e) { return e.target.style.borderColor = 'var(--accent-primary)'; }} onBlur={function (e) { return e.target.style.borderColor = 'var(--border-color)'; }}/>
                <button type="submit" style={{
            padding: '12px 24px',
            borderRadius: '24px',
            border: 'none',
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            boxShadow: 'var(--shadow-lg)'
        }} onMouseOver={function (e) { return e.currentTarget.style.backgroundColor = 'var(--accent-hover)'; }} onMouseOut={function (e) { return e.currentTarget.style.backgroundColor = 'var(--accent-primary)'; }}>
                    Send
                </button>
            </form>
        </footer>);
};
exports.default = InputArea;
