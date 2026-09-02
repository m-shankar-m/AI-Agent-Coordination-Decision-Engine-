from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from backend.llm.client import llm_client

router = APIRouter(prefix="/api/config", tags=["Configuration"])

class ConfigUpdateRequest(BaseModel):
    provider: Optional[str] = None
    gemini_key: Optional[str] = None
    groq_key: Optional[str] = None
    openai_key: Optional[str] = None

@router.get("/status")
async def get_config_status():
    """Returns active LLM provider status, configured models, and connection readiness."""
    return llm_client.get_status()

@router.post("/update-keys")
async def update_keys(config_req: ConfigUpdateRequest):
    """Dynamically updates API keys and switches active LLM provider at runtime."""
    llm_client.update_keys(
        provider=config_req.provider or llm_client.provider,
        gemini_key=config_req.gemini_key,
        groq_key=config_req.groq_key,
        openai_key=config_req.openai_key
    )
    return {
        "success": True,
        "message": "Configuration updated successfully.",
        "status": llm_client.get_status()
    }
