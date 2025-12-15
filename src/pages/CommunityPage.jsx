import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaw,
  faSpinner,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:3000/api/community");

      if (response.data.success) {
        setPosts(response.data.posts);
      } else {
        setError("Failed to load posts");
      }
    } catch (err) {
      console.error("Error fetching community posts:", err);
      setError("Failed to load community posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
            <FontAwesomeIcon icon={faPaw} className="text-3xl text-teal-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the latest pet care tips, stories, and advice from our
            community
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-5xl text-teal-600 mb-4"
            />
            <p className="text-gray-600 text-lg">Loading posts...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <FontAwesomeIcon icon={faPaw} className="text-4xl text-red-500" />
            </div>
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={fetchPosts}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Blog Posts */}
        {!loading && !error && posts.length > 0 && (
          <div className="max-w-5xl mx-auto space-y-8">
            {posts.map((post) => (
              <article
                key={post._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="md:flex">
                  {/* Post Image */}
                  <div className="md:w-2/5">
                    {post.imageURL ? (
                      <img
                        src={post.imageURL}
                        alt={post.title}
                        className="w-full h-64 md:h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/600x400?text=Community+Post";
                        }}
                      />
                    ) : (
                      <div className="w-full h-64 md:h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200">
                        <FontAwesomeIcon
                          icon={faPaw}
                          className="text-6xl text-teal-600"
                        />
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="md:w-3/5 p-8">
                    {/* Date Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium">
                        <FontAwesomeIcon icon={faCalendar} />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 hover:text-teal-600 transition-colors cursor-pointer">
                      {post.title}
                    </h2>

                    {/* Description */}
                    <div className="text-gray-700 leading-relaxed text-base mb-6 whitespace-pre-line">
                      {post.description}
                    </div>

                    {/* Read More Button */}
                    <button className="inline-flex items-center text-teal-600 font-semibold hover:text-teal-700 transition-colors group">
                      Read Full Article
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
              <FontAwesomeIcon
                icon={faPaw}
                className="text-5xl text-gray-400"
              />
            </div>
            <p className="text-gray-600 text-lg mb-2">No community posts yet</p>
            <p className="text-gray-500 text-sm">
              Check back soon for updates!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
