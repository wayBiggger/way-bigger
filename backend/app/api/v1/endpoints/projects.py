from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.project import Project, Track, ProjectStatus
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_projects(db: Session = Depends(get_db)):
    """Get all projects"""
    projects = db.query(Project).filter(Project.status == ProjectStatus.PUBLISHED).all()
    return [
        {
            "id": project.id,
            "title": project.title,
            "brief": project.brief,
            "description": project.description,
            "difficulty": project.difficulty,
            "tags": project.tags,
            "required_skills": project.required_skills,
            "estimated_hours": project.estimated_hours,
            "max_team_size": project.max_team_size,
            "is_community": project.is_community,
            "created_at": project.created_at
        }
        for project in projects
    ]

@router.get("/{project_id}", response_model=Dict[str, Any])
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get project by ID"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return {
        "id": project.id,
        "title": project.title,
        "brief": project.brief,
        "description": project.description,
        "difficulty": project.difficulty,
        "tags": project.tags,
        "required_skills": project.required_skills,
        "milestones": project.milestones,
        "test_spec": project.test_spec,
        "estimated_hours": project.estimated_hours,
        "max_team_size": project.max_team_size,
        "is_community": project.is_community,
        "status": project.status,
        "created_at": project.created_at
    }

@router.post("/", response_model=Dict[str, Any])
async def create_project(project_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create new project"""
    # For now, create a basic project
    # In production, you'd want proper validation and user authentication
    project = Project(
        title=project_data.get("title", "Sample Project"),
        brief=project_data.get("brief", "A sample project description"),
        description=project_data.get("description"),
        difficulty=project_data.get("difficulty", "beginner"),
        tags=project_data.get("tags", []),
        required_skills=project_data.get("required_skills", []),
        estimated_hours=project_data.get("estimated_hours", 10),
        max_team_size=project_data.get("max_team_size", 1),
        is_community=project_data.get("is_community", False),
        status="published"
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    
    return {"message": "Project created successfully", "project_id": project.id}

@router.get("/tracks", response_model=List[Dict[str, Any]])
async def get_tracks(db: Session = Depends(get_db)):
    """Get all tracks"""
    tracks = db.query(Track).filter(Track.is_active == True).all()
    return [
        {
            "id": track.id,
            "name": track.name,
            "domain": track.domain,
            "description": track.description,
            "levels": track.levels,
            "ordering": track.ordering
        }
        for track in tracks
    ]
