from fastapi import APIRouter, BackgroundTasks, HTTPException
from typing import Dict, Any, Optional
import uuid
from backend.models.schemas import (
    WorkflowType,
    LoanApplicationRequest,
    FraudDetectionRequest,
    ClaimsProcessingRequest,
    PortfolioRiskRequest
)
from backend.workflows.orchestrator import orchestrator
from backend.api.websocket_handler import ws_manager

router = APIRouter(prefix="/api/workflows", tags=["Workflows"])

@router.post("/loan-underwriting")
async def execute_loan_underwriting(request: LoanApplicationRequest, session_id: Optional[str] = None):
    sid = session_id or f"loan-{uuid.uuid4().hex[:8]}"
    
    async def event_callback(event: dict):
        await ws_manager.broadcast_session(sid, event)

    result = await orchestrator.execute_workflow(
        workflow_type=WorkflowType.LOAN_UNDERWRITING,
        payload=request.model_dump(),
        session_id=sid,
        event_callback=event_callback
    )
    return result

@router.post("/fraud-detection")
async def execute_fraud_detection(request: FraudDetectionRequest, session_id: Optional[str] = None):
    sid = session_id or f"fraud-{uuid.uuid4().hex[:8]}"
    
    async def event_callback(event: dict):
        await ws_manager.broadcast_session(sid, event)

    result = await orchestrator.execute_workflow(
        workflow_type=WorkflowType.FRAUD_DETECTION,
        payload=request.model_dump(),
        session_id=sid,
        event_callback=event_callback
    )
    return result

@router.post("/claims-processing")
async def execute_claims_processing(request: ClaimsProcessingRequest, session_id: Optional[str] = None):
    sid = session_id or f"claim-{uuid.uuid4().hex[:8]}"
    
    async def event_callback(event: dict):
        await ws_manager.broadcast_session(sid, event)

    result = await orchestrator.execute_workflow(
        workflow_type=WorkflowType.CLAIMS_PROCESSING,
        payload=request.model_dump(),
        session_id=sid,
        event_callback=event_callback
    )
    return result

@router.post("/portfolio-risk")
async def execute_portfolio_risk(request: PortfolioRiskRequest, session_id: Optional[str] = None):
    sid = session_id or f"port-{uuid.uuid4().hex[:8]}"
    
    async def event_callback(event: dict):
        await ws_manager.broadcast_session(sid, event)

    result = await orchestrator.execute_workflow(
        workflow_type=WorkflowType.PORTFOLIO_RISK,
        payload=request.model_dump(),
        session_id=sid,
        event_callback=event_callback
    )
    return result

@router.get("/sample-scenarios")
async def get_sample_scenarios():
    """Provides instant pre-configured test scenarios for one-click testing in the UI."""
    return {
        "loan_underwriting": [
            {
                "id": "loan_prime_mortgage",
                "label": "Prime Residential Mortgage (Low Risk)",
                "description": "Stable salary $145k, credit score 760, requested $380k against $520k collateral.",
                "payload": LoanApplicationRequest().model_dump()
            },
            {
                "id": "loan_jumbo_borderline",
                "label": "Jumbo Loan with High DTI (HITL Trigger)",
                "description": "High requested amount $850k with high monthly obligations $4,800 resulting in borderline DTI.",
                "payload": LoanApplicationRequest(
                    applicant_id="APP-2026-JUMBO",
                    applicant_name="Victoria Sterling",
                    annual_income=180000.0,
                    requested_amount=850000.0,
                    loan_purpose="Luxury Real Estate Purchase",
                    loan_tenure_months=360,
                    monthly_debt_obligations=4800.0,
                    collateral_estimated_value=980000.0,
                    document_notes="W-2s, 1099 investments, and high debt schedule attached."
                ).model_dump()
            }
        ],
        "fraud_detection": [
            {
                "id": "fraud_suspicious_offshore",
                "label": "Suspicious Offshore Wire (High AML Risk / HITL)",
                "description": "Sudden $485,000 transfer to Cayman Islands shell entity with Tor proxy IP.",
                "payload": FraudDetectionRequest().model_dump()
            },
            {
                "id": "fraud_clean_payroll",
                "label": "Standard Domestic Vendor Wire (Low Risk)",
                "description": "Regular $18,500 domestic operating expense wire to verified domestic supplier.",
                "payload": FraudDetectionRequest(
                    transaction_id="TXN-DOM-1102",
                    account_id="ACC-CORP-4401",
                    customer_name="Meridian Trade Logistics Ltd",
                    amount=18500.0,
                    transaction_type="Domestic ACH Supplier Settlement",
                    origin_country="United States",
                    destination_country="United States",
                    destination_bank="JPMorgan Chase Commercial",
                    beneficiary_name="Apex Warehouse Solutions Inc",
                    ip_address="64.233.160.1",
                    device_id="DEV-OFFICE-MAC-01",
                    user_historical_avg_amount=22000.0,
                    velocity_last_24h_count=2,
                    is_weekend_or_holiday=False,
                    notes="Monthly warehouse lease and fulfillment settlement."
                ).model_dump()
            }
        ],
        "claims_processing": [
            {
                "id": "claim_auto_accident",
                "label": "Comprehensive Auto Collision Claim",
                "description": "$28,500 repair bill matching police report with itemized parts/labor breakdown.",
                "payload": ClaimsProcessingRequest().model_dump()
            }
        ],
        "portfolio_risk": [
            {
                "id": "port_growth_stress",
                "label": "Institutional Multi-Asset Portfolio (+250bps Stress Test)",
                "description": "$125M portfolio evaluated against aggressive rate hikes and tech equity drawdowns.",
                "payload": PortfolioRiskRequest().model_dump()
            }
        ]
    }
