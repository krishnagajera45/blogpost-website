import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateBlogPage = () => {
  const { id } = useParams(); // Blog ID from the URL
  const [blog, setBlog] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlog();
  }, []);

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/blogs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setBlog(response.data);
      setTitle(response.data.title);
      setContent(response.data.content);
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Failed to load blog. Please try again later.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        setError("User ID not found. Please log in again.");
        return;
      }

      await axios.put(
        `http://localhost:8000/api/blogs/${id}?user_id=${userId}`, // Include user_id in query params
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      navigate("/my-blogs"); // Redirect to My Blogs page after updating
    } catch (err) {
      console.error("Error updating blog:", err);
      setError("Failed to update blog. Please try again later.");
    }
  };

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading blog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-6 text-center">
        <h1 className="text-3xl font-bold">Update Blog</h1>
      </header>

      <main className="container mx-auto px-6 py-8">
        {error && <p className="text-red-500">{error}</p>}

        <form className="bg-white shadow-md rounded-lg p-6" onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              rows="6"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              required
            ></textarea>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Update Blog
            </button>
            <button
              type="button"
              onClick={() => navigate("/my-blogs")}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default UpdateBlogPage;
