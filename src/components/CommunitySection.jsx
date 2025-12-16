import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaw,
  faSpinner,
  faArrowRight,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";

const CommunitySection = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/community");
      if (response.data.success) {
        // Get only the first 3 posts
        setPosts(response.data.posts.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching community posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = () => {
    navigate("/community");
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
    <section className="bg-gradient-to-br from-[#FCEFD5] to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-[#FFB84C] px-4 py-2 rounded-full mb-4">
            <span className="text-sm font-bold text-[#002A48] uppercase tracking-wide">
              Community Corner
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#002A48] mb-4">
            Join Our Pet Community
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tips, stories, and advice from pet experts and fellow pet parents
          </p>
        </div>

        {/* Blog Posts */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-4xl text-[#FFB84C] animate-spin"
            />
            <p className="ml-4 text-[#002A48] text-lg">Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <article
                  key={post._id}
                  onClick={handlePostClick}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group transform hover:-translate-y-1"
                >
                  {/* Post Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {post.imageURL ? (
                      <img
                        src={post.imageURL}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x300?text=Community+Post";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#FCEFD5]">
                        <FontAwesomeIcon
                          icon={faPaw}
                          className="text-5xl text-[#FFB84C]"
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Post Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        className="text-[#FFB84C] text-sm"
                      />
                      <span className="text-gray-500 text-sm">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#002A48] mb-3 line-clamp-2 group-hover:text-[#FFB84C] transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                      {post.description}
                    </p>

                    <div className="flex items-center text-[#FFB84C] font-semibold text-sm group-hover:text-[#002A48] transition-colors">
                      <span>Read More</span>
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="ml-2 group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <button
                onClick={handlePostClick}
                className="bg-[#002A48] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#FFB84C] hover:text-[#002A48] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <span>View All Community Posts</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <FontAwesomeIcon
              icon={faPaw}
              className="text-6xl text-gray-300 mb-4"
            />
            <p className="text-gray-500 text-lg mb-2">No community posts yet</p>
            <p className="text-gray-400 text-sm">
              Check back soon for updates!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CommunitySection;
