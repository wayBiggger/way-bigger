# Node Backend for Project Generation

Run an Express API that generates monthly student project ideas using Gemini Pro, checks originality via embeddings + Pinecone, stores in Postgres, and exposes a GET endpoint by level.

## Setup
1. Copy `.env.example` to `.env` and fill values.
2. Install deps:
```bash
npm install
```
3. Start dev server:
```bash
npm run dev
```

## Endpoints
- GET `/projects/:level` → active projects for the level.

## Cron
- Runs monthly at 00:00 on the 1st to refresh projects.


