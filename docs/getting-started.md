# LacrosseLens – Local Development Guide

This guide walks through running the LacrosseLens stack locally with the new Dockerised PostgreSQL instance and developer authentication helpers.

## 1. Prerequisites
- Node.js 20+
- npm 10+
- Docker Desktop / Docker Engine

## 2. Install dependencies
```bash
npm install
```

## 3. Configure environment variables
1. Copy the example env file.
   ```bash
   cp .env.example .env
   ```
2. Update values as needed. The defaults assume the Docker Postgres container and enable the developer authentication shim so you can get started without Replit OIDC credentials.

## 4. Start PostgreSQL
```bash
docker compose up database -d
```

## 5. Apply the database schema
```bash
npm run db:push
```

## 6. Run the app
For local development the API and client run as a single Express server.
```bash
npm run dev
```
The server listens on `http://localhost:5000` by default.

## 7. Production build
```bash
npm run build
npm run start
```

## 8. Troubleshooting
- **Database connection errors** – ensure `DATABASE_URL` in `.env` matches the Docker service credentials (`postgres://postgres:postgres@localhost:5432/lacrosselens`).
- **Authentication loops** – set `USE_DEV_AUTH=true` when running locally. For staging/production, provide valid Replit OIDC environment variables and set `USE_DEV_AUTH=false`.
- **Gemini API errors** – the AI processing pipeline requires a valid `GEMINI_API_KEY`. Without it, uploads will remain in `processing` state.

## 9. Next steps
- Configure hosted PostgreSQL (Neon) by setting `DATABASE_URL` accordingly and optionally `DATABASE_CLIENT=neon`.
- Replace the developer auth shim with Replit OIDC by supplying `REPL_ID` and `REPLIT_DOMAINS`, then setting `USE_DEV_AUTH=false`.
- Provision an object storage bucket for video uploads when deploying to production.
