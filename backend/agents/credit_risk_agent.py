from typing import Dict, Any
import time
from backend.agents.base_agent import BankingAgentBase
from backend.tools.tool_registry import banking_tools

class RiskAgent(BankingAgentBase):
    def __init__(self):
        super().__init__(
            "Risk Agent",
            "Credit Risk & Financial Capacity Analysis",
            ["get_credit_profile", "calculate_risk"]
        )

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        start = time.time()
        self.total_runs += 1
        customer = state.get("customer", {})
        limit = state.get("requested_limit", 10000.0)
        
        risk = banking_tools.calculate_risk(customer, 740, limit)
        state["risk_result"] = risk
        state["current_agent"] = "Fraud Agent"
        
        elapsed = int((time.time() - start) * 1000)
        self.total_execution_time_ms += elapsed
        self.success_count += 1
        return state
