import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  FileText,
  Clock,
  Shield,
  ArrowRight,
  User,
} from 'lucide-react';
import { HumanReviewRecord, RBACRole } from '../types/banking.js';

interface PendingReviewItem {
  application_id: string;
  reason: string;
  created_at: string;
  priority: 'URGENT' | 'STANDARD' | 'LOW';
  risk_level: string;
  previous_ai_recommendation: string;
}

interface ReviewPortalProps {
  pendingReviews: PendingReviewItem[];
  reviewHistory: HumanReviewRecord[];
  currentRole: RBACRole;
  onSelectApplication: (appId: string) => void;
  onSubmitDecision: (params: {
    applicationId: string;
    action: 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO';
    reason: string;
    notes?: string;
  }) => void;
}

export const ReviewPortal: React.FC<ReviewPortalProps> = ({
  pendingReviews,
  reviewHistory,
  currentRole,
  onSelectApplication,
  onSubmitDecision,
}) => {
  const [selectedReviewAppId, setSelectedReviewAppId] = useState<string | null>(
    pendingReviews[0]?.application_id || null
  );
  const [decisionAction, setDecisionAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO'>('APPROVE');
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [decisionNotes, setDecisionNotes] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('Officer Sarah Jenkins');

  const activeReview = pendingReviews.find((r) => r.application_id === selectedReviewAppId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewAppId || !decisionReason) return;

    onSubmitDecision({
      applicationId: selectedReviewAppId,
      action: decisionAction,
      reason: decisionReason,
      notes: decisionNotes,
    });

    setDecisionReason('');
    setDecisionNotes('');
  };

  const isAuthorized = currentRole === 'ADMIN' || currentRole === 'REVIEWER' || currentRole === 'OPERATIONS';

  return (
    <div className="space-y-6">
      {/* Header Alert if not authorized */}
      {!isAuthorized && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Current role is <strong>{currentRole}</strong> (Read-Only). Switch role to <strong>REVIEWER</strong> or <strong>ADMIN</strong> in the top header to submit binding banking approvals or rejections.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pending Review Queue */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <UserCheck className="w-4 h-4 mr-1.5 text-amber-600" />
                Review Queue ({pendingReviews.length})
              </h3>
              <p className="text-[11px] text-slate-400">Applications flagged by AI agents</p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {pendingReviews.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
                <p>No applications currently waiting in the manual review queue.</p>
              </div>
            ) : (
              pendingReviews.map((item) => {
                const isSelected = selectedReviewAppId === item.application_id;
                return (
                  <div
                    key={item.application_id}
                    id={`pending-card-${item.application_id}`}
                    onClick={() => setSelectedReviewAppId(item.application_id)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {item.application_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {item.reason}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Prior AI: {item.previous_ai_recommendation.replace('_RECOMMENDATION', '')}</span>
                      <span>{new Date(item.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Review Dossier & Action Console */}
        <div className="lg:col-span-2 space-y-6">
          {activeReview ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                      {activeReview.application_id}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Tier-2 Human Review Required
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Supervisory Review &amp; Decision Protocol
                  </h3>
                </div>

                <button
                  id="btn-inspect-workflow"
                  onClick={() => onSelectApplication(activeReview.application_id)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <span>Inspect Full Agent Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Evidence Box */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 mb-6">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Primary Review Triggers &amp; Discrepancy Evidence
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {activeReview.reason}
                </p>
                <div className="mt-3 pt-2.5 border-t border-amber-200/60 text-xs text-amber-800 flex items-center justify-between">
                  <span>Assessed Risk Tier: <strong>{activeReview.risk_level}</strong></span>
                  <span>Previous AI Recommendation: <strong>{activeReview.previous_ai_recommendation}</strong></span>
                </div>
              </div>

              {/* Reviewer Action Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Execute Regulatory Decision (Audit-Backed)
                </h4>

                {/* Reviewer Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Reviewing Officer Name
                    </label>
                    <input
                      id="input-reviewer-name"
                      type="text"
                      required
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      disabled={!isAuthorized}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Authorized Role
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${currentRole} (Verified Session)`}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono"
                    />
                  </div>
                </div>

                {/* Decision Actions */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Binding Determination
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      id="btn-action-approve"
                      disabled={!isAuthorized}
                      onClick={() => setDecisionAction('APPROVE')}
                      className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition border ${
                        decisionAction === 'APPROVE'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>APPROVE</span>
                    </button>

                    <button
                      type="button"
                      id="btn-action-reject"
                      disabled={!isAuthorized}
                      onClick={() => setDecisionAction('REJECT')}
                      className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition border ${
                        decisionAction === 'REJECT'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>REJECT</span>
                    </button>

                    <button
                      type="button"
                      id="btn-action-request-info"
                      disabled={!isAuthorized}
                      onClick={() => setDecisionAction('REQUEST_MORE_INFO')}
                      className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition border ${
                        decisionAction === 'REQUEST_MORE_INFO'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>REQUEST INFO</span>
                    </button>
                  </div>
                </div>

                {/* Justification Reason */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Regulatory Justification Reason (Required for Audit Trail)
                  </label>
                  <input
                    id="input-review-reason"
                    type="text"
                    required
                    disabled={!isAuthorized}
                    placeholder="e.g. Supplemental utility bill verified; address verified with local registry"
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Internal Compliance Notes (Optional)
                  </label>
                  <textarea
                    id="input-review-notes"
                    rows={2}
                    disabled={!isAuthorized}
                    placeholder="Notes visible only to bank supervisory audits..."
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    id="btn-submit-review-decision"
                    disabled={!isAuthorized || !decisionReason}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center space-x-1.5"
                  >
                    <span>Commit Binding Decision</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select an item from the review queue on the left to examine evidence and execute decisions.
            </div>
          )}

          {/* Historical Review Ledger */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Historical Supervisory Reviews ({reviewHistory.length})
            </h4>

            {reviewHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No previous manual decisions committed in this session.
              </p>
            ) : (
              <div className="space-y-2">
                {reviewHistory.slice(0, 5).map((h) => (
                  <div
                    key={h.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-800">{h.application_id}</span>
                        <span
                          className={`font-bold text-[10px] px-1.5 py-0.2 rounded ${
                            h.action === 'APPROVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : h.action === 'REJECT'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {h.action}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        {h.reason} (By: {h.reviewer_name} - {h.reviewer_role})
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(h.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
