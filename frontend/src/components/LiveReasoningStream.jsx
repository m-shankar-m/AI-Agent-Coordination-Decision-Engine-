import React, { useState } from 'react';
import { 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Activity 
} from 'lucide-react';

export default function LiveReasoningStream({ steps = [], isRunning }) {
  const [expandedSteps, setExpandedSteps] = useState({});

  const toggleExpand = (stepId) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const getAgentColor = (role) => {
    if (!role) return '#94a3b8';
    if (role.includes('Intake')) return '#00f2fe';
    if (role.includes('Credit') || role.includes('Risk')) return '#38bdf8';
    if (role.includes('Compliance')) return '#a855f7';
    if (role.includes('Decision')) return '#10b981';
    return '#f59e0b';
  };

  return (
    <div className="terminal-window" style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>
      {/* Terminal Title Bar */}
      <div style={{
        padding: '12px 18px',
        backgroundColor: '#0a0f1d',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={14} color="#38bdf8" />
            LIVE AGENT REASONING STREAM & TOOL BUS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isRunning && (
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
              <Activity size={12} className="anim-float" /> STREAMING
            </span>
          )}
          <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {steps.length} Steps Logged
          </span>
        </div>
      </div>

      {/* Terminal Content Body */}
      <div style={{
        padding: '16px',
        overflowY: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {steps.length === 0 ? (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            gap: '8px'
          }}>
            <Cpu size={36} strokeWidth={1.5} color="rgba(255,255,255,0.15)" />
            <p style={{ fontSize: '0.8125rem' }}>Select a scenario and click Execute to start the agent swarm.</p>
          </div>
        ) : (
          steps.map((step, idx) => {
            const color = getAgentColor(step.agent_role);
            const isExpanded = !!expandedSteps[step.step_id];
            const hasTool = !!step.tool_called;

            return (
              <div
                key={step.step_id || idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: `3px solid ${color}`,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Step Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: color,
                      background: `${color}15`,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${color}40`
                    }}>
                      {step.agent_role}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                      [{step.phase}]
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem' }}>
                    {step.confidence_score !== undefined && (
                      <span style={{ color: '#34d399', fontWeight: 600 }}>
                        {Math.round(step.confidence_score * 100)}% Conf
                      </span>
                    )}
                    <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                      {step.latency_ms}ms
                    </span>
                  </div>
                </div>

                {/* Step Thought */}
                <p style={{ fontSize: '0.8125rem', color: '#e2e8f0', lineHeight: '1.45', marginBottom: '8px' }}>
                  {step.thought}
                </p>

                {/* Findings Summary if available */}
                {step.findings_summary && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#93c5fd',
                    background: 'rgba(56, 189, 248, 0.08)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    marginBottom: hasTool ? '8px' : '0'
                  }}>
                    💡 {step.findings_summary}
                  </div>
                )}

                {/* Tool Call Drawer */}
                {hasTool && (
                  <div>
                    <button
                      onClick={() => toggleExpand(step.step_id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: '#38bdf8',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 0'
                      }}
                    >
                      <Wrench size={12} />
                      <span>Tool: {step.tool_called}</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {isExpanded && (
                      <div style={{
                        marginTop: '8px',
                        padding: '10px',
                        background: '#04060f',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        <div style={{ color: '#94a3b8', marginBottom: '4px' }}>// Tool Input:</div>
                        <pre style={{ color: '#e2e8f0', marginBottom: '8px', overflowX: 'auto' }}>
                          {JSON.stringify(step.tool_input, null, 2)}
                        </pre>
                        <div style={{ color: '#94a3b8', marginBottom: '4px' }}>// Tool Output:</div>
                        <pre style={{ color: '#34d399', overflowX: 'auto' }}>
                          {JSON.stringify(step.tool_output, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
