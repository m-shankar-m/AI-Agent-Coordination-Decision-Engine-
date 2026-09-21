from typing import Dict, Any
import time
from backend.agents.base_agent import BankingAgentBase
from backend.tools.tool_registry import banking_tools

class KYCAgent(BankingAgentBase):
    def __init__(self):
        super().__init__(
            "KYC Agent",
            "Know Your Customer & Sanctions Screening",
            ["verify_identity"]
        )

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        start = time.time()
        self.total_runs += 1
        customer = state.get("customer", {})
        doc_status = "PASSED"
        if state.get("document_verification"):
            doc_status = state["document_verification"][0].get("status", "PASSED")
            
        kyc = banking_tools.verify_identity(customer, doc_status)
        state["kyc_result"] = kyc
        state["current_agent"] = "Risk Agent"
        
        elapsed = int((time.time() - start) * 1000)
        self.total_execution_time_ms += elapsed
        self.success_count += 1
        return state

class FraudAgent(BankingAgentBase):
    def __init__(self):
        super().__init__(
            "Fraud Agent",
            "Anomaly & Synthetic Identity Detection",
            ["check_fraud_indicators"]
        )

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        start = time.time()
        self.total_runs += 1
        customer = state.get("customer", {})
        docs = state.get("documents", [])
        
        fraud = banking_tools.check_fraud_indicators(customer, docs)
        state["fraud_result"] = fraud
        state["current_agent"] = "Compliance Agent"
        
        elapsed = int((time.time() - start) * 1000)
        self.total_execution_time_ms += elapsed
        self.success_count += 1
        return state

class ComplianceAgent(BankingAgentBase):
    def __init__(self):
        super().__init__(
            "Compliance Agent",
            "Regulatory & Policy Enforcement",
            ["search_banking_policy", "check_compliance"]
        )

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        start = time.time()
        self.total_runs += 1
        
        state["compliance_result"] = {
            "reg_b_fair_lending_compliant": True,
            "aml_cdd_rule_cleared": True,
            "policy_citations": ["POL-AML-001", "POL-OCC-QM-004"],
            "status": "PASS",
        }
        state["current_agent"] = "Decision Agent"
        
        elapsed = int((time.time() - start) * 1000)
        self.total_execution_time_ms += elapsed
        self.success_count += 1
        return state
