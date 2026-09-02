import os
import logging
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from backend.config import Config
from backend.api.routes_workflows import router as workflows_router
from backend.api.routes_decisions import router as decisions_router
from backend.api.routes_audit import router as audit_router
from backend.api.routes_knowledge import router as knowledge_router
from backend.api.routes_config import router as config_router
from backend.api.routes_ocr import router as ocr_router
from backend.api.websocket_handler import ws_manager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("BFSI.Main")

app = FastAPI(
    title="BFSI Enterprise AI Multi-Agent Coordination & Decision Engine",
    description="Enterprise Multi-Agent Platform for Loan Underwriting, Fraud Detection & AML, Insurance Claims, and Portfolio Risk.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(workflows_router)
app.include_router(decisions_router)
app.include_router(audit_router)
app.include_router(knowledge_router)
app.include_router(config_router)
app.include_router(ocr_router)

# WebSocket streaming endpoint
@app.websocket("/ws/stream/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await ws_manager.connect(websocket, session_id)
    try:
        while True:
            # Keepalive listener
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, session_id)
    except Exception as e:
        logger.warning(f"WebSocket exception: {e}")
        ws_manager.disconnect(websocket, session_id)

@app.get("/api/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "BFSI Multi-Agent Coordination Engine",
        "active_provider": Config.PRIMARY_LLM_PROVIDER,
        "version": "1.0.0"
    }

# Mount static frontend if build exists
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api.main:app", host=Config.HOST, port=Config.PORT, reload=Config.DEBUG)
