from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db import crud_blog
from app.schemas import blog_schema
from app.services.blog_generator import generate_blog_content

router = APIRouter()

@router.post("/generate-blog", response_model=blog_schema.BlogResponse)
async def generate_blog(request: blog_schema.BlogGenerate, db: Session = Depends(get_db)):
    try:
        content = await generate_blog_content(request.topic)
        db_blog = crud_blog.create_blog(db, topic=request.topic, content=content)
        return db_blog
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/blogs", response_model=List[blog_schema.BlogResponse])
def read_blogs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    blogs = crud_blog.get_blogs(db, skip=skip, limit=limit)
    return blogs

@router.get("/blogs/{blog_id}", response_model=blog_schema.BlogResponse)
def read_blog(blog_id: int, db: Session = Depends(get_db)):
    db_blog = crud_blog.get_blog(db, blog_id=blog_id)
    if db_blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    return db_blog
