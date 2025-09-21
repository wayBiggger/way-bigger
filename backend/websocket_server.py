import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Set
import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import redis

from app.core.database import get_db
from app.models.collaboration import (
    TeamProject, ProjectParticipant, CollaborationSession, 
    ProjectFile, FileChange, CursorPosition, ChatMessage,
    ProjectRole, ParticipantStatus, ProjectPermission
)
from app.models.gamification import UserProgress

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redis for session management
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        # Store active connections by user_id
        self.active_connections: Dict[str, WebSocket] = {}
        # Store project sessions: project_id -> Set[user_ids]
        self.project_sessions: Dict[str, Set[str]] = {}
        # Store user projects: user_id -> Set[project_ids]
        self.user_projects: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            
            # Remove from all project sessions
            for project_id, users in self.project_sessions.items():
                users.discard(user_id)
                if not users:
                    del self.project_sessions[project_id]
            
            # Clear user projects
            if user_id in self.user_projects:
                del self.user_projects[user_id]
            
            logger.info(f"User {user_id} disconnected")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to {user_id}: {e}")
                self.disconnect(user_id)

    async def send_to_project(self, message: dict, project_id: str, exclude_user: Optional[str] = None):
        if project_id in self.project_sessions:
            for user_id in self.project_sessions[project_id]:
                if user_id != exclude_user:
                    await self.send_personal_message(message, user_id)

    def join_project(self, user_id: str, project_id: str):
        if project_id not in self.project_sessions:
            self.project_sessions[project_id] = set()
        self.project_sessions[project_id].add(user_id)
        
        if user_id not in self.user_projects:
            self.user_projects[user_id] = set()
        self.user_projects[user_id].add(project_id)

    def leave_project(self, user_id: str, project_id: str):
        if project_id in self.project_sessions:
            self.project_sessions[project_id].discard(user_id)
            if not self.project_sessions[project_id]:
                del self.project_sessions[project_id]
        
        if user_id in self.user_projects:
            self.user_projects[user_id].discard(project_id)

manager = ConnectionManager()

# FastAPI app for WebSocket
app = FastAPI(title="Collaboration WebSocket Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await handle_message(user_id, message)
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(user_id)

async def handle_message(user_id: str, message: dict):
    """Handle incoming WebSocket messages"""
    message_type = message.get("type")
    
    try:
        if message_type == "join_project":
            await handle_join_project(user_id, message)
        elif message_type == "leave_project":
            await handle_leave_project(user_id, message)
        elif message_type == "code_change":
            await handle_code_change(user_id, message)
        elif message_type == "cursor_move":
            await handle_cursor_move(user_id, message)
        elif message_type == "file_switch":
            await handle_file_switch(user_id, message)
        elif message_type == "chat_message":
            await handle_chat_message(user_id, message)
        elif message_type == "voice_join":
            await handle_voice_join(user_id, message)
        elif message_type == "voice_leave":
            await handle_voice_leave(user_id, message)
        elif message_type == "screen_share_start":
            await handle_screen_share_start(user_id, message)
        elif message_type == "screen_share_stop":
            await handle_screen_share_stop(user_id, message)
        else:
            logger.warning(f"Unknown message type: {message_type}")
            
    except Exception as e:
        logger.error(f"Error handling message from {user_id}: {e}")
        await manager.send_personal_message({
            "type": "error",
            "message": "An error occurred processing your request"
        }, user_id)

async def handle_join_project(user_id: str, message: dict):
    """Handle user joining a project"""
    project_id = message.get("project_id")
    if not project_id:
        return
    
    # Verify user has access to project
    # This would typically check database permissions
    manager.join_project(user_id, project_id)
    
    # Notify other project members
    await manager.send_to_project({
        "type": "user_joined",
        "user_id": user_id,
        "project_id": project_id,
        "timestamp": datetime.utcnow().isoformat()
    }, project_id, exclude_user=user_id)
    
    # Send current project state to user
    await manager.send_personal_message({
        "type": "project_joined",
        "project_id": project_id,
        "active_users": list(manager.project_sessions.get(project_id, set())),
        "timestamp": datetime.utcnow().isoformat()
    }, user_id)

async def handle_leave_project(user_id: str, message: dict):
    """Handle user leaving a project"""
    project_id = message.get("project_id")
    if not project_id:
        return
    
    manager.leave_project(user_id, project_id)
    
    # Notify other project members
    await manager.send_to_project({
        "type": "user_left",
        "user_id": user_id,
        "project_id": project_id,
        "timestamp": datetime.utcnow().isoformat()
    }, project_id)

async def handle_code_change(user_id: str, message: dict):
    """Handle code changes in real-time"""
    project_id = message.get("project_id")
    file_id = message.get("file_id")
    change_data = message.get("change")
    
    if not all([project_id, file_id, change_data]):
        return
    
    # Store change in database (this would be done asynchronously)
    # For now, just broadcast to other users
    
    await manager.send_to_project({
        "type": "code_change",
        "user_id": user_id,
        "project_id": project_id,
        "file_id": file_id,
        "change": change_data,
        "timestamp": datetime.utcnow().isoformat()
    }, project_id, exclude_user=user_id)

async def handle_cursor_move(user_id: str, message: dict):
    """Handle cursor position updates"""
    project_id = message.get("project_id")
    file_id = message.get("file_id")
    position = message.get("position")
    
    if not all([project_id, file_id, position]):
        return
    
    await manager.send_to_project({
        "type": "cursor_move",
        "user_id": user_id,
        "project_id": project_id,
        "file_id": file_id,
        "position": position,
        "timestamp": datetime.utcnow().isoformat()
    }, project_id, exclude_user=user_id)

async def handle_file_switch(user_id: str, message: dict):
    """Handle file switching"""
    project_id = message.get("project_id")
    file_id = message.get("file_id")
    
    if not all([project_id, file_id]):
        return
    
    await manager.send_to_project({
        "type": "file_switch",
        "user_id": user_id,
        "project_id": project_id,
        "file_id": file_id,
        "timestamp": datetime.utcnow().isoformat()
    }, project_id, exclude_user=user_id)

async def handle_chat_message(user_id: str, message: dict):
    """Handle chat messages"""
    project_id = message.get("project_id")
    content = message.get("content")
    message_type = message.get("message_type", "text")
    
    if not all([project_id, content]):
        return
    
    # Store message in database (this would be done asynchronously)
    
    await manager.send_to_project({
        "type": "chat_message",
        "user_id": user_id,
        "project_id": project_id,
        "content": content,
        "message_type": message_type,
        "timestamp": datetime.utcnow().isoformat()
    }, project_id)

async def handle_voice_join(user_id: str, message: dict):
    """Handle voice channel join"""
    project_id = message.get("project_id")
    if not project_id:
        return
    
    await manager.send_to_project({
        "type": "voice_joined",
        "user_id": user_id,
        "project_id": project_id,
        "timestamp": datetime.utcnow().isoformat()
    }, project_id)

async def handle_voice_leave(user_id: str, message: dict):
    """Handle voice channel leave"""
    project_id = message.get("project_id")
    if not project_id:
        return
    
    await manager.send_to_project({
        "type": "voice_left",
        "user_id": user_id,
        "project_id": project_id,
        "timestamp": datetime.utcnow().isoformat()
    }, project_id)

async def handle_screen_share_start(user_id: str, message: dict):
    """Handle screen sharing start"""
    project_id = message.get("project_id")
    if not project_id:
        return
    
    await manager.send_to_project({
        "type": "screen_share_started",
        "user_id": user_id,
        "project_id": project_id,
        "timestamp": datetime.utcnow().isoformat()
    }, project_id)

async def handle_screen_share_stop(user_id: str, message: dict):
    """Handle screen sharing stop"""
    project_id = message.get("project_id")
    if not project_id:
        return
    
    await manager.send_to_project({
        "type": "screen_share_stopped",
        "user_id": user_id,
        "project_id": project_id,
        "timestamp": datetime.utcnow().isoformat()
    }, project_id)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "active_connections": len(manager.active_connections),
        "active_projects": len(manager.project_sessions)
    }

# Get project participants
@app.get("/project/{project_id}/participants")
async def get_project_participants(project_id: str):
    if project_id in manager.project_sessions:
        return {
            "project_id": project_id,
            "participants": list(manager.project_sessions[project_id]),
            "count": len(manager.project_sessions[project_id])
        }
    return {"project_id": project_id, "participants": [], "count": 0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
