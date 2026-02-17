from sqlalchemy.orm import Session
from app.models.blog_model import Blog
from app.schemas.blog_schema import BlogCreate

def create_blog(db: Session, topic: str, content: str):
    db_blog = Blog(topic=topic, content=content)
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    return db_blog

def get_blogs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Blog).order_by(Blog.created_at.desc()).offset(skip).limit(limit).all()

def get_blog(db: Session, blog_id: int):
    return db.query(Blog).filter(Blog.id == blog_id).first()
