"""
LangGraph Multi-Agent Banking Decision Workflow Definition
Orchestrates Planning, Document, KYC, Risk, Fraud, Compliance, Decision, and Response Agents.
"""
from typing import Dict, Any, Literal
from models.banking import WorkflowStateSchema

# Dynamic Routing Functions
def route_after_document(state: Dict[str, Any]) -> str:
    doc = state.get("document_result")
    if doc and doc.get("status") == "VERIFIED":
        return "kyc_agent"
    return "human_review_evaluation"

def route_after_kyc(state: Dict[str, Any]) -> str:
    kyc = state.get("kyc_result")
    if kyc and kyc.get("status") == "VERIFIED":
        return "risk_agent"
    elif kyc and kyc.get("status") == "PARTIAL":
        return "human_review_evaluation"
    return "rejection_escalation"

def route_after_risk(state: Dict[str, Any]) -> str:
    risk = state.get("risk_result")
    if risk and risk.get("risk_level") == "HIGH":
        return "enhanced_risk_review"
    return "fraud_agent"

def route_after_fraud(state: Dict[str, Any]) -> str:
    fraud = state.get("fraud_result")
    if fraud and fraud.get("fraud_risk") == "HIGH":
        return "security_escalation"
    elif fraud and fraud.get("fraud_risk") == "MEDIUM":
        return "human_review_evaluation"
    return "compliance_agent"

def route_after_compliance(state: Dict[str, Any]) -> str:
    comp = state.get("compliance_result")
    if comp and comp.get("status") == "PASS":
        return "decision_agent"
    elif comp and comp.get("status") == "REVIEW_REQUIRED":
        return "human_review_evaluation"
    return "rejection_escalation"
