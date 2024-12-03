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

def get_comments_for_blog(db: Session, blog_id: int):
    return db.query(models.Comment).filter(models.Comment.blog_id == blog_id).all()

def get_comment_by_id(db: Session, comment_id: int):
    return db.query(models.Comment).filter(models.Comment.id == comment_id).first()


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
