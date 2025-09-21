from fastapi import APIRouter
from .endpoints import (
    auth, users, projects, submissions, tracks, newsletters, 
    code_editor, ai_assistant, portfolio, gamification, 
    mentorship, collaboration, integrated_features, security
)

api_router = APIRouter()

# Core features
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
api_router.include_router(tracks.router, prefix="/tracks", tags=["tracks"])
api_router.include_router(newsletters.router, prefix="/newsletters", tags=["newsletters"])

# Development tools
api_router.include_router(code_editor.router, prefix="/code-editor", tags=["code-editor"])
api_router.include_router(ai_assistant.router, prefix="/ai-assistant", tags=["ai-assistant"])

# Gamification and progression
api_router.include_router(gamification.router, prefix="/gamification", tags=["gamification"])

# Collaboration and mentorship
api_router.include_router(collaboration.router, prefix="/collaboration", tags=["collaboration"])
api_router.include_router(mentorship.router, prefix="/mentorship", tags=["mentorship"])

# Portfolio and presentation
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])

# Integrated features (main dashboard and cross-feature functionality)
api_router.include_router(integrated_features.router, prefix="/integrated-features", tags=["integrated-features"])

# Security
api_router.include_router(security.router, prefix="/security", tags=["security"])
