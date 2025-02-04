import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BlogPage = () => {
  const { id } = useParams(); // Blog ID
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");

  // Fetch Blog and Comments
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/blogs/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setBlog(response.data);
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        setError("Unable to load the blog. Please try again later.");
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/blogs/${id}/comments/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setComments(response.data);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        setError("Unable to load the comments. Please try again later.");
      }
    };

    fetchBlog();
    fetchComments();
  }, [id]);

  // Add a New Comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/blogs/${id}/comments/`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setComments([...comments, response.data]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      setError("Unable to add the comment. Please try again later.");
    }
  };

  // Delete a Comment
  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setError("Unable to delete the comment. Please try again later.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading blog...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Blog Content */}
      <div className="bg-blue-600 text-white py-12 text-center">
        <h1 className="text-4xl font-bold">{blog.title}</h1>
        <p className="text-lg mt-2">By User {blog.user_id}</p>
      </div>
      <div className="container mx-auto px-6 py-8">
        <div className="text-gray-700 space-y-6">
          <p>{blog.content}</p>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          {comments.length > 0 ? (
            <ul className="space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="bg-white p-4 rounded shadow">
                  <p className="text-gray-700">{comment.content}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    By User {comment?.user_id}
                  </p>
                  <button
                    className="mt-2 text-red-500 hover:underline"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Delete Comment
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>

        {/* Add Comment Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Add a Comment</h2>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              className="w-full p-2 border rounded"
              rows="4"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here..."
            ></textarea>
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Footer
      <footer className="bg-gray-100 text-center py-6">
        <p className="text-sm text-gray-500">
          &copy; Blog Site 2024. All rights reserved.
        </p>
      </footer> */}
    </div>
  );
};

export default BlogPage;
