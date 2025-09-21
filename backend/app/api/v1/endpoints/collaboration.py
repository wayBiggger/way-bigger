from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import uuid

from ....core.database import get_db
from ....models.collaboration import (
    TeamProject, ProjectParticipant, CollaborationSession, ProjectFile,
    FileChange, CursorPosition, ChatMessage, TeamInvitation,
    ProjectRole, ParticipantStatus, ProjectPermission
)
from ....models.gamification import UserProgress

router = APIRouter()

@router.post("/projects")
async def create_team_project(
    name: str,
    description: str,
    difficulty_level: str,
    max_team_size: int = 5,
    min_team_size: int = 2,
    is_public: bool = True,
    created_by: str = "user-123",  # Mock user ID
    db: Session = Depends(get_db)
):
    """Create a new team project"""
    
    # Check if user has collaboration unlocked
    progress = db.query(UserProgress).filter(UserProgress.user_id == created_by).first()
    if not progress or progress.level < 3 or progress.projects_completed < 5:
        raise HTTPException(
            status_code=403, 
            detail="Collaboration requires Level 3 and 5 completed projects"
        )
    
    # Create project
    project = TeamProject(
        name=name,
        description=description,
        difficulty_level=difficulty_level,
        max_team_size=max_team_size,
        min_team_size=min_team_size,
        is_public=is_public,
        created_by=created_by
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    
    # Add creator as project leader
    participant = ProjectParticipant(
        project_id=project.id,
        user_id=created_by,
        role=ProjectRole.LEADER,
        permissions=[ProjectPermission.ADMIN, ProjectPermission.MANAGE_USERS, ProjectPermission.MANAGE_ROLES]
    )
    
    db.add(participant)
    db.commit()
    
    return {
        "success": True,
        "project": {
            "id": str(project.id),
            "name": project.name,
            "description": project.description,
            "difficulty_level": project.difficulty_level,
            "max_team_size": project.max_team_size,
            "min_team_size": project.min_team_size,
            "is_public": project.is_public,
            "created_by": project.created_by,
            "created_at": project.created_at
        }
    }

@router.get("/projects")
async def get_team_projects(
    user_id: str = "user-123",  # Mock user ID
    status: str = "active",
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get team projects for user"""
    
    query = db.query(TeamProject).filter(TeamProject.status == status)
    
    if difficulty:
        query = query.filter(TeamProject.difficulty_level == difficulty)
    
    # If not public, only show user's projects
    if status == "my_projects":
        query = query.join(ProjectParticipant).filter(ProjectParticipant.user_id == user_id)
    elif status == "available":
        # Show public projects user can join
        user_projects = db.query(ProjectParticipant.project_id).filter(
            ProjectParticipant.user_id == user_id
        ).subquery()
        query = query.filter(
            TeamProject.is_public == True,
            ~TeamProject.id.in_(user_projects)
        )
    
    projects = query.all()
    
    return {
        "success": True,
        "projects": [
            {
                "id": str(project.id),
                "name": project.name,
                "description": project.description,
                "difficulty_level": project.difficulty_level,
                "max_team_size": project.max_team_size,
                "current_team_size": len(project.participants),
                "is_public": project.is_public,
                "created_by": project.created_by,
                "created_at": project.created_at,
                "progress_percentage": project.progress_percentage
            }
            for project in projects
        ]
    }

@router.get("/projects/{project_id}")
async def get_team_project(project_id: str, db: Session = Depends(get_db)):
    """Get specific team project details"""
    
    project = db.query(TeamProject).filter(TeamProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    participants = db.query(ProjectParticipant).filter(
        ProjectParticipant.project_id == project_id
    ).all()
    
    return {
        "success": True,
        "project": {
            "id": str(project.id),
            "name": project.name,
            "description": project.description,
            "difficulty_level": project.difficulty_level,
            "max_team_size": project.max_team_size,
            "min_team_size": project.min_team_size,
            "is_public": project.is_public,
            "status": project.status,
            "progress_percentage": project.progress_percentage,
            "created_by": project.created_by,
            "created_at": project.created_at,
            "participants": [
                {
                    "user_id": p.user_id,
                    "role": p.role.value,
                    "permissions": [perm.value for perm in p.permissions],
                    "status": p.status.value,
                    "joined_at": p.joined_at,
                    "last_active": p.last_active,
                    "lines_contributed": p.lines_contributed,
                    "commits_made": p.commits_made,
                    "hours_contributed": p.hours_contributed
                }
                for p in participants
            ]
        }
    }

@router.post("/projects/{project_id}/join")
async def join_team_project(
    project_id: str,
    user_id: str = "user-123",  # Mock user ID
    role: str = "contributor",
    db: Session = Depends(get_db)
):
    """Join a team project"""
    
    # Check if user has collaboration unlocked
    progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if not progress or progress.level < 3 or progress.projects_completed < 5:
        raise HTTPException(
            status_code=403, 
            detail="Collaboration requires Level 3 and 5 completed projects"
        )
    
    # Check if project exists and has space
    project = db.query(TeamProject).filter(TeamProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.status != "active":
        raise HTTPException(status_code=400, detail="Project is not active")
    
    # Check if user is already a participant
    existing_participant = db.query(ProjectParticipant).filter(
        ProjectParticipant.project_id == project_id,
        ProjectParticipant.user_id == user_id
    ).first()
    
    if existing_participant:
        raise HTTPException(status_code=400, detail="User is already a participant")
    
    # Check team size
    current_size = len(project.participants)
    if current_size >= project.max_team_size:
        raise HTTPException(status_code=400, detail="Project is full")
    
    # Add participant
    participant = ProjectParticipant(
        project_id=project_id,
        user_id=user_id,
        role=ProjectRole(role),
        permissions=[ProjectPermission.READ, ProjectPermission.WRITE]
    )
    
    db.add(participant)
    db.commit()
    
    return {
        "success": True,
        "message": "Successfully joined project",
        "participant": {
            "user_id": participant.user_id,
            "role": participant.role.value,
            "permissions": [perm.value for perm in participant.permissions],
            "joined_at": participant.joined_at
        }
    }

@router.post("/projects/{project_id}/invite")
async def invite_to_project(
    project_id: str,
    invited_user_id: str,
    role: str = "contributor",
    message: Optional[str] = None,
    invited_by: str = "user-123",  # Mock user ID
    db: Session = Depends(get_db)
):
    """Invite user to project"""
    
    # Check if inviter has permission
    inviter = db.query(ProjectParticipant).filter(
        ProjectParticipant.project_id == project_id,
        ProjectParticipant.user_id == invited_by
    ).first()
    
    if not inviter or ProjectPermission.MANAGE_USERS not in inviter.permissions:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Check if user is already a participant
    existing_participant = db.query(ProjectParticipant).filter(
        ProjectParticipant.project_id == project_id,
        ProjectParticipant.user_id == invited_user_id
    ).first()
    
    if existing_participant:
        raise HTTPException(status_code=400, detail="User is already a participant")
    
    # Create invitation
    invitation = TeamInvitation(
        project_id=project_id,
        invited_user_id=invited_user_id,
        invited_by=invited_by,
        role=ProjectRole(role),
        message=message,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    
    db.add(invitation)
    db.commit()
    
    return {
        "success": True,
        "message": "Invitation sent successfully",
        "invitation": {
            "id": str(invitation.id),
            "project_id": str(invitation.project_id),
            "invited_user_id": invitation.invited_user_id,
            "role": invitation.role.value,
            "expires_at": invitation.expires_at
        }
    }

@router.post("/invitations/{invitation_id}/respond")
async def respond_to_invitation(
    invitation_id: str,
    response: str,  # "accept" or "decline"
    user_id: str = "user-123",  # Mock user ID
    db: Session = Depends(get_db)
):
    """Respond to team invitation"""
    
    invitation = db.query(TeamInvitation).filter(
        TeamInvitation.id == invitation_id,
        TeamInvitation.invited_user_id == user_id,
        TeamInvitation.status == "pending"
    ).first()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    if invitation.expires_at and invitation.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invitation has expired")
    
    if response == "accept":
        # Check if user has collaboration unlocked
        progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
        if not progress or progress.level < 3 or progress.projects_completed < 5:
            raise HTTPException(
                status_code=403, 
                detail="Collaboration requires Level 3 and 5 completed projects"
            )
        
        # Add user to project
        participant = ProjectParticipant(
            project_id=invitation.project_id,
            user_id=user_id,
            role=invitation.role,
            permissions=[ProjectPermission.READ, ProjectPermission.WRITE]
        )
        
        db.add(participant)
    
    invitation.status = response
    invitation.responded_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Invitation {response}ed successfully"
    }

@router.get("/projects/{project_id}/files")
async def get_project_files(project_id: str, db: Session = Depends(get_db)):
    """Get files for a project"""
    
    files = db.query(ProjectFile).filter(ProjectFile.project_id == project_id).all()
    
    return {
        "success": True,
        "files": [
            {
                "id": str(file.id),
                "filename": file.filename,
                "file_path": file.file_path,
                "file_type": file.file_type,
                "language": file.language,
                "version": file.version,
                "last_modified_by": file.last_modified_by,
                "last_modified_at": file.last_modified_at,
                "is_locked": file.is_locked,
                "locked_by": file.locked_by
            }
            for file in files
        ]
    }

@router.post("/projects/{project_id}/files")
async def create_project_file(
    project_id: str,
    filename: str,
    file_path: str,
    content: str = "",
    language: Optional[str] = None,
    created_by: str = "user-123",  # Mock user ID
    db: Session = Depends(get_db)
):
    """Create a new file in project"""
    
    # Check if user has write permission
    participant = db.query(ProjectParticipant).filter(
        ProjectParticipant.project_id == project_id,
        ProjectParticipant.user_id == created_by
    ).first()
    
    if not participant or ProjectPermission.WRITE not in participant.permissions:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    file = ProjectFile(
        project_id=project_id,
        filename=filename,
        file_path=file_path,
        content=content,
        language=language,
        last_modified_by=created_by
    )
    
    db.add(file)
    db.commit()
    db.refresh(file)
    
    return {
        "success": True,
        "file": {
            "id": str(file.id),
            "filename": file.filename,
            "file_path": file.file_path,
            "file_type": file.file_type,
            "language": file.language,
            "content": file.content,
            "version": file.version,
            "created_at": file.last_modified_at
        }
    }

@router.get("/projects/{project_id}/chat")
async def get_chat_messages(
    project_id: str,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get chat messages for project"""
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id.in_(
            db.query(CollaborationSession.id).filter(
                CollaborationSession.project_id == project_id
            )
        )
    ).order_by(ChatMessage.created_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "success": True,
        "messages": [
            {
                "id": str(message.id),
                "user_id": message.user_id,
                "message_type": message.message_type,
                "content": message.content,
                "metadata": message.metadata,
                "created_at": message.created_at,
                "edited_at": message.edited_at
            }
            for message in messages
        ]
    }

@router.get("/user/{user_id}/invitations")
async def get_user_invitations(
    user_id: str,
    status: str = "pending",
    db: Session = Depends(get_db)
):
    """Get invitations for user"""
    
    query = db.query(TeamInvitation).filter(TeamInvitation.invited_user_id == user_id)
    
    if status != "all":
        query = query.filter(TeamInvitation.status == status)
    
    invitations = query.all()
    
    return {
        "success": True,
        "invitations": [
            {
                "id": str(invitation.id),
                "project_id": str(invitation.project_id),
                "invited_by": invitation.invited_by,
                "role": invitation.role.value,
                "message": invitation.message,
                "status": invitation.status,
                "created_at": invitation.created_at,
                "expires_at": invitation.expires_at
            }
            for invitation in invitations
        ]
    }
