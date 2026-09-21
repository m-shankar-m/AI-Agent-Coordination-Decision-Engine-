from typing import Dict, Any, List
import time

def verify_identity(registry, customer: Dict[str, Any], document_status: str) -> Dict[str, Any]:
    start = time.time()
    registry.tool_stats["verify_identity"]["calls"] += 1
    
    pep = customer.get("pep_status", False)
    status = "FAILED" if pep else ("VERIFIED" if document_status == "PASSED" else "NEEDS_REVIEW")
    
    elapsed = int((time.time() - start) * 1000)
    registry.tool_stats["verify_identity"]["totalMs"] += elapsed
    
    return {
        "customer_id": customer.get("id"),
        "sanctions_screen_passed": not pep,
        "pep_match": pep,
        "biometric_liveness_score": 0.96 if not pep else 0.42,
        "kyc_status": status,
    }

def check_fraud_indicators(registry, customer: Dict[str, Any], documents: List[Dict[str, Any]]) -> Dict[str, Any]:
    start = time.time()
    registry.tool_stats["check_fraud_indicators"]["calls"] += 1
    
    email = customer.get("email", "")
    is_disposable = "disposable" in email or "temp" in email
    tamper_present = any(d.get("tamper_flags_detected", False) for d in documents)
    
    fraud_score = 0.15
    flags = []
    if is_disposable:
        fraud_score += 0.45
        flags.append("DISPOSABLE_EMAIL_DOMAIN")
    if tamper_present:
        fraud_score += 0.35
        flags.append("DOCUMENT_TAMPER_DETECTED")
        
    status = "HIGH_RISK" if fraud_score > 0.6 else ("MEDIUM_RISK" if fraud_score > 0.3 else "LOW_RISK")
    
    elapsed = int((time.time() - start) * 1000)
    registry.tool_stats["check_fraud_indicators"]["totalMs"] += elapsed
    
    return {
        "fraud_score": round(fraud_score, 2),
        "status": status,
        "flags": flags,
        "synthetic_identity_detected": fraud_score > 0.7,
    }
