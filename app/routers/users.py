from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import UserCreate, UserResponse, UserUpdate
from app.crud import get_users, create_user, update_user, delete_user
from app.database import get_db
from app.security import get_current_active_user

router = APIRouter()


@router.get("/users/me", response_model=UserResponse)
def get_current_user_profile(current_user: UserResponse = Depends(get_current_active_user)):
    return current_user


@router.post("/users/", response_model=UserResponse)
def add_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)