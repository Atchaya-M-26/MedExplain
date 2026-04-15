import React, { useState, useRef, useEffect, useContext } from 'react';
import { chatbotService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'தமிழ்' },
  { value: 'hi', label: 'हिंदी' },
];

const SUGGESTIONS = [
  'What is my condition?',
  'What medications are listed?',
  'Are my test results normal?',
  'When should I follow up?',
  'What does hemoglobin mean?',
  'Am I at risk?',
];

const Chatbot = ({ reportId, extractedData }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hello! I can help you understand your medical report. Ask me about your condition, medications, test results, or any medical terms.', terms: [] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(user?.language || 'en');
  const [showTerms, setShowTerms] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await chatbotService.sendMessage(q, reportId, language);
      const d = res.data;
      setMessages(prev => [...prev, {
        type: 'bot',
        content: d.response || 'No response received.',
        terms: d.simplified_terms || [],
        intent: d.intent,
      }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errMsg = err.response?.data?.error || 'Sorry, I could not process your question. Please try again.';
      setMessages(prev => [...prev, { type: 'bot', content: errMsg, terms: [] }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-surface-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dk))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>💬</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)' }}>Report Assistant</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Ask about your report</div>
          </div>
        </div>
        {/* Language selector */}
        <select value={language} onChange={e => setLanguage(e.target.value)} style={{ fontSize: '0.78rem', border: '1px solid var(--color-border)', borderRadius: 6, padding: '3px 8px', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', outline: 'none' }}>
          {LANG_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: 0 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%', padding: '0.65rem 0.9rem', borderRadius: msg.type === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.type === 'user' ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dk))' : 'var(--color-surface-2)',
              color: msg.type === 'user' ? '#fff' : 'var(--color-text)',
              fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
              border: msg.type === 'bot' ? '1px solid var(--color-border)' : 'none',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {msg.content}
            </div>
            {/* Simplified terms */}
            {msg.type === 'bot' && msg.terms?.length > 0 && (
              <div style={{ marginTop: '0.35rem', maxWidth: '82%' }}>
                <button onClick={() => setShowTerms(showTerms === i ? null : i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--color-accent)', fontWeight: 600, padding: 0 }}>
                  {showTerms === i ? '▲ Hide' : '▼ Show'} medical terms ({msg.terms.length})
                </button>
                {showTerms === i && (
                  <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {msg.terms.map((t, j) => (
                      <div key={j} style={{ background: 'var(--color-accent-lt)', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-text)' }}>
                        <strong style={{ color: 'var(--color-accent)' }}>{t.term}</strong> — {t.meaning}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '14px 14px 14px 4px', padding: '0.65rem 0.9rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0, 1, 2].map(d => (
                <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulse 1.2s ease infinite', animationDelay: `${d * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--color-border-lt)', display: 'flex', gap: '0.4rem', overflowX: 'auto', flexWrap: 'nowrap' }}>
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => send(s)} style={{ flexShrink: 0, background: 'var(--color-accent-lt)', border: '1px solid var(--color-accent)', borderRadius: 20, padding: '3px 10px', fontSize: '0.72rem', color: 'var(--color-accent)', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-accent-lt)'; e.currentTarget.style.color = 'var(--color-accent)'; }}>
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about your report…"
          rows={1}
          style={{ flex: 1, resize: 'none', border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '0.55rem 0.85rem', fontSize: '0.875rem', fontFamily: 'var(--font-family)', color: 'var(--color-text)', background: 'var(--color-bg)', outline: 'none', lineHeight: 1.5, transition: 'border-color 0.15s', maxHeight: 100, overflowY: 'auto' }}
          onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
          disabled={loading}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.875rem', flexShrink: 0 }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
