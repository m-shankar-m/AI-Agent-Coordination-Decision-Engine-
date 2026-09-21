from backend.agents.intake_agent import PlanningAgent, DocumentAgent
from backend.agents.compliance_agent import KYCAgent, FraudAgent, ComplianceAgent
from backend.agents.credit_risk_agent import RiskAgent
from backend.agents.decision_agent import DecisionAgent, ResponseAgent

# Fleet Registry instance
agent_fleet = {
    "planning": PlanningAgent(),
    "document": DocumentAgent(),
    "kyc": KYCAgent(),
    "risk": RiskAgent(),
    "fraud": FraudAgent(),
    "compliance": ComplianceAgent(),
    "decision": DecisionAgent(),
    "response": ResponseAgent(),
}

__all__ = ["agent_fleet"]
