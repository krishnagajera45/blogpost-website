# Echoword Backend

## Overview
Echoword is a backend application developed using FastAPI, providing a robust platform for creating, managing, and interacting with user-generated content. It serves as the backbone for a full-stack web application designed for user registration, authentication, and CRUD operations on various entities.

## Project Structure
```bash
backend/
├── app/
│   ├── crud.py              # CRUD operations
│   ├── database.py          # Database setup and connection
│   ├── dependencies.py      # Dependency injection for routes
│   ├── main.py              # Entry point of the application
│   ├── models.py            # SQLAlchemy data models
│   ├── routers/
│   │   ├── __init__.py      # Router package initialization
│   │   └── users.py         # User-related API endpoints
│   ├── schemas.py           # Pydantic schemas for validation
│   ├── security.py          # Security and authentication utilities
│   ├── test/                # Test cases for API endpoints
│   │   ├── __init__.py      # Test package initialization
│   │   └── test_users.py    # Unit tests for user endpoints
├── requirements.txt         # Project dependencies
└── README.md                # Documentation

```

## Features
- User Authentication with JWT
- CRUD operations for users
- Database setup using SQLAlchemy with SQLite
- Data validation using Pydantic schemas
- Middleware for CORS and request logging
- Comprehensive unit tests with Pytest


## Setup and Installation
### Prerequisites
- Python 3.8+
- Virtual environment (optional but recommended)

### Steps to Set Up the Project
#### 1. Extract the Backend Code

* Download the provided ZIP file containing the backend code.
* Extract the ZIP file to your desired directory.
* Navigate to the extracted directory:
```bash
cd echoword
```
#### 2. Set Up a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Run the Application

```bash
uvicorn app.main:app --reload
```

#### 5. Access the API

Open http://127.0.0.1:8000/docs for interactive API documentation (Swagger UI).



### Authentication
* JWT is used for secure authentication.
* Token generation and validation are implemented in security.py.


## Testing

### Manual Testing
#### 1. Using FastAPI Docs:

FastAPI automatically generates interactive API documentation that can be used for manual testing.
After running the application, open your browser and navigate to:
``` bash
http://127.0.0.1:8000/docs
```
This interface allows you to:
Explore all API endpoints.
Send requests and view responses directly in the browser.
Test various inputs and observe the behavior of the API.

#### 2. Using Postman:
* Steps to test with Postman:
    * Import the API collection or manually create requests for each endpoint.
    * Specify the method (e.g., GET, POST, PUT, DELETE) and provide the required URL and parameters.
    * Send the request and verify the response for correctness.


### Automated Unit Testing
Pytest is used for writing and running unit tests for the backend API.

#### 1. Test Cases Location:

* All test cases are located in the app/test/ directory.
* Each file is named according to the entity or functionality being tested, e.g., test_users.py.

#### 2. Run Tests:

* Activate your virtual environment.
* Use the following command to run all tests:
```bash
pytest app/test/
```
* Pytest will execute all test cases and provide a summary of passed and failed tests.