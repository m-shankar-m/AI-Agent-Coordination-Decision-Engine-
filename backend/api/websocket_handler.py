import json
import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger("BFSI.WebSocket")
logger.setLevel(logging.INFO)

class ConnectionManager:
    """Manages active WebSocket connections for real-time agent streaming."""

    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.global_listeners: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket, session_id: str = "global"):
        await websocket.accept()
        if session_id == "global":
            self.global_listeners.add(websocket)
        else:
            if session_id not in self.active_connections:
                self.active_connections[session_id] = set()
            self.active_connections[session_id].add(websocket)
        logger.info(f"WebSocket client connected. Session: {session_id}")

    def disconnect(self, websocket: WebSocket, session_id: str = "global"):
        if session_id == "global":
            self.global_listeners.discard(websocket)
        else:
            if session_id in self.active_connections:
                self.active_connections[session_id].discard(websocket)
                if not self.active_connections[session_id]:
                    del self.active_connections[session_id]
        logger.info(f"WebSocket client disconnected. Session: {session_id}")

    async def broadcast_session(self, session_id: str, message: dict):
        message_str = json.dumps(message)
        # Send to session-specific listeners
        if session_id in self.active_connections:
            dead_sockets = set()
            for ws in self.active_connections[session_id]:
                try:
                    await ws.send_text(message_str)
                except Exception:
                    dead_sockets.add(ws)
            for ws in dead_sockets:
                self.active_connections[session_id].discard(ws)

        # Also broadcast to global dashboard listeners
        dead_globals = set()
        for ws in self.global_listeners:
            try:
                await ws.send_text(message_str)
            except Exception:
                dead_globals.add(ws)
        for ws in dead_globals:
            self.global_listeners.discard(ws)

ws_manager = ConnectionManager()
