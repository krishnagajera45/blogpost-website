// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import BlogPage from "./pages/BlogPage";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Signup from "./pages/Signup";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import UserHomePage from "./pages/UserHomePage";
import CreateBlog from "./pages/CreateBlog";
import MyBlogsPage from "./pages/MyBlogsPage";
import UpdateBlogPage from "./pages/UpdateBlogPage";
import axios from "axios";


const App = () => {
  const [user, setUser] = useState(null);

  // Function to fetch current user details
  const fetchUserDetails = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        const response = await axios.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  // Fetch user details on mount
  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/blog/:id" element={<BlogPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/user-home" element={<UserHomePage user={user} />} />
            <Route path="/create-blog" element={<CreateBlog />} />
            <Route path="/my-blogs" element={<MyBlogsPage />} />
            <Route path="/update-blog/:id" element={<UpdateBlogPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
