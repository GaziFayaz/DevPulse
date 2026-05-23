# DevPulse

> Internal Tech Issue & Feature Tracker — A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

**Live URL:** [https://dev-pulse-nine-navy.vercel.app](https://dev-pulse-nine-navy.vercel.app)

---

## Features

- **User Authentication** — Register and login with JWT-based sessions
- **Role-Based Access** — Contributors can create and manage their own issues; Maintainers have full CRUD and workflow control
- **Issue Tracking** — Create, view, update, and delete bug reports and feature requests
- **Smart Filtering** — Sort and filter issues by type (`bug` / `feature_request`) and status (`open` / `in_progress` / `resolved`)
- **Secure** — Passwords hashed with bcrypt, JWTs signed with expiry, no passwords exposed in responses

## Tech Stack

| Technology | Purpose |
|---|---|
| **Bun** | JavaScript runtime & package manager |
| **TypeScript** | Type-safe development |
| **Express.js** | HTTP server & routing |
| **PostgreSQL** | Relational database |
| **pg** (native) | Database driver — raw SQL only |
| **bcrypt** | Password hashing |
| **jsonwebtoken** | JWT authentication |
| **http-status-codes** | Named HTTP status constants |

---

## Setup

### Prerequisites

- [Bun](https://bun.sh) v1.3.14+
- PostgreSQL database (or a hosted instance)

### Installation

```bash
git clone <repo-url>
cd DevPulse
bun install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
CONNECTION_STRING=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Server port |
| `CONNECTION_STRING` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | No | `devpulse-secret-key` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry duration |

### Database Setup

Tables are created automatically on first run. To seed sample data:

```bash
bun run seed
```

This creates 3 users and 8 sample issues:

| Name | Email | Role | Password |
|---|---|---|---|
| Alice Wonder | `alice@devpulse.com` | contributor | `password123` |
| Bob Builder | `bob@devpulse.com` | contributor | `password123` |
| Carol Maintainer | `carol@devpulse.com` | maintainer | `password123` |

### Run

```bash
bun run dev       # Development with hot reload
bun run start     # Production
```

---

## Database Schema

### `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` |
| `name` | `VARCHAR(255)` | `NOT NULL` |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` |
| `password` | `VARCHAR(60)` | `NOT NULL` (bcrypt hash) |
| `role` | `ENUM` | `'contributor'` or `'maintainer'`, defaults to `'contributor'` |
| `created_at` | `TIMESTAMP` | Auto-generated on insert |
| `updated_at` | `TIMESTAMP` | Auto-refreshed on update |

### `issues`

| Column | Type | Constraints |
|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` |
| `title` | `VARCHAR(150)` | `NOT NULL` |
| `description` | `TEXT` | `NOT NULL`, min 20 characters |
| `type` | `ENUM` | `'bug'` or `'feature_request'` |
| `status` | `ENUM` | `'open'`, `'in_progress'`, or `'resolved'`, defaults to `'open'` |
| `reporter_id` | `INT` | References `users.id` (validated in application logic; no foreign key constraint) |
| `created_at` | `TIMESTAMP` | Auto-generated on insert |
| `updated_at` | `TIMESTAMP` | Auto-refreshed on update |

---

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate and receive JWT |

**Signup**
```json
// POST /api/auth/signup
// Body:
{ "name": "John Doe", "email": "john@devpulse.com", "password": "secure123", "role": "contributor" }
// Response 201:
{ "success": true, "message": "User registered successfully", "data": { "id": 1, "name": "John Doe", "email": "john@devpulse.com", "role": "contributor", "created_at": "...", "updated_at": "..." } }
```

**Login**
```json
// POST /api/auth/login
// Body:
{ "email": "john@devpulse.com", "password": "secure123" }
// Response 200:
{ "success": true, "message": "Login successful", "data": { "token": "eyJ...", "user": { "id": 1, "name": "John Doe", "email": "john@devpulse.com", "role": "contributor", "created_at": "...", "updated_at": "..." } } }
```

> After login, attach the token to the `Authorization` header (without `Bearer` prefix) for protected endpoints.

### Issues

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/issues` | Public | — | List all issues (optional: `?sort=newest&type=bug&status=open`) |
| `GET` | `/api/issues/:id` | Public | — | Get a single issue |
| `POST` | `/api/issues` | Required | Any | Create an issue |
| `PATCH` | `/api/issues/:id` | Required | Contributor (own + open), Maintainer (any) | Update issue fields |
| `DELETE` | `/api/issues/:id` | Required | Maintainer only | Delete an issue |

**Query Parameters (GET /api/issues)**

| Param | Values | Default |
|---|---|---|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | (none) |
| `status` | `open`, `in_progress`, `resolved` | (none) |

---

## Project Structure

```
src/
  config/index.ts           # Environment configuration
  db/index.ts               # Database pool & schema initialization
  middleware/
    authenticate.ts         # JWT verification
    authorize.ts            # Role-based access control
    globalErrorHandler.ts   # Centralized error handling
    logger.ts               # Request logging
  modules/
    auth/
      auth.routes.ts        # Auth route definitions
      auth.controller.ts    # Request/response handling
      auth.service.ts       # Business logic & DB queries
    issues/
      issues.routes.ts      # Issue route definitions
      issues.controller.ts  # Request/response handling
      issues.service.ts     # Business logic & DB queries
  utils/
    response.ts             # Standardized response helpers
    errors.ts               # Custom error classes
    sql.ts                  # Database query helper
  app.ts                    # Express app setup
  server.ts                 # Entry point
  seed.ts                   # Sample data seeder
```

## Postman Collection

Import `DevPulse.postman_collection.json` into Postman for a pre-configured set of all API endpoints with auto-token handling.
