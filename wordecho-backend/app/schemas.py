from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# User Schema
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: str = None
    email: str = None

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

# class User(UserBase):
#     id: int
#     created_at: datetime

#     class Config:
#         orm_mode = True  # Tells Pydantic to use ORM mode for SQLAlchemy models

# Blog Schema
class BlogBase(BaseModel):
    title: str
    content: str

class BlogCreate(BlogBase):
    pass

class Blog(BlogBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True  # Tells Pydantic to use ORM mode for SQLAlchemy models

# Comment Schema
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    blog_id: int
    user_id: int

    class Config:
        orm_mode = True  # Tells Pydantic to use ORM mode for SQLAlchemy models


class ContactCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str]
    message: str
