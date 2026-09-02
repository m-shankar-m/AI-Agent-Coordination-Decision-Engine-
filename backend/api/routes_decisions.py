from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional, List
from backend.models.schemas import HumanReviewAction, DecisionStatus
from backend.memory.memory_manager import memory_manager

router = APIRouter(prefix="/api/decisions", tags=["Decisions & HITL"])

@router.get("/pending-hitl")
async def get_pending_hitl():
    """Fetches all workflows requiring Human-in-the-Loop review and underwriter signoff."""
    return {
        "pending_count": len(memory_manager.get_pending_hitl()),
        "pending_decisions": memory_manager.get_pending_hitl()
    }

@router.post("/resolve-hitl")
async def resolve_hitl(action: HumanReviewAction):
    """Submits human underwriter/compliance officer review action (Approve, Reject, Modify)."""
    success = memory_manager.resolve_hitl(
        session_id=action.session_id,
        reviewer_name=action.reviewer_name,
        action=action.action,
        notes=action.override_notes,
        override_verdict=action.decision_override.value if action.decision_override else action.action
    )
    if not success:
        raise HTTPException(status_code=404, detail=f"Session {action.session_id} not found or could not be updated.")
    
    return {
        "success": True,
        "message": f"Human review decision successfully recorded for session {action.session_id}.",
        "action_recorded": action.model_dump()
    }

@router.get("/history")
async def get_decision_history(limit: int = 25):
    """Fetches historical workflow decisions and audit records."""
    decisions = memory_manager.get_recent_decisions(limit=limit)
    return {
        "total": len(decisions),
        "decisions": decisions
    }
