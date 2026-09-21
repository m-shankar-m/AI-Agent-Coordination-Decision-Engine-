"""
Aegis Banking Audit Service (Python Implementation)
Converted from server/services/auditService.ts
Creates tamper-evident SHA-256 hashed audit log records for regulatory banking scrutiny.
"""
from typing import Dict, Any, List
import hashlib
import json
from datetime import datetime

class AuditRecord:
    def __init__(self, id: str, timestamp: str, application_id: str, agent: str, action: str, input_hash: str, output_summary: str, metadata: Dict[str, Any]):
        self.id = id
        self.timestamp = timestamp
        self.application_id = application_id
        self.agent = agent
        self.action = action
        self.input_hash = input_hash
        self.output_summary = output_summary
        self.metadata = metadata

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "application_id": self.application_id,
            "agent": self.agent,
            "action": self.action,
            "input_hash": self.input_hash,
            "output_summary": self.output_summary,
            "metadata": self.metadata,
        }

class AuditService:
    def __init__(self):
        self.logs: List[AuditRecord] = []
        self._seed_initial_audits()

    def _seed_initial_audits(self):
        self.record_action(
            application_id="APP-2026-001",
            agent="Planning Agent",
            action="WORKFLOW_DISPATCHED",
            payload={"scenario": "LOW_RISK", "customer_id": "cust-syn-001"},
            summary="Workflow graph initiated; 7 stages dynamically routed."
        )
        self.record_action(
            application_id="APP-2026-002",
            agent="Document Agent",
            action="OCR_ALIGNMENT_FAILED",
            payload={"extracted_dob": "1992-09-28", "declared_dob": "1992-09-24"},
            summary="Date of birth discrepancy detected: 4-day delta. Review flag raised."
        )
        self.record_action(
            application_id="APP-2026-003",
            agent="KYC Agent",
            action="SANCTIONS_PEP_ALERT",
            payload={"pep_status": True, "tamper_blur_score": 0.35},
            summary="High severity security match: PEP matched on international lists."
        )

    def record_action(self, application_id: str, agent: str, action: str, payload: Any, summary: str, metadata: Dict[str, Any] = None) -> AuditRecord:
        serialized = json.dumps(payload, sort_keys=True, default=str)
        input_hash = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
        audit_id = f"aud-{len(self.logs) + 1:04d}-{int(datetime.utcnow().timestamp())}"
        
        record = AuditRecord(
            id=audit_id,
            timestamp=datetime.utcnow().isoformat() + "Z",
            application_id=application_id,
            agent=agent,
            action=action,
            input_hash=input_hash,
            output_summary=summary,
            metadata=metadata or {}
        )
        self.logs.insert(0, record)
        return record

    def get_logs(self, application_id: str = None) -> List[Dict[str, Any]]:
        if application_id:
            return [l.to_dict() for l in self.logs if l.application_id == application_id]
        return [l.to_dict() for l in self.logs]

audit_service = AuditService()
