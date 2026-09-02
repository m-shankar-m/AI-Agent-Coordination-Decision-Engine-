from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime

class WorkflowType(str, Enum):
    LOAN_UNDERWRITING = "loan_underwriting"
    FRAUD_DETECTION = "fraud_detection"
    CLAIMS_PROCESSING = "claims_processing"
    PORTFOLIO_RISK = "portfolio_risk"

class DecisionStatus(str, Enum):
    APPROVED = "APPROVED"
    CONDITIONALLY_APPROVED = "CONDITIONALLY_APPROVED"
    REJECTED = "REJECTED"
    FLAGGED_FOR_REVIEW = "FLAGGED_FOR_REVIEW"
    ESCALATED_HITL = "ESCALATED_HITL"
    BLOCKED = "BLOCKED"
    ALLOW = "ALLOW"

class AgentRole(str, Enum):
    INTAKE = "Intake & Extraction Agent"
    CREDIT_RISK = "Credit & Risk Analyst Agent"
    COMPLIANCE = "Regulatory Compliance Agent"
    DECISION_APPROVER = "Decision Approver Agent"
    ORCHESTRATOR = "Workflow Orchestrator"

# Execution Event & Streaming Step
class AgentThoughtStep(BaseModel):
    step_id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    agent_role: str
    phase: str
    thought: str
    tool_called: Optional[str] = None
    tool_input: Optional[Dict[str, Any]] = None
    tool_output: Optional[Dict[str, Any]] = None
    findings_summary: Optional[str] = None
    confidence_score: Optional[float] = None
    latency_ms: Optional[int] = 0

# --- 1. Loan Underwriting Schemas ---
class LoanApplicationRequest(BaseModel):
    applicant_id: str = "APP-2026-9041"
    applicant_name: str = "Alexander Wright"
    applicant_age: int = 38
    annual_income: float = 145000.0
    employment_status: str = "Full-Time Employed"
    employer_name: str = "Apex Horizon Tech Labs"
    years_employed: float = 6.5
    requested_amount: float = 380000.0
    loan_purpose: str = "Residential Mortgage - Primary Residence"
    loan_tenure_months: int = 360
    monthly_debt_obligations: float = 2100.0
    collateral_type: Optional[str] = "Single Family Real Estate"
    collateral_estimated_value: Optional[float] = 520000.0
    has_uploaded_documents: bool = True
    document_notes: Optional[str] = "W2 tax returns, recent 3-month pay stubs, appraisal report attached."

class LoanUnderwritingResult(BaseModel):
    application_id: str
    applicant_name: str
    credit_score: int
    credit_bureau_status: str
    debt_to_income_pct: float
    loan_to_value_pct: float
    monthly_payment_projected: float
    risk_tier: str
    regulatory_compliance: Dict[str, Any]
    decision: DecisionStatus
    confidence_score: float
    approved_amount: float
    interest_rate_apr: float
    tenure_months: int
    mandatory_conditions: List[str] = []
    underwriting_rationale: str
    requires_hitl_signoff: bool = False
    hitl_reason: Optional[str] = None
    audit_trail: List[AgentThoughtStep] = []

# --- 2. Fraud Detection & AML Schemas ---
class FraudDetectionRequest(BaseModel):
    transaction_id: str = "TXN-8849-0192"
    account_id: str = "ACC-992014-CORP"
    customer_name: str = "Meridian Trade Logistics Ltd"
    amount: float = 485000.0
    currency: str = "USD"
    transaction_type: str = "Cross-Border International Wire"
    origin_country: str = "United States"
    destination_country: str = "Cayman Islands"
    destination_bank: str = "First Offshore Horizon Bank"
    beneficiary_name: str = "Silver Crest Ventures SPV"
    ip_address: str = "185.220.101.5"
    device_id: str = "DEV-PROXY-TOR-99"
    user_historical_avg_amount: float = 24000.0
    velocity_last_24h_count: int = 8
    is_weekend_or_holiday: bool = True
    notes: Optional[str] = "Urgent high-value payment transfer initiated at 02:45 AM local time"

class FraudDetectionResult(BaseModel):
    transaction_id: str
    customer_name: str
    amount: float
    fraud_risk_score: float  # 0 to 100
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    anomaly_indicators: List[str]
    aml_sanctions_matched: bool
    pep_match_details: Optional[str] = None
    decision: DecisionStatus
    confidence_score: float
    sar_report_draft: Optional[str] = None
    recommended_interventions: List[str]
    requires_hitl_signoff: bool = False
    hitl_reason: Optional[str] = None
    audit_trail: List[AgentThoughtStep] = []

# --- 3. Insurance Claims Processing Schemas ---
class DamageItem(BaseModel):
    item_description: str
    claimed_cost: float
    invoiced_receipt_match: bool = True

class ClaimsProcessingRequest(BaseModel):
    claim_id: str = "CLM-2026-7712"
    policy_id: str = "POL-AUTO-99824"
    claimant_name: str = "Elena Rostova"
    incident_date: str = "2026-08-24"
    claim_type: str = "Comprehensive Motor Vehicle Collision"
    total_claimed_amount: float = 28500.0
    incident_location: str = "Interstate 80 Milepost 44"
    police_report_filed: bool = True
    police_report_number: str = "PR-NV-2026-0881"
    incident_description: str = "Rear-end collision during sudden brake wave on wet highway. Structural bumper and frame damage."
    damage_items: List[DamageItem] = [
        DamageItem(item_description="Front & Rear Bumper Replacement", claimed_cost=7800.0),
        DamageItem(item_description="Radiator & Sensor Assembly", claimed_cost=6200.0),
        DamageItem(item_description="Frame Realignment & Labor", claimed_cost=14500.0)
    ]
    has_prior_claims_count: int = 1
    supporting_documents: List[str] = ["repair_estimate_certified.pdf", "police_accident_report.pdf", "vehicle_photos.jpg"]

class ClaimsProcessingResult(BaseModel):
    claim_id: str
    policy_id: str
    claimant_name: str
    policy_status: str
    policy_coverage_limit: float
    deductible_amount: float
    claimed_amount: float
    approved_payout_amount: float
    exclusion_clauses_triggered: List[str] = []
    fraud_inconsistency_flags: List[str] = []
    decision: DecisionStatus
    confidence_score: float
    adjudication_rationale: str
    requires_hitl_signoff: bool = False
    hitl_reason: Optional[str] = None
    audit_trail: List[AgentThoughtStep] = []

# --- 4. Portfolio Risk Analysis Schemas ---
class AssetHolding(BaseModel):
    asset_name: str
    asset_class: str  # Equity, Sovereign Bond, Corporate Bond, Real Estate, Derivative
    weight_pct: float
    market_value: float
    credit_rating: str  # AAA, AA, BBB, BB, etc.
    duration_years: float
    sector: str

class PortfolioRiskRequest(BaseModel):
    portfolio_id: str = "PORT-INST-502"
    institution_name: str = "Global Prime Asset Management"
    total_portfolio_value: float = 125000000.0
    macro_stress_scenario: str = "Interest Rate Spike (+250 bps) & Tech Sector Correction (-22%)"
    holdings: List[AssetHolding] = [
        AssetHolding(asset_name="US Treasury 10Y Benchmark", asset_class="Sovereign Bond", weight_pct=35.0, market_value=43750000.0, credit_rating="AAA", duration_years=8.2, sector="Government"),
        AssetHolding(asset_name="MegaCap Tech Growth Equity Basket", asset_class="Equity", weight_pct=30.0, market_value=37500000.0, credit_rating="AA", duration_years=0.0, sector="Technology"),
        AssetHolding(asset_name="Investment Grade Corporate Credit ETF", asset_class="Corporate Bond", weight_pct=20.0, market_value=25000000.0, credit_rating="BBB", duration_years=5.4, sector="Financials/Industrial"),
        AssetHolding(asset_name="Commercial Real Estate Debt Trust", asset_class="Real Estate", weight_pct=10.0, market_value=12500000.0, credit_rating="BB", duration_years=6.8, sector="Real Estate"),
        AssetHolding(asset_name="Liquid Cash & Overnight Repo", asset_class="Cash Equivalent", weight_pct=5.0, market_value=6250000.0, credit_rating="AAA", duration_years=0.1, sector="Treasury Cash")
    ]

class PortfolioRiskResult(BaseModel):
    portfolio_id: str
    institution_name: str
    total_value: float
    value_at_risk_95_daily: float
    expected_shortfall_95: float
    stress_projected_loss: float
    stress_projected_loss_pct: float
    concentration_risk_warnings: List[str]
    basel_iii_capital_buffer_status: str
    liquidity_coverage_ratio_pct: float
    decision: DecisionStatus
    confidence_score: float
    risk_summary_rationale: str
    rebalancing_recommendations: List[str]
    requires_hitl_signoff: bool = False
    hitl_reason: Optional[str] = None
    audit_trail: List[AgentThoughtStep] = []

# --- Human In The Loop Action ---
class HumanReviewAction(BaseModel):
    session_id: str
    workflow_type: WorkflowType
    reviewer_name: str = "Senior Compliance Officer"
    action: str  # "APPROVE", "OVERRIDE_REJECT", "MODIFY_TERMS"
    decision_override: Optional[DecisionStatus] = None
    override_notes: str
    updated_terms: Optional[Dict[str, Any]] = None

# --- Vector & Knowledge Schemas ---
class PolicyDocument(BaseModel):
    doc_id: str
    title: str
    category: str  # Banking, Insurance, AML, Basel_III, Underwriting
    content: str
    effective_date: str
    regulatory_body: str
    metadata: Dict[str, Any] = {}

class KnowledgeSearchRequest(BaseModel):
    query: str
    category: Optional[str] = None
    top_k: int = 3

class KnowledgeSearchResult(BaseModel):
    doc_id: str
    title: str
    category: str
    regulatory_body: str
    relevance_score: float
    snippet: str

# --- Audit & Telemetry Schemas ---
class WorkflowExecutionRecord(BaseModel):
    session_id: str
    workflow_type: WorkflowType
    initiated_at: str
    completed_at: str
    status: str
    total_latency_ms: int
    active_llm_provider: str
    agent_steps_count: int
    final_verdict: str
    confidence_score: float
    hitl_triggered: bool
    hitl_resolved: bool = False
    hitl_reviewer_notes: Optional[str] = None
    details: Dict[str, Any]
