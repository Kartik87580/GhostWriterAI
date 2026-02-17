# ✍️ AI Blog Writing Agent

An intelligent, multi-agent system designed to research, draft, and optimize high-quality blog posts. Powered by **LangChain**, **LangGraph**, **Groq**, and **Tavily**, this application automates the entire content creation lifecycle from a single topic or prompt.

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat-square&logo=react&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-Latest-121212?style=flat-square&logo=chainlink&logoColor=white)

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
