from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from typing import List, Dict, Any, Optional
from app.core.database import get_db, get_connection_info
from app.core.cache import cache, cached, invalidate_cache
from app.models.project import Project, Track, ProjectStatus, ProjectDifficulty
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/debug")
async def debug_projects(db: Session = Depends(get_db)):
    """Debug endpoint to check database connection"""
    try:
        total = db.query(Project).count()
        published = db.query(Project).filter(Project.status == ProjectStatus.PUBLISHED).count()
        return {
            "total_projects": total,
            "published_projects": published,
            "database_url": str(db.bind.url) if hasattr(db.bind, 'url') else "unknown"
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/", response_model=List[Dict[str, Any]])
async def get_projects(
    db: Session = Depends(get_db),
    limit: Optional[int] = Query(None, ge=1, le=1000),
    offset: Optional[int] = Query(0, ge=0),
    difficulty: Optional[str] = Query(None),
    domain: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """Get all projects with optional filtering and pagination"""
    try:
        # Create cache key based on parameters
        cache_key = f"projects:{limit}:{offset}:{difficulty}:{domain}:{search}"
        
        # Try to get from cache first
        cached_result = cache.get(cache_key)
        if cached_result is not None:
            logger.info(f"Cache hit for projects query: {cache_key}")
            return cached_result
        
        # Build query with optimizations
        query = db.query(Project).filter(Project.status == ProjectStatus.PUBLISHED)
        
        # Apply filters
        if difficulty and difficulty != 'all':
            query = query.filter(Project.difficulty == ProjectDifficulty(difficulty))
        
        if domain and domain != 'all':
            # Search in tags for domain match
            query = query.filter(
                func.array_to_string(Project.tags, ',').ilike(f'%{domain}%')
            )
        
        if search:
            search_term = f'%{search.lower()}%'
            query = query.filter(
                func.lower(Project.title).ilike(search_term) |
                func.lower(Project.description).ilike(search_term) |
                func.array_to_string(Project.tags, ',').ilike(search_term)
            )
        
        # Order by creation date for consistency
        query = query.order_by(desc(Project.created_at))
        
        # Apply pagination
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        
        # Execute query
        projects = query.all()
        logger.info(f"Query returned {len(projects)} projects")
        logger.info(f"First few project titles: {[p.title for p in projects[:5]]}")
        
        # Transform results efficiently
        result = []
        for project in projects:
            tech_stack = ", ".join(project.tags) if project.tags else ""
            
            result.append({
                "id": project.id,
                "title": project.title,
                "brief": project.brief,
                "description": project.description,
                "difficulty": project.difficulty.value,
                "tags": project.tags,
                "required_skills": project.required_skills,
                "tech_stack": tech_stack,
                "estimated_hours": project.estimated_hours,
                "max_team_size": project.max_team_size,
                "is_community": project.is_community,
                "created_at": project.created_at.isoformat() if project.created_at else None
            })
        
        # Cache the result for 5 minutes
        cache.set(cache_key, result, ttl=300)
        logger.info(f"Cached {len(result)} projects")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in get_projects: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching projects: {str(e)}"
        )

@router.get("/stats")
async def get_project_stats(db: Session = Depends(get_db)):
    """Get project statistics and performance metrics"""
    try:
        # Get basic stats
        total_projects = db.query(Project).count()
        published_projects = db.query(Project).filter(Project.status == ProjectStatus.PUBLISHED).count()
        
        # Get difficulty distribution
        difficulty_stats = db.query(
            Project.difficulty, 
            func.count(Project.id).label('count')
        ).filter(Project.status == ProjectStatus.PUBLISHED).group_by(Project.difficulty).all()
        
        # Get cache stats
        cache_stats = cache.get_stats()
        
        # Get database connection info
        db_info = get_connection_info()
        
        return {
            "total_projects": total_projects,
            "published_projects": published_projects,
            "difficulty_distribution": {d.value: c for d, c in difficulty_stats},
            "cache_stats": cache_stats,
            "database_info": db_info
        }
        
    except Exception as e:
        logger.error(f"Error getting project stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting project stats: {str(e)}"
        )

@router.post("/cache/invalidate")
async def invalidate_project_cache():
    """Invalidate project cache"""
    try:
        deleted_count = invalidate_cache("projects:*")
        return {"message": f"Invalidated {deleted_count} cache entries"}
    except Exception as e:
        logger.error(f"Error invalidating cache: {e}")
        return {"message": f"Cache invalidation failed: {str(e)}"}

@router.get("/beginner", response_model=List[Dict[str, Any]])
async def get_beginner_projects(db: Session = Depends(get_db)):
    """Get all beginner-level projects"""
    projects = db.query(Project).filter(
        Project.status == ProjectStatus.PUBLISHED,
        Project.difficulty == ProjectDifficulty.BEGINNER
    ).all()
    
    result = []
    for project in projects:
        tech_stack = ", ".join(project.tags) if project.tags else ""
        
        result.append({
            "id": project.id,
            "title": project.title,
            "brief": project.brief,
            "description": project.description,
            "difficulty": project.difficulty.value,
            "tags": project.tags,
            "required_skills": project.required_skills,
            "tech_stack": tech_stack,
            "estimated_hours": project.estimated_hours,
            "max_team_size": project.max_team_size,
            "is_community": project.is_community,
            "created_at": project.created_at.isoformat() if project.created_at else None
        })
    
    return result

@router.get("/intermediate", response_model=List[Dict[str, Any]])
async def get_intermediate_projects(db: Session = Depends(get_db)):
    """Get all intermediate-level projects"""
    projects = db.query(Project).filter(
        Project.status == ProjectStatus.PUBLISHED,
        Project.difficulty == ProjectDifficulty.INTERMEDIATE
    ).all()
    
    result = []
    for project in projects:
        tech_stack = ", ".join(project.tags) if project.tags else ""
        
        result.append({
            "id": project.id,
            "title": project.title,
            "brief": project.brief,
            "description": project.description,
            "difficulty": project.difficulty.value,
            "tags": project.tags,
            "required_skills": project.required_skills,
            "tech_stack": tech_stack,
            "estimated_hours": project.estimated_hours,
            "max_team_size": project.max_team_size,
            "is_community": project.is_community,
            "created_at": project.created_at.isoformat() if project.created_at else None
        })
    
    return result

@router.get("/advanced", response_model=List[Dict[str, Any]])
async def get_advanced_projects(db: Session = Depends(get_db)):
    """Get all advanced-level projects"""
    projects = db.query(Project).filter(
        Project.status == ProjectStatus.PUBLISHED,
        Project.difficulty == ProjectDifficulty.ADVANCED
    ).all()
    
    result = []
    for project in projects:
        tech_stack = ", ".join(project.tags) if project.tags else ""
        
        result.append({
            "id": project.id,
            "title": project.title,
            "brief": project.brief,
            "description": project.description,
            "difficulty": project.difficulty.value,
            "tags": project.tags,
            "required_skills": project.required_skills,
            "tech_stack": tech_stack,
            "estimated_hours": project.estimated_hours,
            "max_team_size": project.max_team_size,
            "is_community": project.is_community,
            "created_at": project.created_at.isoformat() if project.created_at else None
        })
    
    return result

@router.get("/tracks", response_model=List[Dict[str, Any]])
async def get_tracks(db: Session = Depends(get_db)):
    """Get all learning tracks"""
    tracks = db.query(Track).filter(Track.is_active == True).all()
    
    result = []
    for track in tracks:
        result.append({
            "id": track.id,
            "name": track.name,
            "domain": track.domain,
            "description": track.description,
            "levels": track.levels,
            "ordering": track.ordering,
            "is_active": track.is_active,
            "created_at": track.created_at.isoformat() if track.created_at else None
        })
    
    return result

@router.get("/{project_id}", response_model=Dict[str, Any])
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project by ID"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    tech_stack = ", ".join(project.tags) if project.tags else ""
    
    return {
        "id": project.id,
        "title": project.title,
        "brief": project.brief,
        "description": project.description,
        "difficulty": project.difficulty.value,
        "tags": project.tags,
        "required_skills": project.required_skills,
        "milestones": project.milestones,
        "test_spec": project.test_spec,
        "tech_stack": tech_stack,
        "estimated_hours": project.estimated_hours,
        "max_team_size": project.max_team_size,
        "is_community": project.is_community,
        "status": project.status.value,
        "created_by": project.created_by,
        "created_at": project.created_at.isoformat() if project.created_at else None,
        "updated_at": project.updated_at.isoformat() if project.updated_at else None
    }