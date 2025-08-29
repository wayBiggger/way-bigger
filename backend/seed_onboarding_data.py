#!/usr/bin/env python3
"""
Script to seed the database with initial fields and proficiency levels for onboarding
"""

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.entities import Field, ProficiencyLevel
from app.models import *  # Import all models to ensure tables are created

def seed_fields_and_levels():
    db = SessionLocal()
    
    try:
        # Create fields
        fields_data = [
            {
                "name": "web-dev",
                "display_name": "Web Development",
                "description": "Build modern websites and web applications using HTML, CSS, JavaScript, and popular frameworks.",
                "icon": "🌐"
            },
            {
                "name": "ai-ml",
                "display_name": "AI & Machine Learning",
                "description": "Create intelligent systems, machine learning models, and AI-powered applications.",
                "icon": "🤖"
            },
            {
                "name": "mobile",
                "display_name": "Mobile Development",
                "description": "Develop mobile applications for iOS and Android platforms.",
                "icon": "📱"
            },
            {
                "name": "data-science",
                "display_name": "Data Science",
                "description": "Analyze data, create visualizations, and build predictive models.",
                "icon": "📊"
            },
            {
                "name": "cybersecurity",
                "display_name": "Cybersecurity",
                "description": "Learn about security, ethical hacking, and protecting digital systems.",
                "icon": "🔒"
            },
            {
                "name": "creative-industry",
                "display_name": "Creative Industry",
                "description": "Explore digital art, animation, and creative software.",
                "icon": "🎨"
            }
        ]
        
        for field_data in fields_data:
            field = Field(**field_data)
            db.add(field)
        
        db.commit()
        
        # Get the created fields to create proficiency levels
        fields = db.query(Field).all()
        
        # Create proficiency levels for each field
        for field in fields:
            field_name = str(field.name)
            levels_data = []
            
            if field_name == "web-dev":
                levels_data = [
                    {
                        "field_id": field.id,
                        "level": "beginner",
                        "display_name": "Beginner",
                        "description": "New to web development? Start here! Learn HTML, CSS basics, and create your first webpage. Perfect for those with no prior coding experience.",
                        "estimated_weeks": 4
                    },
                    {
                        "field_id": field.id,
                        "level": "intermediate",
                        "display_name": "Intermediate",
                        "description": "Ready to build dynamic websites? Master JavaScript, responsive design, and popular frameworks like React or Vue.js.",
                        "estimated_weeks": 8
                    },
                    {
                        "field_id": field.id,
                        "level": "advanced",
                        "display_name": "Advanced",
                        "description": "Build full-stack applications! Learn backend development, databases, APIs, and deployment strategies.",
                        "estimated_weeks": 12
                    }
                ]
            elif field_name == "ai-ml":
                levels_data = [
                    {
                        "field_id": field.id,
                        "level": "beginner",
                        "display_name": "Beginner",
                        "description": "Start your AI journey! Learn Python basics, data manipulation, and simple machine learning concepts.",
                        "estimated_weeks": 6
                    },
                    {
                        "field_id": field.id,
                        "level": "intermediate",
                        "display_name": "Intermediate",
                        "description": "Dive deeper into ML! Master algorithms, neural networks, and build your first AI models.",
                        "estimated_weeks": 10
                    },
                    {
                        "field_id": field.id,
                        "level": "advanced",
                        "display_name": "Advanced",
                        "description": "Create cutting-edge AI! Work with deep learning, NLP, computer vision, and deploy production models.",
                        "estimated_weeks": 16
                    }
                ]
            elif field_name == "mobile":
                levels_data = [
                    {
                        "field_id": field.id,
                        "level": "beginner",
                        "display_name": "Beginner",
                        "description": "Start mobile development! Learn app design principles, basic UI/UX, and create simple mobile apps.",
                        "estimated_weeks": 6
                    },
                    {
                        "field_id": field.id,
                        "level": "intermediate",
                        "display_name": "Intermediate",
                        "description": "Build real mobile apps! Master native development, cross-platform tools, and app store deployment.",
                        "estimated_weeks": 10
                    },
                    {
                        "field_id": field.id,
                        "level": "advanced",
                        "display_name": "Advanced",
                        "description": "Create complex mobile solutions! Work with advanced APIs, performance optimization, and enterprise features.",
                        "estimated_weeks": 14
                    }
                ]
            elif field_name == "data-science":
                levels_data = [
                    {
                        "field_id": field.id,
                        "level": "beginner",
                        "display_name": "Beginner",
                        "description": "Start your data journey! Learn Python, pandas, data cleaning, and basic statistical analysis.",
                        "estimated_weeks": 5
                    },
                    {
                        "field_id": field.id,
                        "level": "intermediate",
                        "display_name": "Intermediate",
                        "description": "Analyze real data! Master data visualization, statistical modeling, and exploratory data analysis.",
                        "estimated_weeks": 8
                    },
                    {
                        "field_id": field.id,
                        "level": "advanced",
                        "display_name": "Advanced",
                        "description": "Build data products! Work with big data, advanced analytics, and create data-driven applications.",
                        "estimated_weeks": 12
                    }
                ]
            elif field_name == "cybersecurity":
                levels_data = [
                    {
                        "field_id": field.id,
                        "level": "beginner",
                        "display_name": "Beginner",
                        "description": "Start your security journey! Learn networking basics, security fundamentals, and ethical hacking principles.",
                        "estimated_weeks": 6
                    },
                    {
                        "field_id": field.id,
                        "level": "intermediate",
                        "display_name": "Intermediate",
                        "description": "Practice security! Master penetration testing, vulnerability assessment, and security tools.",
                        "estimated_weeks": 10
                    },
                    {
                        "field_id": field.id,
                        "level": "advanced",
                        "display_name": "Advanced",
                        "description": "Become a security expert! Work with advanced threats, incident response, and security architecture.",
                        "estimated_weeks": 14
                    }
                ]
            elif field_name == "creative-industry":
                levels_data = [
                    {
                        "field_id": field.id,
                        "level": "beginner",
                        "display_name": "Beginner",
                        "description": "Start your creative journey! Learn digital art tools, basic animation, and creative software fundamentals.",
                        "estimated_weeks": 6
                    },
                    {
                        "field_id": field.id,
                        "level": "intermediate",
                        "display_name": "Intermediate",
                        "description": "Create amazing content! Master advanced creative tools, 3D modeling, and interactive media.",
                        "estimated_weeks": 10
                    },
                    {
                        "field_id": field.id,
                        "level": "advanced",
                        "display_name": "Advanced",
                        "description": "Push creative boundaries! Work with AI-powered tools, VR/AR, and cutting-edge creative technologies.",
                        "estimated_weeks": 14
                    }
                ]
            
            for level_data in levels_data:
                level = ProficiencyLevel(**level_data)
                db.add(level)
        
        db.commit()
        print("✅ Successfully seeded fields and proficiency levels!")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)
    
    print("🌱 Seeding onboarding data...")
    seed_fields_and_levels()
