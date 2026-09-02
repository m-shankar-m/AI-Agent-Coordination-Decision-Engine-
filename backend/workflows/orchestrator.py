import time
import uuid
import logging
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
from backend.models.schemas import (
    WorkflowType, AgentRole, AgentThoughtStep, DecisionStatus,
    LoanUnderwritingResult, FraudDetectionResult, ClaimsProcessingResult, PortfolioRiskResult
)
from backend.agents.intake_agent import IntakeExtractionAgent
from backend.agents.credit_risk_agent import CreditRiskAnalystAgent
from backend.agents.compliance_agent import RegulatoryComplianceAgent
from backend.agents.decision_agent import DecisionApproverAgent
from backend.memory.memory_manager import memory_manager
from backend.llm.client import llm_client

logger = logging.getLogger("BFSI.Orchestrator")
logger.setLevel(logging.INFO)

class WorkflowOrchestrator:
    """Multi-Agent Orchestration & Decision Coordination Engine."""

    def __init__(self):
        self.intake_agent = IntakeExtractionAgent()
        self.risk_agent = CreditRiskAnalystAgent()
        self.compliance_agent = RegulatoryComplianceAgent()
        self.decision_agent = DecisionApproverAgent()

    async def execute_workflow(
        self,
        workflow_type: WorkflowType,
        payload: Dict[str, Any],
        session_id: Optional[str] = None,
        event_callback: Optional[Callable[[Dict[str, Any]], None]] = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        session_id = session_id or f"sess-{uuid.uuid4().hex[:12]}"
        
        blackboard = memory_manager.get_or_create_session(session_id, workflow_type.value)
        blackboard.set("initial_payload", payload, "System")

        audit_trail: List[AgentThoughtStep] = []

        async def emit_step(step: AgentThoughtStep):
            audit_trail.append(step)
            blackboard.events.append(step.model_dump())
            if event_callback:
                try:
                    await event_callback({
                        "type": "AGENT_STEP",
                        "session_id": session_id,
                        "workflow_type": workflow_type.value,
                        "step": step.model_dump()
                    })
                except Exception as e:
                    logger.warning(f"Error in event callback: {e}")

        # --- Phase 1: Intake & Extraction ---
        init_step = AgentThoughtStep(
            step_id=f"step-orch-init-{uuid.uuid4().hex[:6]}",
            agent_role=AgentRole.ORCHESTRATOR,
            phase="WORKFLOW_INITIALIZATION",
            thought=f"Orchestrating multi-agent state graph for {workflow_type.value.upper()}. Initializing agent swarm.",
            findings_summary="Agents initialized: [Intake, CreditRisk, Compliance, DecisionApprover].",
            confidence_score=1.0,
            latency_ms=10
        )
        await emit_step(init_step)

        intake_state, intake_steps = self.intake_agent.process(workflow_type.value, payload)
        for s in intake_steps:
            await emit_step(s)
        blackboard.set("intake_state", intake_state, str(self.intake_agent.role))

        # --- Phase 2: Credit / Risk Quantitative Modeling ---
        risk_state, risk_steps = self.risk_agent.process(workflow_type.value, intake_state)
        for s in risk_steps:
            await emit_step(s)
        blackboard.set("risk_state", risk_state, str(self.risk_agent.role))

        # --- Phase 3: Regulatory Compliance Validation ---
        compliance_state, compliance_steps = self.compliance_agent.process(workflow_type.value, risk_state)
        for s in compliance_steps:
            await emit_step(s)
        blackboard.set("compliance_state", compliance_state, str(self.compliance_agent.role))

        # --- Phase 4: Decision Synthesis & HITL Arbitration ---
        final_state, decision_steps = self.decision_agent.process(workflow_type.value, compliance_state)
        for s in decision_steps:
            await emit_step(s)
        blackboard.set("final_state", final_state, str(self.decision_agent.role))

        total_latency = int((time.time() - start_time) * 1000)

        # Build Domain Specific Result
        formatted_result = self._format_workflow_result(workflow_type, final_state, audit_trail, session_id)

        # Record to Persistent Long-Term Audit Storage
        decision_verdict = final_state.get("final_decision", DecisionStatus.APPROVED)
        verdict_str = decision_verdict.value if hasattr(decision_verdict, "value") else str(decision_verdict)
        
        record = {
            "session_id": session_id,
            "workflow_type": workflow_type.value,
            "initiated_at": datetime.utcfromtimestamp(start_time).isoformat(),
            "completed_at": datetime.utcnow().isoformat(),
            "status": "COMPLETED",
            "total_latency_ms": total_latency,
            "active_llm_provider": llm_client.WORKFLOW_PROVIDER_MAP.get(workflow_type.value, "gemini"),
            "agent_steps_count": len(audit_trail),
            "final_verdict": verdict_str,
            "confidence_score": final_state.get("confidence_score", 0.95),
            "hitl_triggered": final_state.get("requires_hitl_signoff", False),
            "hitl_reason": final_state.get("hitl_reason"),
            "hitl_resolved": False,
            "details": formatted_result
        }
        memory_manager.record_decision(record)

        if event_callback:
            try:
                await event_callback({
                    "type": "WORKFLOW_COMPLETE",
                    "session_id": session_id,
                    "workflow_type": workflow_type.value,
                    "record": record,
                    "result": formatted_result
                })
            except Exception as e:
                logger.warning(f"Error emitting completion event: {e}")

        return {
            "session_id": session_id,
            "workflow_type": workflow_type.value,
            "total_latency_ms": total_latency,
            "final_verdict": verdict_str,
            "result": formatted_result,
            "audit_trail": [s.model_dump() for s in audit_trail]
        }

    def _format_workflow_result(
        self,
        workflow_type: WorkflowType,
        final_state: Dict[str, Any],
        audit_trail: List[AgentThoughtStep],
        session_id: str
    ) -> Dict[str, Any]:
        raw_input = final_state.get("raw_input", {})
        risk_metrics = final_state.get("credit_risk_metrics", {})
        compliance_checks = final_state.get("compliance_checks", {})
        synth = final_state.get("decision_synthesis", {})
        decision = final_state.get("final_decision", DecisionStatus.APPROVED)

        if workflow_type == WorkflowType.LOAN_UNDERWRITING:
            bureau = risk_metrics.get("bureau_data", {})
            return LoanUnderwritingResult(
                application_id=raw_input.get("applicant_id", session_id),
                applicant_name=raw_input.get("applicant_name", "Valued Client"),
                credit_score=risk_metrics.get("credit_score", 740),
                credit_bureau_status=bureau.get("credit_tier", "GOOD"),
                debt_to_income_pct=risk_metrics.get("debt_to_income_pct", 34.5),
                loan_to_value_pct=risk_metrics.get("loan_to_value_pct", 73.1),
                monthly_payment_projected=risk_metrics.get("monthly_payment_projected", 2402.0),
                risk_tier=risk_metrics.get("risk_tier", "PRIME"),
                regulatory_compliance=compliance_checks,
                decision=decision,
                confidence_score=final_state.get("confidence_score", 0.95),
                approved_amount=float(raw_input.get("requested_amount", 380000.0)),
                interest_rate_apr=6.45,
                tenure_months=int(raw_input.get("loan_tenure_months", 360)),
                mandatory_conditions=synth.get("mandatory_conditions", [
                    "Verification of hazard insurance prior to closing",
                    "Final title search and encumbrance certificate"
                ]),
                underwriting_rationale=synth.get("executive_summary", "Applicant demonstrates exceptional repayment capacity with conservative leverage."),
                requires_hitl_signoff=final_state.get("requires_hitl_signoff", False),
                hitl_reason=final_state.get("hitl_reason"),
                audit_trail=audit_trail
            ).model_dump()

        elif workflow_type == WorkflowType.FRAUD_DETECTION:
            return FraudDetectionResult(
                transaction_id=raw_input.get("transaction_id", session_id),
                customer_name=raw_input.get("customer_name", "Corporate Client"),
                amount=float(raw_input.get("amount", 485000.0)),
                fraud_risk_score=risk_metrics.get("fraud_risk_score", 45.0),
                risk_level=risk_metrics.get("risk_level", "MEDIUM"),
                anomaly_indicators=risk_metrics.get("anomalies_detected", []),
                aml_sanctions_matched=not compliance_checks.get("ofac_sanctions_pass", True),
                decision=decision,
                confidence_score=final_state.get("confidence_score", 0.92),
                sar_report_draft=f"Suspicious Activity Report Draft: Account {raw_input.get('account_id')} initiated cross-border wire to {raw_input.get('destination_country')} with 20x spike over baseline." if final_state.get("requires_hitl_signoff") else None,
                recommended_interventions=[
                    "Implement enhanced biometric MFA verification",
                    "Hold wire in compliance review queue for 24h",
                    "Request verified commercial invoice and bill of lading"
                ] if final_state.get("requires_hitl_signoff") else ["Standard automated settlement"],
                requires_hitl_signoff=final_state.get("requires_hitl_signoff", False),
                hitl_reason=final_state.get("hitl_reason"),
                audit_trail=audit_trail
            ).model_dump()

        elif workflow_type == WorkflowType.CLAIMS_PROCESSING:
            return ClaimsProcessingResult(
                claim_id=raw_input.get("claim_id", session_id),
                policy_id=raw_input.get("policy_id", "POL-2026-990"),
                claimant_name=raw_input.get("claimant_name", "Policyholder"),
                policy_status="ACTIVE_IN_FORCE",
                policy_coverage_limit=risk_metrics.get("policy_coverage_limit", 100000.0),
                deductible_amount=risk_metrics.get("deductible_amount", 1000.0),
                claimed_amount=float(raw_input.get("total_claimed_amount", 28500.0)),
                approved_payout_amount=risk_metrics.get("recommended_net_payout", 27500.0),
                decision=decision,
                confidence_score=final_state.get("confidence_score", 0.94),
                adjudication_rationale=synth.get("executive_summary", "Accident report and certified body shop invoice reconciled with zero fraudulent flags."),
                requires_hitl_signoff=final_state.get("requires_hitl_signoff", False),
                hitl_reason=final_state.get("hitl_reason"),
                audit_trail=audit_trail
            ).model_dump()

        elif workflow_type == WorkflowType.PORTFOLIO_RISK:
            return PortfolioRiskResult(
                portfolio_id=raw_input.get("portfolio_id", session_id),
                institution_name=raw_input.get("institution_name", "Institutional Asset Trust"),
                total_value=float(raw_input.get("total_portfolio_value", 125000000.0)),
                value_at_risk_95_daily=risk_metrics.get("value_at_risk_95_daily", 2475000.0),
                expected_shortfall_95=risk_metrics.get("expected_shortfall_95", 3168000.0),
                stress_projected_loss=risk_metrics.get("stress_projected_loss", 20500000.0),
                stress_projected_loss_pct=risk_metrics.get("stress_projected_loss_pct", 16.4),
                concentration_risk_warnings=[
                    "Technology sector equity exposure exceeds 25% single-sector guideline",
                    "Commercial Real Estate debt duration of 6.8 years presents sensitivity to interest rate shocks"
                ],
                basel_iii_capital_buffer_status="ADEQUATE_TIER_1_SURPLUS",
                liquidity_coverage_ratio_pct=risk_metrics.get("liquidity_coverage_ratio_pct", 142.5),
                decision=decision,
                confidence_score=final_state.get("confidence_score", 0.93),
                risk_summary_rationale=synth.get("executive_summary", "Portfolio maintains compliant Basel III liquidity buffers but exhibits elevated tail risk in severe rate shock scenarios."),
                rebalancing_recommendations=[
                    "Reduce Tech equity allocation from 30% to 22%",
                    "Allocate +5% into 2Y Treasury Notes to compress portfolio effective duration",
                    "Hedge interest rate downside with interest rate swaptions"
                ],
                requires_hitl_signoff=final_state.get("requires_hitl_signoff", False),
                hitl_reason=final_state.get("hitl_reason"),
                audit_trail=audit_trail
            ).model_dump()

        return {}

# Global Orchestrator
orchestrator = WorkflowOrchestrator()
