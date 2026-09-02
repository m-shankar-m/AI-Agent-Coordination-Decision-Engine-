from fastapi import APIRouter
from typing import Dict, Any, Optional
from backend.models.schemas import KnowledgeSearchRequest
from backend.tools.policy_retriever import PolicyRetrieverTool

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge & Policies"])
policy_tool = PolicyRetrieverTool()

@router.get("/policies")
async def list_policies():
    """Lists all active institutional policy guidelines in the vector knowledge base."""
    return {
        "count": len(policy_tool.POLICY_DATABASE),
        "policies": policy_tool.POLICY_DATABASE
    }

@router.post("/search")
async def search_policies(request: KnowledgeSearchRequest):
    """Executes semantic/keyword search over the regulatory and policy corpus."""
    res = policy_tool.execute(query=request.query, category=request.category or "", top_k=request.top_k)
    return res
