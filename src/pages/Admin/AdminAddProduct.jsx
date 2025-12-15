import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faSave,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { createProduct } from "../../api/productsAPI";
import { toBDT } from "../../utils/currency";

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    priceUSD: "",
    priceBDT: "",
    category: "",
    brand: "",
    stock: "",
    description: "",
    images: [""],
    tags: [],
    rating: "4.5",
    reviews: "0",
    status: "available",
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadErrors, setUploadErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "priceUSD") {
      const usdPrice = parseFloat(value) || 0;
      setFormData({
        ...formData,
        priceUSD: value,
        priceBDT: toBDT(usdPrice),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, ""],
    });
  };

  // ImgBB upload helper (returns display_url)
  const uploadImageToImgBB = async (imageFile) => {
    const imgFormData = new FormData();
    imgFormData.append("image", imageFile);
    imgFormData.append("key", "ec38464868721c33778fd355631a2d69");

    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      imgFormData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      }
    );

    if (response.data && response.data.success && response.data.data) {
      return response.data.data.display_url;
    }
    throw new Error("Invalid ImgBB response");
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImageUploading(true);
    setUploadErrors([]);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const url = await uploadImageToImgBB(file);
        setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
      } catch (err) {
        setUploadErrors((prev) => [...prev, `${file.name}: ${err.message}`]);
      }
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setImageUploading(false);
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleTagsChange = (e) => {
    const tagsArray = e.target.value.split(",").map((tag) => tag.trim());
    setFormData({ ...formData, tags: tagsArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.priceUSD || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    const filteredImages = formData.images.filter((img) => img.trim() !== "");
    if (filteredImages.length === 0) {
      alert("Please add at least one product image");
      return;
    }

    try {
      setLoading(true);
      const productData = {
        ...formData,
        priceUSD: parseFloat(formData.priceUSD),
        priceBDT: parseFloat(formData.priceBDT),
        stock: parseInt(formData.stock) || 0,
        rating: parseFloat(formData.rating) || 4.5,
        reviews: parseInt(formData.reviews) || 0,
        images: filteredImages,
      };

      const response = await createProduct(productData);

      if (response.success) {
        alert("Product created successfully!");
        navigate("/admin-products");
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      alert(error?.message || "Failed to create product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-28 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate("/admin-products")}
          className="flex items-center gap-2 text-[#002A48] hover:text-[#FFB84C] transition-colors mb-6 group"
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">Back to Products</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg mr-4">
              <FontAwesomeIcon icon={faPlus} className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#002A48]">
                Add New Product
              </h1>
              <p className="text-gray-600">Create a new product listing</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002A48] focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002A48] focus:border-transparent"
                  placeholder="Enter brand name"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="priceUSD"
                  value={formData.priceUSD}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002A48] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (BDT)
                </label>
                <input
                  type="number"
                  name="priceBDT"
                  value={formData.priceBDT}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="Auto-calculated"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002A48] focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002A48] focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="dog">Dog Products</option>
                  <option value="cat">Cat Products</option>
                  <option value="bird">Bird Products</option>
                  <option value="fish">Fish Products</option>
                  <option value="rabbit">Rabbit Products</option>
                  <option value="general">General Pet Products</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002A48] focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags.join(", ")}
                onChange={handleTagsChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002A48] focus:border-transparent"
                placeholder="e.g., food, organic, premium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002A48] focus:border-transparent"
                placeholder="Enter product description"
              />
            </div>

            {/* Product Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Images <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    id="productImagesUpload"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelected}
                    className="hidden"
                    disabled={imageUploading}
                  />

                  <label
                    htmlFor="productImagesUpload"
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faImage} />
                    <span className="ml-2">Upload Images</span>
                  </label>

                  <div className="text-sm text-gray-500">
                    {imageUploading
                      ? `Uploading... ${uploadProgress}%`
                      : `${formData.images.length} image(s)`}
                  </div>
                </div>

                {uploadErrors.length > 0 && (
                  <div className="text-sm text-red-600">
                    {uploadErrors.map((err, idx) => (
                      <div key={idx}>{err}</div>
                    ))}
                  </div>
                )}

                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002A48] focus:border-transparent"
                      placeholder="Enter image URL or upload above"
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                >
                  <FontAwesomeIcon icon={faImage} />
                  Add Another Image
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate("/admin-products")}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#002A48] to-[#004080] text-white rounded-lg hover:from-[#003d6b] hover:to-[#005099] transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    Create Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddProduct;
