"""
Comprehensive Test Suite for Integrated Features
Tests all new features and their integration with existing WAY BIGGER architecture
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json

from main import app
from app.core.database import get_db
from app.models.user import User
from app.models.gamification import UserProgress, Badge, UserBadge
from app.models.collaboration import TeamProject, ProjectParticipant
from app.models.mentorship import MentorshipContext, MentorshipSession

client = TestClient(app)

# ==============================================
# FIXTURES
# ==============================================

@pytest.fixture
def test_user(db: Session):
    """Create a test user"""
    user = User(
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        hashed_password="hashed_password",
        is_active=True,
        email_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_user_progress(db: Session, test_user):
    """Create test user progress"""
    progress = UserProgress(
        user_id=str(test_user.id),
        level=5,
        total_xp=2500,
        current_streak=7,
        longest_streak=15,
        skill_points={"python": 100, "javascript": 80},
        unlocked_features=["collaboration", "mentoring"]
    )
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress

@pytest.fixture
def test_badges(db: Session):
    """Create test badges"""
    badges = [
        Badge(
            name="First Steps",
            description="Complete your first project",
            icon="🎯",
            category="milestone",
            rarity="common",
            xp_reward=100,
            requirements={"projects_completed": 1}
        ),
        Badge(
            name="Code Warrior",
            description="Complete 10 projects",
            icon="⚔️",
            category="milestone",
            rarity="rare",
            xp_reward=500,
            requirements={"projects_completed": 10}
        )
    ]
    for badge in badges:
        db.add(badge)
    db.commit()
    return badges

@pytest.fixture
def auth_headers(test_user):
    """Create authentication headers"""
    # This would normally use your JWT token creation
    return {"Authorization": f"Bearer test_token_{test_user.id}"}

# ==============================================
# DASHBOARD TESTS
# ==============================================

def test_get_user_dashboard_success(db: Session, test_user, test_user_progress, auth_headers):
    """Test successful dashboard retrieval"""
    response = client.get(
        "/api/v1/integrated-features/dashboard",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert "user" in data
    assert "progress" in data
    assert "recent_badges" in data
    assert "active_collaborations" in data
    assert "mentorship_sessions" in data
    assert "unlocked_features" in data
    assert "level_progress" in data
    
    assert data["user"]["id"] == str(test_user.id)
    assert data["progress"]["level"] == 5
    assert data["progress"]["total_xp"] == 2500

def test_get_user_dashboard_unauthorized():
    """Test dashboard access without authentication"""
    response = client.get("/api/v1/integrated-features/dashboard")
    assert response.status_code == 401

# ==============================================
# FEATURE UNLOCK TESTS
# ==============================================

def test_unlock_feature_success(db: Session, test_user, test_user_progress, auth_headers):
    """Test successful feature unlock"""
    response = client.post(
        "/api/v1/integrated-features/features/unlock",
        json={"feature_name": "industry_challenges"},
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["unlocked"] == True
    assert "industry_challenges" in data["unlocked_features"]

def test_unlock_feature_already_unlocked(db: Session, test_user, test_user_progress, auth_headers):
    """Test unlocking already unlocked feature"""
    response = client.post(
        "/api/v1/integrated-features/features/unlock",
        json={"feature_name": "collaboration"},
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["unlocked"] == True

def test_unlock_feature_insufficient_level(db: Session, test_user, auth_headers):
    """Test unlocking feature with insufficient level"""
    # Create user with low level
    progress = UserProgress(
        user_id=str(test_user.id),
        level=1,
        total_xp=100,
        unlocked_features=[]
    )
    db.add(progress)
    db.commit()
    
    response = client.post(
        "/api/v1/integrated-features/features/unlock",
        json={"feature_name": "mentoring"},
        headers=auth_headers
    )
    
    assert response.status_code == 403
    data = response.json()
    assert "Requires level" in data["detail"]

# ==============================================
# COLLABORATION TESTS
# ==============================================

def test_join_collaboration_success(db: Session, test_user, test_user_progress, auth_headers):
    """Test successful collaboration join"""
    # Create a team project
    project = TeamProject(
        name="Test Project",
        description="A test collaboration project",
        difficulty_level="intermediate",
        max_team_size=5,
        min_team_size=2,
        created_by=str(test_user.id)
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    response = client.post(
        "/api/v1/integrated-features/collaboration/join",
        json={
            "project_id": str(project.id),
            "role": "contributor"
        },
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["xp_earned"] == 50
    assert data["project"]["name"] == "Test Project"
    
    # Verify participant was created
    participant = db.query(ProjectParticipant).filter(
        ProjectParticipant.project_id == project.id,
        ProjectParticipant.user_id == str(test_user.id)
    ).first()
    assert participant is not None
    assert participant.role == "contributor"

def test_join_collaboration_feature_locked(db: Session, test_user, auth_headers):
    """Test joining collaboration with locked feature"""
    # Create user without collaboration feature
    progress = UserProgress(
        user_id=str(test_user.id),
        level=1,
        total_xp=100,
        unlocked_features=[]
    )
    db.add(progress)
    db.commit()
    
    response = client.post(
        "/api/v1/integrated-features/collaboration/join",
        json={"project_id": "test-project-id"},
        headers=auth_headers
    )
    
    assert response.status_code == 403
    data = response.json()
    assert "Collaboration feature not unlocked" in data["detail"]

# ==============================================
# MENTORSHIP TESTS
# ==============================================

def test_request_mentorship_success(db: Session, test_user, test_user_progress, auth_headers):
    """Test successful mentorship request"""
    response = client.post(
        "/api/v1/integrated-features/mentorship/request",
        json={
            "mentor_id": "mentor-123",
            "context_type": "project_help",
            "context_data": {"project_id": "test-project"}
        },
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["xp_earned"] == 25
    assert data["status"] == "pending"
    assert "context_id" in data
    
    # Verify mentorship context was created
    context = db.query(MentorshipContext).filter(
        MentorshipContext.user_id == str(test_user.id)
    ).first()
    assert context is not None
    assert context.context_type == "project_help"

def test_request_mentorship_feature_locked(db: Session, test_user, auth_headers):
    """Test mentorship request with locked feature"""
    # Create user without mentorship feature
    progress = UserProgress(
        user_id=str(test_user.id),
        level=1,
        total_xp=100,
        unlocked_features=[]
    )
    db.add(progress)
    db.commit()
    
    response = client.post(
        "/api/v1/integrated-features/mentorship/request",
        json={
            "context_type": "project_help"
        },
        headers=auth_headers
    )
    
    assert response.status_code == 403
    data = response.json()
    assert "Mentorship feature not unlocked" in data["detail"]

# ==============================================
# PORTFOLIO GENERATION TESTS
# ==============================================

def test_generate_portfolio_success(db: Session, test_user, test_user_progress, auth_headers):
    """Test successful portfolio generation"""
    response = client.post(
        "/api/v1/integrated-features/portfolio/generate",
        json={
            "template_id": "developer-template",
            "is_public": True
        },
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["xp_earned"] == 75
    assert data["status"] == "generating"
    assert "portfolio_id" in data

def test_generate_portfolio_feature_locked(db: Session, test_user, auth_headers):
    """Test portfolio generation with locked feature"""
    # Create user without advanced portfolio feature
    progress = UserProgress(
        user_id=str(test_user.id),
        level=1,
        total_xp=100,
        unlocked_features=[]
    )
    db.add(progress)
    db.commit()
    
    response = client.post(
        "/api/v1/integrated-features/portfolio/generate",
        json={"is_public": True},
        headers=auth_headers
    )
    
    assert response.status_code == 403
    data = response.json()
    assert "Advanced portfolio feature not unlocked" in data["detail"]

# ==============================================
# FEATURE STATUS TESTS
# ==============================================

def test_get_feature_status_success(db: Session, test_user, test_user_progress, auth_headers):
    """Test successful feature status retrieval"""
    response = client.get(
        "/api/v1/integrated-features/features/status",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert "features" in data
    assert "level" in data
    assert "unlocked_features" in data
    
    assert data["level"] == 5
    assert "collaboration" in data["unlocked_features"]
    assert "mentoring" in data["unlocked_features"]

# ==============================================
# INTEGRATION TESTS
# ==============================================

def test_full_user_journey(db: Session, test_user, auth_headers):
    """Test complete user journey from signup to advanced features"""
    
    # 1. Create initial user progress
    progress = UserProgress(
        user_id=str(test_user.id),
        level=1,
        total_xp=0,
        unlocked_features=[]
    )
    db.add(progress)
    db.commit()
    
    # 2. Check initial feature status
    response = client.get(
        "/api/v1/integrated-features/features/status",
        headers=auth_headers
    )
    assert response.status_code == 200
    
    # 3. Simulate earning XP and leveling up
    progress.total_xp = 1500
    progress.level = 3
    progress.unlocked_features = ["collaboration"]
    db.commit()
    
    # 4. Try to join collaboration (should work)
    project = TeamProject(
        name="Test Project",
        description="Test",
        difficulty_level="beginner",
        created_by=str(test_user.id)
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    response = client.post(
        "/api/v1/integrated-features/collaboration/join",
        json={"project_id": str(project.id)},
        headers=auth_headers
    )
    assert response.status_code == 200
    
    # 5. Try to request mentorship (should fail - not unlocked)
    response = client.post(
        "/api/v1/integrated-features/mentorship/request",
        json={"context_type": "project_help"},
        headers=auth_headers
    )
    assert response.status_code == 403
    
    # 6. Level up and unlock mentorship
    progress.level = 10
    progress.total_xp = 5000
    progress.unlocked_features = ["collaboration", "mentoring"]
    db.commit()
    
    # 7. Now mentorship should work
    response = client.post(
        "/api/v1/integrated-features/mentorship/request",
        json={"context_type": "project_help"},
        headers=auth_headers
    )
    assert response.status_code == 200

# ==============================================
# ERROR HANDLING TESTS
# ==============================================

def test_invalid_feature_name(db: Session, test_user, test_user_progress, auth_headers):
    """Test unlocking invalid feature name"""
    response = client.post(
        "/api/v1/integrated-features/features/unlock",
        json={"feature_name": "invalid_feature"},
        headers=auth_headers
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "Feature not available" in data["detail"]

def test_nonexistent_project_collaboration(db: Session, test_user, test_user_progress, auth_headers):
    """Test joining nonexistent collaboration project"""
    response = client.post(
        "/api/v1/integrated-features/collaboration/join",
        json={"project_id": "nonexistent-project"},
        headers=auth_headers
    )
    
    assert response.status_code == 404
    data = response.json()
    assert "Project not found" in data["detail"]

# ==============================================
# PERFORMANCE TESTS
# ==============================================

def test_dashboard_performance(db: Session, test_user, test_user_progress, auth_headers):
    """Test dashboard response time"""
    import time
    
    start_time = time.time()
    response = client.get(
        "/api/v1/integrated-features/dashboard",
        headers=auth_headers
    )
    end_time = time.time()
    
    assert response.status_code == 200
    assert (end_time - start_time) < 1.0  # Should respond within 1 second

# ==============================================
# DATA VALIDATION TESTS
# ==============================================

def test_invalid_json_request():
    """Test handling of invalid JSON"""
    response = client.post(
        "/api/v1/integrated-features/features/unlock",
        data="invalid json",
        headers={"Content-Type": "application/json"}
    )
    
    assert response.status_code == 422

def test_missing_required_fields(db: Session, test_user, test_user_progress, auth_headers):
    """Test handling of missing required fields"""
    response = client.post(
        "/api/v1/integrated-features/features/unlock",
        json={},  # Missing feature_name
        headers=auth_headers
    )
    
    assert response.status_code == 422

# ==============================================
# SECURITY TESTS
# ==============================================

def test_unauthorized_access():
    """Test that endpoints require authentication"""
    endpoints = [
        "/api/v1/integrated-features/dashboard",
        "/api/v1/integrated-features/features/status",
        "/api/v1/integrated-features/features/unlock",
        "/api/v1/integrated-features/collaboration/join",
        "/api/v1/integrated-features/mentorship/request",
        "/api/v1/integrated-features/portfolio/generate"
    ]
    
    for endpoint in endpoints:
        response = client.get(endpoint) if endpoint.endswith("status") or endpoint.endswith("dashboard") else client.post(endpoint, json={})
        assert response.status_code == 401

def test_user_isolation(db: Session, test_user, auth_headers):
    """Test that users can only access their own data"""
    # Create another user
    other_user = User(
        email="other@example.com",
        username="otheruser",
        full_name="Other User",
        hashed_password="hashed_password"
    )
    db.add(other_user)
    db.commit()
    
    # Create progress for other user
    other_progress = UserProgress(
        user_id=str(other_user.id),
        level=10,
        total_xp=10000,
        unlocked_features=["collaboration", "mentoring", "industry_challenges"]
    )
    db.add(other_progress)
    db.commit()
    
    # Test that current user can't see other user's data
    response = client.get(
        "/api/v1/integrated-features/dashboard",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["id"] == str(test_user.id)
    assert data["user"]["id"] != str(other_user.id)
