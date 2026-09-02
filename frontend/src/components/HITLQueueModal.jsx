import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  MessageSquare, 
  ShieldAlert,
  ArrowRight,
  Clock
} from 'lucide-react';

export default function HITLQueueModal({ 
  pendingList = [], 
  onResolve, 
  selectedItem, 
  onSelectItem, 
  onClose 
}) {
  const [reviewerName, setReviewerName] = useState('Senior Underwriter / Compliance Officer');
  const [actionType, setActionType] = useState('APPROVE');
  const [notes, setNotes] = useState('Reviewed collateral documentation and verified secondary debt coverage. Overriding autonomous escalation.');
  const [submitting, setSubmitting] = useState(false);

  const activeItem = selectedItem || (pendingList.length > 0 ? pendingList[0] : null);

  const handleSubmitResolution = async (e) => {
    e.preventDefault();
    if (!activeItem) return;
    setSubmitting(true);
    try {
      await onResolve({
        session_id: activeItem.session_id,
        workflow_type: activeItem.workflow_type,
        reviewer_name: reviewerName,
        action: actionType,
        decision_override: actionType === 'APPROVE' ? 'APPROVED' : (actionType === 'REJECT' ? 'REJECTED' : 'CONDITIONALLY_APPROVED'),
        override_notes: notes
      });
      alert(`Decision ${actionType} recorded successfully.`);
    } catch (err) {
      alert("Error resolving HITL action: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '24px',
      alignItems: 'start'
    }}>
      {/* Pending Items List Sidebar */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#f59e0b" />
            Pending Queue ({pendingList.length})
          </h3>
        </div>

        {pendingList.length === 0 ? (
          <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 10px' }} />
            No pending human review items. All multi-agent workflows are operating autonomously!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingList.map((item) => {
              const isSelected = activeItem && activeItem.session_id === item.session_id;
              return (
                <div
                  key={item.session_id}
                  onClick={() => onSelectItem && onSelectItem(item)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(10, 15, 30, 0.6)',
                    border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelected ? '#fbbf24' : '#e2e8f0' }}>
                      {item.session_id}
                    </span>
                    <span className="badge badge-amber" style={{ fontSize: '0.6rem' }}>
                      {item.workflow_type}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {item.hitl_reason || "Requires committee arbitration"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Case Review Action Station */}
      {activeItem ? (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px' }}>
            <div>
              <span className="badge badge-amber" style={{ marginBottom: '6px' }}>
                Human-In-The-Loop Escalation Case
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Case Ref: {activeItem.session_id}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Workflow Type</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                {activeItem.workflow_type}
              </span>
            </div>
          </div>

          {/* Trigger Details */}
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '4px' }}>
              Autonomous Escalation Trigger Reason
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#fef3c7' }}>
              {activeItem.hitl_reason || "Multi-agent confidence below autonomous threshold or policy warning triggered."}
            </p>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmitResolution} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Reviewer Officer Name / Role
              </label>
              <input
                type="text"
                className="input-field"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Review Action
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { id: 'APPROVE', label: 'Approve / Override', color: '#10b981' },
                  { id: 'CONDITIONALLY_APPROVE', label: 'Conditional Terms', color: '#38bdf8' },
                  { id: 'REJECT', label: 'Confirm Reject / Block', color: '#ef4444' }
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActionType(act.id)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: actionType === act.id ? `${act.color}20` : 'rgba(15, 23, 42, 0.6)',
                      border: actionType === act.id ? `2px solid ${act.color}` : '1px solid rgba(255,255,255,0.06)',
                      color: actionType === act.id ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      cursor: 'pointer'
                    }}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Underwriter Audit Notes & Compliance Justification
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ marginTop: '8px', padding: '12px' }}
            >
              <UserCheck size={18} />
              <span>{submitting ? 'Submitting Signature...' : 'Submit Binding Underwriting Decision'}</span>
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
