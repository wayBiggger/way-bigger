# WAY BIGGER API Documentation

## Overview

The WAY BIGGER API provides a comprehensive platform for learning, collaboration, and skill development. This documentation covers all integrated features and their endpoints.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Integrated Features API

### Dashboard

#### GET /integrated-features/dashboard

Get comprehensive user dashboard with all integrated features.

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "full_name": "string",
    "email": "string",
    "level": 5,
    "total_xp": 2500,
    "current_streak": 7,
    "unlocked_features": ["collaboration", "mentoring"]
  },
  "progress": {
    "level": 5,
    "total_xp": 2500,
    "current_streak": 7,
    "longest_streak": 15
  },
  "recent_badges": [
    {
      "id": "string",
      "name": "First Steps",
      "description": "Complete your first project",
      "icon": "🎯",
      "earned_date": "2024-01-01T00:00:00Z"
    }
  ],
  "active_collaborations": [
    {
      "id": "string",
      "name": "E-commerce Website",
      "description": "Build a full-stack e-commerce platform",
      "difficulty_level": "intermediate",
      "status": "active"
    }
  ],
  "mentorship_sessions": [
    {
      "id": "string",
      "title": "Code Review Session",
      "description": "Review your latest project",
      "session_type": "video_call",
      "scheduled_at": "2024-01-15T14:00:00Z",
      "status": "scheduled"
    }
  ],
  "unlocked_features": ["collaboration", "mentoring"],
  "level_progress": {
    "current_level": 5,
    "total_xp": 2500,
    "xp_to_next_level": 500,
    "percentage": 83.33
  }
}
```

### Feature Unlock System

#### POST /integrated-features/features/unlock

Unlock a new feature based on user progress.

**Request:**
```json
{
  "feature_name": "industry_challenges"
}
```

**Response:**
```json
{
  "message": "Feature 'industry_challenges' unlocked successfully!",
  "unlocked": true,
  "unlocked_features": ["collaboration", "mentoring", "industry_challenges"]
}
```

**Available Features:**
- `collaboration` - Real-time collaboration features (Level 3, 5 projects)
- `mentoring` - Access to mentorship system (Level 10, 15 projects)
- `industry_challenges` - Industry challenge participation (Level 5, 10 projects)
- `advanced_portfolio` - Advanced portfolio customization (Level 8, 12 projects)

#### GET /integrated-features/features/status

Get status of all features for the current user.

**Response:**
```json
{
  "features": {
    "collaboration": {
      "unlocked": true,
      "requirements": {
        "level": 3,
        "projects_completed": 5
      },
      "can_unlock": true
    },
    "mentoring": {
      "unlocked": false,
      "requirements": {
        "level": 10,
        "projects_completed": 15
      },
      "can_unlock": false
    }
  },
  "level": 5,
  "unlocked_features": ["collaboration"]
}
```

### Collaboration System

#### POST /integrated-features/collaboration/join

Join a collaboration project with gamification rewards.

**Request:**
```json
{
  "project_id": "string",
  "role": "contributor"
}
```

**Response:**
```json
{
  "message": "Successfully joined project 'E-commerce Website'!",
  "xp_earned": 50,
  "project": {
    "id": "string",
    "name": "E-commerce Website",
    "description": "Build a full-stack e-commerce platform",
    "role": "contributor"
  }
}
```

**Roles:**
- `owner` - Project creator with full control
- `admin` - Can manage participants and settings
- `contributor` - Can edit code and participate
- `viewer` - Read-only access

### Mentorship System

#### POST /integrated-features/mentorship/request

Request mentorship with AI-powered matching.

**Request:**
```json
{
  "mentor_id": "string",
  "context_type": "project_help",
  "context_data": {
    "project_id": "string",
    "specific_question": "How do I implement authentication?"
  }
}
```

**Response:**
```json
{
  "message": "Mentorship request submitted successfully!",
  "xp_earned": 25,
  "context_id": "string",
  "status": "pending"
}
```

**Context Types:**
- `project_help` - Help with specific project
- `career_guidance` - Career advice and planning
- `code_review` - Code review and feedback
- `learning_path` - Learning path recommendations

### Industry Challenges

#### POST /integrated-features/challenges/register

Register for industry challenge with progress tracking.

**Request:**
```json
{
  "challenge_id": "string",
  "team_id": "string"
}
```

**Response:**
```json
{
  "message": "Successfully registered for challenge 'AI-Powered E-commerce'!",
  "xp_earned": 100,
  "challenge": {
    "id": "string",
    "title": "AI-Powered E-commerce",
    "company": "TechCorp",
    "deadline": "2024-02-15T23:59:59Z"
  }
}
```

### Portfolio Generation

#### POST /integrated-features/portfolio/generate

Generate living portfolio with AI assistance.

**Request:**
```json
{
  "template_id": "developer-template",
  "is_public": true,
  "custom_domain": "myportfolio.waybigger.com"
}
```

**Response:**
```json
{
  "message": "Portfolio generation started!",
  "xp_earned": 75,
  "portfolio_id": "string",
  "status": "generating"
}
```

**Available Templates:**
- `developer` - Software developer portfolio
- `designer` - UI/UX designer portfolio
- `data_scientist` - Data science portfolio
- `full_stack` - Full-stack developer portfolio

## Gamification API

### User Progress

#### GET /gamification/progress/{user_id}

Get user progress and statistics.

**Response:**
```json
{
  "user_id": "string",
  "level": 5,
  "total_xp": 2500,
  "current_streak": 7,
  "longest_streak": 15,
  "skill_points": {
    "python": 100,
    "javascript": 80,
    "react": 60
  },
  "unlocked_features": ["collaboration", "mentoring"],
  "badges": [
    {
      "id": "string",
      "name": "First Steps",
      "description": "Complete your first project",
      "icon": "🎯",
      "earned_date": "2024-01-01T00:00:00Z"
    }
  ],
  "xp_transactions": [
    {
      "id": "string",
      "amount": 100,
      "source": "project_complete",
      "description": "Completed 'Hello World' project",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /gamification/xp/award

Award XP to user for completing actions.

**Request:**
```json
{
  "source": "project_complete",
  "amount": 100,
  "description": "Completed 'Hello World' project",
  "metadata": {
    "project_id": "string",
    "difficulty": "beginner"
  }
}
```

**Response:**
```json
{
  "message": "XP awarded successfully!",
  "xp_earned": 100,
  "new_total_xp": 2600,
  "level_up": true,
  "new_level": 6
}
```

**XP Sources:**
- `project_complete` - Complete a project
- `collaboration_join` - Join a collaboration
- `mentorship_request` - Request mentorship
- `challenge_registration` - Register for challenge
- `portfolio_generation` - Generate portfolio
- `daily_login` - Daily login streak
- `badge_earned` - Earn a badge

### Badges

#### GET /gamification/badges/{user_id}

Get user's earned badges.

**Response:**
```json
{
  "badges": [
    {
      "id": "string",
      "name": "First Steps",
      "description": "Complete your first project",
      "icon": "🎯",
      "category": "milestone",
      "rarity": "common",
      "earned_date": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Leaderboards

#### GET /gamification/leaderboard/{category}/{period}

Get leaderboard for specific category and period.

**Parameters:**
- `category`: `xp`, `badges`, `streak`, `projects`
- `period`: `daily`, `weekly`, `monthly`, `all_time`
- `limit`: Number of entries (default: 20)

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "string",
      "username": "string",
      "score": 5000,
      "level": 10
    }
  ],
  "period": "weekly",
  "category": "xp",
  "total_participants": 150
}
```

## Collaboration API

### Team Projects

#### GET /collaboration/projects

Get available team projects.

**Query Parameters:**
- `difficulty`: Filter by difficulty level
- `status`: Filter by project status
- `limit`: Number of projects to return

**Response:**
```json
{
  "projects": [
    {
      "id": "string",
      "name": "E-commerce Website",
      "description": "Build a full-stack e-commerce platform",
      "difficulty_level": "intermediate",
      "max_team_size": 5,
      "current_participants": 3,
      "status": "active",
      "created_by": "string",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25
}
```

#### POST /collaboration/projects

Create a new team project.

**Request:**
```json
{
  "name": "E-commerce Website",
  "description": "Build a full-stack e-commerce platform",
  "difficulty_level": "intermediate",
  "max_team_size": 5,
  "min_team_size": 2,
  "is_public": true
}
```

### Real-time Collaboration

#### WebSocket Connection

Connect to real-time collaboration:

```
ws://localhost:8001/ws/collaboration/{project_id}?token={jwt_token}
```

**Events:**
- `file_change` - File content changed
- `cursor_move` - Cursor position changed
- `user_join` - User joined project
- `user_leave` - User left project
- `chat_message` - New chat message

## Mentorship API

### Mentorship Contexts

#### GET /mentorship/contexts

Get user's mentorship contexts.

**Response:**
```json
{
  "contexts": [
    {
      "id": "string",
      "mentor_id": "string",
      "context_type": "project_help",
      "context_data": {
        "project_id": "string"
      },
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /mentorship/contexts

Create a new mentorship context.

**Request:**
```json
{
  "mentor_id": "string",
  "context_type": "project_help",
  "context_data": {
    "project_id": "string",
    "specific_question": "How do I implement authentication?"
  }
}
```

### Mentorship Sessions

#### GET /mentorship/sessions

Get user's mentorship sessions.

**Response:**
```json
{
  "sessions": [
    {
      "id": "string",
      "title": "Code Review Session",
      "description": "Review your latest project",
      "session_type": "video_call",
      "scheduled_at": "2024-01-15T14:00:00Z",
      "duration_minutes": 60,
      "status": "scheduled"
    }
  ]
}
```

## Portfolio API

### Portfolio Management

#### GET /portfolio/{user_id}

Get user's portfolio.

**Response:**
```json
{
  "id": "string",
  "user_id": "string",
  "template_id": "developer-template",
  "portfolio_data": {
    "user_info": {
      "name": "John Doe",
      "username": "johndoe",
      "bio": "Full-stack developer",
      "level": 5,
      "total_xp": 2500
    },
    "projects": [
      {
        "id": "string",
        "title": "E-commerce Website",
        "description": "Full-stack e-commerce platform",
        "technologies": ["React", "Node.js", "MongoDB"],
        "status": "completed"
      }
    ],
    "badges": [
      {
        "name": "First Steps",
        "description": "Complete your first project",
        "icon": "🎯"
      }
    ]
  },
  "is_public": true,
  "custom_domain": "johndoe.waybigger.com",
  "last_generated_at": "2024-01-01T00:00:00Z"
}
```

#### POST /portfolio/generate

Generate or update portfolio.

**Request:**
```json
{
  "template_id": "developer-template",
  "is_public": true,
  "custom_domain": "myportfolio.waybigger.com"
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error Type",
  "detail": "Detailed error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Feature not unlocked)
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Validation Errors

```json
{
  "error": "Validation Error",
  "detail": "Request validation failed",
  "field_errors": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters"]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- Authentication endpoints: 5 requests per minute
- General API endpoints: 100 requests per minute
- File upload endpoints: 10 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

WAY BIGGER supports webhooks for real-time notifications:

### Webhook Events

- `user.level_up` - User leveled up
- `user.badge_earned` - User earned a badge
- `project.completed` - Project completed
- `collaboration.joined` - User joined collaboration
- `mentorship.session_scheduled` - Mentorship session scheduled

### Webhook Payload

```json
{
  "event": "user.level_up",
  "data": {
    "user_id": "string",
    "old_level": 4,
    "new_level": 5,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @waybigger/api-client
```

```javascript
import { WayBiggerAPI } from '@waybigger/api-client';

const api = new WayBiggerAPI({
  baseURL: 'http://localhost:8000/api/v1',
  token: 'your-jwt-token'
});

// Get user dashboard
const dashboard = await api.dashboard.get();

// Join collaboration
await api.collaboration.join({
  project_id: 'project-123',
  role: 'contributor'
});
```

### Python

```bash
pip install waybigger-api
```

```python
from waybigger_api import WayBiggerAPI

api = WayBiggerAPI(
    base_url='http://localhost:8000/api/v1',
    token='your-jwt-token'
)

# Get user dashboard
dashboard = api.dashboard.get()

# Join collaboration
api.collaboration.join(
    project_id='project-123',
    role='contributor'
)
```

## Changelog

### Version 1.0.0 (2024-01-01)

- Initial release with integrated features
- Dashboard with gamification
- Collaboration system
- Mentorship system
- Industry challenges
- Portfolio generation
- Real-time WebSocket support

## Support

For API support and questions:

- Email: api-support@waybigger.com
- Documentation: https://docs.waybigger.com
- GitHub Issues: https://github.com/waybigger/api/issues
