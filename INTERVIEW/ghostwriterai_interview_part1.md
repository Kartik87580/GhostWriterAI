# 🎯 GhostWriterAI — Interview Preparation Guide (Part 1 of 3)
> Covers: Project Summary · System Design · Tech Stack · Source Code Analysis

---

## PART 1 — PROJECT SUMMARY

### Project Overview
**GhostWriterAI** is a full-stack, multi-agent AI-powered blog writing platform. A user signs up, verifies email via OTP, and gets a private workspace where they can generate high-quality blog posts from either a plain text topic or a YouTube video URL. The AI pipeline uses LangGraph to orchestrate multiple specialized agents that research, plan, and write the content section-by-section. The final blog can be downloaded as Markdown or published directly to DEV.TO with one click.

### Problem Statement
Content creators and developers struggle to:
- Produce well-researched, structured blog posts consistently.
- Convert rich YouTube video content into written articles.
- Publish polished content quickly without a large writing team.

### Why This Project Was Built
To demonstrate a production-grade Generative AI system that goes beyond a simple "call an LLM and return text" pattern — instead showing real agentic orchestration, stateful pipelines, per-user data isolation, and end-to-end deployment.

### Real-World Use Case
A developer watches a 30-minute YouTube tutorial and wants to publish a blog about it. They paste the URL → the system fetches the transcript → runs it through the multi-agent pipeline → outputs a 1,500-word structured Markdown blog → user publishes to DEV.TO in one click.

### Target Users
- Software developers & technical writers
- Content creators who want to repurpose YouTube videos
- Students building a technical blog portfolio

### Key Features
| Feature | Description |
|---|---|
| JWT Auth + OTP Email | Secure signup with 6-digit OTP verification via Gmail SMTP |
| Per-user isolation | Every blog is scoped by `user_id` — no cross-user data leaks |
| Topic → Blog | Enter any topic, AI researches and writes a full post |
| YouTube → Blog | Paste a URL, transcript is fetched and converted into a blog |
| Multi-agent pipeline | Router → Research → Orchestrator → Workers (fan-out) → Reducer |
| DEV.TO Publishing | One-click publish to DEV.TO using user's own API key |
| Download as .md | Export any generated blog as a Markdown file |
| Blog History | Persistent cloud storage of all past blogs per user |

### Business Value
- Reduces blog writing time from hours to ~60 seconds
- Enables developers to build a writing portfolio without writing effort
- Demonstrates enterprise-level AI system design patterns

### Limitations
- No OTP expiry timer implemented (OTP lives until used)
- CORS is set to `allow_origins=["*"]` — unsafe for production
- DEV.TO API key stored in browser `localStorage` — vulnerable to XSS
- No rate limiting on generation endpoint — cost abuse risk
- Render free tier cold-start causes 50s delays
- YouTube transcript API fails for videos with disabled captions

### Future Scope
- Add OTP expiry (e.g., 10-minute TTL)
- Add blog editing before publishing
- Stream LLM output using Server-Sent Events (SSE)
- Add support for more platforms (Medium, Hashnode)
- Add rate limiting (per-user daily quota)
- Replace localStorage for API key with encrypted backend storage
- Add blog categories and search

---

## PART 2 — SYSTEM DESIGN

### Architecture Style
**Monolithic backend** with a **SPA frontend** — not microservices. A single FastAPI app handles auth, blog generation, and publishing. The frontend is a separate Vite/React SPA deployed independently.

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                   USER'S BROWSER                            │
│  React SPA (Vite) — Deployed on Vercel                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Landing  │ │ Signup/  │ │  Home    │ │ BlogHistory/ │   │
│  │  Page    │ │ Login/   │ │ (Writer) │ │ BlogView     │   │
│  │          │ │ OTP      │ │          │ │              │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│         │ Axios + JWT Bearer Token in every request         │
└─────────┼───────────────────────────────────────────────────┘
          │ HTTPS REST API
┌─────────▼───────────────────────────────────────────────────┐
│              FastAPI Backend — Deployed on Render            │
│  ┌────────────────┐   ┌─────────────────────────────────┐   │
│  │  /auth routes  │   │  /blogs routes                  │   │
│  │  - POST signup │   │  - POST /generate-blog          │   │
│  │  - POST login  │   │  - GET  /blogs                  │   │
│  │  - POST verify │   │  - GET  /blogs/{id}             │   │
│  │    -otp        │   │  - POST /blogs/{id}/publish-    │   │
│  └────────────────┘   │         devto                   │   │
│                       └─────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │         LangGraph Multi-Agent Pipeline               │     │
│  │  Router → [Research] → Orchestrator → Workers(N) → Reducer │
│  └─────────────────────────────────────────────────────┘     │
└────────┬──────────────┬──────────────┬───────────────────────┘
         │              │              │
   ┌─────▼──────┐ ┌─────▼──────┐ ┌───▼──────────┐
   │  Neon DB   │ │  Groq API  │ │ Tavily API   │
   │ PostgreSQL │ │ Llama 3.3  │ │ Web Search   │
   │ (cloud)    │ │   70B      │ │              │
   └────────────┘ └────────────┘ └──────────────┘
```

### Complete Request/Response Flow

**Authentication Flow:**
```
1. User fills Signup form (email + password)
2. Frontend POSTs to /auth/signup
3. Backend hashes password with bcrypt
4. Saves User to Neon DB (is_verified=False)
5. Generates 6-digit OTP with random.randint(100000, 999999)
6. Sends branded HTML email via Gmail SMTP (SSL port 465)
7. Returns UserResponse (no token yet)
8. User is redirected to /verify-otp page
9. User enters OTP → POST /auth/verify-otp
10. Backend sets is_verified=True, clears OTP field
11. User goes to /login
12. POST /auth/login → OAuth2PasswordRequestForm
13. Backend verifies password with bcrypt.checkpw
14. Creates JWT (HS256, 7-day expiry)
15. Returns {access_token, token_type: "bearer"}
16. Frontend stores token in localStorage
17. Axios interceptor auto-attaches Bearer token to all future requests
```

**Blog Generation Flow:**
```
1. User enters topic/YouTube URL → clicks Generate
2. Frontend POSTs to /generate-blog with JWT header
3. FastAPI's get_current_user() validates JWT → gets user from DB
4. Calls generate_blog_content(topic, youtube_url) [async]
5. If youtube_url: fetch transcript via YouTubeTranscriptApi
6. Invoke LangGraph compiled graph with initial_state
   a. router_node: decides needs_research / mode
   b. If needs_research: research_node calls Tavily → LLM refines evidence
   c. orchestrator_node: LLM generates structured Plan (5-9 tasks)
   d. fanout(): creates Send() for each task → parallel workers
   e. worker_node × N: each LLM call writes one section in Markdown
   f. reducer_node: sorts sections by id, joins into final Markdown
7. Backend saves blog to Neon DB (topic, content, user_id, created_at)
8. Returns BlogResponse (id, topic, content, created_at)
9. Frontend renders Markdown with ReactMarkdown
10. Publish banner appears → user optionally publishes to DEV.TO
```

**DEV.TO Publishing Flow:**
```
1. User clicks "Publish to DEV.IO"
2. DevToModal checks localStorage for saved API key
3. If saved → confirm step; if not → key-input step
4. Key sent to backend POST /blogs/{id}/publish-devto
5. Backend fetches blog from DB (verifying user_id match)
6. Extracts title from first # heading using regex
7. POSTs to https://dev.to/api/articles
8. On 201 → returns {url, title, id}
9. Frontend shows toast with live DEV.TO link
```

### Data Flow Summary
```
User Input → React State → Axios POST → FastAPI Router
→ Pydantic Validation → Service Layer → LangGraph
→ Groq LLM / Tavily / YouTube → Reducer → SQLAlchemy
→ Neon PostgreSQL → Pydantic Response → JSON → React State → UI
```

---

## PART 3 — TECH STACK DEEP DIVE

### Backend Technologies

| Technology | Version | Why Used |
|---|---|---|
| Python | 3.9+ | AI/ML ecosystem dominance |
| FastAPI | 0.100+ | Async, auto OpenAPI docs, Pydantic integration |
| Uvicorn | Latest | ASGI server for FastAPI |
| SQLAlchemy | Latest | ORM for PostgreSQL interaction |
| Pydantic | v2 | Data validation and settings management |
| LangChain | Latest | LLM abstraction layer |
| LangGraph | Latest | Stateful multi-agent orchestration |
| Groq + Llama 3.3 70B | Latest | Ultra-fast LLM inference |
| Tavily | Latest | Purpose-built LLM search API |
| PyJWT + bcrypt | Latest | JWT tokens + password hashing |
| smtplib | stdlib | Email delivery (no extra dependency) |
| psycopg2-binary | Latest | PostgreSQL driver |
| youtube-transcript-api | Latest | Fetch YT captions without YouTube Data API |

### Frontend Technologies

| Technology | Version | Why Used |
|---|---|---|
| React | 18.3 | Component-based UI, huge ecosystem |
| Vite | 5.4 | Fastest dev server, ESM native |
| Tailwind CSS | v4 | Utility-first, rapid UI development |
| Axios | 1.13 | HTTP client with interceptor support |
| React Router | v7 | Client-side routing with guards |
| Framer Motion | 12 | Smooth animations |
| react-markdown | 10 | Render Markdown blog content safely |
| react-hot-toast | 2.6 | Non-intrusive notifications |
| lucide-react | 0.564 | Clean icon library |

### Why FastAPI over Flask/Django?
- **FastAPI**: Async-native, automatic OpenAPI docs, Pydantic models, 3x faster than Flask
- **Flask**: Synchronous by default, no built-in validation, manual docs
- **Django**: Too heavy/opinionated for an API-only backend; ORM is more complex

### Why LangGraph over plain LangChain?
- LangGraph provides **stateful, graph-based** orchestration
- Supports **fan-out (parallel execution)** via `Send()` primitive
- Has **conditional edges** for routing logic
- Plain LangChain chains are linear — no branching or parallel workers

### Why Groq over OpenAI?
- Groq's LPU™ engine is **5–10x faster** than OpenAI for inference
- Llama 3.3 70B is **open-source** and very capable
- Groq has a **generous free tier**
- Trade-off: Less reliable than OpenAI, no GPT-4 level reasoning

### Why Neon over RDS/Supabase?
- **Neon**: Serverless PostgreSQL, free tier, scales to zero, instant provisioning
- **RDS**: Expensive, requires VPC setup, minimum instance always running
- **Supabase**: Has its own auth system (overkill), larger SDK
- Trade-off: Neon free tier has connection limits and cold-start latency

### Why Vite over Create-React-App?
- Vite is **10–100x faster** for dev server startup (ESM, no bundling during dev)
- CRA is officially deprecated
- Vite has native TypeScript support and better plugin ecosystem

### Why JWT over Session cookies?
- JWT is **stateless** — no server-side session store needed
- Works perfectly for **cross-origin** frontend (Vercel) + backend (Render) architecture
- Trade-off: Cannot revoke a JWT without a blocklist; 7-day expiry is long

### Why Tavily over Google Search API?
- Tavily is purpose-built for **LLM consumption** — returns clean snippets
- Google Search API is expensive and returns HTML/links that need scraping
- Trade-off: Tavily has limited free tier (1,000 searches/month)

### Why Render over AWS?
- **Render**: Zero-config deployment, free tier, auto-deploy from GitHub
- **AWS EC2**: Requires manual setup, security groups, SSH, nginx, etc.
- Trade-off: Render free tier has 50-second cold starts and sleep after inactivity

---

## PART 4 — SOURCE CODE ANALYSIS

### Folder Structure & Responsibilities

```
GhostWriterAI/
├── backend/
│   ├── app/
│   │   ├── main.py          ← FastAPI app creation, CORS, router registration
│   │   ├── api/
│   │   │   ├── routes_auth.py  ← Signup, OTP verify, Login endpoints
│   │   │   ├── routes_blog.py  ← Generate, list, fetch, publish endpoints
│   │   │   └── deps.py         ← JWT auth dependency injection
│   │   ├── core/
│   │   │   ├── config.py       ← Pydantic Settings (env vars)
│   │   │   ├── llm_client.py   ← Groq LLM factory function
│   │   │   └── security.py     ← bcrypt hashing + JWT creation
│   │   ├── db/
│   │   │   ├── database.py     ← SQLAlchemy engine, session, get_db()
│   │   │   └── crud_blog.py    ← Blog CRUD operations
│   │   ├── models/
│   │   │   ├── user_model.py   ← SQLAlchemy User ORM model
│   │   │   └── blog_model.py   ← SQLAlchemy Blog ORM model
│   │   ├── schemas/
│   │   │   ├── user_schema.py  ← Pydantic UserCreate, UserResponse, Token
│   │   │   └── blog_schema.py  ← Pydantic BlogGenerate, BlogResponse
│   │   └── services/
│   │       ├── blog_generator.py   ← LangGraph pipeline (CORE)
│   │       ├── email_service.py    ← Gmail SMTP HTML mailer
│   │       ├── prompt_builder.py   ← LLM system prompts
│   │       ├── research_service.py ← Tavily search + LLM evidence extraction
│   │       └── youtube_service.py  ← YouTube transcript fetcher
│   ├── migrate.py           ← Manual DB migration script
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx          ← BrowserRouter, route guards, all routes
        ├── pages/           ← Landing, Home, BlogHistory, BlogView, Login, Signup, VerifyOTP
        ├── components/      ← Navbar, PublicNavbar, DevToModal, AnimatedBackground, Loader
        └── services/
            ├── api.js       ← Axios instance + JWT interceptor + blogService
            └── authService.js ← login, signup, verifyOTP, logout, isAuthenticated
```

### Key File Explanations

#### `main.py` — Entry Point
- Creates FastAPI app with title `"AI Blog Writer API"`
- Calls `Base.metadata.create_all(bind=engine)` on startup → auto-creates tables
- Adds CORS middleware with `allow_origins=["*"]` (⚠️ interview trap — should be restricted)
- Registers `/auth` prefix for auth router, no prefix for blog router
- Has a health-check `GET /` endpoint

#### `database.py` — Database Layer
- `create_engine()` with `pool_pre_ping=True` (tests connection before use) and `pool_recycle=300` (recycles connections every 5 min to avoid stale connections on Neon)
- `SessionLocal` uses `autocommit=False, autoflush=False` for explicit transaction control
- `get_db()` is a generator function used as a FastAPI dependency — yields session, always closes in `finally`
- Supports both SQLite (local dev) and PostgreSQL (production) via env var check

#### `security.py` — Auth Logic
- `bcrypt.gensalt()` generates a random salt per password
- `bcrypt.hashpw()` hashes password + salt → stored as string in DB
- `verify_password()` handles encoding: converts string hash back to bytes before `checkpw()`
- JWT uses `HS256` (symmetric) algorithm with 7-day expiry
- `SECRET_KEY` fallback `"supersecretkey_please_change_in_prod"` is a security issue

#### `deps.py` — JWT Middleware
- `OAuth2PasswordBearer(tokenUrl="auth/login")` tells FastAPI where to get tokens
- `get_current_user()` is a **dependency** — injected into any protected route
- Decodes JWT, extracts `sub` (email), queries DB for user
- Raises HTTP 401 for any JWT error (`PyJWTError` or `ExpiredSignatureError`)
- **Interview Trap**: `ExpiredSignatureError` is a subclass of `PyJWTError` — the second `except` block is unreachable

#### `blog_generator.py` — The Core AI Pipeline
This is the most complex and interview-critical file.

**State TypedDict:**
```python
class State(TypedDict):
    topic: str
    youtube_url: Optional[str]
    transcript: Optional[str]
    mode: str                    # closed_book / hybrid / open_book
    needs_research: bool
    queries: List[str]           # Search queries for Tavily
    evidence: List[dict]         # Tavily results
    plan: Optional[Plan]         # Structured blog outline
    sections: Annotated[List[tuple[int, str]], operator.add]  # Fan-out reducer
    final: str                   # Compiled Markdown output
```

**`Annotated[List[tuple[int,str]], operator.add]`** — This is the LangGraph **reducer annotation**. When multiple worker nodes write to `sections`, LangGraph uses `operator.add` to **merge all worker outputs** into one list (instead of overwriting).

**Graph Nodes:**
1. **`router_node`**: If YouTube URL → skip research (hybrid mode). Else → LLM decides mode and generates Tavily queries using structured output (`RouterDecision` schema).
2. **`research_node`**: Runs Tavily searches for each query → passes raw results to LLM → extracts structured `EvidencePack`.
3. **`orchestrator_node`**: LLM generates a `Plan` object (blog title, tone, audience, 5-9 `Task` objects each with goal, bullets, word count).
4. **`fanout()`**: Returns a list of `Send("worker", payload)` objects — one per task. LangGraph executes these **in parallel**.
5. **`worker_node`**: Each instance writes one section in Markdown using the task blueprint.
6. **`reducer_node`**: Sorts `sections` by `task.id` (because parallel workers finish in non-deterministic order) → joins into final Markdown.

**Graph Edges:**
```python
START → router
router → (conditional) → research OR orchestrator
research → orchestrator
orchestrator → (conditional fanout) → worker × N
worker → reducer
reducer → END
```

#### `email_service.py` — SMTP Mailer
- Uses `smtplib.SMTP_SSL` (port 465) — encrypted from connection start (vs STARTTLS on 587)
- Sends multipart email: plain text fallback + HTML alternative
- HTML email has branded design with purple OTP display
- Has a **mock mode**: if credentials are default placeholders, prints to console instead of sending

#### `research_service.py` — Tavily Integration
- `run_tavily_search()`: wraps `TavilySearchResults` tool, runs query, returns results
- `get_evidence()`: runs all queries, collects raw results, then uses LLM with `structured_output(EvidencePack)` to extract clean evidence
- Has fallback: if LLM evidence extraction fails, returns first 5 raw results

#### `youtube_service.py` — YouTube Transcript
- `extract_video_id()`: handles two URL formats: `youtube.com/watch?v=ID` and `youtu.be/ID`
- `get_youtube_transcript()`: uses `YouTubeTranscriptApi` (no API key needed — uses public captions)
- Returns joined text string from all transcript entries

#### `api.js` — Frontend API Layer
- Axios instance with `baseURL` from `VITE_API_URL` env var
- **Request interceptor**: automatically reads token from `localStorage` and adds `Authorization: Bearer <token>` header to every request
- `blogService.downloadBlog()`: creates a Blob, generates an object URL, programmatically clicks an `<a>` tag, then revokes the URL — proper memory management

#### `App.jsx` — Route Guards
Three guard components:
- `ProtectedRoute`: checks `authService.isAuthenticated()` → if not auth, redirects to `/landing`; shows `<Navbar />`
- `PublicOnlyRoute`: if already auth, redirects to `/app` (prevents logged-in user accessing login page)
- `LandingRoute`: same as PublicOnlyRoute but shows `<PublicNavbar />`

#### `DevToModal.jsx` — Publishing Component
State machine with 3 steps: `'ask'` → `'key-input'` → `'confirm'`
- Checks `localStorage` for saved key on mount
- `saveKey` toggle: optionally persists key to `localStorage`
- `handleClearKey()`: removes saved key, goes back to `key-input`

---

### Top 10 Interview Questions — Parts 1–4

1. **What is GhostWriterAI and what problem does it solve?**
   > It's a multi-agent AI platform that generates structured blog posts from a topic or YouTube URL. It solves the problem of content creation time for developers — what takes hours manually takes 60 seconds.

2. **Why did you use LangGraph instead of a simple LangChain chain?**
   > LangGraph supports stateful graph execution with conditional routing and parallel fan-out via the `Send()` primitive. A simple chain is linear — I needed workers to run in parallel and their outputs to be merged by a reducer, which LangGraph handles natively.

3. **Explain the fan-out pattern in your blog_generator.py.**
   > The `fanout()` function returns a list of `Send("worker", payload)` objects — one per section task. LangGraph spawns these as parallel executions. The `sections` field uses `Annotated[..., operator.add]` as a reducer, so all worker outputs are merged into one list instead of overwriting each other.

4. **How does JWT authentication work in your system?**
   > On login, the backend creates a signed JWT containing the user's email as the `sub` claim with a 7-day expiry using HS256. The frontend stores it in `localStorage` and the Axios interceptor attaches it as a `Bearer` token to every request. The `get_current_user` dependency in FastAPI decodes it and fetches the user from DB.

5. **What is `pool_pre_ping` and why did you use it?**
   > It's a SQLAlchemy option that tests the database connection before using it from the pool. Neon is a serverless DB that can close idle connections — without `pool_pre_ping`, you'd get stale connection errors. Combined with `pool_recycle=300`, connections are recycled every 5 minutes.

6. **What is the `Annotated[..., operator.add]` in the State TypedDict?**
   > It's a LangGraph reducer annotation. When multiple parallel worker nodes all write to the `sections` field, LangGraph uses `operator.add` (list concatenation) to merge all results instead of the last writer overwriting previous ones.

7. **Why is `allow_origins=["*"]` a security risk?**
   > It allows any domain to make cross-origin requests to your API. In production, it should be restricted to your frontend's exact domain (e.g., `https://ghostwriterai.vercel.app`) to prevent CSRF-style attacks from malicious sites.

8. **How does the OTP system work?**
   > On signup, `random.randint(100000, 999999)` generates a 6-digit OTP stored (as plaintext string) in the `users.otp` column. When the user submits the OTP, it's compared directly. On success, `is_verified=True` and `otp=None`. Weakness: no expiry time.

9. **Why is storing the DEV.TO API key in localStorage a risk?**
   > `localStorage` is accessible to any JavaScript on the page. An XSS attack could steal the key. A better approach would be to encrypt it or store it server-side tied to the user's session.

10. **How does the YouTube-to-blog feature work end-to-end?**
    > User pastes YouTube URL → `extract_video_id()` parses the ID from the URL → `YouTubeTranscriptApi().fetch(video_id)` gets captions (no API key needed) → transcript is injected into the Orchestrator's context → LLM writes the blog based on the transcript content.
