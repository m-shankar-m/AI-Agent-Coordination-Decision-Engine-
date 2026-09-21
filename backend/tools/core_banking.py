from typing import Dict, Any
import time

def get_customer_profile(registry, customer_id: str) -> Dict[str, Any]:
    start = time.time()
    registry.tool_stats["get_customer_profile"]["calls"] += 1
    
    res = {
        "customer_id": customer_id,
        "employment_status": "EMPLOYED",
        "annual_income": 145000,
        "monthly_expenses": 3200,
        "declared_id_type": "PASSPORT",
        "is_synthetic": True,
    }
    
    elapsed = int((time.time() - start) * 1000)
    registry.tool_stats["get_customer_profile"]["totalMs"] += elapsed
    return res

def get_realtime_external_data(registry) -> Dict[str, Any]:
    start = time.time()
    registry.tool_stats["get_realtime_external_data"]["calls"] += 1
    
    res = {
        "benchmark_rate": 5.25,
        "inflation_index": 3.1
    }
    
    elapsed = int((time.time() - start) * 1000)
    registry.tool_stats["get_realtime_external_data"]["totalMs"] += elapsed
    return res

def send_notification(registry) -> Dict[str, Any]:
    start = time.time()
    registry.tool_stats["send_notification"]["calls"] += 1
    
    res = {"status": "SENT"}
    
    elapsed = int((time.time() - start) * 1000)
    registry.tool_stats["send_notification"]["totalMs"] += elapsed
    return res

def create_audit_record(registry) -> Dict[str, Any]:
    start = time.time()
    registry.tool_stats["create_audit_record"]["calls"] += 1
    
    res = {"audit_id": "AUDIT-999", "status": "LOGGED"}
    
    elapsed = int((time.time() - start) * 1000)
    registry.tool_stats["create_audit_record"]["totalMs"] += elapsed
    return res
