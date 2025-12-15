import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTicketAlt,
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    description: "",
    minPurchase: "",
    expiryDate: "",
    usageLimit: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/coupons");
      if (response.data.success) {
        setCoupons(response.data.coupons);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCoupon) {
        // Update existing coupon
        await axios.put(
          `http://localhost:3000/api/admin/coupons/${editingCoupon._id}`,
          formData
        );
        alert("Coupon updated successfully");
      } else {
        // Create new coupon
        await axios.post("http://localhost:3000/api/admin/coupons", formData);
        alert("Coupon created successfully");
      }

      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert(error.response?.data?.message || "Failed to save coupon");
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description || "",
      minPurchase: coupon.minPurchase || "",
      expiryDate: coupon.expiryDate
        ? new Date(coupon.expiryDate).toISOString().split("T")[0]
        : "",
      usageLimit: coupon.usageLimit || "",
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/admin/coupons/${couponId}`);
      alert("Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      alert("Failed to delete coupon");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      description: "",
      minPurchase: "",
      expiryDate: "",
      usageLimit: "",
      isActive: true,
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#002A48] mb-2 flex items-center">
              <FontAwesomeIcon icon={faTicketAlt} className="mr-3" />
              Manage Coupons
            </h1>
            <p className="text-gray-600">
              Create and manage discount coupons ({coupons.length} coupons)
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#002A48] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FFB84C] hover:text-[#002A48] transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add New Coupon
          </button>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#002A48]">
                    {coupon.code}
                  </h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                      coupon.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3">{coupon.description}</p>

              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold">Discount:</span>{" "}
                  {coupon.type === "percentage"
                    ? `${coupon.value}%`
                    : `$${coupon.value}`}
                </p>
                {coupon.minPurchase && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Min Purchase:</span> $
                    {coupon.minPurchase}
                  </p>
                )}
                {coupon.expiryDate && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Expires:</span>{" "}
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-gray-700">
                  <span className="font-semibold">Used:</span>{" "}
                  {coupon.usedCount || 0} / {coupon.usageLimit || "∞"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {coupons.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FontAwesomeIcon
              icon={faTicketAlt}
              className="text-6xl text-gray-300 mb-4"
            />
            <p className="text-gray-500 text-lg mb-4">No coupons found</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#002A48] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FFB84C] hover:text-[#002A48] transition-all"
            >
              Create Your First Coupon
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-[#002A48] text-white p-6 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:text-[#FFB84C] text-2xl"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002A48] focus:outline-none uppercase"
                      placeholder="SUMMER2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002A48] focus:outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002A48] focus:outline-none"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Minimum Purchase ($)
                    </label>
                    <input
                      type="number"
                      name="minPurchase"
                      value={formData.minPurchase}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002A48] focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002A48] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002A48] focus:outline-none"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002A48] focus:outline-none"
                    placeholder="10% off on your first order"
                  />
                </div>

                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#002A48] rounded"
                  />
                  <label className="ml-2 text-sm font-semibold text-gray-700">
                    Active (coupon can be used)
                  </label>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#002A48] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FFB84C] hover:text-[#002A48] transition-all"
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    {editingCoupon ? "Update Coupon" : "Create Coupon"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-all"
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

export default AdminCoupons;
