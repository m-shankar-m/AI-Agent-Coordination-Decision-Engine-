from typing import Dict, Any
import time
from datetime import datetime
from backend.agents.base_agent import BankingAgentBase

class DecisionAgent(BankingAgentBase):
    def __init__(self):
        super().__init__(
            "Decision Agent",
            "Multi-Criteria Synthesis & Recommendation",
            ["create_audit_record"]
        )

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        start = time.time()
        self.total_runs += 1
        
        fraud_high = state.get("fraud_result", {}).get("status") == "HIGH_RISK"
        kyc_failed = state.get("kyc_result", {}).get("kyc_status") == "FAILED"
        
        if fraud_high or kyc_failed:
            decision = "DECLINED"
            rec = "REJECT_RECOMMENDATION"
        elif state.get("risk_result", {}).get("risk_tier") == "LOW":
            decision = "APPROVED"
            rec = "APPROVE_RECOMMENDATION"
        else:
            decision = "REVIEW_REQUIRED"
            rec = "REVIEW_REQUIRED"
            
        state["decision_result"] = {
            "decision": decision,
            "recommendation": rec,
            "confidence": 0.94,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
        state["current_agent"] = "Response Agent"
        
        elapsed = int((time.time() - start) * 1000)
        self.total_execution_time_ms += elapsed
        self.success_count += 1
        return state

class ResponseAgent(BankingAgentBase):
    def __init__(self):
        super().__init__(
            "Response Agent",
            "Customer & Internal Communication",
            ["send_notification"]
        )

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        start = time.time()
        self.total_runs += 1
        
        decision = state.get("decision_result", {}).get("decision", "REVIEW_REQUIRED")
        state["customer_notification"] = {
            "dispatched": True,
            "channel": "EMAIL_AND_INAPP",
            "message_summary": f"Your application status is {decision}.",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
        state["workflow_status"] = "COMPLETED"
        state["current_agent"] = "None (Workflow Completed)"
        
        elapsed = int((time.time() - start) * 1000)
        self.total_execution_time_ms += elapsed
        self.success_count += 1
        return state
