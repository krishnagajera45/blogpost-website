# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Define the database URL (example with SQLite)
DATABASE_URL = "sqlite:///./test.db"  # Update this with your actual database URL

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})  # SQLite-specific for multithreading

# Create a SessionLocal class to handle sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a base class for models to inherit from
Base = declarative_base()

# Dependency to get the database session (will be used in routes)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
