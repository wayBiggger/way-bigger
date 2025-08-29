from fastapi import APIRouter
from .endpoints import auth, users, projects, submissions, tracks, newsletters, code_editor

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
api_router.include_router(tracks.router, prefix="/tracks", tags=["tracks"])
api_router.include_router(newsletters.router, prefix="/newsletters", tags=["newsletters"])
api_router.include_router(code_editor.router, prefix="/code-editor", tags=["code-editor"])
