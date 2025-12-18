import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faStethoscope,
  faCertificate,
  faCalendar,
  faDollarSign,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

const DoctorProfile = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profileData, setProfileData] = useState({
    userName: "",
    userEmail: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    // Doctor-specific fields
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    bio: "",
    availableDays: [],
    availableTimeStart: "",
    availableTimeEnd: "",
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Use GET endpoint with query parameter for userEmail
        const response = await axios.get(
          `http://localhost:3000/api/user/profile?userEmail=${user.email}`
        );

        if (response.data.success) {
          const userData = response.data.profile;
          setProfileData({
            userName: userData.name || "",
            userEmail: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            city: userData.city || "",
            zip: userData.zip || "",
            specialization: userData.specialization || "",
            qualification: userData.qualification || "",
            experience: userData.experience || "",
            consultationFee: userData.consultationFee || "",
            bio: userData.bio || "",
            availableDays: userData.availableDays || [],
            availableTimeStart: userData.availableTimeStart || "09:00",
            availableTimeEnd: userData.availableTimeEnd || "17:00",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage({ type: "error", text: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setProfileData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.put(
        "http://localhost:3000/api/user/update-doctor-profile",
        {
          userEmail: user.email,
          ...profileData,
        }
      );

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-15 px-4 ">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6  pt-[100px]">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Doctor Profile
          </h1>
          <p className="text-gray-600">
            Manage your professional information and availability
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="mr-2 text-blue-600"
                  />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="userName"
                  value={profileData.userName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="mr-2 text-blue-600"
                  />
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.userEmail}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="mr-2 text-blue-600"
                  />
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="mr-2 text-blue-600"
                  />
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="mr-2 text-blue-600"
                  />
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zip"
                  value={profileData.zip}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon
                    icon={faStethoscope}
                    className="mr-2 text-blue-600"
                  />
                  Specialization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={profileData.specialization}
                  onChange={handleChange}
                  placeholder="e.g., Veterinary Surgeon"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon
                    icon={faCertificate}
                    className="mr-2 text-blue-600"
                  />
                  Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={profileData.qualification}
                  onChange={handleChange}
                  placeholder="e.g., DVM, BVSc"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="mr-2 text-blue-600"
                  />
                  Experience (years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="experience"
                  value={profileData.experience}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon
                    icon={faDollarSign}
                    className="mr-2 text-blue-600"
                  />
                  Consultation Fee (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  value={profileData.consultationFee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio / About
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell patients about yourself..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Availability Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Availability Settings
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Days <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      profileData.availableDays.includes(day)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="availableTimeStart"
                  value={profileData.availableTimeStart}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Until <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="availableTimeEnd"
                  value={profileData.availableTimeEnd}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faSave} />
              <span>{saving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;
