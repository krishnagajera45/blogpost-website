// // Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-900 via-purple-700 to-gray-800 text-white py-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Footer Navigation */}
        <nav className="flex space-x-4 mb-4 md:mb-0">
          <a href="/" className="hover:text-yellow-300 text-sm transition duration-300">
            Home
          </a>
          <a href="/about" className="hover:text-yellow-300 text-sm transition duration-300">
            About
          </a>
          <a href="/contactus" className="hover:text-yellow-300 text-sm transition duration-300">
            Contact Us
          </a>
        </nav>

        {/* Social Media Links */}
        <div className="flex space-x-4 mb-4 md:mb-0">
          <a
            href="#"
            className="hover:text-yellow-300 text-sm transition duration-300"
          >
            Facebook
          </a>
          <a
            href="#"
            className="hover:text-yellow-300 text-sm transition duration-300"
          >
            Twitter
          </a>
          <a
            href="#"
            className="hover:text-yellow-300 text-sm transition duration-300"
          >
            Instagram
          </a>
        </div>

        {/* Copyright */}
        <div className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Blog Site. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
