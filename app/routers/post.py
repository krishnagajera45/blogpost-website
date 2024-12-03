from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas, dependencies
from app.security import get_current_active_user

router = APIRouter()


# New Blog-related routes

@router.get("/blogs/", response_model=list[schemas.Blog])
def read_blogs(skip: int = 0, limit: int = 10, db: Session = Depends(dependencies.get_db)):
    blogs = crud.get_blogs(db, skip=skip, limit=limit)
    return blogs

@router.get("/blogs/{blog_id}", response_model=schemas.Blog)
def read_blog(blog_id: int, db: Session = Depends(dependencies.get_db), ):
    blog = crud.get_blog_by_id(db, blog_id=blog_id)
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@router.put("/blogs/{blog_id}", response_model=schemas.Blog)
def update_blog(blog_id: int, blog: schemas.BlogCreate, db: Session = Depends(dependencies.get_db), user_id: int = 1):
    updated_blog = crud.update_blog(db=db, blog_id=blog_id, blog=blog, user_id=user_id)
    if not updated_blog:
        raise HTTPException(status_code=404, detail="Blog not found or you don't have permission to update it")
    return updated_blog

