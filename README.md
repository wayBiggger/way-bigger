# Way Bigger - Project-Based Learning Platform

A platform where students learn by building real projects instead of just reading theory.

## 🚀 Features

- **Skill-Based Learning Paths**: Choose your field and skill level to get personalized project tracks
- **Progressive Difficulty**: Start with easier projects and gradually tackle harder ones
- **Portfolio Building**: Every completed project adds to your public profile
- **Collaboration Unlock**: Earn points to team up with other students on bigger projects
- **Built-in Mentorship**: Get helpful tips and resources while working
- **Community Projects**: Submit and build on project ideas from other students
- **Resume-Ready Profiles**: Showcase your skills with verified project badges

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: FastAPI with Python for robust APIs
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: OAuth (GitHub/Google) + JWT
- **Real-time**: WebSocket support for collaboration
- **Testing**: Docker-based sandbox for project submissions
- **AI Integration**: LLM-powered hints and review assistance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Docker and Docker Compose (recommended)
- Or PostgreSQL 14+ and Redis 7+ (manual setup)

### Option 1: Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# Backend will be available at http://localhost:8000
# Frontend will be available at http://localhost:3000
# PostgreSQL at localhost:5432
# Redis at localhost:6379
```

### Option 2: Manual Setup

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Database Setup
```bash
# Create database
createdb project_learning_platform

# Run migrations
cd backend
alembic upgrade head
```

## 📁 Project Structure

```
├── frontend/                 # Next.js frontend application
│   ├── components/          # Reusable UI components
│   ├── pages/              # Application pages
│   ├── hooks/              # Custom React hooks
│   └── styles/             # Tailwind CSS styles
├── backend/                 # FastAPI backend application
│   ├── app/                # Main application code
│   ├── models/             # Database models
│   ├── services/           # Business logic services
│   └── api/                # API endpoints
├── docs/                   # Documentation and specifications
└── docker/                 # Docker configuration files
```

## 🎯 MVP Roadmap

### Sprint 1: Foundations
- [x] Project structure setup
- [x] Backend API foundation (FastAPI)
- [x] Database models (User, Project, Track)
- [x] Authentication endpoints (signup/login)
- [x] Frontend landing page (Next.js)
- [x] Docker setup for development
- [x] User profiles and skill assessment (signup form)
- [x] Basic project listing and detail pages
- [x] Learning tracks and community features
- [ ] Submission pipeline (backend integration)

### Sprint 2: Core Features
- [ ] Project submission and testing
- [ ] Peer review system
- [ ] Scoring and points
- [ ] Portfolio pages

### Sprint 3: Collaboration
- [ ] Team formation
- [ ] Collaborative workspaces
- [ ] Real-time communication

### Sprint 4: Community
- [ ] Project idea submissions
- [ ] Admin moderation tools
- [ ] Public profiles and badges

## 🔧 Development

### Running Tests
```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
pytest
```

### Code Quality
```bash
# Frontend
npm run lint
npm run type-check

# Backend
black .
flake8 .
mypy .
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details


