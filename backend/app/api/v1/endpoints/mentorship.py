from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
from datetime import datetime

from ....core.database import get_db
from ....services.mentorship_engine import MentorshipEngine
from ....models.mentorship import MentorshipContext, LearningStyleProfile, MentorshipResource

router = APIRouter()

@router.get("/context/{user_id}")
async def get_mentorship_context(user_id: str, db: Session = Depends(get_db)):
    """Get user's mentorship context"""
    engine = MentorshipEngine(db)
    context = await engine.get_mentorship_context(user_id)
    
    return {
        "user_id": context.user_id,
        "skill_level": context.skill_level,
        "learning_style": context.learning_style,
        "preferred_help_style": context.preferred_help_style,
        "current_project": {
            "id": context.current_project_id,
            "name": context.current_project_name,
            "file": context.current_file,
            "language": context.current_language
        },
        "struggling_areas": context.struggling_areas,
        "strong_areas": context.strong_areas,
        "learning_velocity": context.learning_velocity,
        "session_duration": context.session_duration,
        "last_activity": context.last_activity,
        "recent_errors": context.recent_errors,
        "recent_questions": context.recent_questions
    }

@router.put("/context/{user_id}")
async def update_mentorship_context(
    user_id: str, 
    updates: Dict, 
    db: Session = Depends(get_db)
):
    """Update user's mentorship context"""
    engine = MentorshipEngine(db)
    context = await engine.update_context(user_id, updates)
    
    return {
        "success": True,
        "context": {
            "user_id": context.user_id,
            "skill_level": context.skill_level,
            "learning_style": context.learning_style,
            "preferred_help_style": context.preferred_help_style,
            "updated_at": context.updated_at
        }
    }

@router.post("/assess-learning-style/{user_id}")
async def assess_learning_style(
    user_id: str, 
    responses: Dict, 
    db: Session = Depends(get_db)
):
    """Assess user's learning style based on quiz responses"""
    engine = MentorshipEngine(db)
    profile = await engine.assess_learning_style(user_id, responses)
    
    return {
        "success": True,
        "profile": {
            "primary_style": profile.primary_style,
            "secondary_style": profile.secondary_style,
            "scores": {
                "visual": profile.visual_score,
                "auditory": profile.auditory_score,
                "kinesthetic": profile.kinesthetic_score,
                "reading": profile.reading_score
            },
            "preferences": {
                "prefers_diagrams": profile.prefers_diagrams,
                "prefers_examples": profile.prefers_examples,
                "prefers_explanations": profile.prefers_explanations,
                "prefers_hands_on": profile.prefers_hands_on
            },
            "confidence_level": profile.confidence_level,
            "assessment_completed": profile.assessment_completed
        }
    }

@router.get("/learning-style/{user_id}")
async def get_learning_style(user_id: str, db: Session = Depends(get_db)):
    """Get user's learning style profile"""
    profile = db.query(LearningStyleProfile).filter(
        LearningStyleProfile.user_id == user_id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Learning style not assessed")
    
    return {
        "primary_style": profile.primary_style,
        "secondary_style": profile.secondary_style,
        "scores": {
            "visual": profile.visual_score,
            "auditory": profile.auditory_score,
            "kinesthetic": profile.kinesthetic_score,
            "reading": profile.reading_score
        },
        "preferences": {
            "prefers_diagrams": profile.prefers_diagrams,
            "prefers_examples": profile.prefers_examples,
            "prefers_explanations": profile.prefers_explanations,
            "prefers_hands_on": profile.prefers_hands_on
        },
        "detail_level": profile.detail_level,
        "explanation_style": profile.explanation_style,
        "confidence_level": profile.confidence_level
    }

@router.post("/chat/{user_id}")
async def chat_with_mentor(
    user_id: str, 
    message: str, 
    project_context: Optional[Dict] = None,
    db: Session = Depends(get_db)
):
    """Chat with the AI mentor"""
    engine = MentorshipEngine(db)
    
    try:
        response = await engine.generate_mentor_response(
            user_id, message, project_context
        )
        
        # Update context with new activity
        await engine.update_context(user_id, {
            "last_activity": datetime.utcnow(),
            "recent_questions": [message] + (await engine.get_mentorship_context(user_id)).recent_questions[:4]
        })
        
        return {
            "success": True,
            "response": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate mentor response: {str(e)}")

@router.get("/interventions/{user_id}")
async def get_proactive_interventions(user_id: str, db: Session = Depends(get_db)):
    """Get proactive help suggestions for user"""
    engine = MentorshipEngine(db)
    interventions = await engine.detect_struggle_patterns(user_id)
    
    return {
        "success": True,
        "interventions": interventions
    }

@router.get("/resources/{user_id}")
async def get_recommended_resources(
    user_id: str, 
    topic: str, 
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get recommended learning resources"""
    engine = MentorshipEngine(db)
    resources = await engine.get_recommended_resources(user_id, topic, limit)
    
    return {
        "success": True,
        "resources": [
            {
                "id": str(resource.id),
                "title": resource.title,
                "description": resource.description,
                "type": resource.resource_type,
                "url": resource.url,
                "difficulty_level": resource.difficulty_level,
                "time_required": resource.time_required,
                "topics": resource.topics,
                "languages": resource.languages
            }
            for resource in resources
        ]
    }

@router.post("/progress/{user_id}")
async def update_learning_progress(
    user_id: str, 
    concept: str, 
    mastery_level: float,
    db: Session = Depends(get_db)
):
    """Update user's learning progress for a concept"""
    if not 0 <= mastery_level <= 1:
        raise HTTPException(status_code=400, detail="Mastery level must be between 0 and 1")
    
    engine = MentorshipEngine(db)
    await engine.update_learning_progress(user_id, concept, mastery_level)
    
    return {"success": True, "message": "Progress updated successfully"}

@router.get("/sessions/{user_id}")
async def get_mentorship_sessions(
    user_id: str, 
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get user's mentorship session history"""
    from ...models.mentorship import MentorshipSession
    
    sessions = db.query(MentorshipSession).filter(
        MentorshipSession.user_id == user_id
    ).order_by(MentorshipSession.created_at.desc()).limit(limit).all()
    
    return {
        "success": True,
        "sessions": [
            {
                "id": str(session.id),
                "session_type": session.session_type,
                "topic": session.topic,
                "user_message": session.user_message,
                "mentor_response": session.mentor_response,
                "response_type": session.response_type,
                "difficulty_level": session.difficulty_level,
                "concepts_covered": session.concepts_covered,
                "resources_provided": session.resources_provided,
                "follow_up_questions": session.follow_up_questions,
                "was_helpful": session.was_helpful,
                "learning_achieved": session.learning_achieved,
                "created_at": session.created_at
            }
            for session in sessions
        ]
    }

@router.post("/feedback/{session_id}")
async def submit_session_feedback(
    session_id: str,
    satisfaction: int,
    was_helpful: bool,
    learning_achieved: bool,
    db: Session = Depends(get_db)
):
    """Submit feedback for a mentorship session"""
    from ...models.mentorship import MentorshipSession
    
    session = db.query(MentorshipSession).filter(
        MentorshipSession.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.user_satisfaction = satisfaction
    session.was_helpful = was_helpful
    session.learning_achieved = learning_achieved
    
    db.commit()
    
    return {"success": True, "message": "Feedback submitted successfully"}

@router.get("/quiz/questions")
async def get_learning_style_quiz():
    """Get learning style assessment questions"""
    questions = [
        {
            "id": "prefer_diagrams",
            "question": "When learning something new, I prefer to see diagrams and visual representations",
            "category": "visual"
        },
        {
            "id": "prefer_explanations",
            "question": "I learn best when someone explains concepts to me verbally",
            "category": "auditory"
        },
        {
            "id": "hands_on_learning",
            "question": "I need to try things out myself to really understand them",
            "category": "kinesthetic"
        },
        {
            "id": "prefer_reading",
            "question": "I prefer to read documentation and written instructions",
            "category": "reading"
        },
        {
            "id": "like_charts",
            "question": "Charts and graphs help me understand information better",
            "category": "visual"
        },
        {
            "id": "like_discussions",
            "question": "I learn well through group discussions and talking through problems",
            "category": "auditory"
        },
        {
            "id": "practical_examples",
            "question": "I need practical, real-world examples to understand abstract concepts",
            "category": "kinesthetic"
        },
        {
            "id": "like_notes",
            "question": "I like to take detailed notes and write things down",
            "category": "reading"
        },
        {
            "id": "visual_examples",
            "question": "I remember things better when I can visualize them",
            "category": "visual"
        },
        {
            "id": "verbal_instructions",
            "question": "I follow verbal instructions better than written ones",
            "category": "auditory"
        },
        {
            "id": "trial_and_error",
            "question": "I learn by experimenting and making mistakes",
            "category": "kinesthetic"
        },
        {
            "id": "documentation",
            "question": "I rely heavily on documentation and written guides",
            "category": "reading"
        }
    ]
    
    return {
        "success": True,
        "questions": questions
    }
