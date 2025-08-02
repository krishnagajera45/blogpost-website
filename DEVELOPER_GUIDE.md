# 👩‍💻 WordEcho Developer Guide

> *Your complete handbook for contributing to and extending the WordEcho platform*

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.95.2-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

**🚀 From Zero to Hero: Build, Deploy, and Scale WordEcho**

</div>

## 🎯 Table of Contents

- [🏁 Getting Started](#-getting-started)
- [🏗️ Development Environment](#️-development-environment)
- [📂 Project Architecture](#-project-architecture)
- [🔧 Backend Development](#-backend-development)
- [🎨 Frontend Development](#-frontend-development)
- [🧪 Testing Strategy](#-testing-strategy)
- [📦 Database Management](#-database-management)
- [🔐 Security Best Practices](#-security-best-practices)
- [🚀 Deployment Guide](#-deployment-guide)
- [🐛 Debugging & Troubleshooting](#-debugging--troubleshooting)
- [🎨 Code Style & Standards](#-code-style--standards)
- [🤝 Contributing Guidelines](#-contributing-guidelines)

---

## 🏁 Getting Started

### 🛠️ Prerequisites

Before diving in, ensure you have these tools installed:

```bash
# Check versions
python --version    # 3.8+
node --version      # 16+
npm --version       # 8+
git --version       # 2.0+
```

### ⚡ Quick Setup

```bash
# 1. Clone and navigate
git clone https://github.com/yourusername/wordecho.git
cd wordecho

# 2. Set up backend
cd wordecho-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Set up frontend
cd ../wordecho-frontend
npm install

# 4. Environment configuration
cp .env.example .env
# Edit .env with your configuration
```

### 🏃‍♂️ Development Servers

```bash
# Terminal 1: Backend
cd wordecho-backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd wordecho-frontend
npm start
```

🎉 **You're ready!** Visit http://localhost:3000

---

## 🏗️ Development Environment

### 🔧 Recommended IDE Setup

#### VS Code Extensions
```json
{
  "recommendations": [
    "ms-python.python",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-python.flake8",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "HTML"
  }
}
```

### 🐳 Docker Development

```dockerfile
# Dockerfile.dev (Backend)
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  backend:
    build: 
      context: ./wordecho-backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - ./wordecho-backend:/app
    environment:
      - DATABASE_URL=sqlite:///./test.db
      
  frontend:
    build:
      context: ./wordecho-frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./wordecho-frontend:/app
      - /app/node_modules
```

---

## 📂 Project Architecture

### 🎨 Design Patterns

#### Backend: Repository Pattern
```python
# app/repositories/user_repository.py
from abc import ABC, abstractmethod
from sqlalchemy.orm import Session
from app.models import User

class UserRepositoryInterface(ABC):
    @abstractmethod
    def get_by_id(self, user_id: int) -> User:
        pass
    
    @abstractmethod
    def create(self, user_data: dict) -> User:
        pass

class UserRepository(UserRepositoryInterface):
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, user_id: int) -> User:
        return self.db.query(User).filter(User.id == user_id).first()
    
    def create(self, user_data: dict) -> User:
        user = User(**user_data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
```

#### Frontend: Container/Presenter Pattern
```javascript
// components/BlogCard/BlogCardContainer.jsx
import { useState, useEffect } from 'react';
import BlogCardPresenter from './BlogCardPresenter';
import { useBlogApi } from '../../hooks/useBlogApi';

const BlogCardContainer = ({ blogId }) => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchBlog, deleteBlog } = useBlogApi();

  useEffect(() => {
    loadBlog();
  }, [blogId]);

  const loadBlog = async () => {
    try {
      const blogData = await fetchBlog(blogId);
      setBlog(blogData);
    } catch (error) {
      console.error('Failed to load blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await deleteBlog(blogId);
    // Handle success/error
  };

  return (
    <BlogCardPresenter
      blog={blog}
      loading={loading}
      onDelete={handleDelete}
    />
  );
};
```

### 🔄 State Management Architecture

```javascript
// contexts/AuthContext.js
import { createContext, useContext, useReducer } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload, isAuthenticated: true };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  });

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authApi.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 🔧 Backend Development

### 🏗️ FastAPI Best Practices

#### Dependency Injection
```python
# app/dependencies.py
from typing import Generator
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.repositories.user_repository import UserRepository

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

# app/routers/users.py
@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    user_repo: UserRepository = Depends(get_user_repository)
):
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

#### Error Handling
```python
# app/exceptions.py
from fastapi import HTTPException
from typing import Any, Dict, Optional

class WordEchoException(Exception):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details
        super().__init__(self.message)

class UserNotFoundException(WordEchoException):
    pass

class InvalidCredentialsException(WordEchoException):
    pass

# app/exception_handlers.py
from fastapi import Request
from fastapi.responses import JSONResponse

async def wordecho_exception_handler(request: Request, exc: WordEchoException):
    return JSONResponse(
        status_code=400,
        content={
            "detail": exc.message,
            "extra": exc.details
        }
    )

# app/main.py
from app.exceptions import WordEchoException
from app.exception_handlers import wordecho_exception_handler

app.add_exception_handler(WordEchoException, wordecho_exception_handler)
```

#### Middleware Implementation
```python
# app/middleware/logging.py
import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url}")
        
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(f"Response: {response.status_code} ({process_time:.3f}s)")
        
        return response

# app/main.py
app.add_middleware(LoggingMiddleware)
```

### 🗄️ Database Migrations with Alembic

```bash
# Install Alembic
pip install alembic

# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Add blog table"

# Apply migration
alembic upgrade head
```

```python
# alembic/versions/001_add_blog_table.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'blogs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('blogs')
```

### 🧪 Backend Testing

```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

# tests/test_users.py
def test_create_user(client):
    response = client.post(
        "/api/users/",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
```

---

## 🎨 Frontend Development

### ⚛️ React Best Practices

#### Custom Hooks
```javascript
// hooks/useBlog.js
import { useState, useEffect } from 'react';
import { blogApi } from '../services/api';

export const useBlog = (blogId) => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!blogId) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const data = await blogApi.getBlog(blogId);
        setBlog(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  const updateBlog = async (updates) => {
    try {
      const updatedBlog = await blogApi.updateBlog(blogId, updates);
      setBlog(updatedBlog);
      return updatedBlog;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { blog, loading, error, updateBlog };
};
```

#### Error Boundaries
```javascript
// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Oops! Something went wrong.</h2>
          <details>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### API Service Layer
```javascript
// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // User methods
  async getUser(id) {
    return this.client.get(`/api/users/${id}`);
  }

  async createUser(userData) {
    return this.client.post('/api/users/', userData);
  }

  // Blog methods
  async getBlogs(params = {}) {
    return this.client.get('/api/blogs/', { params });
  }

  async getBlog(id) {
    return this.client.get(`/api/blogs/${id}`);
  }

  async createBlog(blogData) {
    return this.client.post('/api/blogs/', blogData);
  }

  async updateBlog(id, updates) {
    return this.client.put(`/api/blogs/${id}`, updates);
  }
}

export const apiService = new ApiService();
export const blogApi = {
  getBlogs: (params) => apiService.getBlogs(params),
  getBlog: (id) => apiService.getBlog(id),
  createBlog: (data) => apiService.createBlog(data),
  updateBlog: (id, data) => apiService.updateBlog(id, data),
};
```

### 🎨 Component Development

#### Compound Components Pattern
```javascript
// components/BlogEditor/index.jsx
import React, { createContext, useContext, useState } from 'react';

const BlogEditorContext = createContext();

const BlogEditor = ({ children, onSave, initialData = {} }) => {
  const [content, setContent] = useState(initialData.content || '');
  const [title, setTitle] = useState(initialData.title || '');

  const value = {
    content,
    setContent,
    title,
    setTitle,
    onSave: () => onSave({ title, content })
  };

  return (
    <BlogEditorContext.Provider value={value}>
      <div className="blog-editor">
        {children}
      </div>
    </BlogEditorContext.Provider>
  );
};

const Title = ({ placeholder = "Enter title..." }) => {
  const { title, setTitle } = useContext(BlogEditorContext);
  
  return (
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder={placeholder}
      className="blog-editor__title"
    />
  );
};

const Content = ({ placeholder = "Start writing..." }) => {
  const { content, setContent } = useContext(BlogEditorContext);
  
  return (
    <textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder={placeholder}
      className="blog-editor__content"
    />
  );
};

const SaveButton = ({ children = "Save" }) => {
  const { onSave } = useContext(BlogEditorContext);
  
  return (
    <button onClick={onSave} className="blog-editor__save">
      {children}
    </button>
  );
};

BlogEditor.Title = Title;
BlogEditor.Content = Content;
BlogEditor.SaveButton = SaveButton;

export default BlogEditor;

// Usage
<BlogEditor onSave={handleSave} initialData={blogData}>
  <BlogEditor.Title placeholder="What's your story?" />
  <BlogEditor.Content placeholder="Tell us more..." />
  <BlogEditor.SaveButton>Publish</BlogEditor.SaveButton>
</BlogEditor>
```

---

## 🧪 Testing Strategy

### 🎯 Testing Pyramid

```
    /\     E2E Tests (5-10%)
   /  \    Integration Tests (15-25%)
  /____\   Unit Tests (70-80%)
```

### 🧪 Frontend Testing

#### Component Testing
```javascript
// __tests__/components/BlogCard.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlogCard from '../BlogCard';

const mockBlog = {
  id: 1,
  title: 'Test Blog',
  content: 'Test content',
  created_at: '2024-01-01T00:00:00Z'
};

const renderBlogCard = (props = {}) => {
  return render(
    <BrowserRouter>
      <BlogCard blog={mockBlog} {...props} />
    </BrowserRouter>
  );
};

describe('BlogCard', () => {
  test('renders blog information', () => {
    renderBlogCard();
    
    expect(screen.getByText('Test Blog')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    renderBlogCard({ onEdit });
    
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(1);
  });

  test('shows loading state during API call', async () => {
    const onDelete = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    renderBlogCard({ onDelete });
    
    fireEvent.click(screen.getByText('Delete'));
    
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Deleting...')).not.toBeInTheDocument();
    });
  });
});
```

#### Hook Testing
```javascript
// __tests__/hooks/useBlog.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { useBlog } from '../hooks/useBlog';
import { blogApi } from '../services/api';

jest.mock('../services/api');

describe('useBlog', () => {
  test('fetches blog data on mount', async () => {
    const mockBlog = { id: 1, title: 'Test' };
    blogApi.getBlog.mockResolvedValue(mockBlog);

    const { result } = renderHook(() => useBlog(1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.blog).toEqual(mockBlog);
    expect(blogApi.getBlog).toHaveBeenCalledWith(1);
  });
});
```

### 🔧 Backend Testing

#### API Testing
```python
# tests/test_api.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_blog():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Create user first
        user_response = await ac.post("/api/users/", json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "testpass"
        })
        
        # Login to get token
        login_response = await ac.post("/token", data={
            "username": "test@example.com",
            "password": "testpass"
        })
        token = login_response.json()["access_token"]
        
        # Create blog
        blog_response = await ac.post(
            "/api/blogs/",
            json={
                "title": "Test Blog",
                "content": "Test content"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert blog_response.status_code == 201
        blog_data = blog_response.json()
        assert blog_data["title"] == "Test Blog"
```

### 🎭 E2E Testing with Cypress

```javascript
// cypress/e2e/blog_creation.cy.js
describe('Blog Creation Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('test@example.com', 'testpassword');
  });

  it('creates a new blog post', () => {
    cy.get('[data-testid="create-blog-btn"]').click();
    
    cy.get('[data-testid="blog-title"]')
      .type('My First Blog Post');
    
    cy.get('[data-testid="blog-content"]')
      .type('This is the content of my first blog post.');
    
    cy.get('[data-testid="publish-btn"]').click();
    
    cy.url().should('include', '/blog/');
    cy.get('[data-testid="blog-title"]')
      .should('contain', 'My First Blog Post');
  });

  it('validates required fields', () => {
    cy.get('[data-testid="create-blog-btn"]').click();
    cy.get('[data-testid="publish-btn"]').click();
    
    cy.get('[data-testid="error-message"]')
      .should('contain', 'Title is required');
  });
});

// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-btn"]').click();
  cy.url().should('include', '/user-home');
});
```

---

## 📦 Database Management

### 🔄 Backup & Restore

```bash
#!/bin/bash
# scripts/backup_db.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/wordecho_backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

# SQLite backup
sqlite3 test.db ".backup $BACKUP_FILE"

echo "Database backup created: $BACKUP_FILE"

# Keep only last 10 backups
ls -t $BACKUP_DIR/wordecho_backup_*.sql | tail -n +11 | xargs -r rm
```

### 📊 Database Seeding

```python
# scripts/seed_data.py
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import User, Blog, ContactMessage
from app.security import get_password_hash
from datetime import datetime

def seed_database():
    db = SessionLocal()
    
    try:
        # Create sample users
        users = [
            User(
                name="John Doe",
                email="john@example.com",
                password=get_password_hash("password123"),
                created_at=datetime.utcnow()
            ),
            User(
                name="Jane Smith",
                email="jane@example.com",
                password=get_password_hash("password123"),
                created_at=datetime.utcnow()
            )
        ]
        
        db.add_all(users)
        db.commit()
        
        # Create sample blogs
        blogs = [
            Blog(
                title="Getting Started with WordEcho",
                content="Welcome to WordEcho! This is your first blog post.",
                user_id=users[0].id
            ),
            Blog(
                title="Advanced Blogging Tips",
                content="Here are some tips to make your blogs more engaging.",
                user_id=users[1].id
            )
        ]
        
        db.add_all(blogs)
        db.commit()
        
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
```

---

## 🔐 Security Best Practices

### 🛡️ Authentication Security

```python
# app/security_enhanced.py
import secrets
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from passlib.context import CryptContext
import jwt
from cryptography.fernet import Fernet

class SecurityManager:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = secrets.token_urlsafe(32)
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        self.refresh_token_expire_days = 7
        
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str, token_type: str = "access"):
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            if payload.get("type") != token_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
```

### 🔒 Input Validation & Sanitization

```python
# app/validators.py
import re
from typing import Optional
from pydantic import BaseModel, validator, EmailStr
from fastapi import HTTPException

class UserCreateSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    
    @validator('name')
    def validate_name(cls, v):
        if len(v) < 2 or len(v) > 50:
            raise ValueError('Name must be between 2 and 50 characters')
        if not re.match(r'^[a-zA-Z\s]+$', v):
            raise ValueError('Name must contain only letters and spaces')
        return v.strip()
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v

class BlogCreateSchema(BaseModel):
    title: str
    content: str
    tags: Optional[list] = []
    
    @validator('title')
    def validate_title(cls, v):
        if len(v) < 5 or len(v) > 200:
            raise ValueError('Title must be between 5 and 200 characters')
        return v.strip()
    
    @validator('content')
    def validate_content(cls, v):
        if len(v) < 50:
            raise ValueError('Content must be at least 50 characters long')
        return v.strip()
```

### 🌐 CORS & Headers Security

```python
# app/middleware/security.py
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response
```

---

## 🚀 Deployment Guide

### 🐳 Docker Production Setup

```dockerfile
# Dockerfile.prod (Backend)
FROM python:3.9-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.9-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY . .

RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Dockerfile.prod (Frontend)
FROM node:16-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### ☸️ Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wordecho-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wordecho-backend
  template:
    metadata:
      labels:
        app: wordecho-backend
    spec:
      containers:
      - name: backend
        image: wordecho/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: wordecho-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: wordecho-backend-service
spec:
  selector:
    app: wordecho-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
```

### 🔄 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy WordEcho

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    
    - name: Run backend tests
      run: |
        cd wordecho-backend
        pip install -r requirements.txt
        pytest
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: 16
    
    - name: Run frontend tests
      run: |
        cd wordecho-frontend
        npm install
        npm test -- --coverage --watchAll=false

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Build and push Docker images
      run: |
        docker build -t wordecho/backend:${{ github.sha }} wordecho-backend/
        docker build -t wordecho/frontend:${{ github.sha }} wordecho-frontend/
        
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        
        docker push wordecho/backend:${{ github.sha }}
        docker push wordecho/frontend:${{ github.sha }}
    
    - name: Deploy to production
      run: |
        # Your deployment script here
        echo "Deploying to production..."
```

---

## 🐛 Debugging & Troubleshooting

### 🔍 Logging Configuration

```python
# app/logging_config.py
import logging
import sys
from pathlib import Path

def setup_logging():
    # Create logs directory
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_dir / "wordecho.log"),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Configure different log levels for different modules
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    
    return logging.getLogger(__name__)

logger = setup_logging()
```

### 🔧 Debug Utilities

```python
# app/debug_utils.py
import functools
import time
from typing import Any, Callable

def debug_timer(func: Callable) -> Callable:
    """Decorator to measure function execution time"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs) -> Any:
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} took {end_time - start_time:.4f} seconds")
        return result
    return wrapper

def debug_requests(app):
    """Middleware to log all requests in debug mode"""
    @app.middleware("http")
    async def log_requests(request, call_next):
        print(f"🔍 {request.method} {request.url}")
        print(f"Headers: {dict(request.headers)}")
        response = await call_next(request)
        print(f"Response: {response.status_code}")
        return response
```

### 🧪 Common Issues & Solutions

#### Issue: CORS Errors
```python
# Solution: Update CORS configuration
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Specific origins in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

#### Issue: Database Connection Errors
```python
# Solution: Connection retry logic
import time
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

def create_db_engine_with_retry(database_url, max_retries=5):
    for attempt in range(max_retries):
        try:
            engine = create_engine(database_url)
            # Test connection
            with engine.connect() as conn:
                conn.execute("SELECT 1")
            return engine
        except OperationalError as e:
            if attempt == max_retries - 1:
                raise e
            print(f"Database connection failed, retrying in {2 ** attempt} seconds...")
            time.sleep(2 ** attempt)
```

---

## 🎨 Code Style & Standards

### 🐍 Python Style Guide

```python
# pyproject.toml
[tool.black]
line-length = 88
target-version = ['py38']
include = '\.pyi?$'

[tool.isort]
profile = "black"
multi_line_output = 3
line_length = 88

[tool.flake8]
max-line-length = 88
extend-ignore = "E203, W503"
exclude = "migrations"

[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

### ⚛️ JavaScript/React Style Guide

```json
// .eslintrc.json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "prettier"
  ],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "prefer-const": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### 📝 Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Example:**
```
feat(auth): add GitHub OAuth integration

- Implement OAuth flow with GitHub
- Add callback handling
- Update user model for OAuth providers

Closes #123
```

---

## 🤝 Contributing Guidelines

### 🔄 Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/yourusername/wordecho.git
   cd wordecho
   git remote add upstream https://github.com/original/wordecho.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow code style guidelines
   - Add tests for new features
   - Update documentation

4. **Test Changes**
   ```bash
   # Backend tests
   cd wordecho-backend && pytest
   
   # Frontend tests
   cd wordecho-frontend && npm test
   
   # E2E tests
   npm run test:e2e
   ```

5. **Submit Pull Request**
   - Create descriptive PR title
   - Fill out PR template
   - Link related issues

### 📋 Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### 🏷️ Issue Templates

```markdown
---
name: Bug Report
about: Create a report to help us improve
---

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Environment:**
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]
```

---

## 🔮 Advanced Topics

### 🚀 Performance Optimization

#### Database Query Optimization
```python
# Use select_related for foreign keys
from sqlalchemy.orm import selectinload, joinedload

def get_blogs_with_users(db: Session):
    return db.query(Blog).options(
        joinedload(Blog.user)
    ).all()

# Use pagination for large datasets
def get_blogs_paginated(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Blog).offset(skip).limit(limit).all()
```

#### React Performance
```javascript
// Memoization
import { memo, useMemo, useCallback } from 'react';

const BlogCard = memo(({ blog, onEdit, onDelete }) => {
  const formattedDate = useMemo(() => 
    new Date(blog.created_at).toLocaleDateString(),
    [blog.created_at]
  );
  
  const handleEdit = useCallback(() => 
    onEdit(blog.id),
    [onEdit, blog.id]
  );
  
  return (
    <div className="blog-card">
      <h3>{blog.title}</h3>
      <p>{formattedDate}</p>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
});
```

### 🔄 State Management with Redux Toolkit

```javascript
// store/blogSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { blogApi } from '../services/api';

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (params) => {
    const response = await blogApi.getBlogs(params);
    return response;
  }
);

const blogSlice = createSlice({
  name: 'blogs',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    addBlog: (state, action) => {
      state.items.push(action.payload);
    },
    updateBlog: (state, action) => {
      const index = state.items.findIndex(blog => blog.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { addBlog, updateBlog } = blogSlice.actions;
export default blogSlice.reducer;
```

---

<div align="center">

## 🎉 Congratulations!

You're now equipped with everything you need to contribute to WordEcho. Whether you're fixing bugs, adding features, or improving documentation, your contributions make this project better for everyone.

**📚 [Back to Main Documentation](README.md) | 🔧 [API Documentation](API_DOCUMENTATION.md) | 🎨 [Frontend Guide](FRONTEND_DOCUMENTATION.md)**

---

**Happy coding! 🚀**

*Made with ❤️ by the WordEcho community*

</div>