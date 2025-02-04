from sqlalchemy.orm import Session
from app import models, schemas
from app.security import get_password_hash
from sqlalchemy.orm import Session
from app.models import User
from app.schemas import UserCreate, UserUpdate


# user CRUD operations
def get_users(db: Session):
    return db.query(User).all()

def create_user(db: Session, user: UserCreate, oauth_provider="local"):
    db_user = User(
        name=user.name,
        email=user.email,
        # password=user.password if user.password else None,  # Handle GitHub OAuth users with no password
        password=get_password_hash(user.password) if user.password else None,  # Hash the password if present

        oauth_provider=oauth_provider  # Track user creation method
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
    
def update_user(db: Session, user_id: int, user_update: UserUpdate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    if user_update.name:
        db_user.name = user_update.name
    if user_update.email:
        db_user.email = user_update.email
    db.commit()
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False
    
def get_comments_for_blog(db: Session, blog_id: int):
    return db.query(models.Comment).filter(models.Comment.blog_id == blog_id).all()

def get_comment_by_id(db: Session, comment_id: int):
    return db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    
def get_blog_by_id(db: Session, blog_id: int):
    return db.query(models.Blog).filter(models.Blog.id == blog_id).first()

def get_blogs(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Blog).offset(skip).limit(limit).all()

def update_blog(db: Session, blog_id: int, blog: schemas.BlogCreate, user_id: int):
    db_blog = db.query(models.Blog).filter(models.Blog.id == blog_id, models.Blog.user_id == user_id).first()
    if db_blog:
        db_blog.title = blog.title
        db_blog.content = blog.content
        db.commit()
        db.refresh(db_blog)
        return db_blog
    return None

def create_contact_message(db: Session, contact: schemas.ContactCreate):
    db_contact = models.ContactMessage(
        name=contact.name,
        email=contact.email,
        phone=contact.phone,
        message=contact.message
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact
