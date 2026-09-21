from typing import Dict
from backend.tools.core_banking import get_customer_profile, get_realtime_external_data, create_audit_record, send_notification
from backend.tools.document_ocr import verify_document
from backend.tools.aml_sanctions import verify_identity
from backend.tools.credit_bureau import calculate_risk, get_credit_profile
from backend.tools.policy_retriever import search_banking_policy, check_compliance
from backend.tools.aml_sanctions import check_fraud_indicators

class BankingToolsSystem:
    def __init__(self):
        self.tool_stats: Dict[str, Dict[str, int]] = {
            "get_customer_profile": {"calls": 0, "failures": 0, "totalMs": 0},
            "verify_document": {"calls": 0, "failures": 0, "totalMs": 0},
            "verify_identity": {"calls": 0, "failures": 0, "totalMs": 0},
            "get_credit_profile": {"calls": 0, "failures": 0, "totalMs": 0},
            "calculate_risk": {"calls": 0, "failures": 0, "totalMs": 0},
            "check_fraud_indicators": {"calls": 0, "failures": 0, "totalMs": 0},
            "check_compliance": {"calls": 0, "failures": 0, "totalMs": 0},
            "search_banking_policy": {"calls": 0, "failures": 0, "totalMs": 0},
            "get_realtime_external_data": {"calls": 0, "failures": 0, "totalMs": 0},
            "send_notification": {"calls": 0, "failures": 0, "totalMs": 0},
            "create_audit_record": {"calls": 0, "failures": 0, "totalMs": 0},
        }

    # Bind imported functions as methods so existing code that uses `banking_tools.verify_document()` still works
    
    def get_customer_profile(self, customer_id: str):
        return get_customer_profile(self, customer_id)
        
    def verify_document(self, document: dict, customer: dict):
        return verify_document(self, document, customer)
        
    def verify_identity(self, customer: dict, document_status: str):
        return verify_identity(self, customer, document_status)
        
    def calculate_risk(self, customer: dict, credit_score: int, requested_limit: float = 10000.0):
        return calculate_risk(self, customer, credit_score, requested_limit)
        
    def check_fraud_indicators(self, customer: dict, documents: list):
        # putting check_fraud_indicators in aml_sanctions
        from backend.tools.aml_sanctions import check_fraud_indicators as cfi
        return cfi(self, customer, documents)
        
    def get_credit_profile(self, customer_id: str):
        return get_credit_profile(self, customer_id)
        
    def search_banking_policy(self, query: str):
        return search_banking_policy(self, query)
        
    def check_compliance(self, customer: dict, policies: list):
        return check_compliance(self, customer, policies)
        
    def get_realtime_external_data(self):
        return get_realtime_external_data(self)
        
    def send_notification(self):
        return send_notification(self)
        
    def create_audit_record(self):
        return create_audit_record(self)

banking_tools = BankingToolsSystem()
