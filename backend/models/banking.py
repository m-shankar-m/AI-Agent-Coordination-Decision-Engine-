"""
Pydantic Schemas for AI-Powered Banking Decision Engine
All customer and document records are marked as SYNTHETIC / DEMONSTRATION ONLY.
"""
from typing import List, Dict, Optional, Any
from datetime import datetime

try:
    from pydantic import BaseModel, Field
except ImportError:
    # Standard library fallback
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__
    def Field(default=None, default_factory=None, **kwargs):
        if default_factory is not None:
            return default_factory()
        return default

class CustomerDataSchema(BaseModel):
    id: str
    full_name: str
    date_of_birth: str
    email: str
    phone: str
    employment_status: str
    annual_income: float
    monthly_expenses: float
    declared_id_type: str
    declared_id_number: str
    nationality: str
    pep_status: bool = False
    is_synthetic: bool = True

class DocumentResultSchema(BaseModel):
    status: str  # VERIFIED, FAILED, INCONCLUSIVE
    document_type: str
    name_match: bool
    dob_match: bool
    confidence: float
    extracted_fields: Dict[str, Any] = Field(default_factory=dict)
    mismatch_reasons: Optional[List[str]] = None
    is_synthetic: bool = True

class KYCResultSchema(BaseModel):
    status: str  # VERIFIED, FAILED, PARTIAL, REVIEW_REQUIRED
    verification_id: str
    match_score: float
    biometric_liveness: bool
    sanctions_cleared: bool
    watchlist_flag: bool
    details: str
    is_synthetic: bool = True

class RiskResultSchema(BaseModel):
    risk_level: str  # LOW, MEDIUM, HIGH
    risk_score: float
    credit_score: int
    debt_to_income_ratio: float
    employment_stability_score: float
    payment_history_score: float
    risk_indicators: List[str]
    explanation: str
    is_synthetic: bool = True

class FraudResultSchema(BaseModel):
    fraud_risk: str  # LOW, MEDIUM, HIGH
    fraud_score: float
    duplicate_detected: bool
    velocity_anomaly: bool
    suspicious_indicators: List[str]
    human_review_required: bool
    is_synthetic: bool = True

class ComplianceResultSchema(BaseModel):
    status: str  # PASS, FAIL, REVIEW_REQUIRED
    aml_status: str
    kyc_status: str
    policy_rules_applied: List[str]
    failed_rules: List[str]
    compliance_notes: str

class DecisionResultSchema(BaseModel):
    decision: str  # APPROVAL_RECOMMENDATION, REVIEW_REQUIRED, REJECTION_RECOMMENDATION
    confidence: float
    reasons: List[str]
    supporting_factors: List[str]
    failed_checks: List[str]
    risk_indicators: List[str]
    data_sources: List[str]
    human_review_required: bool
    agent_contributions: Dict[str, str]
    timestamp: str

class WorkflowStateSchema(BaseModel):
    application_id: str
    workflow_id: str
    current_agent: str
    workflow_status: str
    customer_data: CustomerDataSchema
    document_result: Optional[DocumentResultSchema] = None
    kyc_result: Optional[KYCResultSchema] = None
    risk_result: Optional[RiskResultSchema] = None
    fraud_result: Optional[FraudResultSchema] = None
    compliance_result: Optional[ComplianceResultSchema] = None
    decision_result: Optional[DecisionResultSchema] = None
    human_review_required: bool = False
    errors: List[str] = Field(default_factory=list)
    timestamps: Dict[str, str] = Field(default_factory=dict)
    data_sources: List[str] = Field(default_factory=list)
