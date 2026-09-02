from fastapi import APIRouter
from backend.memory.memory_manager import memory_manager
from backend.llm.client import llm_client

router = APIRouter(prefix="/api/audit", tags=["Audit & Telemetry"])

@router.get("/metrics")
async def get_system_metrics():
    """Returns real-time system throughput, latency averages, and decision distributions."""
    metrics = memory_manager.get_system_metrics()
    llm_status = llm_client.get_status()
    return {
        "metrics": metrics,
        "llm_status": llm_status
    }

@router.get("/logs")
async def get_audit_logs(limit: int = 50):
    """Returns recent audit logs with full agent reasoning traces."""
    decisions = memory_manager.get_recent_decisions(limit=limit)
    return {
        "count": len(decisions),
        "logs": decisions
    }
