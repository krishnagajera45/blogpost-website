from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.routers import users, post,  contactus  # Import the updated users router with blogs and comments
from app import models
from app.database import engine
import time 
import logging
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app import security, models, database
from app.schemas import Token
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
import os
import logging
from app.schemas import Token
from app import models, database, security
from sqlalchemy.orm import Session
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv() 

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware for development purposes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for security in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key="68100e9b46258359923a9059394ee0b65780ac889e5520fd")

# OAuth configuration for GitHub
OAUTH_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
OAUTH_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_CALLBACK_URL = os.getenv("GITHUB_CALLBACK_URL")

oauth = OAuth()
oauth.register(
    name='github',
    client_id=OAUTH_CLIENT_ID,
    client_secret=OAUTH_CLIENT_SECRET,
    authorize_url='https://github.com/login/oauth/authorize',
    authorize_params=None,
    access_token_url='https://github.com/login/oauth/access_token',
    access_token_params=None,
    client_kwargs={'scope': 'user:email'},
    redirect_uri=GITHUB_CALLBACK_URL
)

# Create database tables on startup
models.Base.metadata.create_all(bind=engine)

# Include routers with prefix
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(post.router, prefix="/api", tags=["posts"])
app.include_router(contactus.router, prefix="/api", tags=["contactus"])

@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Log the incoming request with timestamp
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    logger.info(f"[{current_time}] Request: {request.method} {request.url}")

    # Measure the response time
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    # Log the response status and processing time
    logger.info(f"[{current_time}] Response: {response.status_code} completed in {process_time:.4f}s")

    return response

@app.get("/auth/github")
async def github_login(request: Request):
    redirect_uri = GITHUB_CALLBACK_URL
    return await oauth.github.authorize_redirect(request=request, redirect_uri=redirect_uri)

@app.get("/auth/github/callback")
async def github_callback(request: Request, db: Session = Depends(database.get_db)):
    token = await oauth.github.authorize_access_token(request)
    
    # Retrieve user data from GitHub
    user_data = await oauth.github.get('https://api.github.com/user', token=token)
    user_data = user_data.json()

    # Check if email is available, if not, get it from /user/emails endpoint
    email = user_data.get('email')
    if email is None:
        emails_data = await oauth.github.get('https://api.github.com/user/emails', token=token)
        emails_data = emails_data.json()
        primary_emails = [e['email'] for e in emails_data if e.get('primary') and e.get('verified')]
        if primary_emails:
            email = primary_emails[0]
    
    # If email is still None, raise an exception
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required for GitHub signup but was not provided."
        )

    # Create or retrieve user from the database
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            name=user_data.get('name') or "GitHub User",
            email=email,
            password="",  # Password is not needed for OAuth users
            oauth_provider="github"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    response = RedirectResponse(url="http://localhost:3000")  # Redirect to your frontend
    response.set_cookie(key="access_token", value=f"Bearer {access_token}", httponly=True)
    return response



@app.post("/token", response_model=Token)
def login_for_access_token(
    db: Session = Depends(database.get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user = security.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/")
def read_root():
    return {"message": "Welcome to the WordEcho - Blogging web application!"}
