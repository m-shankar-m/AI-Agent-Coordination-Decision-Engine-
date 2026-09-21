from typing import Dict, Any, List

class BankingAgentBase:
    def __init__(self, name: str, role: str, allowed_tools: List[str]):
        self.name = name
        self.role = role
        self.allowed_tools = allowed_tools
        self.total_runs = 0
        self.success_count = 0
        self.total_execution_time_ms = 0

    @property
    def success_rate(self) -> float:
        return 1.0 if self.total_runs == 0 else self.success_count / self.total_runs

    def to_metadata(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "role": self.role,
            "status": "IDLE",
            "execution_time_ms": int(self.total_execution_time_ms / max(1, self.total_runs)),
            "success_rate": round(self.success_rate, 2),
            "total_runs": self.total_runs,
            "allowed_tools": self.allowed_tools,
        }
