from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.project import Track

router = APIRouter()

@router.get("/", response_model=list[dict])
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
            "ordering": track.ordering,
            "is_active": track.is_active,
            "created_at": track.created_at
        }
        for track in tracks
    ]

@router.get("/{track_id}", response_model=dict)
async def get_track(track_id: int, db: Session = Depends(get_db)):
    """Get track by ID"""
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Track not found"
        )
    
    return {
        "id": track.id,
        "name": track.name,
        "domain": track.domain,
        "description": track.description,
        "levels": track.levels,
        "ordering": track.ordering,
        "is_active": track.is_active,
        "created_at": track.created_at
    }

@router.post("/", response_model=dict)
async def create_track(track_data: dict, db: Session = Depends(get_db)):
    """Create new track"""
    track = Track(
        name=track_data.get("name", "Sample Track"),
        domain=track_data.get("domain", "web-dev"),
        description=track_data.get("description", "A sample learning track"),
        levels=track_data.get("levels", ["beginner", "intermediate", "advanced"]),
        ordering=track_data.get("ordering", []),
        is_active=True
    )
    
    db.add(track)
    db.commit()
    db.refresh(track)
    
    return {"message": "Track created successfully", "track_id": track.id}

@router.put("/{track_id}", response_model=dict)
async def update_track(track_id: int, track_data: dict, db: Session = Depends(get_db)):
    """Update track"""
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Track not found"
        )
    
    # Update fields
    if "name" in track_data:
        track.name = track_data["name"]
    if "domain" in track_data:
        track.domain = track_data["domain"]
    if "description" in track_data:
        track.description = track_data["description"]
    if "levels" in track_data:
        track.levels = track_data["levels"]
    if "ordering" in track_data:
        track.ordering = track_data["ordering"]
    
    db.commit()
    db.refresh(track)
    
    return {"message": "Track updated successfully"}

@router.delete("/{track_id}", response_model=dict)
async def delete_track(track_id: int, db: Session = Depends(get_db)):
    """Delete track"""
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Track not found"
        )
    
    db.delete(track)
    db.commit()
    
    return {"message": "Track deleted successfully"}
