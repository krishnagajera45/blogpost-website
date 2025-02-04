import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserHomePage = ({ user }) => {
  const [currentUser, setCurrentUser] = useState(user || null);
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      fetchUserProfile();
    } else {
      fetchAllBlogs();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setCurrentUser(response.data);
      fetchAllBlogs();
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile. Please try logging in again.");
    }
  };

  const fetchAllBlogs = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/blogs/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setBlogs(response.data);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blogs. Please try again later.");
    }
  };

  const handleCreateBlog = () => {
    navigate("/create-blog");
  };

  const handleViewMyBlogs = () => {
    navigate("/my-blogs");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-semibold text-gray-800">
          Please log in to access your dashboard.
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {currentUser.name}!</h1>
            <p className="mt-2 text-lg">
              Here’s what’s happening in your blog space.
            </p>
          </div>
          <div>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mr-4"
              onClick={handleCreateBlog}
            >
              Create a Blog
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={handleViewMyBlogs}
            >
              View My Blogs
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {error && <p className="text-red-500">{error}</p>}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div key={blog.id} className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {blog.title}
                </h2>
                <p className="text-gray-600">{blog.content.slice(0, 100)}...</p>
                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  onClick={() => navigate(`/blog/${blog.id}`)}
                >
                  View Blog
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No blogs available.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserHomePage;

