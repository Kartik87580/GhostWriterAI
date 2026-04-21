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

## 🔐 Authentication Flow

```
User visits site
  └─► Not logged in? → Redirect to /login
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
.venv\Scripts\activate   # Windows
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

> **First-time Neon DB setup**: If your `users` or `blogs` table already exists and is missing new columns, run the one-time migration script:
> ```bash
> python migrate.py
> ```

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
| **Database** | [Neon](https://neon.tech) | Serverless PostgreSQL — add `DATABASE_URL` (pooled connection) as env var in Render |

---

## 📂 Project Structure

```text
GhostWriterAI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_auth.py     # Signup, Login, Verify OTP endpoints
│   │   │   ├── routes_blog.py     # Blog CRUD (auth-protected)
│   │   │   └── deps.py            # JWT get_current_user dependency
│   │   ├── core/
│   │   │   ├── config.py          # App settings & env vars
│   │   │   └── security.py        # Bcrypt hashing & JWT generation
│   │   ├── db/
│   │   │   ├── database.py        # SQLAlchemy engine + session
│   │   │   └── crud_blog.py       # Blog DB operations
│   │   ├── models/
│   │   │   ├── user_model.py      # User table (email, password, otp, is_verified)
│   │   │   └── blog_model.py      # Blog table (user_id FK)
│   │   ├── schemas/
│   │   │   ├── user_schema.py     # Pydantic user validation
│   │   │   └── blog_schema.py     # Pydantic blog validation
│   │   ├── services/
│   │   │   ├── blog_generator.py  # LangGraph multi-agent pipeline
│   │   │   ├── email_service.py   # HTML OTP email sender
│   │   │   └── youtube_service.py # YouTube transcript extractor
│   │   └── main.py                # FastAPI app entry point
│   ├── migrate.py                 # One-time DB column migration script
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Signup.jsx         # Signup page
│   │   │   ├── VerifyOTP.jsx      # OTP verification page
│   │   │   ├── Home.jsx           # Blog generator dashboard
│   │   │   ├── BlogHistory.jsx    # User's blog history
│   │   │   └── BlogView.jsx       # Individual blog viewer
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Nav with logout button
│   │   │   └── AnimatedBackground.jsx
│   │   ├── services/
│   │   │   ├── api.js             # Axios instance + JWT interceptor
│   │   │   └── authService.js     # Login, signup, verifyOTP, logout
│   │   └── App.jsx                # Routes with ProtectedRoute wrapper
│   └── package.json
└── readme.md
```

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ for the Generative AI Community</p>


---

## 🚀 Key Features

- **Multi-Agent Orchestration**: Uses LangGraph to manage a workflow between Research, Writing, and Editorial agents.
- **Real-time Research**: Integrates with Tavily Search API to fetch the most recent and relevant data from the web.
- **High-Performance LLM**: Leverages Groq's LPU™ Inference Engine for blazing-fast content generation.
- **Beautiful UI**: A modern React-based dashboard with real-time markdown preview.
- **Database Persistence**: Stores generated blogs and research notes in a SQLite database for easy access.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI
- **LLM Orchestration**: LangChain & LangGraph
- **Inference**: Groq (Llama 3/Mistral models)
- **Search Engine**: Tavily API
- **Database**: SQLAlchemy with SQLite
- **Environment**: Python 3.9+

### Frontend
- **Framework**: Vite + React
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Markdown Rendering**: React Markdown

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/8_blog_writing_agent.git
cd 8_blog_writing_agent
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
GROQ_API_KEY=your_groq_key
TAVILY_API_KEY=your_tavily_key
DATABASE_URL=sqlite+aiosqlite:///./blogs.db
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 🏃 Running the Application

### Start the Backend
```bash
cd backend
python app/main.py
```
The API will be available at `http://localhost:8000`

### Start the Frontend
```bash
cd frontend
npm run dev
```
The UI will be available at `http://localhost:5173`

---

## 📂 Project Structure

```text
8_blog_writing_agent/
├── backend/                # FastAPI Application
│   ├── app/                # Core logic, agents, and API
│   ├── blogs.db            # SQLite database
│   └── requirements.txt    # Python dependencies
├── frontend/               # React Application
│   ├── src/                # UI components and pages
│   └── package.json        # Node dependencies
└── notebooks/              # Experimental Jupyter notebooks
```

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ for the Generative AI Community</p>
