import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Cpu, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  Save,
  Zap
} from 'lucide-react';

export default function ConfigSettingsModal({ isOpen, onClose, onConfigSaved }) {
  const [provider, setProvider] = useState('gemini');
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:8000/api/config/status')
        .then(res => res.json())
        .then(data => {
          setStatus(data);
          setProvider(data.active_provider || 'gemini');
        })
        .catch(err => console.error("Error loading config status:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('http://localhost:8000/api/config/update-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: provider,
          gemini_key: geminiKey || undefined,
          groq_key: groqKey || undefined,
          openai_key: openaiKey || undefined
        })
      });
      const data = await res.json();
      alert("Configuration and API keys updated successfully!");
      if (onConfigSaved) onConfigSaved(data.status);
      onClose();
    } catch (err) {
      alert("Error saving configuration: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '28px', position: 'relative' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Key size={22} color="#030712" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>LLM Provider & Key Management</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configure reasoning model backends and API credentials</p>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Active Provider Selector */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Active Primary LLM Engine
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { id: 'gemini', label: 'Google Gemini', sub: 'gemini-2.5-flash', active: status?.gemini_configured },
                { id: 'groq', label: 'Groq Cloud', sub: 'qwen/qwen3.8-27b', active: status?.groq_configured },
                { id: 'openai', label: 'OpenAI GPT', sub: 'gpt-4o-mini', active: status?.openai_configured }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: '10px',
                    background: provider === p.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: provider === p.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)',
                    color: provider === p.id ? '#fff' : 'var(--text-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{p.label}</span>
                    {p.active && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Gemini Key Input */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Google Gemini API Key {status?.gemini_configured && <span style={{ color: '#10b981' }}>(✓ Configured)</span>}
            </label>
            <input
              type="password"
              className="input-field font-mono"
              placeholder="AQ.Ab8RN6... (Leave blank to keep existing key)"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
            />
          </div>

          {/* Groq Key Input */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Groq API Key {status?.groq_configured && <span style={{ color: '#10b981' }}>(✓ Configured)</span>}
            </label>
            <input
              type="password"
              className="input-field font-mono"
              placeholder="gsk_... (Leave blank to keep existing key)"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
            />
          </div>

          {/* OpenAI Key Input */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              OpenAI API Key {status?.openai_configured && <span style={{ color: '#10b981' }}>(✓ Configured)</span>}
            </label>
            <input
              type="password"
              className="input-field font-mono"
              placeholder="sk-proj-... (Leave blank to keep existing key)"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save & Apply Config'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
