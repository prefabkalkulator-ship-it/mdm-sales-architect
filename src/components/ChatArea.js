"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ChatArea = function (_a) {
    var messages = _a.messages;
    var bottomRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var _a;
        (_a = bottomRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    return (<main style={{
            flex: 1,
            marginTop: '60px',
            marginBottom: '80px',
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
      {messages.map(function (msg, index) { return (<div key={index} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                maxWidth: '80%',
                border: msg.role !== 'user' ? '1px solid var(--border-color)' : 'none',
                boxShadow: msg.role === 'user' ? 'var(--shadow-lg)' : 'none',
                whiteSpace: 'pre-wrap'
            }}>
          <p>{msg.content}</p>
        </div>); })}
      <div ref={bottomRef}/>
    </main>);
};
exports.default = ChatArea;
