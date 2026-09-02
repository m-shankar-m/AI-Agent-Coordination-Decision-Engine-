import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Layers, 
  FileText, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  Zap
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  llmStatus, 
  pendingHitlCount, 
  onOpenSettings, 
  connected 
}) {
  const tabs = [
    { id: 'studio', label: 'Workflow Studio', icon: Zap },
    { id: 'graph', label: 'Agent Topology', icon: Layers },
    { id: 'hitl', label: 'HITL Review Queue', icon: AlertTriangle, badge: pendingHitlCount },
    { id: 'knowledge', label: 'Policy Vector DB', icon: FileText },
    { id: 'audit', label: 'Audit & Telemetry', icon: BarChart3 },
  ];

  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)'
        }}>
          <ShieldCheck size={26} color="#030712" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BFSI AGENT ENGINE
            </h1>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Enterprise 1.0</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Autonomous Multi-Agent Coordination & Decision Platform
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(5, 8, 20, 0.6)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(59, 130, 246, 0.2))' : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <Icon size={16} color={isActive ? '#38bdf8' : '#94a3b8'} />
              <span>{tab.label}</span>
              {Boolean(tab.badge) && tab.badge > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '999px',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status & Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: connected ? '#10b981' : '#f59e0b',
            boxShadow: connected ? '0 0 10px #10b981' : 'none'
          }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            LLM: <strong style={{ color: '#38bdf8' }}>{llmStatus?.active_provider?.toUpperCase() || 'GEMINI'}</strong>
          </span>
        </div>

        <button 
          onClick={onOpenSettings}
          className="btn btn-secondary" 
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          title="Configure API Keys & LLMs"
        >
          <Settings size={16} />
          <span style={{ fontSize: '0.75rem' }}>Config</span>
        </button>
      </div>
    </header>
  );
}
