from typing import Dict, Any, List
import time

def search_banking_policy(registry, query: str) -> Dict[str, Any]:
    start = time.time()
    registry.tool_stats["search_banking_policy"]["calls"] += 1
    
    # Mock search
    res = {
        "results": [
            "POL-AML-001",
            "POL-OCC-QM-004"
        ]
    }
    
    elapsed = int((time.time() - start) * 1000)
    registry.tool_stats["search_banking_policy"]["totalMs"] += elapsed
    return res

def check_compliance(registry, customer: Dict[str, Any], policies: List[Any]) -> Dict[str, Any]:
    start = time.time()
    registry.tool_stats["check_compliance"]["calls"] += 1
    
    res = {
        "reg_b_fair_lending_compliant": True,
        "aml_cdd_rule_cleared": True,
        "policy_citations": ["POL-AML-001", "POL-OCC-QM-004"],
        "status": "PASS",
    }
    
    elapsed = int((time.time() - start) * 1000)
    registry.tool_stats["check_compliance"]["totalMs"] += elapsed
    return res
