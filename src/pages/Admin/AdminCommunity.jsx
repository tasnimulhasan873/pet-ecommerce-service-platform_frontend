import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faTrash,
  faBan,
  faSearch,
  faPlus,
  faImage,
  faSpinner,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const AdminCommunity = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    imageURL: "",
    title: "",
    description: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/api/admin/community-posts"
      );
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB.");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to ImgBB
      uploadImageToImgBB(file);
    }
  };

  const uploadImageToImgBB = async (imageFile) => {
    setImageUploading(true);
    const imgFormData = new FormData();
    imgFormData.append("image", imageFile);
    imgFormData.append("key", "ec38464868721c33778fd355631a2d69");

    try {
      const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        imgFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );

      if (response.data && response.data.success && response.data.data) {
        const imageURL = response.data.data.display_url;
        setFormData((prev) => ({ ...prev, imageURL }));
        console.log("✅ Image uploaded:", imageURL);
      } else {
        throw new Error("Invalid ImgBB response");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image: " + error.message);
    } finally {
      setImageUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    if (imageUploading) {
      alert("Please wait for image upload to complete");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        "http://localhost:3000/api/admin/community",
        formData
      );

      if (response.data.success) {
        alert("Post created successfully!");
        resetForm();
        fetchPosts();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert(
        "Failed to create post: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ imageURL: "", title: "", description: "" });
    setSelectedImage(null);
    setImagePreview("");
    setShowForm(false);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(
        `http://localhost:3000/api/admin/community-posts/${postId}`
      );
      alert("Post deleted successfully");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  const handleBanUser = async (userEmail) => {
    if (
      !window.confirm(
        `Are you sure you want to ban user ${userEmail}? This will deactivate their account.`
      )
    )
      return;

    try {
      await axios.post("http://localhost:3000/api/admin/ban-user", {
        userEmail,
      });
      alert("User banned successfully");
    } catch (error) {
      console.error("Error banning user:", error);
      alert("Failed to ban user");
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#002A48] mb-2 flex items-center">
              <FontAwesomeIcon icon={faComments} className="mr-3" />
              Manage Community
            </h1>
            <p className="text-gray-600">
              View and moderate community posts ({filteredPosts.length} posts)
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-[#002A48] text-white rounded-lg font-semibold hover:bg-[#FFB84C] hover:text-[#002A48] transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create Post
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FontAwesomeIcon icon={faSearch} className="mr-2" />
            Search Posts
          </label>
          <input
            type="text"
            placeholder="Search by title, author, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002A48] focus:outline-none"
          />
        </div>

        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#002A48] mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    By {post.author} •{" "}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">{post.content}</p>

                  {post.reports && post.reports > 0 && (
                    <div className="mt-3">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        {post.reports} Reports
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
                    title="Delete Post"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button
                    onClick={() => handleBanUser(post.authorEmail)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
                    title="Ban User"
                  >
                    <FontAwesomeIcon icon={faBan} />
                  </button>
                </div>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FontAwesomeIcon
              icon={faComments}
              className="text-6xl text-gray-300 mb-4"
            />
            <p className="text-gray-500 text-lg">No community posts found</p>
          </div>
        )}

        {/* Create Post Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#002A48]">
                  Create Community Post
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faImage} className="mr-2" />
                    Post Image
                  </label>
                  <input
                    type="file"
                    id="postImage"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="postImage"
                    className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#FFB84C] transition-colors"
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        {imageUploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <FontAwesomeIcon
                              icon={faSpinner}
                              className="text-white text-3xl animate-spin"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <FontAwesomeIcon
                          icon={faImage}
                          className="text-4xl text-gray-400 mb-2"
                        />
                        <p className="text-gray-600">
                          Click to upload image (max 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                  {imageUploading && (
                    <p className="text-sm text-blue-600 mt-2">
                      Uploading to ImgBB...
                    </p>
                  )}
                  {formData.imageURL && !imageUploading && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Image uploaded successfully
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FFB84C] focus:outline-none"
                    placeholder="Enter post title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FFB84C] focus:outline-none resize-none"
                    placeholder="Enter post description"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting || imageUploading}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      submitting || imageUploading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#002A48] text-white hover:bg-[#FFB84C] hover:text-[#002A48]"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin mr-2"
                        />
                        Posting...
                      </>
                    ) : (
                      "Post"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCommunity;
