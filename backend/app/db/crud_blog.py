from sqlalchemy.orm import Session
from app.models.blog_model import Blog
from app.schemas.blog_schema import BlogCreate

def create_blog(db: Session, topic: str, content: str, user_id: int):
    db_blog = Blog(topic=topic, content=content, user_id=user_id)
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    return db_blog

def get_blogs(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Blog).filter(Blog.user_id == user_id).order_by(Blog.created_at.desc()).offset(skip).limit(limit).all()

def get_blog(db: Session, blog_id: int, user_id: int):
    return db.query(Blog).filter(Blog.id == blog_id, Blog.user_id == user_id).first()
