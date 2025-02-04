import React, { useState } from "react";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/users/", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setSuccessMessage("Registration successful! Please log in.");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setError("");
    } catch (err) {
      console.error("Signup failed:", err);
      setError("Registration failed. Please try again.");
    }
  };

  const handleGithubSignup = () => {
    window.location.href = "http://localhost:8000/auth/github";
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create an Account
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {successMessage && (
          <p className="text-green-500 text-center mb-4">{successMessage}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">Or sign up with</p>
          <button
            onClick={handleGithubSignup}
            className="mt-4 w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
            >
              <path d="M12 .297c-6.6 0-12 5.373-12 12 0 5.32 3.438 9.8 8.205 11.388.6.11.82-.26.82-.577 0-.285-.011-1.04-.017-2.04-3.337.727-4.042-1.59-4.042-1.59-.546-1.385-1.333-1.755-1.333-1.755-1.087-.744.083-.73.083-.73 1.2.085 1.833 1.235 1.833 1.235 1.07 1.835 2.81 1.305 3.495.997.11-.775.417-1.306.76-1.607-2.665-.304-5.466-1.334-5.466-5.935 0-1.31.47-2.382 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.007-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.29-1.553 3.3-1.23 3.3-1.23.653 1.653.243 2.873.12 3.176.77.838 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.47 5.93.43.37.81 1.1.81 2.22 0 1.606-.015 2.898-.015 3.29 0 .32.22.695.825.575 4.765-1.588 8.205-6.065 8.205-11.385 0-6.627-5.4-12-12-12z" />
            </svg>
            Sign Up with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
