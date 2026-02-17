from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class BlogBase(BaseModel):
    topic: str

class BlogCreate(BlogBase):
    pass

class BlogResponse(BlogBase):
    id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class BlogGenerate(BaseModel):
    topic: str
