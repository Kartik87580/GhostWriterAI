from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db import crud_blog
from app.schemas import blog_schema
from app.services.blog_generator import generate_blog_content
from app.api.deps import get_current_user
from app.models.user_model import User

router = APIRouter()

@router.post("/generate-blog", response_model=blog_schema.BlogResponse)
async def generate_blog(request: blog_schema.BlogGenerate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        content = await generate_blog_content(topic=request.topic, youtube_url=request.youtube_url)
        
        # Use request.topic if provided, else use youtube_url
        display_topic = request.topic if request.topic else f"YouTube: {request.youtube_url}"
        
        db_blog = crud_blog.create_blog(db, topic=display_topic, content=content, user_id=current_user.id)
        return db_blog
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/blogs", response_model=List[blog_schema.BlogResponse])
def read_blogs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    blogs = crud_blog.get_blogs(db, user_id=current_user.id, skip=skip, limit=limit)
    return blogs

@router.get("/blogs/{blog_id}", response_model=blog_schema.BlogResponse)
def read_blog(blog_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_blog = crud_blog.get_blog(db, blog_id=blog_id, user_id=current_user.id)
    if db_blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    return db_blog
