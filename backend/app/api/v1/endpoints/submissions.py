from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import Submission
from app.models.project import Project
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=list[dict])
async def get_submissions(db: Session = Depends(get_db)):
    """Get all submissions"""
    submissions = db.query(Submission).all()
    return [
        {
            "id": submission.id,
            "user_id": submission.user_id,
            "project_id": submission.project_id,
            "status": submission.status,
            "submitted_at": submission.submitted_at
        }
        for submission in submissions
    ]

@router.get("/{submission_id}", response_model=dict)
async def get_submission(submission_id: int, db: Session = Depends(get_db)):
    """Get submission by ID"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    return {
        "id": submission.id,
        "user_id": submission.user_id,
        "project_id": submission.project_id,
        "status": submission.status,
        "submitted_at": submission.submitted_at
    }

@router.post("/", response_model=dict)
async def create_submission(submission_data: dict, db: Session = Depends(get_db)):
    """Create new submission"""
    submission = Submission(
        user_id=submission_data.get("user_id"),
        project_id=submission_data.get("project_id"),
        status=submission_data.get("status", "pending")
    )
    
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    return {"message": "Submission created successfully", "submission_id": submission.id}

@router.put("/{submission_id}", response_model=dict)
async def update_submission(submission_id: int, submission_data: dict, db: Session = Depends(get_db)):
    """Update submission"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    if "status" in submission_data:
        submission.status = submission_data["status"]
    
    db.commit()
    db.refresh(submission)
    
    return {"message": "Submission updated successfully"}

@router.delete("/{submission_id}", response_model=dict)
async def delete_submission(submission_id: int, db: Session = Depends(get_db)):
    """Delete submission"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    db.delete(submission)
    db.commit()
    
    return {"message": "Submission deleted successfully"}
