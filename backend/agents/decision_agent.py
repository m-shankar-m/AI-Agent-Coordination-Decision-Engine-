import uuid
from typing import Dict, Any, List, Tuple
from backend.models.schemas import AgentRole, AgentThoughtStep, DecisionStatus, WorkflowType
from backend.agents.base_agent import BaseAgent
from backend.config import Config

class DecisionApproverAgent(BaseAgent):
    """Specialized Agent 4: Decision Approver Agent with Human-In-The-Loop (HITL) Gate."""

    def __init__(self):
        persona = """You are the Senior Executive Underwriting & Decision Approver Agent for an institutional BFSI platform.
Your responsibility is to synthesize findings from all prior specialized agents (Intake, Credit/Risk Analyst, Regulatory Compliance);
evaluate composite risk & policy alignment;
determine whether the request can be autonomously approved/rejected or requires escalation to a Human Underwriting Committee (HITL);
and formulate unambiguous final terms, interest rates, payout allocations, SAR filing drafts, or rebalancing mandates."""
        super().__init__(role=AgentRole.DECISION_APPROVER, system_persona=persona)

    def process(self, workflow_type: str, compliance_data: Dict[str, Any]) -> Tuple[Dict[str, Any], List[AgentThoughtStep]]:
        steps: List[AgentThoughtStep] = []
        raw_input = compliance_data.get("raw_input", {})
        risk_metrics = compliance_data.get("credit_risk_metrics", {})
        compliance_checks = compliance_data.get("compliance_checks", {})
        violations = compliance_data.get("violations", [])
        warnings = compliance_data.get("warnings", [])

        # Evaluate HITL necessity
        requires_hitl = False
        hitl_reasons = []

        if violations:
            final_status = DecisionStatus.BLOCKED if workflow_type == WorkflowType.FRAUD_DETECTION.value else DecisionStatus.REJECTED
            requires_hitl = True
            hitl_reasons.append(f"Regulatory/Sanction violation detected ({'; '.join(violations)}). Requires compliance officer signoff.")
        else:
            # Check for borderline / high-risk parameters
            if workflow_type == WorkflowType.LOAN_UNDERWRITING.value:
                dti = risk_metrics.get("debt_to_income_pct", 35.0)
                cscore = risk_metrics.get("credit_score", 740)
                if dti > 43.0 or cscore < 660 or raw_input.get("requested_amount", 0) > 750000.0:
                    requires_hitl = True
                    hitl_reasons.append(f"Borderline DTI ({dti}%) or jumbo requested amount requires senior underwriter signoff.")
                final_status = DecisionStatus.ESCALATED_HITL if requires_hitl else DecisionStatus.APPROVED

            elif workflow_type == WorkflowType.FRAUD_DETECTION.value:
                fraud_score = risk_metrics.get("fraud_risk_score", 50.0)
                requires_sar = compliance_checks.get("sar_filing_required", False)
                if fraud_score >= Config.FRAUD_RISK_ALERT_THRESHOLD or requires_sar:
                    requires_hitl = True
                    hitl_reasons.append(f"High AML Anomaly score ({fraud_score}/100) and SAR filing trigger requires BSA Compliance Officer review.")
                    final_status = DecisionStatus.ESCALATED_HITL
                elif fraud_score >= 40.0:
                    final_status = DecisionStatus.FLAGGED_FOR_REVIEW
                else:
                    final_status = DecisionStatus.ALLOW

            elif workflow_type == WorkflowType.CLAIMS_PROCESSING.value:
                claimed = float(raw_input.get("total_claimed_amount", 0.0))
                if claimed > 25000.0:
                    requires_hitl = True
                    hitl_reasons.append(f"Claim amount (${claimed:,.2f}) exceeds autonomous adjustor limit ($25,000.00).")
                    final_status = DecisionStatus.ESCALATED_HITL
                else:
                    final_status = DecisionStatus.APPROVED

            elif workflow_type == WorkflowType.PORTFOLIO_RISK.value:
                stress_loss_pct = risk_metrics.get("stress_projected_loss_pct", 16.4)
                if stress_loss_pct > 15.0:
                    requires_hitl = True
                    hitl_reasons.append(f"Projected stress loss ({stress_loss_pct}%) breaches 15% institutional risk appetite threshold.")
                    final_status = DecisionStatus.ESCALATED_HITL
                else:
                    final_status = DecisionStatus.APPROVED

        # Step: LLM Decision Synthesis & Rationale Generation
        step_id = f"step-{uuid.uuid4().hex[:8]}"
        task_desc = f"""Synthesize complete executive decision for {workflow_type}.
Decision Verdict: {final_status.value}
Requires HITL Signoff: {requires_hitl} ({hitl_reasons})
Context:
Risk Metrics: {risk_metrics}
Compliance: {compliance_checks}

Output JSON schema:
{{
  "executive_summary": "detailed 2-3 sentence executive decision rationale",
  "approved_terms": {{ "amount_or_payout": 0.0, "rate_or_fee": 0.0, "tenure_or_duration": 0 }},
  "mandatory_conditions": ["string"],
  "decision_confidence": 0.95,
  "audit_notes": "compliance and audit trail justification"
}}"""

        provider_map = {"loan_underwriting": "gemini", "fraud_detection": "groq", "claims_processing": "openai", "portfolio_risk": "gemini"}
        target_p = provider_map.get(workflow_type, "gemini")
        reasoning = self.think_and_reason(task_desc, {"status": final_status.value, "hitl": requires_hitl}, target_provider=target_p)
        parsed = reasoning.get("parsed_output", {})

        confidence = float(parsed.get("decision_confidence", 0.95))
        if requires_hitl:
            confidence = min(confidence, 0.78)

        steps.append(AgentThoughtStep(
            step_id=step_id,
            agent_role=self.role,
            phase="EXECUTIVE_DECISION_ARBITRATION",
            thought="Synthesized multi-agent findings, evaluated risk/reward thresholds, and formulated final binding decision.",
            findings_summary=parsed.get("executive_summary", f"Decision rendered: {final_status.value}"),
            confidence_score=confidence,
            latency_ms=reasoning.get("latency_ms", 130)
        ))

        final_decision_payload = {
            **compliance_data,
            "final_decision": final_status,
            "requires_hitl_signoff": requires_hitl,
            "hitl_reason": "; ".join(hitl_reasons) if hitl_reasons else None,
            "confidence_score": confidence,
            "decision_synthesis": parsed
        }

        return final_decision_payload, steps
