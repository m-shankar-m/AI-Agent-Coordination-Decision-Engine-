import pytest
import asyncio
from backend.models.schemas import (
    WorkflowType,
    LoanApplicationRequest,
    FraudDetectionRequest,
    ClaimsProcessingRequest,
    PortfolioRiskRequest,
    HumanReviewAction,
    DecisionStatus
)
from backend.workflows.orchestrator import orchestrator
from backend.tools.tool_registry import tool_registry
from backend.memory.memory_manager import memory_manager

@pytest.mark.asyncio
async def test_tool_registry_executions():
    # 1. Credit Bureau Tool
    bureau_res = tool_registry.execute_tool("credit_bureau", applicant_name="Test User", applicant_id="APP-99", annual_income=120000, debt_obligations=2000)
    assert bureau_res["success"] is True
    assert "credit_score" in bureau_res["data"]

    # 2. Core Banking Tool
    bank_res = tool_registry.execute_tool("core_banking", account_id="ACC-99", applicant_name="Test User", annual_income=120000)
    assert bank_res["success"] is True
    assert "average_6m_balance" in bank_res["data"]

    # 3. AML Sanctions Tool
    aml_res = tool_registry.execute_tool("aml_sanctions", customer_name="Clean Co", counterparty_name="Vendor A", amount=5000, origin_country="US", destination_country="US", historical_avg_amount=4000, velocity_24h=1)
    assert aml_res["success"] is True
    assert aml_res["data"]["sanction_match"] is False

    # 4. Policy Retriever Tool
    policy_res = tool_registry.execute_tool("policy_retriever", query="DTI ratio qualified mortgage", category="Banking", top_k=2)
    assert policy_res["success"] is True
    assert len(policy_res["data"]["policies"]) > 0

@pytest.mark.asyncio
async def test_loan_underwriting_workflow():
    payload = LoanApplicationRequest(
        applicant_id="TEST-APP-001",
        applicant_name="Sarah Jenkins",
        annual_income=150000.0,
        requested_amount=320000.0,
        monthly_debt_obligations=1800.0,
        collateral_estimated_value=480000.0
    ).model_dump()

    result = await orchestrator.execute_workflow(
        workflow_type=WorkflowType.LOAN_UNDERWRITING,
        payload=payload,
        session_id="test-loan-sess-001"
    )

    assert result["session_id"] == "test-loan-sess-001"
    assert "final_verdict" in result
    assert len(result["audit_trail"]) >= 4
    assert result["result"]["applicant_name"] == "Sarah Jenkins"

@pytest.mark.asyncio
async def test_fraud_detection_workflow():
    payload = FraudDetectionRequest(
        transaction_id="TEST-TXN-002",
        customer_name="Global Exports LLC",
        amount=500000.0,
        destination_country="Cayman Islands",
        beneficiary_name="Silver Crest Ventures SPV",
        user_historical_avg_amount=15000.0,
        velocity_last_24h_count=10
    ).model_dump()

    result = await orchestrator.execute_workflow(
        workflow_type=WorkflowType.FRAUD_DETECTION,
        payload=payload,
        session_id="test-fraud-sess-002"
    )

    assert result["session_id"] == "test-fraud-sess-002"
    assert result["result"]["fraud_risk_score"] > 50.0
    assert result["result"]["requires_hitl_signoff"] is True

@pytest.mark.asyncio
async def test_claims_processing_workflow():
    payload = ClaimsProcessingRequest(
        claim_id="TEST-CLM-003",
        claimant_name="Michael Scott",
        total_claimed_amount=14200.0
    ).model_dump()

    result = await orchestrator.execute_workflow(
        workflow_type=WorkflowType.CLAIMS_PROCESSING,
        payload=payload,
        session_id="test-claim-sess-003"
    )

    assert result["session_id"] == "test-claim-sess-003"
    assert result["result"]["approved_payout_amount"] > 0

@pytest.mark.asyncio
async def test_portfolio_risk_workflow():
    payload = PortfolioRiskRequest(
        portfolio_id="TEST-PORT-004",
        total_portfolio_value=50000000.0
    ).model_dump()

    result = await orchestrator.execute_workflow(
        workflow_type=WorkflowType.PORTFOLIO_RISK,
        payload=payload,
        session_id="test-port-sess-004"
    )

    assert result["session_id"] == "test-port-sess-004"
    assert result["result"]["value_at_risk_95_daily"] > 0

@pytest.mark.asyncio
async def test_human_in_the_loop_resolution():
    pending_list = memory_manager.get_pending_hitl()
    if pending_list:
        target_sess = pending_list[0]["session_id"]
        res = memory_manager.resolve_hitl(
            session_id=target_sess,
            reviewer_name="Senior Underwriter Test",
            action="APPROVE",
            notes="Manually overridden and signed off after secondary collateral verification.",
            override_verdict="APPROVED"
        )
        assert res is True
