"""
Portfolio API Endpoints
Handles portfolio generation, management, and public profile serving
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
import json
from datetime import datetime, timedelta
import uuid

from ....core.database import get_db
from ....models.user import User
from ....core.security import get_current_user, get_optional_user
from ....core.ai import generate_ai_content

router = APIRouter()

# Portfolio project model (simplified for this implementation)
class PortfolioProject:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

@router.post("/projects")
async def create_portfolio_project(
    project_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new portfolio project"""
    try:
        # Generate AI content for professional description
        ai_prompt = f"""
        Convert this technical project into a professional description for a resume/portfolio:
        
        Title: {project_data.get('title', '')}
        Description: {project_data.get('technicalDescription', '')}
        Technologies: {', '.join(project_data.get('techStack', []))}
        Time Spent: {project_data.get('timeSpent', 0)} hours
        Difficulty: {project_data.get('difficultyLevel', 'intermediate')}
        
        Generate:
        1. Professional description highlighting business impact
        2. Key achievements and outcomes
        3. Technical challenges overcome
        4. Skills demonstrated
        5. Industry relevance
        
        Format as JSON with professionalDescription, outcomes, technicalChallenges, skillsLearned, industryRelevance.
        """
        
        ai_response = await generate_ai_content(ai_prompt)
        
        # Parse AI response and enhance project data
        try:
            ai_data = json.loads(ai_response) if isinstance(ai_response, str) else ai_response
        except:
            ai_data = {
                "professionalDescription": project_data.get('technicalDescription', ''),
                "outcomes": ["Demonstrated technical proficiency"],
                "technicalChallenges": ["Technology integration"],
                "skillsLearned": project_data.get('techStack', []),
                "industryRelevance": "Relevant for software development roles"
            }
        
        # Create enhanced project
        enhanced_project = {
            "id": str(uuid.uuid4()),
            "userId": str(current_user.id),
            "title": project_data.get('title', 'Untitled Project'),
            "professionalDescription": ai_data.get('professionalDescription', project_data.get('technicalDescription', '')),
            "technicalDescription": project_data.get('technicalDescription', ''),
            "techStack": project_data.get('techStack', []),
            "outcomes": ai_data.get('outcomes', []),
            "githubUrl": project_data.get('githubUrl'),
            "liveUrl": project_data.get('liveUrl'),
            "screenshots": project_data.get('screenshots', []),
            "skillsLearned": ai_data.get('skillsLearned', project_data.get('techStack', [])),
            "industryRelevance": ai_data.get('industryRelevance', ''),
            "completionDate": datetime.now().isoformat(),
            "timeSpent": project_data.get('timeSpent', 0),
            "difficultyLevel": project_data.get('difficultyLevel', 'intermediate'),
            "projectType": project_data.get('projectType', 'web'),
            "status": "completed",
            "tags": project_data.get('tags', []),
            "featured": project_data.get('featured', False),
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        # In a real implementation, save to database
        # For now, return the enhanced project
        return enhanced_project
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create portfolio project: {str(e)}")

@router.get("/projects/{user_id}")
async def get_user_portfolio_projects(
    user_id: str,
    limit: Optional[int] = Query(10, ge=1, le=100),
    offset: Optional[int] = Query(0, ge=0),
    featured: Optional[bool] = None,
    difficulty: Optional[str] = Query(None),
    technologies: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get user's portfolio projects"""
    try:
        # In a real implementation, query the database
        # For now, return mock data
        mock_projects = [
            {
                "id": str(uuid.uuid4()),
                "userId": user_id,
                "title": "E-Commerce Web Application",
                "professionalDescription": "Developed a full-stack e-commerce platform using React and Node.js, resulting in 40% improvement in user engagement and 25% increase in conversion rates.",
                "technicalDescription": "Built a responsive e-commerce website with shopping cart, user authentication, and payment integration.",
                "techStack": ["React", "Node.js", "MongoDB", "Stripe API"],
                "outcomes": [
                    "Improved user engagement by 40%",
                    "Increased conversion rates by 25%",
                    "Reduced page load time by 30%"
                ],
                "githubUrl": "https://github.com/user/ecommerce-app",
                "liveUrl": "https://ecommerce-demo.com",
                "screenshots": [],
                "skillsLearned": ["React", "Node.js", "MongoDB", "API Integration"],
                "industryRelevance": "Relevant for full-stack development and e-commerce roles",
                "completionDate": (datetime.now() - timedelta(days=30)).isoformat(),
                "timeSpent": 120,
                "difficultyLevel": "intermediate",
                "projectType": "web",
                "status": "completed",
                "tags": ["ecommerce", "fullstack", "react", "nodejs"],
                "featured": True,
                "createdAt": (datetime.now() - timedelta(days=30)).isoformat(),
                "updatedAt": (datetime.now() - timedelta(days=5)).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "userId": user_id,
                "title": "Machine Learning Data Analysis Tool",
                "professionalDescription": "Created a Python-based data analysis tool using scikit-learn and pandas, processing 10,000+ records and generating actionable business insights.",
                "technicalDescription": "Built a machine learning pipeline for data analysis and visualization.",
                "techStack": ["Python", "scikit-learn", "pandas", "matplotlib"],
                "outcomes": [
                    "Processed 10,000+ data records",
                    "Generated actionable business insights",
                    "Automated data analysis workflow"
                ],
                "githubUrl": "https://github.com/user/ml-analysis-tool",
                "liveUrl": None,
                "screenshots": [],
                "skillsLearned": ["Python", "Machine Learning", "Data Analysis", "Pandas"],
                "industryRelevance": "Relevant for data science and machine learning roles",
                "completionDate": (datetime.now() - timedelta(days=60)).isoformat(),
                "timeSpent": 80,
                "difficultyLevel": "advanced",
                "projectType": "data-science",
                "status": "completed",
                "tags": ["machine-learning", "python", "data-analysis"],
                "featured": False,
                "createdAt": (datetime.now() - timedelta(days=60)).isoformat(),
                "updatedAt": (datetime.now() - timedelta(days=10)).isoformat()
            }
        ]
        
        # Apply filters
        filtered_projects = mock_projects
        
        if featured is not None:
            filtered_projects = [p for p in filtered_projects if p['featured'] == featured]
        
        if difficulty:
            difficulty_levels = difficulty.split(',')
            filtered_projects = [p for p in filtered_projects if p['difficultyLevel'] in difficulty_levels]
        
        if technologies:
            tech_list = technologies.split(',')
            filtered_projects = [p for p in filtered_projects if any(tech in p['techStack'] for tech in tech_list)]
        
        # Apply pagination
        start = offset
        end = offset + limit
        paginated_projects = filtered_projects[start:end]
        
        return paginated_projects
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch portfolio projects: {str(e)}")

@router.get("/projects/single/{project_id}")
async def get_portfolio_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get a specific portfolio project"""
    try:
        # In a real implementation, query the database
        # For now, return mock data
        mock_project = {
            "id": project_id,
            "userId": "user123",
            "title": "Sample Portfolio Project",
            "professionalDescription": "This is a sample project description for demonstration purposes.",
            "technicalDescription": "Technical details of the project implementation.",
            "techStack": ["React", "Node.js", "MongoDB"],
            "outcomes": ["Improved performance", "Enhanced user experience"],
            "githubUrl": "https://github.com/user/sample-project",
            "liveUrl": "https://sample-project.com",
            "screenshots": [],
            "skillsLearned": ["React", "Node.js", "MongoDB"],
            "industryRelevance": "Relevant for full-stack development roles",
            "completionDate": datetime.now().isoformat(),
            "timeSpent": 40,
            "difficultyLevel": "intermediate",
            "projectType": "web",
            "status": "completed",
            "tags": ["web", "fullstack", "react"],
            "featured": True,
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        return mock_project
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch portfolio project: {str(e)}")

@router.put("/projects/{project_id}")
async def update_portfolio_project(
    project_id: str,
    updates: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a portfolio project"""
    try:
        # In a real implementation, update the database
        # For now, return success
        return {
            "success": True,
            "message": "Project updated successfully",
            "projectId": project_id,
            "updatedAt": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update portfolio project: {str(e)}")

@router.delete("/projects/{project_id}")
async def delete_portfolio_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a portfolio project"""
    try:
        # In a real implementation, delete from database
        # For now, return success
        return {
            "success": True,
            "message": "Project deleted successfully",
            "projectId": project_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete portfolio project: {str(e)}")

@router.get("/users/{user_id}")
async def get_portfolio_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get user's portfolio profile"""
    try:
        # In a real implementation, query the database
        # For now, return mock data
        mock_user = {
            "id": user_id,
            "username": "johndoe",
            "displayName": "John Doe",
            "email": "john@example.com",
            "bio": "Full-stack developer passionate about creating innovative web solutions.",
            "avatar": None,
            "location": "San Francisco, CA",
            "website": "https://johndoe.dev",
            "githubUsername": "johndoe",
            "linkedinUrl": "https://linkedin.com/in/johndoe",
            "twitterUrl": "https://twitter.com/johndoe",
            "skills": ["React", "Node.js", "Python", "MongoDB", "AWS"],
            "experience": "5 years",
            "education": "Computer Science, Stanford University",
            "certifications": ["AWS Certified Developer", "Google Cloud Professional"],
            "languages": ["English", "Spanish"],
            "availability": "available",
            "publicProfile": True,
            "createdAt": (datetime.now() - timedelta(days=365)).isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        return mock_user
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch portfolio user: {str(e)}")

@router.get("/stats/{user_id}")
async def get_portfolio_stats(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get user's portfolio statistics"""
    try:
        # In a real implementation, calculate from database
        # For now, return mock data
        mock_stats = {
            "totalProjects": 12,
            "completedProjects": 10,
            "totalHoursSpent": 480,
            "averageProjectDuration": 40,
            "mostUsedTechnologies": [
                {"technology": "React", "count": 8, "percentage": 67},
                {"technology": "Node.js", "count": 6, "percentage": 50},
                {"technology": "Python", "count": 4, "percentage": 33},
                {"technology": "MongoDB", "count": 3, "percentage": 25}
            ],
            "skillDistribution": [
                {"skill": "React", "level": "advanced", "projects": 8},
                {"skill": "Node.js", "level": "intermediate", "projects": 6},
                {"skill": "Python", "level": "intermediate", "projects": 4},
                {"skill": "MongoDB", "level": "beginner", "projects": 3}
            ],
            "monthlyActivity": [
                {"month": "2024-01", "projectsCompleted": 2, "hoursSpent": 80},
                {"month": "2024-02", "projectsCompleted": 3, "hoursSpent": 120},
                {"month": "2024-03", "projectsCompleted": 1, "hoursSpent": 40},
                {"month": "2024-04", "projectsCompleted": 4, "hoursSpent": 160}
            ]
        }
        
        return mock_stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch portfolio stats: {str(e)}")

@router.post("/export")
async def export_portfolio(
    export_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export portfolio data in various formats"""
    try:
        user_id = export_data.get('userId')
        format_type = export_data.get('format', 'pdf')
        
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        
        # In a real implementation, generate the export file
        # For now, return a placeholder response
        return {
            "success": True,
            "message": f"Portfolio exported successfully in {format_type} format",
            "downloadUrl": f"/api/v1/portfolio/download/{user_id}/{format_type}",
            "expiresAt": (datetime.now() + timedelta(hours=24)).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export portfolio: {str(e)}")

@router.get("/analytics/{user_id}")
async def get_portfolio_analytics(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get portfolio analytics data"""
    try:
        # In a real implementation, calculate from analytics data
        # For now, return mock data
        mock_analytics = {
            "views": 1250,
            "uniqueVisitors": 890,
            "timeOnPage": 180,
            "bounceRate": 0.25,
            "topProjects": [
                {"projectId": "proj1", "views": 450, "clicks": 120},
                {"projectId": "proj2", "views": 380, "clicks": 95},
                {"projectId": "proj3", "views": 320, "clicks": 80}
            ],
            "trafficSources": [
                {"source": "Direct", "visitors": 400, "percentage": 45},
                {"source": "Google", "visitors": 300, "percentage": 34},
                {"source": "LinkedIn", "visitors": 190, "percentage": 21}
            ],
            "deviceBreakdown": [
                {"device": "Desktop", "percentage": 60},
                {"device": "Mobile", "percentage": 35},
                {"device": "Tablet", "percentage": 5}
            ],
            "geographicData": [
                {"country": "United States", "visitors": 450},
                {"country": "Canada", "visitors": 200},
                {"country": "United Kingdom", "visitors": 150},
                {"country": "Germany", "visitors": 90}
            ]
        }
        
        return mock_analytics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch portfolio analytics: {str(e)}")

@router.post("/github/integrate")
async def integrate_github_repository(
    integration_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Integrate GitHub repository with portfolio project"""
    try:
        project_id = integration_data.get('projectId')
        repository_url = integration_data.get('repositoryUrl')
        
        if not project_id or not repository_url:
            raise HTTPException(status_code=400, detail="Project ID and repository URL are required")
        
        # In a real implementation, integrate with GitHub API
        # For now, return mock data
        mock_integration = {
            "repositoryUrl": repository_url,
            "lastSync": datetime.now().isoformat(),
            "commits": 45,
            "stars": 12,
            "forks": 3,
            "languages": [
                {"name": "JavaScript", "percentage": 60},
                {"name": "Python", "percentage": 30},
                {"name": "CSS", "percentage": 10}
            ],
            "readmeContent": "# Sample Project\n\nThis is a sample project description.",
            "issues": 2,
            "pullRequests": 5
        }
        
        return mock_integration
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to integrate GitHub repository: {str(e)}")

@router.post("/demo-links")
async def add_demo_link(
    demo_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add demo link for portfolio project"""
    try:
        # In a real implementation, save to database
        # For now, return success
        return {
            "success": True,
            "message": "Demo link added successfully",
            "demoLink": {
                "id": str(uuid.uuid4()),
                "projectId": demo_data.get('projectId'),
                "url": demo_data.get('url'),
                "type": demo_data.get('type', 'live-demo'),
                "title": demo_data.get('title'),
                "description": demo_data.get('description'),
                "thumbnail": demo_data.get('thumbnail'),
                "isActive": demo_data.get('isActive', True),
                "createdAt": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add demo link: {str(e)}")
