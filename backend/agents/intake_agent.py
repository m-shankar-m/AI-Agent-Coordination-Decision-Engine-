from typing import Dict, Any
import time
from backend.agents.base_agent import BankingAgentBase
from backend.tools.tool_registry import banking_tools

class PlanningAgent(BankingAgentBase):
    def __init__(self):
        super().__init__(
            "Planning Agent",
            "Orchestrator & Graph Dispatcher",
            ["get_customer_profile", "get_realtime_external_data", "create_audit_record"]
        )

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        start = time.time()
        self.total_runs += 1
        customer_id = state.get("customer_id")
        profile = banking_tools.get_customer_profile(customer_id)
        
        state["customer_profile"] = profile
        state["execution_plan"] = ["DOCUMENT", "KYC", "RISK", "FRAUD", "COMPLIANCE", "DECISION", "RESPONSE"]
        state["current_agent"] = "Document Agent"
        
        elapsed = int((time.time() - start) * 1000)
        self.total_execution_time_ms += elapsed
        self.success_count += 1
        return state

class DocumentAgent(BankingAgentBase):
    def __init__(self):
        super().__init__(
            "Document Agent",
            "Identity Document Verification",
            ["verify_document"]
        )

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        start = time.time()
        self.total_runs += 1
        documents = state.get("documents", [])
        customer = state.get("customer", {})
        
        results = []
        for doc in documents:
            res = banking_tools.verify_document(doc, customer)
            results.append(res)
            
        state["document_verification"] = results
        state["current_agent"] = "KYC Agent"
        
        elapsed = int((time.time() - start) * 1000)
        self.total_execution_time_ms += elapsed
        self.success_count += 1
        return state
