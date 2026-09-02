import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  FileCheck, 
  Download, 
  ArrowUpRight,
  TrendingDown,
  UserCheck
} from 'lucide-react';

export default function DecisionView({ workflowType, result, onResolveHitl }) {
  if (!result || !result.result) return null;

  const data = result.result;
  const verdict = result.final_verdict || data.decision || 'APPROVED';
  const requiresHitl = data.requires_hitl_signoff || verdict.includes('HITL');
  const confidence = Math.round((data.confidence_score || 0.95) * 100);

  const getVerdictTheme = () => {
    if (verdict.includes('APPROV') || verdict.includes('ALLOW')) {
      return {
        bg: 'rgba(16, 185, 129, 0.12)',
        border: '#10b981',
        text: '#34d399',
        badge: 'badge-emerald',
        icon: ShieldCheck,
        label: 'AUTONOMOUSLY APPROVED'
      };
    } else if (verdict.includes('HITL') || verdict.includes('FLAGGED')) {
      return {
        bg: 'rgba(245, 158, 11, 0.12)',
        border: '#f59e0b',
        text: '#fbbf24',
        badge: 'badge-amber',
        icon: AlertTriangle,
        label: 'ESCALATED FOR HUMAN REVIEW (HITL)'
      };
    } else {
      return {
        bg: 'rgba(244, 63, 94, 0.12)',
        border: '#f43f5e',
        text: '#fb7185',
        badge: 'badge-rose',
        icon: ShieldAlert,
        label: 'REJECTED / BLOCKED'
      };
    }
  };

  const theme = getVerdictTheme();
  const Icon = theme.icon;

  const handleDownloadAudit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audit_report_${result.session_id || 'bfsi'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', border: `1px solid ${theme.border}50` }}>
      {/* Verdict Header Banner */}
      <div style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: `${theme.border}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 15px ${theme.border}40`
          }}>
            <Icon size={26} color={theme.text} />
          </div>
          <div>
            <span className={`badge ${theme.badge}`} style={{ marginBottom: '4px' }}>
              {theme.label}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              {data.applicant_name || data.customer_name || data.claimant_name || data.institution_name || 'Executive Decision'}
            </h3>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
            Consensus Confidence
          </div>
          <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.text }}>
            {confidence}%
          </div>
        </div>
      </div>

      {/* Rationale Narrative */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
          Executive Arbitration Summary
        </h4>
        <p style={{ fontSize: '0.875rem', color: '#e2e8f0', lineHeight: '1.5' }}>
          {data.underwriting_rationale || data.adjudication_rationale || data.risk_summary_rationale || data.decision_synthesis?.executive_summary || "Multi-agent analysis concluded in full alignment with institutional risk parameters."}
        </p>
      </div>

      {/* Quantitative KPIs Breakdown Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* Loan Metrics */}
        {data.credit_score && (
          <div style={{ padding: '12px', background: 'rgba(10, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Credit Score</div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>{data.credit_score}</div>
          </div>
        )}
        {data.debt_to_income_pct !== undefined && (
          <div style={{ padding: '12px', background: 'rgba(10, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DTI Ratio</div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: data.debt_to_income_pct > 43 ? '#f59e0b' : '#34d399' }}>{data.debt_to_income_pct}%</div>
          </div>
        )}
        {data.approved_amount !== undefined && (
          <div style={{ padding: '12px', background: 'rgba(10, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Approved Facility</div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>${data.approved_amount.toLocaleString()}</div>
          </div>
        )}

        {/* Fraud Metrics */}
        {data.fraud_risk_score !== undefined && (
          <div style={{ padding: '12px', background: 'rgba(10, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fraud Risk Index</div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: data.fraud_risk_score > 60 ? '#f43f5e' : '#34d399' }}>{data.fraud_risk_score}/100</div>
          </div>
        )}
        {data.amount !== undefined && (
          <div style={{ padding: '12px', background: 'rgba(10, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Transaction Amount</div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>${data.amount.toLocaleString()}</div>
          </div>
        )}

        {/* Claims Metrics */}
        {data.approved_payout_amount !== undefined && (
          <div style={{ padding: '12px', background: 'rgba(10, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Approved Payout</div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>${data.approved_payout_amount.toLocaleString()}</div>
          </div>
        )}

        {/* Portfolio Metrics */}
        {data.value_at_risk_95_daily !== undefined && (
          <div style={{ padding: '12px', background: 'rgba(10, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>95% Daily VaR</div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f43f5e' }}>${data.value_at_risk_95_daily.toLocaleString()}</div>
          </div>
        )}
        {data.stress_projected_loss_pct !== undefined && (
          <div style={{ padding: '12px', background: 'rgba(10, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Stress Drawdown</div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{data.stress_projected_loss_pct}%</div>
          </div>
        )}
      </div>

      {/* Mandatory Conditions / Stipulations */}
      {(data.mandatory_conditions?.length > 0 || data.recommended_interventions?.length > 0 || data.rebalancing_recommendations?.length > 0) && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Binding Stipulations & Action Items
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(data.mandatory_conditions || data.recommended_interventions || data.rebalancing_recommendations || []).map((cond, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <CheckCircle size={14} color="#34d399" />
                <span>{cond}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
        <button
          onClick={handleDownloadAudit}
          className="btn btn-secondary"
          style={{ fontSize: '0.8125rem', padding: '8px 14px' }}
        >
          <Download size={15} />
          <span>Export Audit Log (JSON)</span>
        </button>

        {requiresHitl && (
          <button
            onClick={() => onResolveHitl && onResolveHitl(result)}
            className="btn btn-primary"
            style={{ fontSize: '0.8125rem', padding: '8px 16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <UserCheck size={16} />
            <span>Open HITL Underwriter Signoff</span>
          </button>
        )}
      </div>
    </div>
  );
}
