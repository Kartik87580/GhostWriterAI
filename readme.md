# ✍️ GhostWriterAI

An intelligent, multi-agent blog writing system powered by **LangChain**, **LangGraph**, **Groq**, and **Tavily**. Users sign up, verify their email via OTP, and get their own private workspace to generate and manage high-quality AI blog posts — from a topic or a YouTube URL.

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat-square&logo=react&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.0+-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-Latest-121212?style=flat-square&logo=chainlink&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)
![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render&logoColor=black)

---

## 🚀 Key Features

- **JWT Authentication**: Secure signup, email OTP verification, and login flow.
- **Per-User Data Isolation**: Every blog is scoped to the authenticated user — no data leaks between accounts.
- **HTML OTP Emails**: Aesthetic, branded verification emails sent via Gmail SMTP.
- **Multi-Agent Orchestration**: LangGraph manages a pipeline between Research, Writing, and Editorial agents.
- **Real-time Web Research**: Integrates with Tavily Search API to fetch current and relevant information.
- **YouTube-to-Blog**: Generate high-quality blog posts from any YouTube video URL.
- **High-Performance LLM**: Leverages Groq's LPU™ Inference Engine with Llama 3.3 70B.
- **Persistent Cloud Database**: Stores all user data and blogs in Neon DB (Serverless PostgreSQL).
- **Fully Deployed**: Frontend on Vercel, Backend on Render — live and ready for production.

---

## 🛠️ Technology Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI + Uvicorn |
| Auth | JWT (PyJWT) + bcrypt password hashing |
| Email | Python `smtplib` + Gmail SMTP |
| LLM Orchestration | LangChain & LangGraph |
| Inference | Groq (Llama 3.3 70B Versatile) |
| Search | Tavily Search API |
| Database ORM | SQLAlchemy |
| Database | Neon DB (Serverless PostgreSQL) |
| Deployment | Render (Free Tier) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Vite + React 18 |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios (with JWT interceptor) |
| Animations | Framer Motion |
| Routing | React Router v7 |
| Deployment | Vercel (Free Tier) |

---

## 🗺️ System Workflow & Architecture

```mermaid
graph TD
    %% Styling Definitions
    classDef clientClass fill:#E0F7FA,stroke:#00ACC1,stroke-width:2px,color:#006064;
    classDef apiClass fill:#EDE7F6,stroke:#5E35B1,stroke-width:2px,color:#311B92;
    classDef graphClass fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px,color:#E65100;
    classDef agentClass fill:#E8F5E9,stroke:#43A047,stroke-width:2px,color:#1B5E20;
    classDef extClass fill:#FCE4EC,stroke:#D81B60,stroke-width:2px,color:#880E4F;
    classDef dbClass fill:#FFFDE7,stroke:#FBC02D,stroke-width:2px,color:#F57F17;

    subgraph Client["🎨 Frontend Client (React + Vite)"]
        UI["Writer Dashboard<br/>(Home.jsx)"]:::clientClass
        AuthUI["Authentication Panel<br/>(Signup, Login, OTP)"]:::clientClass
        LS[("Local Storage<br/>(JWT & DEV.TO Key)")]:::clientClass
    end

    subgraph API["⚡ Backend Gateway (FastAPI)"]
        AR["Auth Controller<br/>(routes_auth.py)"]:::apiClass
        BR["Blog Controller<br/>(routes_blog.py)"]:::apiClass
        SMTP["SMTP Mailer Service<br/>(Gmail SMTP)"]:::apiClass
    end

    subgraph AgentPipeline["🤖 LangGraph Multi-Agent Orchestration (blog_generator.py)"]
        direction TB
        InitState["State Initialization<br/>(Topic, Transcript, etc.)"]:::graphClass
        RouterNode{"1. Router Agent"}:::graphClass
        ResearchNode["2. Research Agent<br/>(Tavily Integration)"]:::agentClass
        OrchNode["3. Orchestrator Agent<br/>(Generates Plan & Tasks)"]:::agentClass
        
        subgraph Workers["Parallel Execution Plan (Fan-Out Map)"]
            W1["Worker Agent 1<br/>(Section 1)"]:::agentClass
            W2["Worker Agent 2<br/>(Section 2)"]:::agentClass
            Wn["Worker Agent N<br/>(Section N)"]:::agentClass
        end
        
        Reducer["4. Reducer / Compiler<br/>(Merges & Formats Sections)"]:::agentClass
    end

    subgraph External["🌐 Cloud & External Integrations"]
        Neon[("Neon Database<br/>(Serverless PostgreSQL)")]:::dbClass
        Tavily["Tavily Search API<br/>(Real-time Web Context)"]:::extClass
        Groq["Groq LPU Engine<br/>(Llama 3.3 70B)"]:::extClass
        DevTo["DEV.TO API<br/>(Developer Platform)"]:::extClass
    end

    %% --- Authentication Workflow Connections ---
    AuthUI -->|1. Submit Signup / Login| AR
    AR -->|2. Query / Save User Credentials| Neon
    AR -->|3. Trigger OTP Request| SMTP
    SMTP -.->|4. Deliver Email OTP| AuthUI
    AR -->|5. Return Signed JWT| AuthUI
    AuthUI -->|6. Cache Session Info| LS

    %% --- Blog Generation Intake Flow ---
    UI -->|1. Submit Generation Prompt| BR
    LS -.->|JWT Authorization Header| BR
    BR -->|2. Verify Session Token| Neon
    BR -->|3. Start Async Generation| InitState

    %% --- LangGraph Agent Processing State Machine ---
    InitState --> RouterNode
    RouterNode -->|Needs Web Search| ResearchNode
    RouterNode -->|Direct to Outline Plan| OrchNode
    
    ResearchNode -->|Query Engine| Tavily
    Tavily -->|Inject Web Evidence| ResearchNode
    ResearchNode --> OrchNode
    
    OrchNode -->|Generate Structured Schema| Groq
    Groq -->|Plan (Title, Tone, Section Tasks)| OrchNode
    
    OrchNode -->|Fan-Out Tasks Parallelly| Workers
    
    W1 -->|Generate Content| Groq
    W2 -->|Generate Content| Groq
    Wn -->|Generate Content| Groq
    
    Groq -->|Section 1 Markdown| W1
    Groq -->|Section 2 Markdown| W2
    Groq -->|Section N Markdown| Wn
    
    Workers -->|Collate Sections| Reducer
    Reducer -->|Compiled Blog Markdown| BR

    %% --- Post Generation and Distribution Flow ---
    BR -->|4. Persist Blog Data| Neon
    BR -->|5. Deliver Markdown Document| UI
    
    UI -->|6. Export Document| Download[".md File / Clipboard"]:::clientClass
    UI -->|7. Request Cloud Publishing| BR
    LS -.->|DEV.TO API Key| BR
    BR -->|8. Push Article JSON| DevTo
    DevTo -->|9. Post URL / Live Link| UI
```

---

## 🔐 Authentication Flow

```
User visits site
  └─► Not logged in? → Redirect to /landing
        ├─► /signup  → Enter email + password
        │     └─► OTP sent to email (HTML formatted)
        │           └─► /verify-otp → Account activated
        └─► /login  → JWT token issued
              └─► Token stored in localStorage
                    └─► All API requests auto-attach Bearer token
```

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Kartik87580/GhostWriterAI.git
cd GhostWriterAI
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows (use source .venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
SECRET_KEY=your_super_secret_jwt_key
SENDER_EMAIL=your_gmail@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password
```

Run the backend:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:8000
```

Run the frontend:
```bash
npm run dev
```

---

## 🚢 Deployment Guide

| Service | Platform | Config |
|---|---|---|
| **Backend** | [Render](https://render.com) | Root Dir: `backend`, Build: `pip install -r requirements.txt`, Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Frontend** | [Vercel](https://vercel.com) | Root Dir: `frontend`, Framework: Vite, Env Var: `VITE_API_URL=<your_render_url>` |
| **Database** | [Neon](https://neon.tech) | Serverless PostgreSQL — add `DATABASE_URL` as env var in Render |

**Note**: For Vercel deployments, ensure a `vercel.json` exists in the frontend root with rewrites to `index.html` to prevent 404s on refresh.

---

## 📂 Project Structure

```text
GhostWriterAI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_auth.py     # Signup, Login, Verify OTP
│   │   │   ├── routes_blog.py     # Generation & DEV.TO Publishing
│   │   │   └── deps.py            # JWT Authentication
│   │   ├── core/
│   │   │   ├── config.py          # Environment settings
│   │   │   ├── llm_client.py      # LLM initialization
│   │   │   └── security.py        # Hashing & JWT logic
│   │   ├── db/
│   │   │   ├── database.py        # SQLAlchemy Setup
│   │   │   └── crud_blog.py       # Blog DB Operations
│   │   ├── models/
│   │   │   ├── blog_model.py      # SQLAlchemy Blog Model
│   │   │   └── user_model.py      # SQLAlchemy User Model
│   │   ├── schemas/
│   │   │   ├── blog_schema.py     # Pydantic schemas for blogs
│   │   │   └── user_schema.py     # Pydantic schemas for users
│   │   ├── services/
│   │   │   ├── blog_generator.py  # LangGraph Pipeline
│   │   │   ├── email_service.py   # HTML SMTP Email
│   │   │   ├── prompt_builder.py  # System Prompt Templates
│   │   │   ├── research_service.py# Tavily Search Integration
│   │   │   └── youtube_service.py # YouTube Transcript API
│   │   └── main.py                # Entry Point
│   ├── requirements.txt
│   └── migrate.py                 # Database migration script
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx        # Public Landing Page
│   │   │   ├── Home.jsx           # AI Writer Dashboard (Topic/YouTube)
│   │   │   ├── BlogHistory.jsx    # User's saved blogs
│   │   │   ├── BlogView.jsx       # Individual blog viewer
│   │   │   ├── Login.jsx          # User Login
│   │   │   ├── Signup.jsx         # User Registration
│   │   │   └── VerifyOTP.jsx      # Email Verification flow
│   │   ├── components/
│   │   │   ├── DevToModal.jsx     # Secure DEV.TO Publishing modal
│   │   │   ├── AnimatedBackground.jsx # UI Effects
│   │   │   ├── Navbar.jsx         # Authenticated Navigation
│   │   │   └── PublicNavbar.jsx   # Public Navigation
│   │   └── App.jsx                # Routing & Auth Guards
│   └── vercel.json                # Vercel SPA config
└── readme.md
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">Made with ❤️ for the Generative AI Community</p>

