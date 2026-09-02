import time
import logging
from typing import Dict, Any, Optional, List, Union
from backend.models.schemas import AgentRole, AgentThoughtStep
from backend.llm.client import llm_client
from backend.tools.tool_registry import tool_registry

logger = logging.getLogger("BFSI.Agent")
logger.setLevel(logging.INFO)

class BaseAgent:
    """Base specialized AI Agent class with standardized reasoning, tool execution, and telemetry."""

    def __init__(self, role: Union[AgentRole, str], system_persona: str):
        self.role = role.value if hasattr(role, "value") else str(role)
        self.system_persona = system_persona

    def think_and_reason(
        self,
        task_description: str,
        context_data: Dict[str, Any],
        response_json: bool = True,
        target_provider: Optional[str] = None
    ) -> Dict[str, Any]:
        """Calls LLM with specialized agent prompt, target provider routing, and structured context."""
        start_time = time.time()
        
        system_prompt = f"""You are the {self.role} in an enterprise Banking, Financial Services & Insurance (BFSI) multi-agent system.
Your core expertise & responsibility:
{self.system_persona}

Strict Guidelines:
1. Provide accurate, professional financial reasoning.
2. Format your response strictly in the requested JSON schema.
3. Quantify risk factors, confidence scores (0.0 to 1.0), and provide unambiguous technical recommendations.
"""
        
        user_prompt = f"""Task: {task_description}

Context Data & Prior Findings:
{context_data}

Execute your specialized analysis and return your structured assessment in JSON format.
"""
        llm_response = llm_client.generate_chat(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_format_json=response_json,
            target_provider=target_provider
        )
        
        parsed = llm_client.extract_json(llm_response.get("text", "{}"))
        latency_ms = llm_response.get("latency_ms", int((time.time() - start_time) * 1000))
        
        return {
            "parsed_output": parsed,
            "raw_text": llm_response.get("text", ""),
            "provider": llm_response.get("provider", "unknown"),
            "latency_ms": latency_ms
        }

    def call_tool(self, tool_name: str, **kwargs) -> Dict[str, Any]:
        return tool_registry.execute_tool(tool_name, **kwargs)
