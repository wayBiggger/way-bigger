#!/usr/bin/env python3
"""
Generate 750 innovative, industry-relevant projects that solve real problems
"""

import random
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.project import Project, ProjectDifficulty, ProjectStatus
from app.models.entities import Field
from app.models import *  # Import all models to ensure tables are created

# Industry problem categories with real-world applications
INDUSTRY_PROBLEMS = {
    "ecommerce": {
        "problems": [
            "Last-mile delivery optimization",
            "Dynamic pricing based on demand",
            "Fraud detection in transactions",
            "Inventory prediction and management",
            "Customer churn prediction",
            "Supply chain transparency",
            "Return logistics optimization",
            "Cross-border payment processing",
            "Real-time inventory tracking",
            "Personalized recommendation engines"
        ],
        "tech_stacks": ["Python", "Machine Learning", "Data Analytics", "APIs", "Cloud Computing"],
        "domains": ["web-dev", "ai-ml", "data-science"]
    },
    "healthcare": {
        "problems": [
            "Remote patient monitoring",
            "Drug interaction detection",
            "Medical image analysis",
            "Telemedicine platforms",
            "Electronic health records integration",
            "Predictive health analytics",
            "Medical device connectivity",
            "Health data privacy protection",
            "Clinical trial management",
            "Mental health tracking"
        ],
        "tech_stacks": ["Python", "IoT", "Machine Learning", "Security", "Mobile Development"],
        "domains": ["ai-ml", "mobile", "cybersecurity", "data-science"]
    },
    "finance": {
        "problems": [
            "Algorithmic trading systems",
            "Credit risk assessment",
            "Financial inclusion solutions",
            "Cryptocurrency trading platforms",
            "Regulatory compliance automation",
            "Real-time fraud detection",
            "Investment portfolio optimization",
            "Cross-border remittance",
            "Micro-lending platforms",
            "Insurance claim processing"
        ],
        "tech_stacks": ["Python", "Blockchain", "APIs", "Security", "Data Analytics"],
        "domains": ["web-dev", "ai-ml", "cybersecurity", "data-science"]
    },
    "agriculture": {
        "problems": [
            "Precision farming with IoT",
            "Crop disease detection",
            "Supply chain traceability",
            "Weather-based irrigation",
            "Soil quality monitoring",
            "Livestock health tracking",
            "Market price prediction",
            "Agricultural drone management",
            "Water usage optimization",
            "Organic certification tracking"
        ],
        "tech_stacks": ["IoT", "Machine Learning", "Mobile Development", "Data Analytics", "Cloud Computing"],
        "domains": ["ai-ml", "mobile", "data-science", "web-dev"]
    },
    "environment": {
        "problems": [
            "Carbon credit trading platform",
            "Waste management optimization",
            "Renewable energy monitoring",
            "Air quality prediction",
            "Water conservation systems",
            "Sustainable supply chain tracking",
            "Environmental impact assessment",
            "Green building management",
            "Biodiversity monitoring",
            "Climate change data visualization"
        ],
        "tech_stacks": ["Python", "IoT", "Data Analytics", "Blockchain", "Web Development"],
        "domains": ["web-dev", "ai-ml", "data-science", "mobile"]
    },
    "education": {
        "problems": [
            "Personalized learning paths",
            "Skill gap analysis",
            "Accessibility in online learning",
            "Plagiarism detection",
            "Student performance prediction",
            "Virtual reality learning",
            "Language learning with AI",
            "Educational content recommendation",
            "Learning analytics dashboard",
            "Remote exam proctoring"
        ],
        "tech_stacks": ["Python", "Machine Learning", "Web Development", "Mobile Development", "AR/VR"],
        "domains": ["web-dev", "ai-ml", "mobile", "creative-industry"]
    },
    "transportation": {
        "problems": [
            "Route optimization algorithms",
            "Autonomous vehicle simulation",
            "Smart traffic management",
            "Fleet management systems",
            "Public transport optimization",
            "Ride-sharing algorithms",
            "Parking space optimization",
            "Vehicle maintenance prediction",
            "Traffic congestion prediction",
            "Multi-modal transport planning"
        ],
        "tech_stacks": ["Python", "Machine Learning", "IoT", "Mobile Development", "Data Analytics"],
        "domains": ["ai-ml", "mobile", "data-science", "web-dev"]
    },
    "manufacturing": {
        "problems": [
            "Predictive maintenance systems",
            "Quality control automation",
            "Supply chain optimization",
            "Production line efficiency",
            "Worker safety monitoring",
            "Energy consumption optimization",
            "Product lifecycle management",
            "Real-time production monitoring",
            "Defect detection systems",
            "Smart factory integration"
        ],
        "tech_stacks": ["IoT", "Machine Learning", "Data Analytics", "Cloud Computing", "Security"],
        "domains": ["ai-ml", "data-science", "cybersecurity", "web-dev"]
    }
}

# Innovation approaches
INNOVATION_APPROACHES = [
    "Adapting {solution} for the {market} market",
    "Combining {tech1} and {tech2} to solve {problem}",
    "Building a {platform} that addresses {gap} in existing solutions",
    "Creating a {type} system that improves {process} efficiency",
    "Developing a {approach} to tackle {challenge} in {industry}",
    "Implementing {methodology} for better {outcome} in {sector}",
    "Designing a {solution} that bridges {gap} between {stakeholder1} and {stakeholder2}",
    "Building an {platform} that democratizes {service} for {target_audience}"
]

# Technology combinations for innovation
TECH_COMBINATIONS = [
    ("AI", "IoT", "real-time monitoring"),
    ("Blockchain", "IoT", "supply chain transparency"),
    ("Machine Learning", "Computer Vision", "automated quality control"),
    ("AR/VR", "Mobile", "immersive training"),
    ("Data Analytics", "Mobile", "personalized recommendations"),
    ("Cloud Computing", "IoT", "scalable monitoring"),
    ("Blockchain", "Mobile", "secure transactions"),
    ("AI", "Web", "intelligent automation")
]

def generate_project_title(industry, problem, approach):
    """Generate an innovative project title"""
    titles = [
        f"Smart{problem.replace(' ', '')} - {approach}",
        f"AI-Powered {problem} Solution",
        f"Next-Gen {problem} Platform",
        f"Intelligent {problem} System",
        f"Automated {problem} Management",
        f"Real-time {problem} Analytics",
        f"Predictive {problem} Engine",
        f"Smart {problem} Dashboard"
    ]
    return random.choice(titles)

def generate_brief(industry, problem, tech_stack):
    """Generate a compelling project brief"""
    briefs = [
        f"Build an innovative solution to address {problem} in the {industry} industry using {', '.join(tech_stack[:3])}.",
        f"Create a cutting-edge platform that solves {problem} through intelligent automation and data-driven insights.",
        f"Develop a comprehensive system that tackles {problem} using modern technology stack and industry best practices.",
        f"Design and implement a scalable solution for {problem} that can be adapted across different {industry} scenarios.",
        f"Build a smart application that addresses {problem} through innovative use of {tech_stack[0]} and {tech_stack[1]}."
    ]
    return random.choice(briefs)

def generate_description(industry, problem, tech_stack, difficulty):
    """Generate detailed project description"""
    base_description = f"""
This project addresses the critical challenge of {problem} in the {industry} industry. 
The solution leverages {', '.join(tech_stack[:3])} to create a comprehensive platform that can be deployed in real-world scenarios.

**Problem Statement:**
{problem} is a significant challenge facing {industry} companies today. Current solutions are often fragmented, expensive, or lack the scalability needed for modern business requirements.

**Solution Approach:**
The project will implement a {difficulty}-level solution using industry-standard technologies and methodologies. The system will be designed with scalability, security, and user experience as core principles.

**Key Features:**
- Real-time data processing and analytics
- Intuitive user interface and experience
- Scalable architecture for future growth
- Integration with existing industry tools
- Comprehensive testing and documentation

**Learning Outcomes:**
- Hands-on experience with {', '.join(tech_stack[:3])}
- Understanding of {industry} industry challenges
- Problem-solving and system design skills
- Industry best practices and standards
- Project management and documentation
"""
    return base_description.strip()

def generate_milestones(difficulty, tech_stack):
    """Generate project milestones based on difficulty"""
    if difficulty == "beginner":
        milestones = [
            {"title": "Project Setup & Planning", "description": "Set up development environment and create project structure", "estimated_hours": 4},
            {"title": "Core Functionality", "description": f"Implement basic features using {tech_stack[0]}", "estimated_hours": 12},
            {"title": "User Interface", "description": "Create responsive and intuitive user interface", "estimated_hours": 8},
            {"title": "Testing & Documentation", "description": "Write tests and comprehensive documentation", "estimated_hours": 6},
            {"title": "Deployment & Presentation", "description": "Deploy application and prepare presentation", "estimated_hours": 4}
        ]
    elif difficulty == "intermediate":
        milestones = [
            {"title": "Requirements Analysis", "description": "Analyze requirements and design system architecture", "estimated_hours": 8},
            {"title": "Backend Development", "description": f"Build robust backend using {', '.join(tech_stack[:2])}", "estimated_hours": 20},
            {"title": "Frontend Development", "description": "Create modern, responsive frontend interface", "estimated_hours": 16},
            {"title": "Integration & APIs", "description": "Integrate with external services and create APIs", "estimated_hours": 12},
            {"title": "Testing & Optimization", "description": "Comprehensive testing and performance optimization", "estimated_hours": 10},
            {"title": "Deployment & Monitoring", "description": "Deploy to cloud and implement monitoring", "estimated_hours": 8}
        ]
    else:  # advanced
        milestones = [
            {"title": "System Architecture Design", "description": "Design scalable, distributed system architecture", "estimated_hours": 16},
            {"title": "Core Algorithm Development", "description": f"Implement complex algorithms using {', '.join(tech_stack[:3])}", "estimated_hours": 32},
            {"title": "Microservices Implementation", "description": "Build and deploy microservices architecture", "estimated_hours": 24},
            {"title": "Data Pipeline & Analytics", "description": "Implement data processing and analytics pipeline", "estimated_hours": 20},
            {"title": "Security & Compliance", "description": "Implement security measures and compliance requirements", "estimated_hours": 16},
            {"title": "Performance Optimization", "description": "Optimize for high performance and scalability", "estimated_hours": 12},
            {"title": "Testing & Quality Assurance", "description": "Comprehensive testing and quality assurance", "estimated_hours": 16},
            {"title": "Deployment & DevOps", "description": "Implement CI/CD and production deployment", "estimated_hours": 12}
        ]
    
    return milestones

def generate_tech_stack(domain, industry_tech):
    """Generate appropriate tech stack based on domain and industry"""
    base_tech = {
        "web-dev": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "PostgreSQL"],
        "ai-ml": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Jupyter", "OpenCV"],
        "mobile": ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "Android Studio", "Xcode"],
        "data-science": ["Python", "R", "SQL", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Jupyter"],
        "cybersecurity": ["Python", "Docker", "Kubernetes", "OWASP", "Cryptography", "Network Security", "Penetration Testing"],
        "creative-industry": ["JavaScript", "Three.js", "WebGL", "Blender", "Unity", "Unreal Engine", "Adobe Creative Suite"]
    }
    
    # Combine domain-specific tech with industry-specific tech
    domain_tech = base_tech.get(domain, ["Python", "JavaScript", "HTML", "CSS"])
    combined_tech = list(set(domain_tech + industry_tech))
    
    # Select 4-6 technologies
    return random.sample(combined_tech, min(6, len(combined_tech)))

def generate_750_projects():
    """Generate 750 innovative projects"""
    db = SessionLocal()
    
    try:
        # Get field IDs
        fields = {field.name: field.id for field in db.query(Field).all()}
        
        projects_created = 0
        industries = list(INDUSTRY_PROBLEMS.keys())
        
        # Generate 750 projects
        for i in range(750):
            # Select random industry and problem
            industry = random.choice(industries)
            problem_data = INDUSTRY_PROBLEMS[industry]
            problem = random.choice(problem_data["problems"])
            domain = random.choice(problem_data["domains"])
            
            # Determine difficulty (250 each)
            if i < 250:
                difficulty = ProjectDifficulty.BEGINNER
            elif i < 500:
                difficulty = ProjectDifficulty.INTERMEDIATE
            else:
                difficulty = ProjectDifficulty.ADVANCED
            
            # Generate tech stack
            tech_stack = generate_tech_stack(domain, problem_data["tech_stacks"])
            
            # Generate project data
            title = generate_project_title(industry, problem, random.choice(INNOVATION_APPROACHES))
            brief = generate_brief(industry, problem, tech_stack)
            description = generate_description(industry, problem, tech_stack, difficulty.value)
            milestones = generate_milestones(difficulty.value, tech_stack)
            
            # Calculate estimated hours based on difficulty
            if difficulty == ProjectDifficulty.BEGINNER:
                estimated_hours = random.randint(8, 20)
                max_team_size = random.randint(1, 3)
            elif difficulty == ProjectDifficulty.INTERMEDIATE:
                estimated_hours = random.randint(20, 50)
                max_team_size = random.randint(2, 5)
            else:
                estimated_hours = random.randint(50, 120)
                max_team_size = random.randint(3, 8)
            
            # Create project
            project = Project(
                title=title,
                brief=brief,
                description=description,
                difficulty=difficulty,
                tags=tech_stack,
                required_skills=[skill.lower().replace(' ', '-') for skill in tech_stack[:5]],
                milestones=milestones,
                estimated_hours=estimated_hours,
                max_team_size=max_team_size,
                is_community=random.choice([True, False]),
                status=ProjectStatus.PUBLISHED
            )
            
            db.add(project)
            projects_created += 1
            
            # Commit every 50 projects
            if projects_created % 50 == 0:
                db.commit()
                print(f"Created {projects_created} projects...")
        
        # Final commit
        db.commit()
        print(f"✅ Successfully created {projects_created} innovative projects!")
        
        # Show distribution
        beginner_count = db.query(Project).filter(Project.difficulty == ProjectDifficulty.BEGINNER).count()
        intermediate_count = db.query(Project).filter(Project.difficulty == ProjectDifficulty.INTERMEDIATE).count()
        advanced_count = db.query(Project).filter(Project.difficulty == ProjectDifficulty.ADVANCED).count()
        
        print(f"\nProject Distribution:")
        print(f"- Beginner: {beginner_count}")
        print(f"- Intermediate: {intermediate_count}")
        print(f"- Advanced: {advanced_count}")
        print(f"- Total: {beginner_count + intermediate_count + advanced_count}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Generating 750 innovative, industry-relevant projects...")
    generate_750_projects()
