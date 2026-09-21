import React, { useState } from 'react';
import {
  Brain,
  FileCheck,
  UserCheck2,
  TrendingUp,
  ShieldAlert,
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  ChevronRight,
  Database,
  Hash,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SharedAgentState, ToolCallRecord } from '../types/banking.js';
import { formatINR } from '../utils/currency.js';

interface WorkflowVisualizerProps {
  workflowState: SharedAgentState | null;
  toolCalls: ToolCallRecord[];
  onTriggerReview?: (applicationId: string) => void;
  onSelectApplication?: (appId: string) => void;
  onNavigateToApplications?: () => void;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  workflowState,
  toolCalls,
  onTriggerReview,
  onNavigateToApplications,
}) => {
  const [selectedAgentNode, setSelectedAgentNode] = useState<string | null>('Decision Agent');

  if (!workflowState) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Brain className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No Active Workflow Selected</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          To enter custom applicant data or choose a test scenario, switch to the <strong>Applications</strong> tab or click the button below.
        </p>
        {onNavigateToApplications && (
          <button
            id="btn-go-to-applications"
            onClick={onNavigateToApplications}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-xs transition inline-flex items-center space-x-2 cursor-pointer"
          >
            <span>Go to Applications &amp; Enter Data</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  const {
    application_id,
    workflow_id,
    current_agent,
    workflow_status,
    customer_data,
    document_result,
    kyc_result,
    risk_result,
    fraud_result,
    compliance_result,
    decision_result,
    response_result,
    human_review_required,
    dynamic_routes_taken,
  } = workflowState;

  // Agent nodes in order of execution
  const agentNodes = [
    {
      name: 'Planning Agent',
      icon: Brain,
      step: 1,
      status: workflowState.current_step > 1 ? 'COMPLETED' : workflowState.current_step === 1 ? 'RUNNING' : 'PENDING',
      badge: 'DAG & Benchmark',
      summary: workflowState.realtime_data
        ? `Benchmark Rate: ${workflowState.realtime_data.central_bank_repo_rate}%`
        : 'Formulating Plan',
    },
    {
      name: 'Document Agent',
      icon: FileCheck,
      step: 2,
      status: document_result ? (document_result.status === 'VERIFIED' ? 'COMPLETED' : 'WARNING') : workflowState.current_step === 2 ? 'RUNNING' : 'PENDING',
      badge: document_result?.status || 'OCR & Tamper',
      summary: document_result
        ? `Confidence: ${Math.round(document_result.confidence * 100)}%`
        : 'Awaiting Documents',
    },
    {
      name: 'KYC Agent',
      icon: UserCheck2,
      step: 3,
      status: kyc_result ? (kyc_result.status === 'VERIFIED' ? 'COMPLETED' : kyc_result.status === 'PARTIAL' ? 'WARNING' : 'FAILED') : workflowState.current_step === 3 ? 'RUNNING' : 'PENDING',
      badge: kyc_result?.status || 'Sanctions & PEP',
      summary: kyc_result
        ? kyc_result.sanctions_cleared ? 'Sanctions Cleared' : 'Sanction Flag'
        : 'Awaiting Identity API',
    },
    {
      name: 'Risk Agent',
      icon: TrendingUp,
      step: 4,
      status: risk_result ? (risk_result.risk_level === 'LOW' ? 'COMPLETED' : risk_result.risk_level === 'MEDIUM' ? 'WARNING' : 'FAILED') : workflowState.current_step === 4 ? 'RUNNING' : 'PENDING',
      badge: risk_result ? `${risk_result.risk_level} RISK` : 'Bureau & DTI',
      summary: risk_result
        ? `Credit: ${risk_result.credit_score} | DTI: ${risk_result.debt_to_income_ratio}%`
        : 'Computing Risk',
    },
    {
      name: 'Fraud Agent',
      icon: ShieldAlert,
      step: 5,
      status: fraud_result ? (fraud_result.fraud_risk === 'LOW' ? 'COMPLETED' : fraud_result.fraud_risk === 'MEDIUM' ? 'WARNING' : 'FAILED') : workflowState.current_step === 5 ? 'RUNNING' : 'PENDING',
      badge: fraud_result ? `${fraud_result.fraud_risk} FRAUD` : 'Synthetic & Anomaly',
      summary: fraud_result
        ? `Fraud Score: ${fraud_result.fraud_score}/100`
        : 'Scanning Vectors',
    },
    {
      name: 'Compliance Agent',
      icon: Scale,
      step: 6,
      status: compliance_result ? (compliance_result.status === 'PASS' ? 'COMPLETED' : compliance_result.status === 'REVIEW_REQUIRED' ? 'WARNING' : 'FAILED') : workflowState.current_step === 6 ? 'RUNNING' : 'PENDING',
      badge: compliance_result?.status || 'Vector Policy Check',
      summary: compliance_result
        ? `${compliance_result.policy_rules_applied.length} Policies Verified`
        : 'Querying Vector KB',
    },
    {
      name: 'Decision Agent',
      icon: CheckCircle2,
      step: 7,
      status: decision_result ? (decision_result.decision === 'APPROVAL_RECOMMENDATION' ? 'COMPLETED' : decision_result.decision === 'REVIEW_REQUIRED' ? 'WARNING' : 'FAILED') : workflowState.current_step === 7 ? 'RUNNING' : 'PENDING',
      badge: decision_result ? decision_result.decision.replace('_RECOMMENDATION', '') : 'Synthesis Engine',
      summary: decision_result ? `Conf: ${Math.round(decision_result.confidence * 100)}%` : 'Synthesizing Data',
    },
    {
      name: 'Response Agent',
      icon: Send,
      step: 8,
      status: response_result ? 'COMPLETED' : workflowState.current_step === 8 ? 'RUNNING' : 'PENDING',
      badge: response_result ? 'DISPATCHED' : 'Customer & Internal',
      summary: response_result ? 'Customer Notified' : 'Drafting Output',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                {application_id}
              </span>
              <span className="text-slate-400 font-mono text-xs">/</span>
              <span className="font-mono text-xs text-slate-500">{workflow_id}</span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  workflow_status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : workflow_status === 'PAUSED_FOR_REVIEW'
                    ? 'bg-amber-100 text-amber-800'
                    : workflow_status === 'RUNNING'
                    ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {workflow_status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {customer_data.full_name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Declared Income: {formatINR(customer_data.annual_income)} | ID Type: {customer_data.declared_id_type} ({customer_data.declared_id_number})
              {customer_data.is_synthetic && (
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  SYNTHETIC DATA
                </span>
              )}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-6 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="block text-slate-400 text-[10px] uppercase font-semibold">Current Agent</span>
              <span className="font-semibold text-slate-900">{current_agent}</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="block text-slate-400 text-[10px] uppercase font-semibold">Human Review</span>
              <span
                className={`font-semibold ${
                  human_review_required ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {human_review_required ? 'REQUIRED' : 'NOT REQUIRED'}
              </span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="block text-slate-400 text-[10px] uppercase font-semibold">Tool Calls</span>
              <span className="font-mono font-semibold text-slate-900">{toolCalls.length}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Routes Bar if triggered */}
        {dynamic_routes_taken && dynamic_routes_taken.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center">
              <ArrowRight className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Dynamic Routes:
            </span>
            {dynamic_routes_taken.map((route, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200 font-medium"
              >
                {route}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Multi-Agent LangGraph Node Visualizer */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Multi-Agent Execution Graph (LangGraph State Machine)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Click any node to inspect state</span>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {agentNodes.map((node) => {
            const Icon = node.icon;
            const isSelected = selectedAgentNode === node.name;
            const isRunning = node.status === 'RUNNING';
            const isCompleted = node.status === 'COMPLETED';
            const isWarning = node.status === 'WARNING';
            const isFailed = node.status === 'FAILED';

            return (
              <div
                key={node.name}
                id={`node-${node.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedAgentNode(node.name)}
                className={`cursor-pointer rounded-xl p-3.5 border transition relative ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isRunning
                          ? 'bg-indigo-600 text-white animate-spin'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : isWarning
                          ? 'bg-amber-100 text-amber-700'
                          : isFailed
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        {node.name}
                      </span>
                      <span className="text-[10px] text-slate-400">Step {node.step} of 8</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isRunning
                        ? 'bg-indigo-100 text-indigo-700 animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isWarning
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : isFailed
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {node.badge}
                  </span>
                </div>

                <div className="text-xs text-slate-600 font-medium truncate">
                  {node.summary}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Output Card & Explainability */}
      {decision_result && (
        <div
          className={`rounded-xl border p-6 shadow-xs ${
            decision_result.decision === 'APPROVAL_RECOMMENDATION'
              ? 'bg-emerald-50/50 border-emerald-200'
              : decision_result.decision === 'REVIEW_REQUIRED'
              ? 'bg-amber-50/50 border-amber-200'
              : 'bg-rose-50/50 border-rose-200'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              {decision_result.decision === 'APPROVAL_RECOMMENDATION' ? (
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : decision_result.decision === 'REVIEW_REQUIRED' ? (
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Synthesized Decision Recommendation
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {decision_result.decision.replace(/_/g, ' ')}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">AI Confidence Score</span>
                <span className="text-lg font-mono font-bold text-slate-900">
                  {Math.round(decision_result.confidence * 100)}%
                </span>
              </div>
              {decision_result.human_review_required && onTriggerReview && (
                <button
                  id="btn-open-review-portal"
                  onClick={() => onTriggerReview(application_id)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
                >
                  <span>Review in Human Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Decision Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200/60">
            {/* Supporting Factors */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Supporting Factors
              </h4>
              <ul className="space-y-1 text-xs text-slate-600">
                {decision_result.supporting_factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-emerald-500 mr-1.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reasons / Failed Checks */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Key Triggers & Reasons
              </h4>
              <ul className="space-y-1 text-xs text-slate-600">
                {decision_result.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-amber-500 mr-1.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Data Sources and Contributing Agents */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Verified Sources: {decision_result.data_sources.join(', ')}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-400">
              Timestamp: {new Date(decision_result.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Split Details: Selected Node Inspector & Live Tool Calls Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Node Inspector */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-indigo-600" />
              State Inspector: {selectedAgentNode}
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Pydantic / Typed State</span>
          </div>

          <div className="space-y-3 text-xs">
            {selectedAgentNode === 'Planning Agent' && (
              <div className="space-y-2">
                <p className="text-slate-600">Formulates the execution DAG and samples real-time market benchmark rates.</p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs">
                  <div>Workflow ID: {workflow_id}</div>
                  <div>Planned Steps: 8 specialized agents</div>
                  <div>Market Data Status: {workflowState.realtime_data ? 'Connected' : 'Pending'}</div>
                </div>
              </div>
            )}

            {selectedAgentNode === 'Document Agent' && document_result && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase block">Status</span>
                    <span className="font-bold">{document_result.status}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase block">Confidence</span>
                    <span className="font-bold">{Math.round(document_result.confidence * 100)}%</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <div>Name Match: {document_result.name_match ? '✓ Matched' : '✗ Mismatch'}</div>
                  <div>DOB Match: {document_result.dob_match ? '✓ Matched' : '✗ Mismatch'}</div>
                  <div>Tamper Flags: {document_result.extracted_fields?.tamper_detected ? '🚨 Detected' : 'None'}</div>
                </div>
              </div>
            )}

            {selectedAgentNode === 'KYC Agent' && kyc_result && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase block">Sanctions Cleared</span>
                    <span className="font-bold">{kyc_result.sanctions_cleared ? 'YES' : 'NO'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase block">PEP Identified</span>
                    <span className="font-bold">{kyc_result.pep_identified ? 'YES (EDD Required)' : 'NO'}</span>
                  </div>
                </div>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  {kyc_result.details}
                </p>
              </div>
            )}

            {selectedAgentNode === 'Risk Agent' && risk_result && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase block">Credit Score</span>
                    <span className="font-bold font-mono">{risk_result.credit_score}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase block">DTI Ratio</span>
                    <span className="font-bold font-mono">{risk_result.debt_to_income_ratio}%</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase block">Risk Tier</span>
                    <span className="font-bold">{risk_result.risk_level}</span>
                  </div>
                </div>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  {risk_result.explanation}
                </p>
              </div>
            )}

            {selectedAgentNode === 'Fraud Agent' && fraud_result && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase block">Fraud Score</span>
                    <span className="font-bold font-mono">{fraud_result.fraud_score}/100</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase block">Duplicate Check</span>
                    <span className="font-bold">{fraud_result.duplicate_detected ? 'Duplicate Found' : 'Unique Profile'}</span>
                  </div>
                </div>
                {fraud_result.suspicious_indicators.length > 0 && (
                  <div className="p-2.5 bg-rose-50 text-rose-800 rounded border border-rose-200">
                    <span className="font-bold block mb-1">Suspicious Indicators:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {fraud_result.suspicious_indicators.map((ind, i) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {selectedAgentNode === 'Compliance Agent' && compliance_result && (
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="font-semibold block mb-1">Policies Evaluated:</span>
                  <ul className="space-y-1 text-slate-600">
                    {compliance_result.policy_rules_applied.map((pol, i) => (
                      <li key={i}>• {pol}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-slate-600 italic">
                  {compliance_result.compliance_notes}
                </p>
              </div>
            )}

            {selectedAgentNode === 'Decision Agent' && decision_result && (
              <div className="space-y-2 font-mono text-xs bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto">
                <pre>{JSON.stringify(decision_result, null, 2)}</pre>
              </div>
            )}

            {selectedAgentNode === 'Response Agent' && response_result && (
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-200">
                  <span className="font-semibold text-indigo-900 block mb-1">Customer Notification:</span>
                  <p className="text-slate-700">{response_result.customer_message}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-900 block mb-1">Internal Operations Summary:</span>
                  <p className="text-slate-600">{response_result.internal_summary}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Tool Calls Stream */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-indigo-600" />
              Live Tool Calls & Invocations ({toolCalls.length})
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Audit-Hashed</span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {toolCalls.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                Awaiting tool execution...
              </p>
            ) : (
              toolCalls.map((call) => (
                <div
                  key={call.id}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-xs transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-indigo-700 font-mono">
                      {call.tool_name}()
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {call.execution_time_ms}ms
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Called by: {call.agent_name}</span>
                    <span className="font-mono flex items-center text-[10px] text-slate-400">
                      <Hash className="w-3 h-3 mr-0.5" /> {call.input_hash}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
