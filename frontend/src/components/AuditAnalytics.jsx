import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function AuditAnalytics({ onSelectDecision }) {
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMetricsAndLogs = () => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:8000/api/audit/metrics').then(r => r.json()),
      fetch('http://localhost:8000/api/audit/logs?limit=50').then(r => r.json())
    ]).then(([metricsData, logsData]) => {
      setMetrics(metricsData.metrics || {});
      setLogs(logsData.logs || []);
    }).catch(err => console.error("Error loading audit data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetricsAndLogs();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Workflows Executed</span>
            <Activity size={18} color="#00f2fe" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>
            {metrics?.total_workflows_executed || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: '4px' }}>
            Multi-Agent Swarm Active
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Approvals & Allows</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
            {metrics?.approved_count || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Autonomous STP rate
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>HITL Escalations</span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>
            {metrics?.hitl_escalations_count || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Pending reviews: {metrics?.pending_hitl_count || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Avg Pipeline Latency</span>
            <Clock size={18} color="#a855f7" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a855f7' }}>
            {metrics?.avg_workflow_latency_ms || 0}ms
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across all 4 agent phases
          </div>
        </div>
      </div>

      {/* Historical Decisions & Audit Log Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: '4px' }}>
              Immutable Execution Log
            </span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>
              End-to-End Decision Audit Trails
            </h3>
          </div>

          <button onClick={fetchMetricsAndLogs} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
            Refresh Logs
          </button>
        </div>

        {logs.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No audit records yet. Execute workflows from the Workflow Studio to generate live audit logs.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>Session ID</th>
                  <th style={{ padding: '12px 14px' }}>Workflow</th>
                  <th style={{ padding: '12px 14px' }}>Final Verdict</th>
                  <th style={{ padding: '12px 14px' }}>Confidence</th>
                  <th style={{ padding: '12px 14px' }}>Latency</th>
                  <th style={{ padding: '12px 14px' }}>Provider</th>
                  <th style={{ padding: '12px 14px' }}>HITL Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isApproved = log.final_verdict?.includes('APPROV') || log.final_verdict?.includes('ALLOW');
                  const isHitl = log.hitl_triggered;

                  return (
                    <tr 
                      key={log.session_id} 
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                    >
                      <td className="font-mono" style={{ padding: '12px 14px', color: '#38bdf8' }}>
                        {log.session_id}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                        {log.workflow_type}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${isApproved ? 'badge-emerald' : (isHitl ? 'badge-amber' : 'badge-rose')}`}>
                          {log.final_verdict}
                        </span>
                      </td>
                      <td className="font-mono" style={{ padding: '12px 14px', color: '#34d399' }}>
                        {Math.round((log.confidence_score || 0.95) * 100)}%
                      </td>
                      <td className="font-mono" style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                        {log.total_latency_ms}ms
                      </td>
                      <td style={{ padding: '12px 14px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        {log.active_llm_provider}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {isHitl ? (
                          <span style={{ color: log.hitl_resolved ? '#34d399' : '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>
                            {log.hitl_resolved ? '✓ Resolved by Officer' : '⚠️ Pending Signoff'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            Autonomous
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
