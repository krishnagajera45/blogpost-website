import pytest 
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, get_db
from sqlalchemy.orm import sessionmaker
from app.models import User, Blog, Comment

# Database setup for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

@pytest.fixture
def client():
    def override_get_db():
        db = TestSessionLocal()
        try:
            yield db
        finally:
            db.close()
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)

@pytest.fixture
def test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestSessionLocal()
    yield db
    db.close()

@pytest.fixture
def setup_test_data(test_db):
    user = User(name="Test User", email="testuser@example.com", password="password")
    test_db.add(user)
    test_db.commit()
    return user

def test_create_user(client):
    response = client.post("/api/users/", json={"name": "John Doe", "email": "john@example.com", "password": "123456"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "John Doe"
    assert data["email"] == "john@example.com"

def test_read_users(client, test_db):
    test_db.add(User(name="Alice", email="alice@example.com", password="password"))
    test_db.commit()
    response = client.get("/api/users/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Alice"

def test_update_user(client, test_db):
    user = User(name="Bob", email="bob@example.com", password="password")
    test_db.add(user)
    test_db.commit()
    response = client.put(f"/api/users/{user.id}", json={"name": "Bob Updated"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Bob Updated"

def test_delete_user(client, test_db):
    user = User(name="Eve", email="eve@example.com", password="password")
    test_db.add(user)
    test_db.commit()
    response = client.delete(f"/api/users/{user.id}")
    assert response.status_code == 200
    assert response.json() == {"success": True}


def test_create_blog(client, setup_test_data):
    # Test blog creation
    response = client.post(
        "/api/blogs/",
        json={"title": "Test Blog", "content": "This is a test blog."},
        params={"user_id": setup_test_data.id}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Blog"
    assert data["content"] == "This is a test blog."
    assert data["user_id"] == setup_test_data.id

def test_delete_blog(client, setup_test_data, test_db):
    # Create a blog
    blog = Blog(title="Blog to Delete", content="Content to delete", user_id=setup_test_data.id)
    test_db.add(blog)
    test_db.commit()

    # Test blog deletion
    response = client.delete(f"/api/blogs/{blog.id}", params={"user_id": setup_test_data.id})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Blog to Delete"

    # Verify blog is deleted
    response = client.get(f"/api/blogs/{blog.id}")
    assert response.status_code == 404

def test_create_comment(client, setup_test_data, test_db):
    # Create a blog
    blog = Blog(title="Blog with Comment", content="Content", user_id=setup_test_data.id)
    test_db.add(blog)
    test_db.commit()

    # Test comment creation
    response = client.post(
        f"/api/blogs/{blog.id}/comments/",
        json={"content": "This is a test comment."},
        params={"user_id": setup_test_data.id}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "This is a test comment."
    assert data["blog_id"] == blog.id
    assert data["user_id"] == setup_test_data.id

def test_delete_comment(client, setup_test_data, test_db):
    # Create a blog and comment
    blog = Blog(title="Blog with Comment", content="Content", user_id=setup_test_data.id)
    test_db.add(blog)
    test_db.commit()

    comment = Comment(content="Comment to Delete", blog_id=blog.id, user_id=setup_test_data.id)
    test_db.add(comment)
    test_db.commit()

    # Test comment deletion
    response = client.delete(f"/api/comments/{comment.id}", params={"user_id": setup_test_data.id})
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Comment to Delete"

    # Verify comment is deleted
    response = client.get(f"/api/comments/{comment.id}")
    assert response.status_code == 404