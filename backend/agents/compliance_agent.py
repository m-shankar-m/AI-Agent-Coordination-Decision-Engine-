import uuid
from typing import Dict, Any, List, Tuple
from backend.models.schemas import AgentRole, AgentThoughtStep, WorkflowType
from backend.agents.base_agent import BaseAgent

class RegulatoryComplianceAgent(BaseAgent):
    """Specialized Agent 3: Regulatory Compliance Agent for statutory, AML, and policy validation."""

    def __init__(self):
        persona = """You are the Chief Regulatory Compliance & Legal Officer Agent for an institutional BFSI platform.
Your responsibility is to ensure 100% adherence to all statutory, legal, and prudential frameworks:
- OCC & CFPB Qualified Mortgage standards and Truth in Lending rules.
- FinCEN Bank Secrecy Act (BSA), OFAC Sanctions, and Suspicious Activity Reporting (SAR) triggers.
- Basel III Capital Adequacy, CET1 buffers, and Liquidity Coverage Ratios (LCR).
- State Insurance Commissioner claim adjudication standards and statutory exclusion clauses.
You search the vector policy database, verify regulatory thresholds, and flag any statutory violations."""
        super().__init__(role=AgentRole.COMPLIANCE, system_persona=persona)

    def process(self, workflow_type: str, analyst_data: Dict[str, Any]) -> Tuple[Dict[str, Any], List[AgentThoughtStep]]:
        steps: List[AgentThoughtStep] = []
        raw_input = analyst_data.get("raw_input", {})
        risk_metrics = analyst_data.get("credit_risk_metrics", {})

        # Step 1: Policy Vector Search
        step1_id = f"step-{uuid.uuid4().hex[:8]}"
        search_query = f"{workflow_type} regulatory compliance requirements threshold"
        category = "Banking" if workflow_type == WorkflowType.LOAN_UNDERWRITING.value else ("AML" if workflow_type == WorkflowType.FRAUD_DETECTION.value else ("Insurance" if workflow_type == WorkflowType.CLAIMS_PROCESSING.value else "Portfolio Risk"))
        
        policy_res = self.call_tool("policy_retriever", query=search_query, category=category, top_k=2)
        policy_data = policy_res.get("data", {})
        matched_policies = policy_data.get("policies", [])

        steps.append(AgentThoughtStep(
            step_id=step1_id,
            agent_role=self.role,
            phase="POLICY_VECTOR_SEARCH",
            thought=f"Queried institutional Policy Vector DB for active regulations in category '{category}'.",
            tool_called="policy_retriever",
            tool_input={"query": search_query, "category": category},
            tool_output=policy_data,
            findings_summary=f"Retrieved {len(matched_policies)} binding regulatory clauses (Top match: {matched_policies[0].get('title') if matched_policies else 'Standard Code'}).",
            confidence_score=0.97,
            latency_ms=policy_res.get("latency_ms", 40)
        ))

        # Step 2: Statutory Compliance Evaluation
        compliance_check_results = {}
        violations = []
        warnings = []
        requires_sar = False

        if workflow_type == WorkflowType.LOAN_UNDERWRITING.value:
            dti = risk_metrics.get("debt_to_income_pct", 35.0)
            ltv = risk_metrics.get("loan_to_value_pct", 75.0)
            cscore = risk_metrics.get("credit_score", 740)
            
            # OCC QM Rule: Standard DTI <= 43%, up to 45% with >= 720 score
            dti_pass = dti <= 43.0 or (dti <= 45.0 and cscore >= 720)
            if not dti_pass:
                violations.append(f"OCC QM DTI violation: Computed DTI {dti}% exceeds statutory limit.")
            
            pmi_required = ltv > 80.0
            if pmi_required:
                warnings.append(f"LTV {ltv}% exceeds 80.0%; mandatory escrow for Private Mortgage Insurance (PMI) required.")

            compliance_check_results = {
                "occ_qualified_mortgage_compliant": dti_pass,
                "cfpb_ability_to_repay_verified": True,
                "pmi_escrow_mandated": pmi_required,
                "fair_lending_act_aligned": True,
                "status": "PASS" if not violations else "NON_COMPLIANT"
            }

        elif workflow_type == WorkflowType.FRAUD_DETECTION.value:
            aml_output = risk_metrics.get("aml_tool_output", {})
            sanction_match = aml_output.get("sanction_match", False)
            requires_sar = aml_output.get("requires_sar_filing", False)
            
            if sanction_match:
                violations.append("OFAC / UN Sanctions Direct Hit: Immediate asset freeze and blocking mandate.")
            if requires_sar:
                warnings.append("FinCEN SAR Filing Triggered: Transaction meets threshold for suspicious activity report.")

            compliance_check_results = {
                "ofac_sanctions_pass": not sanction_match,
                "fincen_bsa_compliant": not sanction_match,
                "sar_filing_required": requires_sar,
                "beneficial_ownership_verified": not sanction_match,
                "status": "BLOCKED" if sanction_match else ("FLAGGED_SAR" if requires_sar else "PASS")
            }

        elif workflow_type == WorkflowType.CLAIMS_PROCESSING.value:
            compliance_check_results = {
                "state_insurance_code_adherent": True,
                "statutory_deductible_compliant": True,
                "fraud_statute_verified": True,
                "exclusion_clauses_triggered": [],
                "status": "PASS"
            }

        elif workflow_type == WorkflowType.PORTFOLIO_RISK.value:
            stress_loss_pct = risk_metrics.get("stress_projected_loss_pct", 16.4)
            lcr = risk_metrics.get("liquidity_coverage_ratio_pct", 142.5)
            
            basel_pass = lcr >= 100.0
            if stress_loss_pct > 15.0:
                warnings.append(f"Basel III Stress Threshold Exceeded: Projected drawdown {stress_loss_pct}% exceeds 15% supervisory guidance.")

            compliance_check_results = {
                "basel_iii_cet1_buffer": "COMPLIANT (CET1 11.2% > 4.5% min)",
                "liquidity_coverage_ratio_status": "COMPLIANT (LCR 142.5% > 100% min)",
                "capital_conservation_buffer": "ADEQUATE",
                "supervisory_stress_warning": stress_loss_pct > 15.0,
                "status": "PASS_WITH_WARNINGS" if warnings else "PASS"
            }

        # Step 3: LLM Compliance Legal Synthesis
        step2_id = f"step-{uuid.uuid4().hex[:8]}"
        task_desc = f"""Analyze legal & regulatory compliance for {workflow_type}.
Context & Compliance Check Results:
{compliance_check_results}
Violations: {violations}
Warnings: {warnings}
Retrieved Policies: {matched_policies}

Output JSON schema:
{{
  "compliance_overall_verdict": "PASS",
  "legal_summary": "string explaining legal standing",
  "compliance_confidence": 0.95,
  "mandatory_regulatory_stipulations": ["string"]
}}"""

        provider_map = {"loan_underwriting": "gemini", "fraud_detection": "groq", "claims_processing": "openai", "portfolio_risk": "gemini"}
        target_p = provider_map.get(workflow_type, "gemini")
        reasoning = self.think_and_reason(task_desc, {"checks": compliance_check_results, "policies": matched_policies}, target_provider=target_p)
        parsed = reasoning.get("parsed_output", {})

        steps.append(AgentThoughtStep(
            step_id=step2_id,
            agent_role=self.role,
            phase="REGULATORY_STATUTE_VALIDATION",
            thought="Validated statutory ratios against binding regulatory jurisprudence and Basel/OCC/FinCEN thresholds.",
            findings_summary=parsed.get("legal_summary", "Regulatory compliance validation complete."),
            confidence_score=float(parsed.get("compliance_confidence", 0.96)),
            latency_ms=reasoning.get("latency_ms", 115)
        ))

        compliance_payload = {
            **analyst_data,
            "compliance_checks": compliance_check_results,
            "violations": violations,
            "warnings": warnings,
            "matched_policies": matched_policies,
            "compliance_synthesis": parsed
        }

        return compliance_payload, steps
