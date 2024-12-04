from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud
from app.database import get_db

router = APIRouter()

@router.post("/contact/")
def submit_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    try:
        crud.create_contact_message(db, contact)
        return {"message": "Contact message received successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error.")
