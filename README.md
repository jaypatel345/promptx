# PromptX

> Backend-driven AI prompt enhancement platform with asynchronous processing, JWT authentication, Redis-backed queues, MongoDB conversations, and Supabase/PostgreSQL prompt history persistence.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=fff)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=fff)](https://mongoosejs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=fff)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?logo=redis&logoColor=fff)](https://bullmq.io/)
[![Jest](https://img.shields.io/badge/Jest-Supertest-C21325?logo=jest&logoColor=fff)](https://jestjs.io/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=fff)](https://www.docker.com/)

**Live Demo:** [https://promptx.co.in](https://promptx.co.in)  
**GitHub:** [https://github.com/jaypatel345/promptx](https://github.com/jaypatel345/promptx)

---

## Overview

PromptX helps users turn rough, vague, or under-specified prompts into clearer AI-ready instructions. It is built as a full-stack application with a Next.js frontend and a production-oriented Express backend that separates routing, controllers, services, repositories, models, workers, and infrastructure integrations.

The project exists because most AI quality problems start before the model responds: users often provide too little context, unclear constraints, or unstructured intent. PromptX improves that first mile by accepting user messages, storing conversations, enqueueing AI enhancement jobs, generating optimized prompts through a Groq-compatible OpenAI client, and saving prompt history for analytics.

PromptX is useful for developers, creators, students, teams, and AI product builders who want repeatable prompt quality without manually rewriting every request.

---

## Key Features

- **AI prompt enhancement:** Converts user input into clearer, more specific prompts using Groq's OpenAI-compatible chat/completions API.
- **Conversation system:** Supports guest and authenticated conversations with create, list, rename, delete, pin, and message fetch flows.
- **Asynchronous AI processing:** Chat requests create durable AI job records in MongoDB and enqueue background work through BullMQ.
- **BullMQ worker:** Dedicated worker consumes `ai-jobs`, calls the AI enhancement service, writes assistant messages, updates job status, and persists prompt history.
- **Authentication:** Email/password signup and login, Google OAuth callback flow, JWT access tokens, refresh tokens, logout, and email verification endpoints.
- **Refresh token persistence:** Refresh tokens are stored in MongoDB with TTL-backed expiry.
- **Protected and guest-aware routes:** `optionalAuth` supports both logged-in users and guest sessions for chat/conversation flows; `protect` middleware is available for strict JWT protection.
- **MongoDB persistence:** Users, tokens, conversations, messages, and AI job state are modeled with Mongoose.
- **PostgreSQL integration:** Supabase/PostgreSQL connection pool stores prompt history and includes service methods for usage logging.
- **Redis integration:** Redis client and cache helpers are implemented with ioredis; BullMQ uses Redis for queue coordination.
- **Bull Board dashboard:** Queue monitoring UI is mounted at `/admin/queues`.
- **Validation:** Zod validation is implemented for the `/api/ask` assistant route, with additional service-level validation across auth, chat, messages, and conversations.
- **Centralized errors:** Async handler, custom `ApiError`, Mongoose/JWT error normalization, and global error middleware provide consistent API failures.
- **Structured logging:** Pino and pino-http provide request logging, request IDs, status-aware log levels, and service/worker event logs.
- **Health checks:** `/health` reports MongoDB, PostgreSQL, Redis, uptime, environment, and request ID.
- **Testing:** Jest 30 and Supertest cover unit, integration, and API-level auth behavior.
- **CI/CD:** GitHub Actions installs backend dependencies, runs server tests on pushes/PRs, and triggers Render deployment from `main`.
- **Dockerization:** Backend Dockerfile and development/production compose files are included for containerized server deployment.
- **SEO-ready frontend:** Next.js app router, sitemap generation, robots.txt, metadata helpers, and public assets are included.

> Note: A rate-limiting middleware and full RBAC authorization layer are not currently implemented. The user model includes `isAdmin`, but there is no admin authorization middleware yet.

---

## Architecture

```mermaid
flowchart TD
  User[User / Browser] --> Client[Next.js 16 Client<br/>React 19 + Tailwind CSS]
  Client -->|REST + cookies| API[Express 5 API<br/>server/app.js]

  API --> Middleware[Middleware<br/>CORS, cookies, request IDs, pino logs, optional JWT auth]
  Middleware --> Routes[Routes<br/>auth, user, chat, conversations, messages, ask, team, health, queues]
  Routes --> Controllers[Controllers]
  Controllers --> Services[Services<br/>auth, chat, AI, messages, conversations, Redis, PostgreSQL]
  Services --> Repositories[Repositories]

  Repositories --> Mongo[(MongoDB / Mongoose<br/>users, tokens, conversations, messages, ai jobs)]
  Services --> Redis[(Redis / ioredis)]
  Services --> Postgres[(Supabase PostgreSQL<br/>prompt_history, usage log service)]

  Services --> Queue[BullMQ Queue<br/>ai-jobs]
  Queue --> Worker[AI Worker<br/>server/src/workers/ai.worker.js]
  Worker --> Groq[Groq API<br/>OpenAI-compatible client]
  Worker --> Mongo
  Worker --> Postgres

  API --> BullBoard[Bull Board<br/>/admin/queues]
  API --> Health[/health]
```

### Main Request Flow

1. The frontend creates or selects a conversation.
2. `POST /api/chat/send` validates the conversation and saves the user's message in MongoDB.
3. The API creates an `AIjob` document with `pending` status.
4. The API enqueues `process-ai-job` into BullMQ.
5. The worker marks the job `processing`, loads the user message, calls the AI enhancement service, saves the assistant response, stores prompt history in PostgreSQL, and marks the job `completed`.
6. The frontend fetches messages with `GET /api/messages/:conversationId`.

---

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Axios, Framer Motion, Lenis, next-sitemap |
| Backend | Node.js 20, Express 5, JavaScript ESM, cookie-parser, cors, multer |
| Authentication | JWT, bcryptjs, HTTP-only cookies, Google OAuth, refresh token storage |
| AI | Groq API via OpenAI-compatible SDK/client, node-fetch |
| Databases | MongoDB with Mongoose, Supabase/PostgreSQL with `pg` |
| Queue & Cache | Redis, ioredis, BullMQ, Bull Board |
| Logging & Observability | Pino, pino-http, request IDs, `/health` service checks |
| Validation & Errors | Zod, custom `ApiError`, async handler, centralized error middleware |
| Testing | Jest 30, Supertest, mongodb-memory-server dependency, unit/integration/API tests |
| DevOps | Docker, Docker Compose files, GitHub Actions, Render deploy hook, Vercel-compatible frontend |

---

## Project Structure

```text
promptx/
├── client/
│   ├── app/
│   │   ├── AITools/
│   │   ├── Engineering/
│   │   ├── Enhancer/
│   │   ├── Learn/
│   │   ├── Pricing/
│   │   ├── Signup/
│   │   ├── Teams/
│   │   ├── Templates/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── enhancer/
│   │   ├── home/
│   │   └── signup/
│   ├── context/
│   ├── lib/
│   ├── public/
│   ├── next.config.ts
│   ├── next-sitemap.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── env.js
│   │   │   ├── logger.js
│   │   │   ├── postgres.js
│   │   │   └── redis.js
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── lib/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── queues/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── tests/
│   │   │   ├── api/
│   │   │   ├── integration/
│   │   │   └── unit/
│   │   ├── utils/
│   │   ├── workers/
│   │   └── server.js
│   ├── app.js
│   ├── dockerfile
│   ├── jest.config.js
│   └── package.json
├── .github/
│   └── workflows/
│       └── test.yml
├── docker-compose.yml
├── docker-compose.prod.yaml
├── package.json
└── README.md
```

There is no dedicated `validators/` directory at the moment. Validation currently lives inside services/controllers, with Zod used in `ask.service.js`.

---

## API Overview

Default backend port: `1571`  
Base URL locally: `http://localhost:1571`

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Register a credentials user and send a verification email when email is enabled. |
| `POST` | `/api/auth/login` | Login with email/password, set HTTP-only access and refresh token cookies. |
| `POST` | `/api/auth/logout` | Clear auth cookies. |
| `GET` | `/api/auth/google` | Redirect to Google OAuth consent. |
| `GET` | `/api/auth/google/callback` | Exchange Google auth code, create/update user, set cookies, redirect to the frontend. |
| `POST` | `/api/auth/verify-email` | Verify a user from a verification token. |
| `POST` | `/api/auth/refresh-token` | Issue a new access token from a valid refresh token cookie. |
| `POST` | `/api/v1/auth/*` | Versioned alias for the same auth routes. |

### User

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/user/me` | Return the current cookie-authenticated user or a guest response. |

### Conversations

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/conversations` | Create a conversation for an authenticated user or `guestId`. |
| `GET` | `/api/conversations?guestId=...` | List conversations for the authenticated user or guest. |
| `DELETE` | `/api/conversations/:id` | Delete a conversation scoped to user or guest. |
| `PATCH` | `/api/conversations/:id/title` | Rename a conversation. |
| `PATCH` | `/api/conversations/:id/pin` | Pin or unpin a conversation. |

### Chat & Messages

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/chat/send` | Save a user message, create an AI job, and enqueue background enhancement. Supports multipart uploads through multer. |
| `GET` | `/api/messages/:conversationId?guestId=...` | Fetch up to 50 ordered messages for a conversation. |

Example chat request:

```json
{
  "conversationId": "66f000000000000000000000",
  "content": "Explain Kubernetes like I am new to backend engineering"
}
```

Example chat response:

```json
{
  "success": true,
  "data": {
    "userMessage": {
      "_id": "66f000000000000000000001",
      "conversationId": "66f000000000000000000000",
      "role": "user",
      "content": "Explain Kubernetes like I am new to backend engineering"
    },
    "aiJobId": "66f000000000000000000002"
  }
}
```

### Site Assistant, Team Search, Health, and Queues

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/ask` | RAG-style PromptX website assistant using local site knowledge and Groq. |
| `GET` | `/api/search?q=...` | Search team data. |
| `GET` | `/api/test-cache` | Redis cache smoke-test route. |
| `GET` | `/health` | Health check for MongoDB, PostgreSQL, Redis, uptime, environment, and request ID. |
| `GET` | `/admin/queues` | Bull Board dashboard for the `ai-jobs` queue. |

---

## Security Features

- **JWT access tokens:** 15-minute access tokens signed with `ACCESSTOKEN_SECRET`.
- **Refresh tokens:** 7-day refresh tokens signed with `REFRESHTOKEN_SECRET` and stored in MongoDB.
- **HTTP-only cookies:** Auth cookies are HTTP-only, `secure` in production, and use `sameSite: none` in production for cross-site deployments.
- **Password hashing:** Credentials passwords are hashed with bcryptjs.
- **Google OAuth:** OAuth code exchange creates or links Google users and stores verified profiles.
- **Guest-aware access:** Conversation and message queries scope data by authenticated `userId` or explicit `guestId`.
- **Input validation:** Zod validation for `/api/ask`; service-level required-field and ObjectId validation for core chat/conversation/message flows.
- **Centralized error handling:** JWT, Mongoose CastError, duplicate key, and validation errors are normalized.
- **CORS allowlist:** Localhost, production PromptX domains, configured environment origins, LAN development URLs, and Vercel preview URLs are handled.
- **RBAC status:** The `User` model has an `isAdmin` field, but route-level RBAC is not currently implemented.
- **Rate limiting status:** No rate-limiting middleware is currently implemented.

---

## Performance Optimizations

- **Background processing:** AI enhancement is moved out of the request-response path through BullMQ jobs.
- **Durable job state:** AI jobs are persisted in MongoDB with `pending`, `processing`, `completed`, and `failed` states.
- **Redis-backed queueing:** BullMQ coordinates asynchronous work through Redis.
- **Redis cache helpers:** `setCache`, `getCache`, and `delCache` are available for TTL-based JSON caching.
- **Database indexes:** MongoDB schemas include indexes for users, tokens, conversation sorting, and message retrieval.
- **Connection pooling:** PostgreSQL uses a reusable `pg` pool with max connections, idle timeout, SSL, and connection timeout configuration.
- **Message fetch limit:** Conversation messages are sorted and capped at 50 records per fetch.
- **Request logging:** Structured logs include request IDs, status-aware levels, and worker event metadata for debugging production latency/failures.

---

## Testing

The backend test suite uses Jest with ESM support and Supertest.

```bash
cd server
npm test
```

Implemented tests include:

- Unit tests for auth controller signup behavior.
- Integration tests for auth registration flow.
- API tests for signup, duplicate user handling, password omission, and invalid login behavior.
- CI-safe behavior: tests that require `MONGO_URI_TEST` are skipped when the variable is absent.

Relevant files:

- `server/jest.config.js`
- `server/src/tests/jest.setup.js`
- `server/src/tests/unit/auth.test.js`
- `server/src/tests/integration/auth.integration.test.js`
- `server/src/tests/api/auth.api.test.js`

---

## DevOps

### Docker

The backend includes a Node 20 Alpine Dockerfile:

```bash
cd server
docker build -f dockerfile -t promptx-server .
docker run --env-file .env.development -p 1571:1571 promptx-server
```

Development and production compose files are present at the repository root:

- `docker-compose.yml`
- `docker-compose.prod.yaml`

These files are intended to run the server with Redis. Review/fix Redis service indentation before relying on Docker Compose in production.

### GitHub Actions CI/CD

`.github/workflows/test.yml` runs on:

- pushes to `dev`, `main`, and `feature/*`
- pull requests

Pipeline behavior:

1. Detects the server directory.
2. Sets up Node.js 20.
3. Runs `npm ci` in `server`.
4. Runs `npm test`.
5. On successful `main` builds, triggers deployment through `RENDER_DEPLOY_HOOK`.

---

## Installation

### Prerequisites

- Node.js 20+
- npm
- MongoDB connection string
- Supabase/PostgreSQL connection string
- Redis server for BullMQ and cache behavior
- Groq API key for AI enhancement
- SMTP credentials for email verification, unless `DISABLE_EMAIL=true`

### 1. Clone the Repository

```bash
git clone https://github.com/jaypatel345/promptx.git
cd promptx
```

### 2. Configure Backend Environment

Create `server/.env.development`:

```env
NODE_ENV=development
PORT=1571

MONGODB_URI=mongodb+srv://user:password@cluster.example.mongodb.net/promptx
SUPABASE_DB_URL=postgresql://user:password@host:5432/postgres
REDIS_URL=redis://127.0.0.1:6379

ACCESSTOKEN_SECRET=replace_with_access_token_secret
REFRESHTOKEN_SECRET=replace_with_refresh_token_secret

GROQ_API_KEY=replace_with_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
SERVER_URL=http://localhost:1571
DOMAIN=http://localhost:3000

GOOGLE_CLIENT_ID=replace_with_google_client_id
GOOGLE_CLIENT_SECRET=replace_with_google_client_secret

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=replace_with_smtp_user
SMTP_PASS=replace_with_smtp_password
EMAIL_FROM=no-reply@promptx.co.in
DISABLE_EMAIL=false

LOG_LEVEL=info
POSTGRES_REQUIRED=0
```

### 3. Configure Frontend Environment

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:1571/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
API_PROXY_TARGET=http://localhost:1571
```

The frontend API helper also supports `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API`, and `API`.

### 4. Install and Run the Backend API

```bash
cd server
npm install
npm run dev
```

The API runs on `http://localhost:1571`.

### 5. Run the BullMQ Worker

In a second terminal:

```bash
cd server
npm run worker
```

### 6. Install and Run the Frontend

In a third terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

---

## Environment Variables

### Backend

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Yes | Runtime mode: `development`, `production`, or `test`. |
| `PORT` | No | Backend port. Defaults to `1571`. |
| `MONGODB_URI` | Yes | MongoDB connection string for app data. |
| `MONGO_URI_TEST` | Test only | MongoDB connection string for integration/API tests. |
| `SUPABASE_DB_URL` | Yes | PostgreSQL connection string used by the `pg` pool. |
| `REDIS_URL` | Recommended | Redis connection string for cache helpers. BullMQ worker currently defaults to `127.0.0.1:6379`. |
| `ACCESSTOKEN_SECRET` | Yes | JWT access token signing secret. |
| `REFRESHTOKEN_SECRET` | Yes | JWT refresh token signing secret. |
| `GROQ_API_KEY` | Yes for AI | Groq API key. |
| `GROQ_MODEL` | No | AI model. Defaults to `llama-3.3-70b-versatile` in AI services. |
| `CLIENT_URL` | Yes | Frontend URL used by OAuth redirects and CORS. |
| `FRONTEND_URL` | No | Additional CORS origin. |
| `SERVER_URL` | Yes for Google OAuth | Backend URL used to build the Google callback URL. |
| `DOMAIN` | Yes for email links/CORS | Public app domain used in email verification links. |
| `GOOGLE_CLIENT_ID` | For Google login | Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | For Google login | Google OAuth client secret. |
| `SMTP_HOST` | For email | SMTP host. Defaults to Mailtrap sandbox host. |
| `SMTP_PORT` | For email | SMTP port. Defaults to `2525`. |
| `SMTP_USER` | For email | SMTP username. |
| `SMTP_PASS` | For email | SMTP password. |
| `EMAIL_FROM` | For email | Sender address. |
| `DISABLE_EMAIL` | No | Set `true` to skip email sending, useful in tests/local development. |
| `LOG_LEVEL` | No | Pino log level. Defaults to `info`. |
| `POSTGRES_REQUIRED` | No | Set `0` to avoid failing production worker jobs when prompt history persistence fails. |
| `DOTENV_PATH` | No | Override dotenv file path. |
| `LOAD_DOTENV` | No | Set `1` to force dotenv loading in production. |
| `LOAD_DOTENV_TEST` | No | Set `1` to load dotenv during tests. |

### Frontend

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE` | Recommended | Browser API base URL. Automatically normalizes to include `/api`. |
| `NEXT_PUBLIC_API_URL` | Alternative | Alternative API base variable. |
| `NEXT_PUBLIC_API` | Alternative | Alternative API base variable. |
| `NEXT_PUBLIC_BASE_URL` | Production recommended | Frontend origin used to decide whether proxy mode should be used. |
| `API_PROXY_TARGET` | Optional | Next.js rewrite target for `/api/:path*`. |
| `API` | Optional | Server-side fallback API base variable. |

---

## Deployment

The repository is configured for a split deployment:

- **Frontend:** Next.js app, suitable for Vercel or any Node-compatible Next.js host.
- **Backend:** Express server, Docker-ready and CI/CD wired to trigger Render deployment through `RENDER_DEPLOY_HOOK`.
- **Datastores:** MongoDB, Supabase/PostgreSQL, and Redis are external runtime dependencies.

### Production Backend

1. Set production environment variables in the hosting provider.
2. Ensure `NODE_ENV=production`.
3. Ensure MongoDB, Supabase/PostgreSQL, and Redis are reachable.
4. Start the API:

```bash
cd server
npm start
```

5. Start the worker as a separate process/service:

```bash
cd server
node src/workers/ai.worker.js
```

### Production Frontend

```bash
cd client
npm run build
npm start
```

During `next build`, `next-sitemap` runs through the `postbuild` script.

---

## Screenshots

Images are available in `client/public/`. Add GitHub-rendered screenshots here when final product screenshots are selected.

### Homepage

<!-- Add screenshot here -->

### Prompt Enhancer

<!-- Add screenshot here -->

### Chat / Conversation Flow

<!-- Add screenshot here -->

---

## Engineering Highlights

- Designed a layered backend architecture with routes, controllers, services, repositories, models, queues, workers, utilities, and infrastructure config.
- Moved AI generation into a BullMQ worker pipeline so API requests return quickly while durable job status is tracked in MongoDB.
- Implemented dual persistence: MongoDB for operational app data and Supabase/PostgreSQL for prompt history and usage analytics.
- Added production-grade observability primitives: request IDs, structured Pino logs, worker event logs, and health checks across core services.
- Built secure cookie-based auth with short-lived access tokens, refresh token persistence, bcrypt password hashing, and Google OAuth.
- Added guest and authenticated conversation ownership paths without duplicating the chat API.
- Wrote Jest/Supertest coverage for critical auth behavior and wired those tests into GitHub Actions before deployment.
- Kept frontend/backend deployment concerns separate while supporting API proxy rewrites for production hosting.

---

## Future Improvements

- Add Express rate limiting for auth, chat, and AI endpoints.
- Add route-level RBAC middleware around admin-only endpoints such as Bull Board.
- Add a public AI job status endpoint so the frontend can poll job progress directly.
- Move BullMQ Redis connection configuration to use `REDIS_URL` consistently in both queue and worker.
- Add migrations or schema setup documentation for `prompt_history` and `usage_logs`.
- Add OpenAPI/Swagger documentation for the REST API.
- Expand tests for conversations, messages, queue creation, worker failure paths, and refresh-token flows.
- Fix Docker Compose Redis service indentation and add a dedicated worker service.
- Add production screenshots and a short demo GIF.

---

## Author

**Jay Patel**  
Backend Developer | Software Engineer

**GitHub:** [https://github.com/jaypatel345](https://github.com/jaypatel345)  
**LinkedIn:** [https://www.linkedin.com/in/jaypatel3405](https://www.linkedin.com/in/jaypatel3405)  
**Portfolio:** [https://jay34-portfolio-website.vercel.app](https://jay34-portfolio-website.vercel.app)

---

If you find PromptX useful, consider starring the repository.
