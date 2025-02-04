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

@router.get("/users/", response_model=list[UserResponse])
def read_users(db: Session = Depends(get_db)):
    return get_users(db)

@router.put("/users/{user_id}", response_model=UserResponse)
def edit_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    updated_user = update_user(db, user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/users/{user_id}")
def remove_user(user_id: int, db: Session = Depends(get_db)):
    if not delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True}
