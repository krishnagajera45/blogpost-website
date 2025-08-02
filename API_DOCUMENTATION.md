# WordEcho API Documentation

## Project Overview

WordEcho is a full-stack blogging application built with FastAPI (backend) and React (frontend). It provides a platform for users to create, read, update, and delete blog posts, manage user authentication, and handle contact form submissions.

## Architecture

- **Backend**: FastAPI with SQLAlchemy ORM
- **Frontend**: React with React Router
- **Database**: SQLite (configurable)
- **Authentication**: JWT tokens with OAuth2 (GitHub integration)
- **Styling**: Tailwind CSS

## Base URLs

- **Backend API**: `http://localhost:8000/api`
- **Frontend**: `http://localhost:3000`

---

## Authentication

### Overview
The application supports two authentication methods:
1. **Local Authentication**: Email/password based
2. **OAuth Authentication**: GitHub OAuth integration

### JWT Token Structure
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

### Authentication Headers
Include the JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## API Endpoints

### Authentication Endpoints

#### POST /token
**Description**: Authenticate user and receive access token

**Request Body**:
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Missing username or password

#### GET /auth/github
**Description**: Initiate GitHub OAuth flow

**Response**: Redirects to GitHub authorization page

#### GET /auth/github/callback
**Description**: Handle GitHub OAuth callback

**Query Parameters**:
- `code`: Authorization code from GitHub

**Response**: Redirects to frontend with token

---

### User Management Endpoints

#### GET /api/users/me
**Description**: Get current authenticated user profile

**Headers**: 
- `Authorization: Bearer <token>` (required)

**Response**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token

#### POST /api/users/
**Description**: Create a new user account

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid email format or missing fields
- `409 Conflict`: Email already exists

#### GET /api/users/
**Description**: Get list of all users

**Headers**: 
- `Authorization: Bearer <token>` (required)

**Response**:
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### PUT /api/users/{user_id}
**Description**: Update user information

**Headers**: 
- `Authorization: Bearer <token>` (required)

**Path Parameters**:
- `user_id`: User ID to update

**Request Body**:
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Response**:
```json
{
  "id": 1,
  "name": "John Updated",
  "email": "john.updated@example.com",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses**:
- `404 Not Found`: User not found
- `400 Bad Request`: Invalid email format

#### DELETE /api/users/{user_id}
**Description**: Delete a user account

**Headers**: 
- `Authorization: Bearer <token>` (required)

**Path Parameters**:
- `user_id`: User ID to delete

**Response**:
```json
{
  "success": true
}
```

**Error Responses**:
- `404 Not Found`: User not found

---

### Blog Management Endpoints

#### GET /api/blogs/
**Description**: Get list of blog posts with pagination

**Query Parameters**:
- `skip`: Number of posts to skip (default: 0)
- `limit`: Maximum number of posts to return (default: 10)

**Response**:
```json
[
  {
    "id": 1,
    "title": "My First Blog Post",
    "content": "This is the content of my first blog post...",
    "user_id": 1
  }
]
```

#### GET /api/blogs/{blog_id}
**Description**: Get a specific blog post by ID

**Path Parameters**:
- `blog_id`: Blog post ID

**Response**:
```json
{
  "id": 1,
  "title": "My First Blog Post",
  "content": "This is the content of my first blog post...",
  "user_id": 1
}
```

**Error Responses**:
- `404 Not Found`: Blog post not found

#### PUT /api/blogs/{blog_id}
**Description**: Update a blog post

**Headers**: 
- `Authorization: Bearer <token>` (required)

**Path Parameters**:
- `blog_id`: Blog post ID to update

**Request Body**:
```json
{
  "title": "Updated Blog Title",
  "content": "Updated blog content..."
}
```

**Response**:
```json
{
  "id": 1,
  "title": "Updated Blog Title",
  "content": "Updated blog content...",
  "user_id": 1
}
```

**Error Responses**:
- `404 Not Found`: Blog not found or user doesn't have permission
- `401 Unauthorized`: Invalid token

---

### Comment Management Endpoints

#### GET /api/blogs/{blog_id}/comments/
**Description**: Get all comments for a specific blog post

**Path Parameters**:
- `blog_id`: Blog post ID

**Response**:
```json
[
  {
    "id": 1,
    "content": "Great blog post!",
    "blog_id": 1,
    "user_id": 2
  }
]
```

#### GET /api/comments/{comment_id}
**Description**: Get a specific comment by ID

**Path Parameters**:
- `comment_id`: Comment ID

**Response**:
```json
{
  "id": 1,
  "content": "Great blog post!",
  "blog_id": 1,
  "user_id": 2
}
```

**Error Responses**:
- `404 Not Found`: Comment not found

---

### Contact Form Endpoints

#### POST /api/contact/
**Description**: Submit a contact form message

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Hello, I have a question about your platform."
}
```

**Response**:
```json
{
  "message": "Contact message received successfully."
}
```

**Error Responses**:
- `500 Internal Server Error`: Server error processing the request
- `400 Bad Request`: Missing required fields

---

## Error Handling

### Standard Error Response Format
```json
{
  "detail": "Error description"
}
```

### HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limiting for:
- Authentication endpoints
- Contact form submissions
- User registration

---

## CORS Configuration

The API is configured to accept requests from any origin during development:
```python
allow_origins=["*"]
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]
```

⚠️ **Warning**: Update CORS settings for production deployment.

---

## Security Considerations

1. **JWT Secret**: Change the default JWT secret key in production
2. **HTTPS**: Use HTTPS in production
3. **Environment Variables**: Store sensitive configuration in environment variables
4. **Input Validation**: All inputs are validated using Pydantic schemas
5. **Password Hashing**: Passwords are hashed using bcrypt

---

## Example Usage

### JavaScript/Axios Examples

#### User Authentication
```javascript
// Login
const loginResponse = await axios.post('http://localhost:8000/token', {
  username: 'user@example.com',
  password: 'password123'
}, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

const token = loginResponse.data.access_token;

// Get user profile
const userResponse = await axios.get('http://localhost:8000/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

#### Blog Management
```javascript
// Get blogs
const blogsResponse = await axios.get('http://localhost:8000/api/blogs/', {
  params: { skip: 0, limit: 10 }
});

// Get specific blog
const blogResponse = await axios.get(`http://localhost:8000/api/blogs/1`);

// Update blog
const updateResponse = await axios.put(`http://localhost:8000/api/blogs/1`, {
  title: 'Updated Title',
  content: 'Updated content'
}, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

#### Contact Form
```javascript
// Submit contact form
const contactResponse = await axios.post('http://localhost:8000/api/contact/', {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  message: 'Hello, I have a question.'
});
```

---

## Next Steps

1. **Blog Creation**: Implement missing blog creation endpoint
2. **Comment Management**: Add create, update, delete endpoints for comments
3. **User Profiles**: Add user profile images and bio fields
4. **Search**: Implement blog search functionality
5. **Categories**: Add blog categories and tags
6. **Pagination**: Improve pagination with total count and navigation