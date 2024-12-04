import React from "react";
import whyWeBlogImage from "../whyWeBlogImage.png"; // Update this path accordingly
import whatWeBlogImage from "../whatWeBlogImage.png"; // Update this path accordingly

const AboutUs = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">
            About Our Blog
          </h1>
          <p className="text-lg max-w-3xl mx-auto">
            Welcome to our blog! We're a passionate team dedicated to sharing
            unique ideas, inspiring stories, and fresh perspectives. Our goal
            is to connect, inform, and engage with readers from all walks of
            life.
          </p>
        </div>
      </div>

      {/* Why We Blog Section */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Why We Blog
              </h2>
              <p className="text-gray-600">
                Blogging is our way of expressing creativity, sharing knowledge,
                and creating a positive impact. We believe in the power of words
                to inspire change and foster a sense of community.
              </p>
            </div>
            <div>
              <img
                src={whyWeBlogImage}
                alt="Why We Blog"
                className="rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
                width="600"
                height="400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* What We Blog About Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src={whatWeBlogImage}
                alt="What We Blog About"
                className="rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
                width="600"
                height="400"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                What We Blog About
              </h2>
              <p className="text-gray-600">
                Our blog covers a variety of topics, from personal development
                and lifestyle to cutting-edge technology and industry trends.
                Each post is crafted to provide value, spark curiosity, and
                inspire action.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission and Vision Section */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Our Mission & Vision
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Our Mission</h3>
              <p className="text-gray-600">
                To provide insightful, inspiring, and authentic content that
                resonates with our audience. We aim to spark meaningful
                conversations and encourage positive action.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Our Vision</h3>
              <p className="text-gray-600">
                To become a leading source of inspiration and knowledge, uniting
                a global community of thinkers, dreamers, and doers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Journey
          </h2>
          <p className="text-white mb-6">
            Be a part of our growing community. Discover more, connect with
            like-minded individuals, and share your story!
          </p>
          <button className="bg-white text-purple-600 font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors">
            Read More
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
