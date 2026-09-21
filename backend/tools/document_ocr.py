from typing import Dict, Any
import time

def verify_document(registry, document: Dict[str, Any], customer: Dict[str, Any]) -> Dict[str, Any]:
    start = time.time()
    registry.tool_stats["verify_document"]["calls"] += 1
    
    name_match = document.get("extracted_name") == customer.get("full_name")
    dob_match = document.get("extracted_dob") == customer.get("date_of_birth")
    tampered = document.get("tamper_flags_detected", False)
    
    status = "PASSED" if (name_match and dob_match and not tampered) else "FLAGGED"
    confidence = 0.98 if status == "PASSED" else 0.54
    
    elapsed = int((time.time() - start) * 1000)
    registry.tool_stats["verify_document"]["totalMs"] += elapsed
    
    return {
        "document_id": document.get("id"),
        "status": status,
        "confidence_score": confidence,
        "name_match": name_match,
        "dob_match": dob_match,
        "tamper_detected": tampered,
        "blur_score": document.get("blur_score", 0.05),
        "discrepancy_details": None if status == "PASSED" else "Discrepancy detected in document fields",
    }
