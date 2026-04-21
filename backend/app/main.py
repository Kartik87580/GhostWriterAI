from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes_blog, routes_auth
from app.db.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Blog Writer API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(routes_auth.router, prefix="/auth", tags=["auth"])
app.include_router(routes_blog.router, tags=["blogs"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Blog Writer API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
