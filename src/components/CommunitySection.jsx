import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaw, faSpinner } from "@fortawesome/free-solid-svg-icons";

const CommunitySection = () => {
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
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error("Error fetching community posts:", error);
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
    <section className="bg-[#FCEFD5] py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#002A48] mb-4">
            Community & Resources
          </h2>
          <p className="text-lg text-[#555]">
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
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
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
                      <div className="w-full h-64 md:h-full flex items-center justify-center bg-[#FCEFD5]">
                        <FontAwesomeIcon
                          icon={faPaw}
                          className="text-6xl text-[#FFB84C]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="md:w-3/5 p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-[#FFB84C] text-[#002A48] px-3 py-1 rounded-full text-sm font-medium">
                        Community Blog
                      </span>
                      <span className="text-[#555] text-sm">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold text-[#002A48] mb-4 hover:text-[#FFB84C] transition">
                      {post.title}
                    </h3>

                    <p className="text-[#555] leading-relaxed text-base mb-6">
                      {post.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FontAwesomeIcon
              icon={faPaw}
              className="text-6xl text-gray-300 mb-4"
            />
            <p className="text-gray-500 text-lg">No community posts yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Check back soon for updates!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CommunitySection;
