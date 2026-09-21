"""
Aegis Banking Supervisory Review Service (Python Implementation)
Converted from server/services/reviewService.ts
Handles human-in-the-loop (HITL) compliance, escalations, override submissions, and audit tracking.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime

class ReviewItem:
    def __init__(
        self,
        application_id: str,
        reason: str,
        created_at: str,
        priority: str = "STANDARD",
        risk_level: str = "MEDIUM",
        previous_ai_recommendation: str = "REVIEW_REQUIRED",
    ):
        self.application_id = application_id
        self.reason = reason
        self.created_at = created_at
        self.priority = priority
        self.risk_level = risk_level
        self.previous_ai_recommendation = previous_ai_recommendation

    def to_dict(self) -> Dict[str, Any]:
        return {
            "application_id": self.application_id,
            "reason": self.reason,
            "created_at": self.created_at,
            "priority": self.priority,
            "risk_level": self.risk_level,
            "previous_ai_recommendation": self.previous_ai_recommendation,
        }

class ReviewService:
    def __init__(self):
        self.pending_reviews: List[ReviewItem] = [
            ReviewItem(
                application_id="APP-2026-002",
                reason="Date of Birth discrepancy: Declared 1992-09-24 vs Driving License OCR 1992-09-28 (Delta: 4 days). Secondary supervisory review required.",
                created_at=datetime.utcnow().isoformat() + "Z",
                priority="STANDARD",
                risk_level="MEDIUM",
                previous_ai_recommendation="REVIEW_REQUIRED",
            ),
            ReviewItem(
                application_id="APP-2026-003",
                reason="Critical Security Alert: Document tamper score exceeded threshold (0.35 blur/tamper index) + Politically Exposed Person (PEP) list match.",
                created_at=datetime.utcnow().isoformat() + "Z",
                priority="URGENT",
                risk_level="HIGH",
                previous_ai_recommendation="REJECT_RECOMMENDATION",
            ),
        ]
        self.history: List[Dict[str, Any]] = []

    def get_pending(self) -> List[Dict[str, Any]]:
        return [r.to_dict() for r in self.pending_reviews]

    def get_history(self) -> List[Dict[str, Any]]:
        return self.history

    def submit_decision(self, application_id: str, decision: str, notes: str, reviewer: str = "Chief Credit Officer") -> Dict[str, Any]:
        matched = [r for r in self.pending_reviews if r.application_id == application_id]
        self.pending_reviews = [r for r in self.pending_reviews if r.application_id != application_id]
        
        record = {
            "application_id": application_id,
            "reviewer": reviewer,
            "human_decision": decision,
            "justification": notes,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "previous_item": matched[0].to_dict() if matched else None
        }
        self.history.insert(0, record)
        return record

review_service = ReviewService()
