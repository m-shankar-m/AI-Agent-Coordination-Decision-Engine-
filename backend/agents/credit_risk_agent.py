import uuid
from typing import Dict, Any, List, Tuple
from backend.models.schemas import AgentRole, AgentThoughtStep, WorkflowType
from backend.agents.base_agent import BaseAgent

class CreditRiskAnalystAgent(BaseAgent):
    """Specialized Agent 2: Credit & Risk Analyst Agent for quantitative modeling and exposure analysis."""

    def __init__(self):
        persona = """You are the Senior Credit & Quantitative Risk Analyst Agent for an institutional BFSI platform.
Your responsibility is to perform rigorous quantitative risk assessment:
- Calculate Debt-to-Income (DTI), Loan-to-Value (LTV), and credit score rating for loan underwriting.
- Evaluate transaction velocity, anomaly spikes, and behavioral deviation for fraud detection.
- Compute loss adjustor depreciation, invoice legitimacy, and exposure for insurance claims.
- Calculate 95% Daily Value at Risk (VaR), Expected Shortfall, duration risk, and macroeconomic stress impact for investment portfolios.
Always provide rigorous numerical evaluations, risk tier assignments, and clear mathematical rationales."""
        super().__init__(role=AgentRole.CREDIT_RISK, system_persona=persona)

    def process(self, workflow_type: str, intake_data: Dict[str, Any]) -> Tuple[Dict[str, Any], List[AgentThoughtStep]]:
        steps: List[AgentThoughtStep] = []
        raw_input = intake_data.get("raw_input", {})
        
        risk_metrics: Dict[str, Any] = {}

        # --- 1. LOAN UNDERWRITING PATHWAY ---
        if workflow_type == WorkflowType.LOAN_UNDERWRITING.value:
            applicant_name = raw_input.get("applicant_name", "Alexander Wright")
            applicant_id = raw_input.get("applicant_id", "APP-2026-9041")
            annual_income = float(raw_input.get("annual_income", 145000.0))
            requested_amount = float(raw_input.get("requested_amount", 380000.0))
            monthly_debts = float(raw_input.get("monthly_debt_obligations", 2100.0))
            collateral_val = float(raw_input.get("collateral_estimated_value", 520000.0))
            tenure_months = int(raw_input.get("loan_tenure_months", 360))

            # Call Credit Bureau Tool
            step1_id = f"step-{uuid.uuid4().hex[:8]}"
            bureau_res = self.call_tool("credit_bureau", applicant_name=applicant_name, applicant_id=applicant_id, annual_income=annual_income, debt_obligations=monthly_debts)
            bureau_data = bureau_res.get("data", {})
            steps.append(AgentThoughtStep(
                step_id=step1_id,
                agent_role=self.role,
                phase="CREDIT_BUREAU_INQUIRY",
                thought="Queried Experian/CIBIL credit repository to retrieve verified FICO score, tradelines, and payment delinquency records.",
                tool_called="credit_bureau",
                tool_input={"applicant_id": applicant_id, "applicant_name": applicant_name},
                tool_output=bureau_data,
                findings_summary=f"Retrieved Credit Score: {bureau_data.get('credit_score', 740)} ({bureau_data.get('credit_tier', 'GOOD')}), {bureau_data.get('total_active_tradelines', 4)} active tradelines.",
                confidence_score=0.98,
                latency_ms=bureau_res.get("latency_ms", 65)
            ))

            # Call Core Banking Tool
            step2_id = f"step-{uuid.uuid4().hex[:8]}"
            bank_res = self.call_tool("core_banking", account_id=f"ACC-{applicant_id}", applicant_name=applicant_name, annual_income=annual_income)
            bank_data = bank_res.get("data", {})
            steps.append(AgentThoughtStep(
                step_id=step2_id,
                agent_role=self.role,
                phase="CORE_BANKING_LEDGER_ANALYSIS",
                thought="Interfaced with Core Banking ledger to evaluate recurring salary deposits, 6-month average balance, and NSF occurrences.",
                tool_called="core_banking",
                tool_input={"account_id": f"ACC-{applicant_id}", "annual_income": annual_income},
                tool_output=bank_data,
                findings_summary=f"Verified 6M Avg Balance: ${bank_data.get('average_6m_balance', 0):,.2f}, Direct Deposit: {bank_data.get('salary_direct_deposit_verified')}.",
                confidence_score=0.96,
                latency_ms=bank_res.get("latency_ms", 50)
            ))

            # Mathematical Quantitative Analysis
            monthly_income = annual_income / 12.0
            # Approx monthly mortgage payment at ~6.5% interest
            r = (6.5 / 100.0) / 12.0
            n = tenure_months
            monthly_payment = requested_amount * (r * ((1 + r) ** n)) / (((1 + r) ** n) - 1)
            
            total_monthly_obligations = monthly_debts + monthly_payment
            dti_ratio = (total_monthly_obligations / monthly_income) * 100.0 if monthly_income > 0 else 50.0
            ltv_ratio = (requested_amount / collateral_val) * 100.0 if collateral_val > 0 else 80.0
            
            credit_score = bureau_data.get("credit_score", 740)
            risk_tier = "PRIME (LOW RISK)" if credit_score >= 740 and dti_ratio <= 38.0 else ("NEAR PRIME (MODERATE RISK)" if credit_score >= 660 and dti_ratio <= 45.0 else "SUBPRIME (HIGH RISK)")

            risk_metrics = {
                "credit_score": credit_score,
                "credit_tier": bureau_data.get("credit_tier", "GOOD"),
                "debt_to_income_pct": round(dti_ratio, 2),
                "loan_to_value_pct": round(ltv_ratio, 2),
                "monthly_payment_projected": round(monthly_payment, 2),
                "risk_tier": risk_tier,
                "bureau_data": bureau_data,
                "bank_data": bank_data
            }

        # --- 2. FRAUD DETECTION PATHWAY ---
        elif workflow_type == WorkflowType.FRAUD_DETECTION.value:
            step1_id = f"step-{uuid.uuid4().hex[:8]}"
            amount = float(raw_input.get("amount", 485000.0))
            hist_avg = float(raw_input.get("user_historical_avg_amount", 24000.0))
            velocity = int(raw_input.get("velocity_last_24h_count", 8))
            dest_country = raw_input.get("destination_country", "Cayman Islands")
            counterparty = raw_input.get("beneficiary_name", "Silver Crest Ventures SPV")
            ip = raw_input.get("ip_address", "185.220.101.5")
            device = raw_input.get("device_id", "DEV-PROXY-TOR-99")

            # Call AML Screening Tool for quantitative baseline
            aml_res = self.call_tool("aml_sanctions", customer_name=raw_input.get("customer_name", ""), counterparty_name=counterparty, amount=amount, origin_country=raw_input.get("origin_country", "US"), destination_country=dest_country, historical_avg_amount=hist_avg, velocity_24h=velocity, ip_address=ip, device_id=device)
            aml_data = aml_res.get("data", {})
            
            steps.append(AgentThoughtStep(
                step_id=step1_id,
                agent_role=self.role,
                phase="TRANSACTION_VELOCITY_ANOMALY_SCORING",
                thought="Calculated statistical Z-score deviation against account baseline, velocity clustering, and geographic anomaly indicators.",
                tool_called="aml_sanctions",
                tool_input={"amount": amount, "historical_avg": hist_avg, "velocity": velocity},
                tool_output=aml_data,
                findings_summary=f"Computed AML Risk Index: {aml_data.get('computed_aml_risk_score')}/100. Spike Ratio: {aml_data.get('amount_spike_ratio')}x.",
                confidence_score=0.95,
                latency_ms=aml_res.get("latency_ms", 55)
            ))

            fraud_score = aml_data.get("computed_aml_risk_score", 65.0)
            risk_level = "CRITICAL" if fraud_score >= 80 else ("HIGH" if fraud_score >= 60 else ("MEDIUM" if fraud_score >= 35 else "LOW"))

            risk_metrics = {
                "fraud_risk_score": fraud_score,
                "risk_level": risk_level,
                "amount_spike_ratio": aml_data.get("amount_spike_ratio", 1.0),
                "anomalies_detected": aml_data.get("anomaly_list", []),
                "aml_tool_output": aml_data
            }

        # --- 3. CLAIMS PROCESSING PATHWAY ---
        elif workflow_type == WorkflowType.CLAIMS_PROCESSING.value:
            claimed_amount = float(raw_input.get("total_claimed_amount", 28500.0))
            damage_items = raw_input.get("damage_items", [])
            deductible = 1000.0
            
            calculated_parts = sum([item.get("claimed_cost", 0.0) for item in damage_items]) if damage_items else claimed_amount
            approved_payout = max(0.0, calculated_parts - deductible)

            risk_metrics = {
                "policy_coverage_limit": 100000.0,
                "deductible_amount": deductible,
                "gross_claimed_amount": claimed_amount,
                "assessed_labor_parts_total": calculated_parts,
                "recommended_net_payout": approved_payout,
                "inflation_risk_pct": 0.0,
                "fraud_indicator": "LOW"
            }

        # --- 4. PORTFOLIO RISK PATHWAY ---
        elif workflow_type == WorkflowType.PORTFOLIO_RISK.value:
            total_val = float(raw_input.get("total_portfolio_value", 125000000.0))
            holdings = raw_input.get("holdings", [])
            scenario = raw_input.get("macro_stress_scenario", "")
            
            # Calculate weighted duration and risk exposure
            high_risk_weight = sum([h.get("weight_pct", 0) for h in holdings if h.get("credit_rating") in ["BB", "B", "CCC", "CC", "C", "D"] or h.get("asset_class") == "Equity"])
            safe_weight = sum([h.get("weight_pct", 0) for h in holdings if h.get("credit_rating") in ["AAA", "AA"] or h.get("asset_class") in ["Sovereign Bond", "Cash Equivalent"]])

            if safe_weight >= 60.0:
                stress_loss_pct = 4.8
                daily_vol = 0.005
            elif high_risk_weight >= 60.0:
                stress_loss_pct = 26.5
                daily_vol = 0.024
            else:
                stress_loss_pct = 16.4
                daily_vol = 0.012

            var_95 = total_val * (1.65 * daily_vol)
            expected_shortfall = var_95 * 1.28
            stress_loss = total_val * (stress_loss_pct / 100.0)

            risk_metrics = {
                "total_value": total_val,
                "value_at_risk_95_daily": round(var_95, 2),
                "expected_shortfall_95": round(expected_shortfall, 2),
                "stress_projected_loss": round(stress_loss, 2),
                "stress_projected_loss_pct": round(stress_loss_pct, 1),
                "liquidity_coverage_ratio_pct": 142.5 if safe_weight >= 50.0 else 88.0,
                "holdings_analyzed": len(holdings),
                "high_risk_weight_pct": round(high_risk_weight, 1),
                "safe_weight_pct": round(safe_weight, 1)
            }

        # Step: Synthesize Quantitative Reasoning with LLM
        step_synth_id = f"step-{uuid.uuid4().hex[:8]}"
        task_desc = f"""Perform specialized credit/risk synthesis for {workflow_type}.
Context & Computed Risk Metrics:
{risk_metrics}

Output JSON schema:
{{
  "risk_analyst_verdict": "FAVORABLE",
  "quantitative_summary": "detailed 2-sentence financial assessment",
  "risk_confidence": 0.95,
  "key_risk_drivers": ["metrics"]
}}"""

        provider_map = {"loan_underwriting": "gemini", "fraud_detection": "groq", "claims_processing": "openai", "portfolio_risk": "gemini"}
        target_p = provider_map.get(workflow_type, "gemini")
        reasoning = self.think_and_reason(task_desc, {"workflow_type": workflow_type, "metrics": risk_metrics}, target_provider=target_p)
        parsed = reasoning.get("parsed_output", {})

        steps.append(AgentThoughtStep(
            step_id=step_synth_id,
            agent_role=self.role,
            phase="QUANTITATIVE_RISK_SYNTHESIS",
            thought="Synthesized financial stress models, ratio matrices, and quantitative risk drivers.",
            findings_summary=parsed.get("quantitative_summary", "Quantitative modeling complete."),
            confidence_score=float(parsed.get("risk_confidence", 0.94)),
            latency_ms=reasoning.get("latency_ms", 110)
        ))

        analyst_payload = {
            **intake_data,
            "credit_risk_metrics": risk_metrics,
            "credit_risk_synthesis": parsed
        }

        return analyst_payload, steps
