from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.core.gemini_service import gemini_service
from app.core.security import get_current_user, get_optional_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class ProjectIdeaRequest(BaseModel):
    field: str
    difficulty: str
    user_interests: Optional[List[str]] = None

class LearningPathRequest(BaseModel):
    field: str
    current_skill_level: str
    goal: str

class CodeReviewRequest(BaseModel):
    code: str
    language: str
    context: Optional[str] = ""

class ProjectDescriptionRequest(BaseModel):
    title: str
    field: str
    difficulty: str

class TutorQuestionRequest(BaseModel):
    question: str
    context: Optional[str] = ""
    user_level: Optional[str] = "beginner"

@router.post("/project-ideas", response_model=List[Dict[str, Any]])
async def generate_project_ideas(
    request: ProjectIdeaRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Generate AI-powered project ideas based on user preferences"""
    try:
        ideas = gemini_service.generate_project_ideas(
            field=request.field,
            difficulty=request.difficulty,
            user_interests=request.user_interests
        )
        
        if not ideas:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not available. Please check your configuration."
            )
        
        return ideas
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate project ideas: {str(e)}"
        )

@router.post("/learning-path", response_model=Dict[str, Any])
async def generate_learning_path(
    request: LearningPathRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Generate personalized learning path"""
    try:
        learning_path = gemini_service.generate_learning_path(
            field=request.field,
            current_skill_level=request.current_skill_level,
            goal=request.goal
        )
        
        if not learning_path:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not available. Please check your configuration."
            )
        
        return learning_path
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate learning path: {str(e)}"
        )

@router.post("/code-review", response_model=Dict[str, Any])
async def get_code_review(
    request: CodeReviewRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered code review and suggestions"""
    try:
        review = gemini_service.code_review_and_suggestions(
            code=request.code,
            language=request.language,
            context=request.context
        )
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not available. Please check your configuration."
            )
        
        return review
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get code review: {str(e)}"
        )

@router.post("/project-description", response_model=Dict[str, Any])
async def generate_project_description(
    request: ProjectDescriptionRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Generate detailed project description and milestones"""
    try:
        description = gemini_service.generate_project_description(
            title=request.title,
            field=request.field,
            difficulty=request.difficulty
        )
        
        if not description:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not available. Please check your configuration."
            )
        
        return description
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate project description: {str(e)}"
        )

@router.post("/tutor", response_model=Dict[str, Any])
async def ask_ai_tutor(
    request: TutorQuestionRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Ask AI tutor for programming help"""
    try:
        # Determine user level from current user if available
        user_level = request.user_level
        if current_user and current_user.proficiency_level:
            user_level = current_user.proficiency_level
        
        response = gemini_service.ai_tutor_response(
            question=request.question,
            context=request.context,
            user_level=user_level
        )
        
        return {
            "answer": response,
            "user_level": user_level,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tutor response: {str(e)}"
        )

@router.get("/status")
async def ai_service_status():
    """Check if AI service is available"""
    try:
        is_available = gemini_service.model is not None
        return {
            "available": is_available,
            "service": "Gemini Flash",
            "status": "active" if is_available else "inactive"
        }
    except Exception as e:
        return {
            "available": False,
            "service": "Gemini Pro",
            "status": "error",
            "error": str(e)
        }
