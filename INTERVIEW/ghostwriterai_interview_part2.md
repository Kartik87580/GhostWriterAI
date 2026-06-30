# 🎯 GhostWriterAI — Interview Preparation Guide (Part 2 of 3)
> Covers: Database · API Analysis · Complete Workflow · Why Questions · Design Decisions

---

## PART 5 — DATABASE

### Database: Neon DB (Serverless PostgreSQL)

### Tables

#### `users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, auto-increment | Unique user ID |
| `email` | VARCHAR | UNIQUE, NOT NULL, INDEX | User's email address |
| `hashed_password` | VARCHAR | NOT NULL | bcrypt hash of password |
| `is_verified` | BOOLEAN | DEFAULT FALSE | Email OTP verified? |
| `otp` | VARCHAR | NULLABLE | Active OTP code (cleared on verify) |
| `created_at` | DATETIME | DEFAULT utcnow | Account creation timestamp |

#### `blogs` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, auto-increment | Unique blog ID |
| `topic` | VARCHAR | INDEX | Topic string or YouTube URL label |
| `content` | TEXT | NOT NULL | Full Markdown content of the blog |
| `created_at` | DATETIME | DEFAULT utcnow | Generation timestamp |
| `user_id` | INTEGER | FOREIGN KEY → users.id | Owner of the blog |

### ER Diagram
```
┌─────────────────────────┐        ┌─────────────────────────┐
│         users           │        │          blogs          │
├─────────────────────────┤        ├─────────────────────────┤
│ id (PK)                 │◄───────│ user_id (FK → users.id) │
│ email (UNIQUE, INDEX)   │  1:N   │ id (PK)                 │
│ hashed_password         │        │ topic (INDEX)           │
│ is_verified             │        │ content (TEXT)          │
│ otp                     │        │ created_at              │
│ created_at              │        └─────────────────────────┘
└─────────────────────────┘
```

### Relationship
One User → Many Blogs (One-to-Many). A `user_id` foreign key on the `blogs` table links every blog to its author.

### Indexes
- `users.id` — primary key auto-index
- `users.email` — explicit index for fast login lookups
- `blogs.id` — primary key auto-index
- `blogs.topic` — index for faster topic-based queries
- `blogs.user_id` — implicitly needed for the filter in every blog query

### Why This Schema?
- **Simple and flat**: Only 2 tables for an MVP. No complex joins.
- **`content` as TEXT**: Blog content can be thousands of words — TEXT type has no length limit in PostgreSQL.
- **`otp` nullable**: After verification, it's set to `None` to avoid storing stale codes.

### Normalization
The schema is in **3NF (Third Normal Form)**:
- No repeating groups
- No partial dependencies (single-column PKs)
- No transitive dependencies

### Possible Improvements
- Add `otp_expires_at TIMESTAMP` column for OTP expiry
- Add `blog_status` column (draft/published)
- Add `devto_url` column to track published links
- Add index on `blogs.created_at` for efficient sorting
- Add `tags` column for blog categorization
- Consider storing `hashed_otp` instead of plaintext OTP

### How Tables Are Created
```python
# main.py — runs on every startup
Base.metadata.create_all(bind=engine)
```
SQLAlchemy reads all models inheriting from `Base` and creates tables if they don't exist. **No Alembic/migrations** — just `CREATE TABLE IF NOT EXISTS`.

### Top 5 Database Interview Questions

1. **Why PostgreSQL over MongoDB for this project?**
   > The data has a clear relational structure (users own blogs, FK relationship). PostgreSQL gives us joins, transactions, and strong typing. MongoDB would be overkill and schema-less flexibility is not needed here.

2. **Why is the OTP stored as plaintext?**
   > It's an MVP simplification. In production, you'd hash the OTP (e.g., SHA-256) or use a time-limited token. Plaintext OTP means anyone with DB read access can see active codes.

3. **What happens if `Base.metadata.create_all()` is called on an existing DB?**
   > SQLAlchemy uses `CREATE TABLE IF NOT EXISTS` internally — it's idempotent. Existing tables are not dropped or modified. This is why a separate `migrate.py` was needed to add the `is_verified` and `otp` columns after the fact.

4. **Explain the `pool_recycle=300` setting.**
   > Neon's serverless PostgreSQL closes idle connections after a period. `pool_recycle=300` tells SQLAlchemy to discard and recreate connections after 300 seconds (5 min), preventing "connection closed" errors on stale pooled connections.

5. **What is the CRUD pattern and how is it implemented?**
   > CRUD = Create, Read, Update, Delete. `crud_blog.py` implements `create_blog()`, `get_blogs()` (with user_id filter, pagination via skip/limit), and `get_blog()` (single fetch with user_id ownership check). There's no update or delete endpoint — limitation of current MVP.

---

## PART 6 — API ANALYSIS

### Auth Endpoints

#### `POST /auth/signup`
| | |
|---|---|
| **Purpose** | Register a new user |
| **Request Body** | `{"email": "user@example.com", "password": "secret123"}` |
| **Response** | `{"id": 1, "email": "...", "created_at": "..."}` (UserResponse) |
| **Auth Required** | No |
| **Validation** | Pydantic `UserCreate` model; duplicate email check |
| **Side Effect** | Sends OTP email via Gmail SMTP |
| **Error Cases** | 400 if email already registered |
| **Status Codes** | 200 OK, 400 Bad Request |

#### `POST /auth/verify-otp`
| | |
|---|---|
| **Purpose** | Confirm email ownership via OTP |
| **Request Body** | `{"email": "user@example.com", "otp": "123456"}` |
| **Response** | `{"message": "Email successfully verified..."}` |
| **Auth Required** | No |
| **Validation** | Checks user exists, not already verified, OTP matches |
| **Side Effect** | Sets `is_verified=True`, clears `otp` field in DB |
| **Error Cases** | 404 user not found, 400 already verified, 400 invalid OTP |

#### `POST /auth/login`
| | |
|---|---|
| **Purpose** | Authenticate and get JWT token |
| **Request Body** | `username=email&password=secret` (form-encoded, not JSON!) |
| **Response** | `{"access_token": "eyJ...", "token_type": "bearer"}` |
| **Auth Required** | No |
| **Validation** | Uses `OAuth2PasswordRequestForm` — FastAPI standard |
| **Error Cases** | 400 wrong credentials, 403 email not verified |
| **Status Codes** | 200 OK, 400, 403 |

**Interview Trap**: The login endpoint uses `application/x-www-form-urlencoded`, NOT JSON. This is why the frontend's `authService.js` uses `URLSearchParams` instead of a JSON body.

### Blog Endpoints

#### `POST /generate-blog`
| | |
|---|---|
| **Purpose** | Generate a blog post using the AI pipeline |
| **Request Body** | `{"topic": "LangGraph tutorial"}` OR `{"youtube_url": "https://..."}` |
| **Response** | `{"id": 1, "topic": "...", "content": "# ...", "created_at": "..."}` |
| **Auth Required** | Yes — Bearer JWT |
| **Processing** | Calls `generate_blog_content()` — async, invokes LangGraph |
| **Error Cases** | 401 unauthorized, 500 on pipeline failure |
| **Latency** | ~30–90 seconds (LLM inference + optional web search) |

#### `GET /blogs`
| | |
|---|---|
| **Purpose** | List all blogs for the current user |
| **Query Params** | `skip=0&limit=100` (pagination) |
| **Response** | Array of BlogResponse objects, ordered by `created_at DESC` |
| **Auth Required** | Yes |
| **Isolation** | Filters by `user_id=current_user.id` — users only see own blogs |

#### `GET /blogs/{blog_id}`
| | |
|---|---|
| **Purpose** | Fetch a single blog by ID |
| **Auth Required** | Yes |
| **Ownership Check** | `WHERE id=blog_id AND user_id=current_user.id` — prevents other users from accessing by ID |
| **Error Cases** | 404 if not found OR if belongs to another user (same response — no info leak) |

#### `POST /blogs/{blog_id}/publish-devto`
| | |
|---|---|
| **Purpose** | Publish a saved blog to DEV.TO |
| **Request Body** | `{"devto_api_key": "abc123..."}` |
| **Response** | `{"success": true, "url": "https://dev.to/...", "title": "...", "id": 123}` |
| **Auth Required** | Yes (JWT) + user must own the blog |
| **Processing** | Regex extracts title from first `#` heading; POSTs to `dev.to/api/articles` |
| **Error Cases** | 404 blog not found, 400 invalid key, 502 DEV.TO API error |

**Interview Trap on 502**: When the DEV.TO API returns an error, this server returns 502 (Bad Gateway) — which correctly signals that an upstream service failed.

### API Design Decisions
- **REST** (not GraphQL): Simpler, well-understood, sufficient for the data structure
- **No versioning**: MVP — `/v1/` prefix should be added in production
- **No rate limiting**: Anyone with a valid JWT can spam `/generate-blog` — each call costs Groq API credits
- **Async endpoint**: `/generate-blog` uses `async def` because `generate_blog_content()` is awaited

---

## PART 7 — COMPLETE WORKFLOW (End-to-End)

```
USER opens browser → visits site URL
         │
         ▼
App.jsx root route checks authService.isAuthenticated()
         │
    ┌────┴────┐
   No        Yes
    │         │
    ▼         ▼
/landing    /app (Home.jsx)
    │
    ▼
User clicks "Sign Up"
    │
    ▼
Signup.jsx → POST /auth/signup
    │
    ├── Backend: hash password (bcrypt) → save to Neon DB
    ├── Backend: generate 6-digit OTP → save to users.otp
    └── Backend: send HTML email via Gmail SMTP → return UserResponse
    │
    ▼
Redirect to /verify-otp
    │
User enters OTP → POST /auth/verify-otp
    │
    ├── Backend: lookup user by email
    ├── Compare OTP string
    └── Set is_verified=True, clear otp → return success message
    │
    ▼
User goes to /login
    │
Login.jsx → POST /auth/login (form-encoded)
    │
    ├── Backend: verify bcrypt hash
    ├── Check is_verified=True
    └── Create JWT (HS256, 7 days) → return {access_token, token_type}
    │
    ▼
Frontend stores token in localStorage
Redirect to /app (protected route)
    │
    ▼
Home.jsx renders with mode toggle (Topic | YouTube)
    │
User selects "By Topic" → types topic → clicks Generate
    │
    ▼
blogService.generateBlog({topic: "..."})
Axios adds Authorization: Bearer <token> header
POST /generate-blog
    │
    ▼
FastAPI → get_current_user() dependency
    ├── Decode JWT → extract email
    └── Query DB for user → inject user object
    │
    ▼
generate_blog_content(topic) called (async)
    │
    ▼
LangGraph graph.invoke(initial_state)
    │
    ├── router_node
    │   └── LLM(RouterDecision): needs_research=True, mode="hybrid", queries=[...]
    │
    ├── research_node
    │   ├── Tavily search for each query
    │   ├── Collect raw results
    │   └── LLM(EvidencePack): extract clean snippets
    │
    ├── orchestrator_node
    │   └── LLM(Plan): blog_title, tone, audience, tasks=[Task×5-9]
    │
    ├── fanout() → Send("worker", {task, plan}) × N (parallel)
    │
    ├── worker_node × N (each writes one section)
    │   └── LLM: write section Markdown → (task_id, section_md)
    │
    └── reducer_node
        └── Sort sections by id → join → prepend "# title" → return final_md
    │
    ▼
FastAPI: crud_blog.create_blog(db, topic, content, user_id)
INSERT INTO blogs ... → return BlogResponse
    │
    ▼
JSON response to frontend
React: setBlog(data) → ReactMarkdown renders content
setTimeout 800ms → showPublishBanner=true
    │
    ▼
(Optional) User clicks "Publish to DEV.IO"
    │
    ▼
DevToModal renders
    ├── Check localStorage for 'devto_api_key'
    ├── If found → 'confirm' step → user clicks Publish
    └── If not → 'key-input' step → user pastes key
    │
    ▼
POST /blogs/{id}/publish-devto {devto_api_key: "..."}
    ├── Verify blog ownership
    ├── Extract title via regex
    └── POST to https://dev.to/api/articles
    │
    ▼
Return {url, title, id}
Frontend: toast notification with clickable DEV.TO link
```

---

## PART 8 — WHY QUESTIONS (With Answers)

**Q: Why Python for the backend?**
> Python has the richest AI/ML ecosystem. LangChain, LangGraph, Groq, and Tavily all have first-class Python SDKs. It also has FastAPI which rivals Node.js in performance for async workloads.

**Q: Why FastAPI and not Flask/Django?**
> FastAPI is async-native (critical for LLM calls that can take 60s+), has automatic request validation via Pydantic, generates OpenAPI docs automatically, and is significantly faster than Flask. Django is too heavy and opinionated for an API-only service.

**Q: Why LangGraph and not a simple chain?**
> The blog generation requires: conditional routing (research or not?), parallel execution (one worker per section), and state aggregation (reducer merges sections). LangGraph's graph model with `Send()` fan-out is the only clean way to implement this. A linear chain can't do parallel branches.

**Q: Why Groq + Llama instead of OpenAI?**
> Groq's LPU inference is 5–10x faster than OpenAI for the same model size. For a blog generation app where users wait for output, speed is critical. Llama 3.3 70B is comparable to GPT-4 for structured writing tasks. Groq also has a free tier sufficient for development.

**Q: Why Tavily and not DuckDuckGo or Google?**
> Tavily is purpose-built for LLM augmentation. It returns clean, structured snippets optimized for LLM consumption. Google Search API returns raw HTML links requiring scraping; DuckDuckGo's unofficial API is unreliable. Tavily gives the best signal-to-noise ratio for research.

**Q: Why JWT and not sessions?**
> The frontend (Vercel) and backend (Render) are on different domains. Sessions require cookies with `SameSite` configuration across domains. JWTs are stateless — the token travels in the `Authorization` header and works cross-origin without cookie complications.

**Q: Why PostgreSQL (Neon) and not MongoDB?**
> The data model is inherently relational (users own blogs, FK relationship). MongoDB's schema flexibility provides no benefit here. PostgreSQL gives ACID compliance, strong typing, and familiar SQL for a simple 2-table schema.

**Q: Why Vite and not Create React App?**
> CRA is deprecated and slow. Vite uses native ES modules for instant dev server startup (no bundling) and is significantly faster for HMR. It's the modern standard for React tooling.

**Q: Why Vercel for frontend and Render for backend?**
> Vercel is purpose-built for static/SPA deployments — zero config, global CDN, auto-preview URLs. Render supports always-on Python processes (Uvicorn), environment variables, and auto-deploy from GitHub. Both have free tiers suitable for portfolio projects.

**Q: Why a monolith and not microservices?**
> Microservices add operational complexity (service discovery, inter-service auth, distributed tracing) that's unjustified for a single-developer portfolio project. The monolith is easier to develop, debug, and deploy. The architecture can be decomposed later if scale demands it.

---

## PART 9 — DESIGN DECISIONS

### Why This Folder Structure?
The backend follows a **layered architecture**:
- `api/` = Controllers (HTTP layer — validates requests, calls services)
- `services/` = Business Logic (AI pipeline, email, research)
- `db/` = Data Access Layer (CRUD operations)
- `models/` = Data Models (SQLAlchemy ORM)
- `schemas/` = Data Transfer Objects (Pydantic — validates I/O)
- `core/` = Cross-cutting Concerns (config, security, LLM client)

This separation ensures each layer has one responsibility and can be tested/swapped independently.

### Why MVC-ish Pattern?
- Model = `models/` + `schemas/`
- View = Frontend React (separate repo)
- Controller = `api/routes_*.py`
- Service = `services/` (business logic kept out of controllers)

Controllers are thin — they validate input, call services, save to DB, and return responses. All complex logic is in services.

### Why Client-Server Architecture?
- Decoupled: frontend and backend can be developed and deployed independently
- Scalable: can scale frontend (CDN) separately from backend (compute)
- The API becomes usable by other clients (mobile app, CLI, etc.)

### Why REST over GraphQL?
- Simple CRUD operations don't need GraphQL's query flexibility
- REST is universally understood by interviewers and teammates
- FastAPI natively generates OpenAPI/Swagger docs for REST

### Why No Alembic for Migrations?
- `Base.metadata.create_all()` is sufficient for an MVP
- For production, Alembic migrations would be essential for zero-downtime schema changes
- The manual `migrate.py` was a one-time fix — a limitation acknowledged in the project

### Why `random.randint` for OTP?
- Simple 6-digit numeric OTP sufficient for email verification
- Python's `random` module is NOT cryptographically secure
- Should use `secrets.randbelow(900000) + 100000` for production
- No expiry timer is a known limitation

### Authentication Design Decision: No Refresh Tokens
- Only access tokens are issued (7-day expiry)
- In production: short-lived access token (15min) + long-lived refresh token (30 days) is the standard
- Current implementation means the user stays logged in for 7 days even if compromised

### DEV.TO API Key Design Decision
- Key is NOT stored on the server — it stays client-side (localStorage)
- This means the backend never stores third-party credentials
- Trade-off: LocalStorage is XSS-vulnerable; should use `httpOnly` cookies or server-side encrypted storage

---

### Top 10 Interview Questions — Parts 5–9

1. **Why not use Alembic for database migrations?**
   > For this MVP, `Base.metadata.create_all()` handles initial table creation. Alembic was not set up from the start. The `migrate.py` script was a pragmatic one-time fix. In production, I would use Alembic for versioned, reversible migrations.

2. **What is the purpose of the `schemas/` folder vs `models/`?**
   > `models/` contains SQLAlchemy ORM classes that map to database tables. `schemas/` contains Pydantic models that define the shape of HTTP request/response data. They serve different layers — ORM for DB interaction, Pydantic for API validation.

3. **Why does the login endpoint use form-encoded data instead of JSON?**
   > FastAPI's `OAuth2PasswordRequestForm` dependency follows the OAuth2 spec, which mandates `application/x-www-form-urlencoded` for the token endpoint. This is a standard, not a bug — it's why the frontend uses `URLSearchParams`.

4. **How does per-user data isolation work?**
   > Every blog query includes `WHERE user_id = current_user.id`. The `current_user` is extracted from the verified JWT. Even if a user guesses another user's blog ID, the ownership check in `get_blog()` returns 404 — not the other user's content.

5. **What does `from_attributes = True` in Pydantic Config mean?**
   > It allows Pydantic to read data from SQLAlchemy ORM objects (which use attribute access) instead of requiring a dictionary. Without this, FastAPI couldn't serialize the SQLAlchemy model instance into JSON.

6. **Why is the blog content stored as TEXT instead of VARCHAR?**
   > A generated blog post can be 2,000–5,000 words of Markdown. VARCHAR has a length limit (typically 255 or configurable). TEXT in PostgreSQL is unlimited length, appropriate for long content.

7. **Explain the `vercel.json` rewrite rule.**
   > `{"source": "/(.*)", "destination": "/index.html"}` is an SPA catch-all. React Router handles routing client-side. Without this, refreshing `/blog/5` would cause Vercel to look for a file at that path and return 404. The rewrite always serves `index.html` and lets React Router handle the URL.

8. **Why does `get_db()` use a generator with try/finally?**
   > It's a FastAPI dependency pattern. `yield db` provides the session to the route function. The `finally: db.close()` block guarantees the session is closed after every request — even if an exception occurs — preventing connection leaks.

9. **What is the difference between `SMTP_SSL` on port 465 and `STARTTLS` on port 587?**
   > `SMTP_SSL` (port 465) wraps the entire connection in SSL from the start. `STARTTLS` (port 587) starts as a plaintext connection and upgrades to TLS via the STARTTLS command. Both are secure; 465 is simpler for Python's `smtplib`.

10. **What would you add to make this production-ready?**
    > Rate limiting on `/generate-blog` (e.g., via `slowapi`), OTP expiry timer, CORS restricted to frontend domain, refresh token system, Alembic migrations, proper secret management (AWS Secrets Manager or Vault), request logging with correlation IDs, and health check endpoints for uptime monitoring.
