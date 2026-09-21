export type RBACRole = 'ADMIN' | 'OPERATIONS' | 'REVIEWER' | 'ANALYST' | 'VIEWER';

export type ProductType = 'PREMIUM_CHECKING' | 'BUSINESS_ACCOUNT' | 'SAVINGS_ACCOUNT' | 'CREDIT_LINE' | 'COMMERCIAL_LOAN';

export type ApplicationStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'REVIEW_REQUIRED' | 'APPROVED' | 'REJECTED';

export type WorkflowStepStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export interface CustomerData {
  id: string;
  full_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  employment_status: 'EMPLOYED' | 'SELF_EMPLOYED' | 'RETIRED' | 'STUDENT' | 'UNEMPLOYED';
  employer_name?: string;
  annual_income: number;
  monthly_expenses: number;
  declared_id_type: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVING_LICENSE' | 'TAX_ID';
  declared_id_number: string;
  nationality: string;
  pep_status: boolean; // Politically Exposed Person
  existing_customer: boolean;
  credit_score?: number;
  payment_history_score?: number;
  open_tradelines?: number;
  is_synthetic: true; // Mandatory synthetic flag
}

export interface SyntheticDocument {
  id: string;
  document_type: 'IDENTITY_DOCUMENT' | 'PROOF_OF_ADDRESS' | 'INCOME_VERIFICATION' | 'TAX_RETURN';
  file_name: string;
  extracted_name: string;
  extracted_dob: string;
  extracted_id_number: string;
  extracted_address?: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
  tamper_flags_detected: boolean;
  blur_score: number; // 0 to 1
  is_synthetic: true;
}

export interface DocumentResult {
  status: 'VERIFIED' | 'FAILED' | 'INCONCLUSIVE';
  document_type: string;
  name_match: boolean;
  dob_match: boolean;
  id_number_match: boolean;
  confidence: number;
  extracted_fields: Record<string, any>;
  mismatch_reasons?: string[];
  is_synthetic: true;
}

export interface KYCResult {
  status: 'VERIFIED' | 'FAILED' | 'PARTIAL' | 'REVIEW_REQUIRED';
  verification_id: string;
  match_score: number;
  biometric_liveness: boolean;
  sanctions_cleared: boolean;
  watchlist_flag: boolean;
  pep_identified: boolean;
  details: string;
  external_source: string;
  is_synthetic: true;
}

export interface RiskResult {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_score: number; // 0 - 100
  credit_score: number; // 300 - 850
  debt_to_income_ratio: number;
  employment_stability_score: number;
  payment_history_score: number;
  risk_indicators: string[];
  explanation: string;
  is_synthetic: true;
}

export interface FraudResult {
  fraud_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  fraud_score: number; // 0 - 100
  duplicate_detected: boolean;
  velocity_anomaly: boolean;
  device_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  ip_geolocation_mismatch: boolean;
  synthetic_identity_risk: boolean;
  suspicious_indicators: string[];
  human_review_required: boolean;
  is_synthetic: true;
}

export interface ComplianceResult {
  status: 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';
  aml_status: 'CLEARED' | 'FLAGGED' | 'MANUAL_AUDIT';
  kyc_status: 'COMPLETED' | 'INCOMPLETE' | 'FAILED';
  policy_rules_applied: string[];
  matched_policies: { code: string; title: string; summary: string }[];
  failed_rules: string[];
  compliance_notes: string;
}

export interface DecisionResult {
  decision: 'APPROVAL_RECOMMENDATION' | 'REVIEW_REQUIRED' | 'REJECTION_RECOMMENDATION';
  confidence: number;
  reasons: string[];
  supporting_factors: string[];
  failed_checks: string[];
  risk_indicators: string[];
  policy_rules_applied: string[];
  data_sources: string[];
  human_review_required: boolean;
  agent_contributions: Record<string, string>;
  timestamp: string;
}

export interface ResponseResult {
  customer_message: string;
  internal_summary: string;
  next_steps: string[];
  notification_dispatched: boolean;
  dispatch_channel: 'EMAIL' | 'SMS' | 'BANK_PORTAL';
}

export interface SharedAgentState {
  application_id: string;
  workflow_id: string;
  current_agent: string;
  current_step: number;
  total_steps: number;
  workflow_status: 'INITIALIZING' | 'RUNNING' | 'PAUSED_FOR_REVIEW' | 'COMPLETED' | 'FAILED' | 'REJECTED';
  customer_data: CustomerData;
  documents: SyntheticDocument[];
  document_result?: DocumentResult;
  kyc_result?: KYCResult;
  risk_result?: RiskResult;
  fraud_result?: FraudResult;
  compliance_result?: ComplianceResult;
  decision_result?: DecisionResult;
  response_result?: ResponseResult;
  human_review_required: boolean;
  review_reason?: string;
  errors: string[];
  timestamps: Record<string, string>;
  data_sources: string[];
  execution_plan: string[];
  dynamic_routes_taken: string[];
  realtime_data?: RealtimeFinancialData;
}

export interface ToolCallRecord {
  id: string;
  tool_name: string;
  agent_name: string;
  input_data: any;
  input_hash: string;
  output_data: any;
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  execution_time_ms: number;
  error?: string;
  data_source: string;
  is_realtime: boolean;
  timestamp: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  application_id: string;
  agent_name: string;
  action: string;
  tool_name?: string;
  input_hash?: string;
  output_summary?: string;
  output_data?: any;
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'ESCALATED';
  execution_time_ms: number;
  error?: string;
  data_source: string;
}

export interface HumanReviewRecord {
  id: string;
  application_id: string;
  reviewer_name: string;
  reviewer_role: RBACRole;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO';
  reason: string;
  notes?: string;
  previous_ai_recommendation: string;
  timestamp: string;
}

export interface AgentMetadata {
  name: string;
  role: string;
  description: string;
  status: 'IDLE' | 'EXECUTING' | 'COMPLETED' | 'ERROR' | 'PAUSED';
  current_task?: string;
  execution_time_ms: number;
  last_run?: string;
  success_rate: number;
  total_runs: number;
  allowed_tools: string[];
}

export interface BankingPolicy {
  id: string;
  code: string;
  category: 'KYC_AML' | 'CREDIT_RISK' | 'FRAUD_PREVENTION' | 'REGULATORY_COMPLIANCE' | 'ACCOUNT_ELIGIBILITY';
  title: string;
  text: string;
  version: string;
  mandatory: boolean;
  effective_date: string;
}

export interface RealtimeFinancialData {
  timestamp: string;
  central_bank_repo_rate: number;
  currency_fx_rates: {
    USD_INR: number;
    EUR_INR: number;
    GBP_INR: number;
    USD_EUR: number;
    USD_GBP?: number;
    USD_JPY?: number;
  };
  inflation_rate: number;
  inflation_rate_benchmark?: number;
  interbank_base_rate: number;
  is_realtime: boolean;
  source_api: string;
  circuit_breaker_active: boolean;
  latency_ms: number;
  last_cached_at: string;
}

export interface Application {
  id: string;
  customer_id: string;
  product_type: ProductType;
  status: ApplicationStatus;
  customer_name: string;
  customer_email: string;
  annual_income: number;
  requested_credit_limit?: number;
  created_at: string;
  updated_at: string;
  workflow_id?: string;
  scenario?: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'DOCUMENT_MISMATCH' | 'KYC_FAILURE' | 'FRAUD_INDICATOR' | 'FRAUD_SUSPECT' | 'COMPLIANCE_FAILURE' | 'HUMAN_REVIEW';
  is_synthetic: true;
}

export type ApplicationRecord = Application;

export interface SystemMetrics {
  total_applications: number;
  in_progress: number;
  completed: number;
  review_required: number;
  approval_recommendations: number;
  rejection_recommendations: number;
  average_processing_time_ms: number;
  agent_errors: number;
  tool_failures: number;
  human_review_rate: number;
  uptime_seconds: number;
}
