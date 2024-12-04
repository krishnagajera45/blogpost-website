import React from "react";
import { Link } from "react-router-dom";


const Header = () => {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link to="/">Blog Logo</Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="hover:text-gray-400 transition duration-200">
            Home
          </Link>
          <Link to="/about" className="hover:text-gray-400 transition duration-200">
            About
          </Link>
          <div className="relative group">
            <button
              className="hover:text-gray-400 transition duration-200 focus:outline-none"
              aria-haspopup="true"
            >
              More
            </button>
            <div
              className="absolute left-0 hidden group-hover:block bg-gray-700 text-sm mt-2 rounded shadow-lg min-w-[150px] z-10"
              aria-label="submenu"
            >
              <Link
                to="#"
                className="block px-4 py-2 text-white hover:bg-gray-600 rounded-t"
              >
                Option 1
              </Link>
              <Link
                to="#"
                className="block px-4 py-2 text-white hover:bg-gray-600"
              >
                Option 2
              </Link>
              <Link
                to="#"
                className="block px-4 py-2 text-white hover:bg-gray-600 rounded-b"
              >
                Option 3
              </Link>
            </div>
          </div>
          <Link to="/contactus" className="hover:text-gray-400 transition duration-200">
            Contact Us
          </Link>
        </nav>


        {/* Login and Register Buttons */}
        <div className="flex space-x-4">
          <Link
            to="/login"
            className="bg-orange-500 text-white py-2 px-4 rounded-full hover:bg-orange-600 transition duration-200"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-orange-500 text-white py-2 px-4 rounded-full hover:bg-orange-600 transition duration-200"
          >
            Register
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className="text-gray-400 hover:text-white">
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
