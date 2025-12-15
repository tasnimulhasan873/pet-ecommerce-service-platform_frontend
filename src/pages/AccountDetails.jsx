import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCity,
  faMailBulk,
  faSave,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

const AccountDetails = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        "http://localhost:3000/api/user/profile",
        { email: user?.email }
      );

      if (response.data.success && response.data.profile) {
        const profile = response.data.profile;
        setFormData({
          name: profile.name || user?.displayName || "",
          email: profile.email || user?.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
          zip: profile.zip || "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to load profile");

      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [user, navigate, fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await axios.put(
        "http://localhost:3000/api/user/update-profile",
        {
          ...formData,
          userEmail: user?.email, // Include userEmail for backend validation
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");

      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#002A48] mb-2">
              Account Details
            </h1>
            <p className="text-gray-600">Manage your personal information</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#002A48] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#004080] transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faEdit} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700 font-semibold">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-[#FFB84C] mr-2"
                  />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                    isEditing
                      ? "border-gray-300 focus:border-[#002A48] focus:outline-none"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-[#FFB84C] mr-2"
                  />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                    isEditing
                      ? "border-gray-300 focus:border-[#002A48] focus:outline-none"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed"
                  }`}
                  placeholder="Enter your email"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-[#FFB84C] mr-2"
                  />
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                    isEditing
                      ? "border-gray-300 focus:border-[#002A48] focus:outline-none"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed"
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <FontAwesomeIcon
                    icon={faCity}
                    className="text-[#FFB84C] mr-2"
                  />
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                    isEditing
                      ? "border-gray-300 focus:border-[#002A48] focus:outline-none"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed"
                  }`}
                  placeholder="Enter your city"
                />
              </div>

              {/* ZIP Code */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <FontAwesomeIcon
                    icon={faMailBulk}
                    className="text-[#FFB84C] mr-2"
                  />
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors ${
                    isEditing
                      ? "border-gray-300 focus:border-[#002A48] focus:outline-none"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed"
                  }`}
                  placeholder="Enter your ZIP code"
                />
              </div>

              {/* Address - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-[#FFB84C] mr-2"
                  />
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  rows="3"
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-colors resize-none ${
                    isEditing
                      ? "border-gray-300 focus:border-[#002A48] focus:outline-none"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed"
                  }`}
                  placeholder="Enter your full address"
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="mt-8 flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 bg-[#002A48] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#004080] transition-colors flex items-center justify-center gap-2 ${
                    saving ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile(); // Reset form
                  }}
                  className="flex-1 bg-gray-200 text-[#002A48] px-8 py-4 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Required Fields Notice */}
        <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-yellow-900 mb-2">
            ⚠️ Complete Your Profile
          </h3>
          <p className="text-yellow-700 text-sm">
            All fields marked with{" "}
            <span className="text-red-500 font-bold">*</span> are mandatory. You
            must complete your profile before you can add items to cart or book
            services.
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">Account Security</h3>
          <p className="text-blue-700 text-sm">
            Your account is secured with Firebase Authentication. To change your
            password or update security settings, please use the Firebase
            account management portal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
