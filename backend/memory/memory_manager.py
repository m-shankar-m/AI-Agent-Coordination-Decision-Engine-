import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path
from backend.config import Config

logger = logging.getLogger("BFSI.Memory")
logger.setLevel(logging.INFO)

class SharedBlackboard:
    """Short-term shared memory space for active agent collaboration during a workflow session."""
    def __init__(self, session_id: str, workflow_type: str):
        self.session_id = session_id
        self.workflow_type = workflow_type
        self.data: Dict[str, Any] = {}
        self.events: List[Dict[str, Any]] = []
        self.created_at = datetime.utcnow().isoformat()

    def set(self, key: str, value: Any, agent_name: str = ""):
        self.data[key] = value
        self.events.append({
            "timestamp": datetime.utcnow().isoformat(),
            "agent": agent_name,
            "action": f"WRITE_KEY:{key}",
            "summary": f"Agent {agent_name} updated {key}"
        })

    def get(self, key: str, default: Any = None) -> Any:
        return self.data.get(key, default)

    def get_all(self) -> Dict[str, Any]:
        return self.data


class MemoryManager:
    """Hybrid Memory System: Short-term Blackboard + Long-term Persistent Knowledge & Audit Store."""

    def __init__(self):
        self.active_sessions: Dict[str, SharedBlackboard] = {}
        self.audit_db_file = Config.AUDIT_DB_PATH
        self._init_persistent_store()

    def _init_persistent_store(self):
        if not self.audit_db_file.exists():
            initial_data = {
                "decisions": [],
                "pending_hitl": [],
                "system_metrics": {
                    "total_workflows_executed": 0,
                    "approved_count": 0,
                    "rejected_count": 0,
                    "hitl_escalations_count": 0,
                    "total_latency_ms": 0
                }
            }
            with open(self.audit_db_file, "w") as f:
                json.dump(initial_data, f, indent=2)

    def get_or_create_session(self, session_id: str, workflow_type: str) -> SharedBlackboard:
        if session_id not in self.active_sessions:
            self.active_sessions[session_id] = SharedBlackboard(session_id, workflow_type)
        return self.active_sessions[session_id]

    def record_decision(self, record: Dict[str, Any]):
        """Save completed workflow decision into long-term persistent storage."""
        try:
            with open(self.audit_db_file, "r") as f:
                db = json.load(f)

            db["decisions"].insert(0, record)
            
            # Keep recent 200 decisions
            db["decisions"] = db["decisions"][:200]

            # Update metrics
            metrics = db["system_metrics"]
            metrics["total_workflows_executed"] += 1
            verdict = record.get("final_verdict", "").upper()
            if "APPROV" in verdict or "ALLOW" in verdict:
                metrics["approved_count"] += 1
            elif "REJECT" in verdict or "BLOCK" in verdict:
                metrics["rejected_count"] += 1

            if record.get("hitl_triggered", False):
                metrics["hitl_escalations_count"] += 1
                # Add to pending HITL queue if not already resolved
                if not record.get("hitl_resolved", False):
                    db["pending_hitl"].insert(0, record)

            metrics["total_latency_ms"] += record.get("total_latency_ms", 0)

            with open(self.audit_db_file, "w") as f:
                json.dump(db, f, indent=2)

        except Exception as e:
            logger.error(f"Error persisting decision record: {e}", exc_info=True)

    def resolve_hitl(self, session_id: str, reviewer_name: str, action: str, notes: str, override_verdict: Optional[str] = None):
        """Update a pending Human-in-the-Loop decision."""
        try:
            with open(self.audit_db_file, "r") as f:
                db = json.load(f)

            # Remove from pending queue
            db["pending_hitl"] = [item for item in db["pending_hitl"] if item.get("session_id") != session_id]

            # Update decision record in history
            for item in db["decisions"]:
                if item.get("session_id") == session_id:
                    item["hitl_resolved"] = True
                    item["hitl_reviewer"] = reviewer_name
                    item["hitl_action_taken"] = action
                    item["hitl_reviewer_notes"] = notes
                    if override_verdict:
                        item["final_verdict"] = override_verdict
                    break

            with open(self.audit_db_file, "w") as f:
                json.dump(db, f, indent=2)

            return True
        except Exception as e:
            logger.error(f"Error resolving HITL: {e}")
            return False

    def get_recent_decisions(self, limit: int = 20) -> List[Dict[str, Any]]:
        try:
            with open(self.audit_db_file, "r") as f:
                db = json.load(f)
            return db.get("decisions", [])[:limit]
        except Exception:
            return []

    def get_pending_hitl(self) -> List[Dict[str, Any]]:
        try:
            with open(self.audit_db_file, "r") as f:
                db = json.load(f)
            return db.get("pending_hitl", [])
        except Exception:
            return []

    def get_system_metrics(self) -> Dict[str, Any]:
        try:
            with open(self.audit_db_file, "r") as f:
                db = json.load(f)
            metrics = db.get("system_metrics", {})
            total = metrics.get("total_workflows_executed", 0)
            avg_latency = int(metrics.get("total_latency_ms", 0) / max(1, total))
            return {
                **metrics,
                "avg_workflow_latency_ms": avg_latency,
                "active_sessions_in_memory": len(self.active_sessions),
                "pending_hitl_count": len(db.get("pending_hitl", []))
            }
        except Exception:
            return {
                "total_workflows_executed": 0,
                "approved_count": 0,
                "rejected_count": 0,
                "hitl_escalations_count": 0,
                "avg_workflow_latency_ms": 0,
                "active_sessions_in_memory": 0,
                "pending_hitl_count": 0
            }

# Global memory manager
memory_manager = MemoryManager()
