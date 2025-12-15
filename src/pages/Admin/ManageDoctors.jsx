import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserMd,
  faSearch,
  faCheckCircle,
  faTrash,
  faEnvelope,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/doctors");
      if (response.data.success) {
        // Show all doctors
        setDoctors(response.data.doctors);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      alert(
        "Failed to fetch doctors: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDoctor = async (doctorId) => {
    if (
      !window.confirm(
        "Are you sure you want to approve and verify this doctor?"
      )
    )
      return;

    try {
      console.log("Approving doctor with ID:", doctorId);
      const response = await axios.patch(
        `http://localhost:3000/api/doctors/${doctorId}/verify`
      );
      console.log("Approve response:", response.data);
      if (response.data.success) {
        alert("Doctor approved and verified successfully!");
        fetchDoctors(); // Refresh the list
      } else {
        alert(
          "Failed to approve: " + (response.data.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error approving doctor:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Unknown error";
      alert("Failed to approve doctor: " + errorMsg);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      await axios.delete(`http://localhost:3000/users/${doctorId}`);
      alert("Doctor deleted successfully");
      fetchDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      alert("Failed to delete doctor");
    }
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#002A48] mb-2 flex items-center">
            <FontAwesomeIcon icon={faUserMd} className="mr-3" />
            Manage Doctors
          </h1>
          <p className="text-gray-600">
            View and manage all doctor accounts ({filteredDoctors.length}{" "}
            doctors total, {filteredDoctors.filter((d) => !d.isVerified).length}{" "}
            pending verification)
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FontAwesomeIcon icon={faSearch} className="mr-2" />
            Search Doctors
          </label>
          <input
            type="text"
            placeholder="Search by name, email, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002A48] focus:outline-none"
          />
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="relative h-48 bg-gradient-to-br from-[#FFB84C] to-[#ff9f1c]">
                <img
                  src={
                    doctor.photoURL ||
                    "https://via.placeholder.com/400x300?text=Doctor"
                  }
                  alt={doctor.userName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=Doctor";
                  }}
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      doctor.accountStatus === "active"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {doctor.accountStatus || "active"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      doctor.isVerified === true
                        ? "bg-blue-500 text-white"
                        : "bg-orange-500 text-white"
                    }`}
                  >
                    {doctor.isVerified === true ? "✓ Verified" : "⏳ Pending"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-[#002A48] mb-2">
                  Dr. {doctor.userName}
                </h3>
                <p className="text-[#FFB84C] font-semibold mb-3">
                  {doctor.specialization || "General Veterinary"}
                </p>

                <div className="space-y-2 mb-4 text-sm">
                  <p className="flex items-center text-gray-600">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="mr-2 text-gray-400"
                    />
                    {doctor.userEmail}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="mr-2 text-gray-400"
                    />
                    {doctor.phone || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Experience:</span>{" "}
                    {doctor.experience_years || 0} years
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Fee:</span> ৳
                    {doctor.meeting_fee_bdt || 800}
                  </p>
                </div>

                <div className="flex gap-2">
                  {doctor.isVerified === true ? (
                    <div className="flex-1 px-4 py-3 rounded-lg text-center bg-gray-100 text-gray-500 font-semibold">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                      Already Verified
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApproveDoctor(doctor._id)}
                      className="flex-1 px-4 py-3 rounded-lg text-white font-semibold bg-green-500 hover:bg-green-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                      Approve Doctor
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDoctor(doctor._id)}
                    className="px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FontAwesomeIcon
              icon={faUserMd}
              className="text-6xl text-gray-300 mb-4"
            />
            <p className="text-gray-500 text-lg">No doctors found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm
                ? "Try adjusting your search"
                : "No doctors registered yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDoctors;
