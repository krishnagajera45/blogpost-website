import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert"; // Import confirmAlert
import "react-confirm-alert/src/react-confirm-alert.css"; // Import CSS

const MyBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUserId = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log("Fetched user ID:", response.data.id);
      return response.data.id; // Return user_id
    } catch (err) {
      console.error("Error fetching user ID:", err);
      setError("Failed to load user information.");
    }
  };

  const fetchMyBlogs = async (userId) => {
    try {
      const response = await axios.get("http://localhost:8000/api/blogs/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log("API Response for Blogs:", response.data);
      const userBlogs = response.data.filter((blog) => blog.user_id === parseInt(userId, 10));
      console.log("Filtered Blogs for User:", userBlogs);
      setBlogs(userBlogs);
    } catch (err) {
      console.error("Error fetching user blogs:", err);
      setError("Failed to load your blogs. Please try again later.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userId = await fetchUserId();
      if (userId) {
        fetchMyBlogs(userId);
      }
    };
    fetchData();
  }, []);

  const handleDeleteBlog = async (blogId) => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setError("User ID not found. Please log in again.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/blogs/${blogId}?user_id=${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setBlogs(blogs.filter((blog) => blog.id !== blogId));
    } catch (err) {
      console.error("Error deleting blog:", err);
      setError("Failed to delete the blog. Please try again later.");
    }
  };

  const confirmDelete = (blogId) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this blog?",
      buttons: [
        {
          label: "Yes",
          onClick: () => handleDeleteBlog(blogId),
        },
        {
          label: "No",
          onClick: () => console.log("Delete cancelled"),
        },
      ],
    });
  };

  const handleUpdateBlog = (id) => {
    navigate(`/update-blog/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-6 text-center">
        <h1 className="text-3xl font-bold">My Blogs</h1>
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
                <div className="mt-4 flex justify-between">
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                    onClick={() => handleUpdateBlog(blog.id)}
                  >
                    Update
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    onClick={() => confirmDelete(blog.id)} // Trigger confirmation dialog
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">You haven't posted any blogs yet.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default MyBlogsPage;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const MyBlogsPage = () => {
//   const [blogs, setBlogs] = useState([]);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const fetchUserId = async () => {
//     try {
//       const response = await axios.get("http://localhost:8000/api/users/me", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//         },
//       });
//       console.log("Fetched user ID:", response.data.id); // Debug log
//       return response.data.id; // Return user_id
//     } catch (err) {
//       console.error("Error fetching user ID:", err);
//       setError("Failed to load user information.");
//     }
//   };

//   const fetchMyBlogs = async (userId) => {
//     try {
//       const response = await axios.get("http://localhost:8000/api/blogs/", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//         },
//       });
//       console.log("API Response for Blogs:", response.data); // Debug log
//       const userBlogs = response.data.filter((blog) => blog.user_id === parseInt(userId, 10));
//       console.log("Filtered Blogs for User:", userBlogs); // Debug log
//       setBlogs(userBlogs);
//     } catch (err) {
//       console.error("Error fetching user blogs:", err);
//       setError("Failed to load your blogs. Please try again later.");
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       const userId = await fetchUserId();
//       if (userId) {
//         fetchMyBlogs(userId);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleDeleteBlog = async (id) => {
//     try {
//       await axios.delete(`http://localhost:8000/api/blogs/${id}`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//         },
//       });
//       setBlogs(blogs.filter((blog) => blog.id !== id));
//     } catch (err) {
//       console.error("Error deleting blog:", err);
//       setError("Failed to delete the blog. Please try again later.");
//     }
//   };

//   const handleUpdateBlog = (id) => {
//     navigate(`/update-blog/${id}`);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <header className="bg-blue-600 text-white py-6 text-center">
//         <h1 className="text-3xl font-bold">My Blogs</h1>
//       </header>

//       <main className="container mx-auto px-6 py-8">
//         {error && <p className="text-red-500">{error}</p>}

//         <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {blogs.length > 0 ? (
//             blogs.map((blog) => (
//               <div key={blog.id} className="bg-white shadow-md rounded-lg p-6">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-2">
//                   {blog.title}
//                 </h2>
//                 <p className="text-gray-600">{blog.content.slice(0, 100)}...</p>
//                 <div className="mt-4 flex justify-between">
//                   <button
//                     className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
//                     onClick={() => handleUpdateBlog(blog.id)}
//                   >
//                     Update
//                   </button>
//                   <button
//                     className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
//                     onClick={() => handleDeleteBlog(blog.id)}
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-gray-500">You haven't posted any blogs yet.</p>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// };

// export default MyBlogsPage;
