# app/dependencies.py
from typing import Any, Generator
from sqlalchemy.orm import Session
from app.database import SessionLocal

# Dependency to get the database session
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Example of a function that may use 'Any'
def some_function(data: Any):
    return data
