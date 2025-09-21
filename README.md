# Project Learning Platform

A full-stack platform where students learn by building real projects. Built with FastAPI (backend) and Next.js (frontend).

## 🏗️ Architecture

- **Backend**: FastAPI with PostgreSQL and Redis
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT-based auth system
- **Containerization**: Docker Compose for easy setup

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development, optional)

### Option 1: Full Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/wayBiggger/way-bigger
   cd demo
   ```

2. **Start all services**
   ```bash
   docker compose up --build
   ```

3. **Access the application**
   - Backend API: http://localhost:8000
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

### Option 2: Mixed Setup (Backend in Docker, Frontend locally)

1. **Start backend services only**
   ```bash
   docker compose up postgres redis backend
   ```

2. **Start frontend locally**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📁 Project Structure

```
demo/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/v1/         # API endpoints
│   │   ├── core/           # Configuration, database, security
│   │   ├── models/         # Database models
│   │   └── schemas/        # Pydantic schemas
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # FastAPI application entry point
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   └── components/    # React components
│   └── package.json       # Node.js dependencies
├── docker-compose.yml      # Docker services configuration
└── .gitignore             # Git ignore rules
```

## 🔧 Development

### Backend Development

The backend automatically creates database tables on startup for development. In production, use Alembic migrations.

**Key endpoints:**
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/users` - List users
- `GET /api/v1/projects` - List projects
- `GET /api/v1/tracks` - List learning tracks

### Frontend Development

The frontend connects to the backend via environment variables.

**Environment setup:**
```bash
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

**Key features:**
- Dark/light theme support
- Responsive design with Tailwind CSS
- Form validation and error handling
- JWT token storage for authentication

## 🐳 Docker Services

- **postgres**: PostgreSQL 15 database
- **redis**: Redis 7 cache
- **backend**: FastAPI application with auto-reload

## 📝 Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/project_learning_platform
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-change-in-production
DEBUG=true
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔒 Security Notes

- Change default database passwords in production
- Use strong SECRET_KEY for JWT tokens
- Enable HTTPS in production
- Implement rate limiting for production use

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with Docker
4. Submit a pull request

## 📋 TODO

- [ ] Add user profile management
- [ ] Implement project submission system
- [ ] Add review and feedback system
- [ ] Create learning track progression
- [ ] Add team collaboration features
- [ ] Implement file upload system
- [ ] Add email verification
- [ ] Create admin dashboard

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 8000, 3000, 5432, and 6379 are available
2. **Database connection**: Wait for PostgreSQL to be healthy before starting backend
3. **Frontend not connecting**: Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

### Reset Everything
```bash
docker compose down -v
docker compose up --build
```

## 📄 License

[MIT license]


