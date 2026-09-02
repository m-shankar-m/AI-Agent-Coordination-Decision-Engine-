import time
import logging
from typing import Dict, Any, Optional
from backend.tools.core_banking import CoreBankingTool
from backend.tools.credit_bureau import CreditBureauTool
from backend.tools.aml_sanctions import AMLSanctionsTool
from backend.tools.document_ocr import DocumentOCRTool
from backend.tools.policy_retriever import PolicyRetrieverTool

logger = logging.getLogger("BFSI.Tools")
logger.setLevel(logging.INFO)

class ToolRegistry:
    """Unified Enterprise Tool Registry & Dispatcher with monitoring and validation."""

    def __init__(self):
        self.core_banking = CoreBankingTool()
        self.credit_bureau = CreditBureauTool()
        self.aml_sanctions = AMLSanctionsTool()
        self.document_ocr = DocumentOCRTool()
        self.policy_retriever = PolicyRetrieverTool()
        
        self.tools_map = {
            "core_banking": self.core_banking,
            "credit_bureau": self.credit_bureau,
            "aml_sanctions": self.aml_sanctions,
            "document_ocr": self.document_ocr,
            "policy_retriever": self.policy_retriever
        }

    def list_available_tools(self) -> Dict[str, str]:
        return {name: tool.description for name, tool in self.tools_map.items()}

    def execute_tool(self, tool_name: str, **kwargs) -> Dict[str, Any]:
        start_time = time.time()
        tool = self.tools_map.get(tool_name)
        if not tool:
            return {
                "success": False,
                "error": f"Tool '{tool_name}' not found in registry.",
                "available_tools": list(self.tools_map.keys())
            }

        try:
            logger.info(f"[ToolRegistry] Executing tool '{tool_name}' with args keys: {list(kwargs.keys())}")
            result = tool.execute(**kwargs)
            latency_ms = int((time.time() - start_time) * 1000)
            return {
                "success": True,
                "tool_name": tool_name,
                "latency_ms": latency_ms,
                "data": result
            }
        except Exception as e:
            logger.error(f"[ToolRegistry] Execution error in tool '{tool_name}': {e}", exc_info=True)
            latency_ms = int((time.time() - start_time) * 1000)
            return {
                "success": False,
                "tool_name": tool_name,
                "latency_ms": latency_ms,
                "error": str(e)
            }

# Global instance
tool_registry = ToolRegistry()
