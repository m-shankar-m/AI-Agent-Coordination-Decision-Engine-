from typing import Dict, Any
import time

def calculate_risk(registry, customer: Dict[str, Any], credit_score: int, requested_limit: float = 10000.0) -> Dict[str, Any]:
    start = time.time()
    registry.tool_stats["calculate_risk"]["calls"] += 1
    
    annual_income = customer.get("annual_income", 50000.0)
    monthly_income = annual_income / 12.0
    monthly_expenses = customer.get("monthly_expenses", 2000.0)
    
    dti_ratio = (monthly_expenses / monthly_income * 100.0) if monthly_income > 0 else 50.0
    
    if credit_score >= 720 and dti_ratio < 40:
        risk_tier = "LOW"
        rec = "APPROVE"
        assigned_limit = requested_limit
    elif credit_score >= 640 and dti_ratio < 50:
        risk_tier = "MEDIUM"
        rec = "MANUAL_REVIEW"
        assigned_limit = requested_limit * 0.7
    else:
        risk_tier = "HIGH"
        rec = "REJECT"
        assigned_limit = 0.0

    elapsed = int((time.time() - start) * 1000)
    registry.tool_stats["calculate_risk"]["totalMs"] += elapsed
    
    return {
        "credit_score": credit_score,
        "dti_ratio": round(dti_ratio, 2),
        "risk_tier": risk_tier,
        "recommendation": rec,
        "assigned_limit": assigned_limit,
    }

def get_credit_profile(registry, customer_id: str) -> Dict[str, Any]:
    start = time.time()
    registry.tool_stats["get_credit_profile"]["calls"] += 1
    
    # Mock data for demonstration
    res = {
        "customer_id": customer_id,
        "credit_score": 750,
        "active_tradelines": 4,
        "delinquencies_30d": 0
    }
    
    elapsed = int((time.time() - start) * 1000)
    registry.tool_stats["get_credit_profile"]["totalMs"] += elapsed
    return res
