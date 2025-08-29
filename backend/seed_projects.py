#!/usr/bin/env python3
"""
Script to seed the database with advanced projects across different domains
"""

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.project import Project, ProjectDifficulty, ProjectStatus
from app.models.entities import Field
from app.models import *  # Import all models to ensure tables are created

def seed_projects():
    db = SessionLocal()
    
    try:
        # Get field IDs for reference
        fields = {field.name: field.id for field in db.query(Field).all()}
        
        projects_data = [
            # AI & Machine Learning Projects
            {
                "title": "AI-Powered Content Recommendation Engine",
                "brief": "Build a sophisticated recommendation system using collaborative filtering and content-based approaches",
                "description": "Create an intelligent content recommendation engine that analyzes user behavior, content metadata, and engagement patterns to suggest personalized content. Implement both collaborative filtering and content-based recommendation algorithms, with A/B testing capabilities and real-time learning.",
                "difficulty": ProjectDifficulty.ADVANCED,
                "tags": ["Python", "Machine Learning", "Recommendation Systems", "TensorFlow", "Redis"],
                "required_skills": ["python", "machine-learning", "data-analysis"],
                "milestones": [
                    {"title": "Data Collection & Preprocessing", "description": "Set up data pipelines and clean user interaction data", "estimated_hours": 8},
                    {"title": "Algorithm Implementation", "description": "Implement collaborative filtering and content-based algorithms", "estimated_hours": 16},
                    {"title": "Model Training & Optimization", "description": "Train models and optimize hyperparameters", "estimated_hours": 12},
                    {"title": "API Development", "description": "Build RESTful API for recommendations", "estimated_hours": 10},
                    {"title": "A/B Testing Framework", "description": "Implement testing framework to measure performance", "estimated_hours": 8}
                ],
                "estimated_hours": 54,
                "max_team_size": 3,
                "is_community": False,
                "status": ProjectStatus.PUBLISHED
            },
            {
                "title": "Computer Vision Security System",
                "brief": "Develop an AI-powered security camera system with real-time threat detection",
                "description": "Build a comprehensive security system using computer vision to detect suspicious activities, unauthorized access, and potential threats in real-time. Implement object detection, facial recognition, and anomaly detection algorithms.",
                "difficulty": ProjectDifficulty.ADVANCED,
                "tags": ["Python", "Computer Vision", "OpenCV", "TensorFlow", "Security", "Real-time"],
                "required_skills": ["python", "computer-vision", "machine-learning"],
                "milestones": [
                    {"title": "Camera Integration", "description": "Set up video capture and preprocessing", "estimated_hours": 6},
                    {"title": "Object Detection Model", "description": "Implement YOLO or similar for object detection", "estimated_hours": 12},
                    {"title": "Facial Recognition", "description": "Add face detection and recognition capabilities", "estimated_hours": 10},
                    {"title": "Anomaly Detection", "description": "Implement behavior analysis and threat detection", "estimated_hours": 14},
                    {"title": "Alert System", "description": "Build notification and alert mechanisms", "estimated_hours": 8}
                ],
                "estimated_hours": 50,
                "max_team_size": 4,
                "is_community": False,
                "status": ProjectStatus.PUBLISHED
            },
            {
                "title": "Natural Language Processing Chatbot",
                "brief": "Create an intelligent chatbot using advanced NLP techniques",
                "description": "Develop a sophisticated chatbot that can understand context, handle complex queries, and provide meaningful responses. Implement intent recognition, entity extraction, sentiment analysis, and conversation flow management.",
                "difficulty": ProjectDifficulty.INTERMEDIATE,
                "tags": ["Python", "NLP", "Chatbot", "Transformers", "FastAPI"],
                "required_skills": ["python", "nlp", "api-development"],
                "milestones": [
                    {"title": "NLP Pipeline Setup", "description": "Set up tokenization, POS tagging, and NER", "estimated_hours": 8},
                    {"title": "Intent Recognition", "description": "Implement intent classification using BERT", "estimated_hours": 12},
                    {"title": "Response Generation", "description": "Build response generation using transformers", "estimated_hours": 10},
                    {"title": "Conversation Management", "description": "Add context tracking and conversation flow", "estimated_hours": 8},
                    {"title": "Integration & Testing", "description": "Deploy and test with real conversations", "estimated_hours": 6}
                ],
                "estimated_hours": 44,
                "max_team_size": 2,
                "is_community": False,
                "status": ProjectStatus.PUBLISHED
            },

            # Cybersecurity Projects
            {
                "title": "Network Intrusion Detection System",
                "brief": "Build an AI-powered network security monitoring system",
                "description": "Create a comprehensive network intrusion detection system that monitors network traffic, identifies suspicious patterns, and alerts administrators to potential security threats. Implement machine learning algorithms for anomaly detection and signature-based detection.",
                "difficulty": ProjectDifficulty.ADVANCED,
                "tags": ["Python", "Cybersecurity", "Network Security", "Machine Learning", "Snort"],
                "required_skills": ["python", "cybersecurity", "networking"],
                "milestones": [
                    {"title": "Network Traffic Capture", "description": "Set up packet capture and analysis", "estimated_hours": 10},
                    {"title": "Feature Extraction", "description": "Extract relevant features from network data", "estimated_hours": 8},
                    {"title": "ML Model Development", "description": "Train anomaly detection models", "estimated_hours": 12},
                    {"title": "Alert System", "description": "Build real-time alerting and reporting", "estimated_hours": 8},
                    {"title": "Dashboard & Monitoring", "description": "Create web interface for monitoring", "estimated_hours": 10}
                ],
                "estimated_hours": 48,
                "max_team_size": 3,
                "is_community": False,
                "status": ProjectStatus.PUBLISHED
            },
            {
                "title": "Web Application Security Scanner",
                "brief": "Develop an automated security vulnerability scanner for web applications",
                "description": "Build a comprehensive web application security scanner that can detect common vulnerabilities like SQL injection, XSS, CSRF, and insecure configurations. Include automated testing, detailed reporting, and remediation suggestions.",
                "difficulty": ProjectDifficulty.INTERMEDIATE,
                "tags": ["Python", "Web Security", "OWASP", "Automation", "Reporting"],
                "required_skills": ["python", "web-security", "automation"],
                "milestones": [
                    {"title": "Vulnerability Detection Engine", "description": "Implement core scanning algorithms", "estimated_hours": 12},
                    {"title": "Web Crawler", "description": "Build automated site discovery", "estimated_hours": 8},
                    {"title": "Test Cases", "description": "Create comprehensive test scenarios", "estimated_hours": 10},
                    {"title": "Reporting System", "description": "Generate detailed security reports", "estimated_hours": 6},
                    {"title": "Web Interface", "description": "Build user-friendly dashboard", "estimated_hours": 8}
                ],
                "estimated_hours": 44,
                "max_team_size": 2,
                "is_community": False,
                "status": ProjectStatus.PUBLISHED
            },

            # Web Development Projects
            {
                "title": "Real-time Collaborative Code Editor",
                "brief": "Build a Google Docs-style collaborative code editor with real-time features",
                "description": "Create a sophisticated collaborative code editor that allows multiple developers to work on the same code simultaneously. Implement operational transformation for conflict resolution, syntax highlighting, and real-time collaboration features.",
                "difficulty": ProjectDifficulty.ADVANCED,
                "tags": ["React", "Node.js", "WebSockets", "Operational Transform", "Monaco Editor"],
                "required_skills": ["javascript", "react", "websockets"],
                "milestones": [
                    {"title": "Editor Foundation", "description": "Set up Monaco editor with syntax highlighting", "estimated_hours": 8},
                    {"title": "Real-time Communication", "description": "Implement WebSocket-based collaboration", "estimated_hours": 12},
                    {"title": "Operational Transform", "description": "Add conflict resolution algorithms", "estimated_hours": 16},
                    {"title": "User Management", "description": "Add authentication and user presence", "estimated_hours": 8},
                    {"title": "File Management", "description": "Implement file saving and sharing", "estimated_hours": 6}
                ],
                "estimated_hours": 50,
                "max_team_size": 3,
                "is_community": False,
                "status": ProjectStatus.PUBLISHED
            },
            {
                "title": "Progressive Web App E-commerce Platform",
                "brief": "Create a modern PWA e-commerce platform with offline capabilities",
                "description": "Build a full-featured e-commerce platform as a Progressive Web App with offline functionality, push notifications, and native app-like experience. Include inventory management, payment processing, and analytics.",
                "difficulty": ProjectDifficulty.INTERMEDIATE,
                "tags": ["React", "PWA", "E-commerce", "Service Workers", "Payment API"],
                "required_skills": ["javascript", "react", "pwa"],
                "milestones": [
                    {"title": "PWA Foundation", "description": "Set up service workers and manifest", "estimated_hours": 8},
                    {"title": "Product Catalog", "description": "Build product listing and search", "estimated_hours": 10},
                    {"title": "Shopping Cart", "description": "Implement cart and checkout flow", "estimated_hours": 12},
                    {"title": "Payment Integration", "description": "Add secure payment processing", "estimated_hours": 8},
                    {"title": "Offline Support", "description": "Implement offline browsing and sync", "estimated_hours": 10}
                ],
                "estimated_hours": 48,
                "max_team_size": 3,
                "is_community": False,
                "status": ProjectStatus.PUBLISHED
            },

            # Mobile App Development Projects
            {
                "title": "AI-Powered Fitness Tracking App",
                "brief": "Develop a mobile app that uses AI to analyze workout form and provide personalized recommendations",
                "description": "Create a comprehensive fitness tracking app that uses computer vision to analyze workout form, provides personalized training plans, and tracks progress with AI-powered insights and recommendations.",
                "difficulty": ProjectDifficulty.ADVANCED,
                "tags": ["React Native", "AI", "Computer Vision", "Health", "Fitness"],
                "required_skills": ["javascript", "react-native", "ai"],
                "milestones": [
                    {"title": "Camera Integration", "description": "Set up video capture and processing", "estimated_hours": 8},
                    {"title": "Pose Detection", "description": "Implement pose estimation for form analysis", "estimated_hours": 12},
                    {"title": "Workout Tracking", "description": "Build exercise tracking and logging", "estimated_hours": 10},
                    {"title": "AI Recommendations", "description": "Add personalized training suggestions", "estimated_hours": 12},
                    {"title": "Progress Analytics", "description": "Create detailed progress tracking", "estimated_hours": 8}
                ],
                "estimated_hours": 50,
                "max_team_size": 3,
                "is_community": False,
                "status": ProjectStatus.PUBLISHED
            },
            {
                "title": "Augmented Reality Interior Design App",
                "brief": "Build an AR app that lets users visualize furniture and decor in their space",
                "description": "Create an augmented reality app that allows users to visualize furniture, paint colors, and decor items in their actual living spaces. Include 3D model rendering, room scanning, and social sharing features.",
                "difficulty": ProjectDifficulty.ADVANCED,
                "tags": ["React Native", "AR", "3D Graphics", "Interior Design", "ARKit/ARCore"],
                "required_skills": ["javascript", "react-native", "ar"],
                "milestones": [
                    {"title": "AR Foundation", "description": "Set up AR framework and camera", "estimated_hours": 10},
                    {"title": "3D Model Integration", "description": "Add furniture and decor models", "estimated_hours": 12},
                    {"title": "Room Scanning", "description": "Implement room detection and mapping", "estimated_hours": 14},
                    {"title": "Visualization Engine", "description": "Build AR rendering and placement", "estimated_hours": 12},
                    {"title": "Social Features", "description": "Add sharing and community features", "estimated_hours": 8}
                ],
                "estimated_hours": 56,
                "max_team_size": 4,
                "is_community": False,
                "status": ProjectStatus.PUBLISHED
            },

            # Creative Industry Projects
            {
                "title": "AI-Powered Music Composition Tool",
                "brief": "Create an AI system that generates original music compositions based on user preferences",
                "description": "Build an intelligent music composition tool that uses machine learning to generate original melodies, harmonies, and arrangements. Include genre-specific training, user preference learning, and export capabilities.",
                "difficulty": ProjectDifficulty.ADVANCED,
                "tags": ["Python", "AI", "Music", "Machine Learning", "Audio Processing"],
                "required_skills": ["python", "ai", "music"],
                "milestones": [
                    {"title": "Audio Processing", "description": "Set up audio input/output and processing", "estimated_hours": 10},
                    {"title": "Music Theory Engine", "description": "Implement music theory rules and constraints", "estimated_hours": 12},
                    {"title": "AI Model Training", "description": "Train models on music datasets", "estimated_hours": 16},
                    {"title": "Composition Engine", "description": "Build melody and harmony generation", "estimated_hours": 14},
                    {"title": "User Interface", "description": "Create intuitive composition interface", "estimated_hours": 8}
                ],
                "estimated_hours": 60,
                "max_team_size": 3,
                "is_community": False,
                "status": ProjectStatus.PUBLISHED
            },
            {
                "title": "Digital Art NFT Marketplace",
                "brief": "Develop a platform for artists to create, sell, and trade digital art as NFTs",
                "description": "Create a comprehensive NFT marketplace specifically designed for digital artists. Include minting tools, auction systems, royalty tracking, and social features for the creative community.",
                "difficulty": ProjectDifficulty.INTERMEDIATE,
                "tags": ["React", "Blockchain", "NFT", "Digital Art", "Web3"],
                "required_skills": ["javascript", "react", "blockchain"],
                "milestones": [
                    {"title": "Blockchain Integration", "description": "Set up smart contracts and wallet connection", "estimated_hours": 12},
                    {"title": "NFT Minting", "description": "Build tools for creating and minting NFTs", "estimated_hours": 10},
                    {"title": "Marketplace Features", "description": "Implement buying, selling, and auctioning", "estimated_hours": 14},
                    {"title": "Artist Profiles", "description": "Create artist portfolios and social features", "estimated_hours": 8},
                    {"title": "Royalty System", "description": "Implement automatic royalty distribution", "estimated_hours": 8}
                ],
                "estimated_hours": 52,
                "max_team_size": 4,
                "is_community": False,
                "status": ProjectStatus.PUBLISHED
            },
            {
                "title": "AI-Powered Video Editing Platform",
                "brief": "Build an intelligent video editing tool that automates common editing tasks",
                "description": "Create a sophisticated video editing platform that uses AI to automate scene detection, color correction, audio synchronization, and content-aware editing. Include professional-grade features and export options.",
                "difficulty": ProjectDifficulty.ADVANCED,
                "tags": ["Python", "AI", "Video Processing", "Computer Vision", "FFmpeg"],
                "required_skills": ["python", "ai", "video-processing"],
                "milestones": [
                    {"title": "Video Processing Engine", "description": "Set up video input/output and processing", "estimated_hours": 12},
                    {"title": "Scene Detection", "description": "Implement AI-powered scene analysis", "estimated_hours": 14},
                    {"title": "Auto-Editing Features", "description": "Build automated editing algorithms", "estimated_hours": 16},
                    {"title": "User Interface", "description": "Create professional editing interface", "estimated_hours": 12},
                    {"title": "Export & Rendering", "description": "Implement high-quality export options", "estimated_hours": 8}
                ],
                "estimated_hours": 62,
                "max_team_size": 4,
                "is_community": False,
                "status": ProjectStatus.PUBLISHED
            },
            {
                "title": "Virtual Reality Art Studio",
                "brief": "Create a VR application for digital artists to create 3D art and sculptures",
                "description": "Build a comprehensive VR art studio that allows artists to create 3D sculptures, paintings, and installations in virtual space. Include various tools, materials, and collaboration features.",
                "difficulty": ProjectDifficulty.ADVANCED,
                "tags": ["Unity", "VR", "3D Graphics", "Digital Art", "C#"],
                "required_skills": ["c-sharp", "unity", "vr"],
                "milestones": [
                    {"title": "VR Foundation", "description": "Set up VR environment and controllers", "estimated_hours": 10},
                    {"title": "3D Modeling Tools", "description": "Implement sculpting and modeling tools", "estimated_hours": 16},
                    {"title": "Material System", "description": "Create realistic materials and textures", "estimated_hours": 12},
                    {"title": "Collaboration Features", "description": "Add multi-user creation capabilities", "estimated_hours": 14},
                    {"title": "Export & Sharing", "description": "Implement 3D model export and sharing", "estimated_hours": 8}
                ],
                "estimated_hours": 60,
                "max_team_size": 4,
                "is_community": False,
                "status": ProjectStatus.PUBLISHED
            }
        ]
        
        for project_data in projects_data:
            project = Project(**project_data)
            db.add(project)
        
        db.commit()
        print(f"✅ Successfully seeded {len(projects_data)} advanced projects!")
        
    except Exception as e:
        print(f"❌ Error seeding projects: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)
    
    print("🌱 Seeding advanced projects...")
    seed_projects()
