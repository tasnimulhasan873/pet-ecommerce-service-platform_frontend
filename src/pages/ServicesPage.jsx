import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatBdt } from "../utils/currency";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserMd,
  faStethoscope,
  faMapMarkerAlt,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

const ServicesPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch doctors from backend API
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("http://localhost:3000/api/doctors");
        if (res.data && res.data.success) {
          // Filter to show only verified doctors (role = "doctor" AND isVerified = true)
          const verifiedDoctors = res.data.doctors.filter(
            (d) => d.role === "doctor" && d.isVerified === true
          );

          // Map backend user objects to the local doctor shape expected by the UI
          const mapped = verifiedDoctors.map((d) => ({
            id: d._id || d.id || d.userEmail,
            _id: d._id,
            name: d.userName || d.name || "Unnamed Doctor",
            email: d.userEmail || d.email,

            specialization: d.specialization || "General Veterinary",
            experience_years: d.experience_years || 0,
            clinic_name: d.clinic_name || "",
            location: d.address || d.city || d.location || "",
            meeting_fee_bdt: d.meeting_fee_bdt || 800,
            image:
              d.photoURL ||
              d.image ||
              "https://via.placeholder.com/400x300?text=Doctor",
            services: d.services || d.services_offered || ["General Checkup"],
            available_days: d.available_days || ["Saturday", "Sunday"],
          }));

          setDoctors(mapped);
        } else {
          setError("Failed to fetch doctors from API");
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(
          err.response?.data?.message || err.message || "Error fetching doctors"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleDoctorClick = (doctorId) => {
    navigate(`/doctor/${doctorId}`);
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#002A48] mb-2">
            Error loading doctors
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28">
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#002A48] mb-4">
            Our Veterinary Specialists
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Meet our experienced veterinary doctors dedicated to providing the
            best care for your beloved pets.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              onClick={() => handleDoctorClick(doctor.email || doctor.id)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
            >
              {/* Doctor Image */}
              <div className="relative h-64 bg-gradient-to-br from-[#FFB84C] to-[#ff9f1c] overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=Doctor";
                  }}
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
                  <FontAwesomeIcon
                    icon={faStar}
                    className="text-[#FFB84C] mr-1"
                  />
                  <span className="font-semibold text-[#002A48]">
                    {doctor.experience_years}+ years
                  </span>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="p-6">
                {/* Name & Specialization */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-[#002A48] mb-2 flex items-center">
                    <FontAwesomeIcon
                      icon={faUserMd}
                      className="mr-2 text-[#FFB84C]"
                    />
                    {doctor.name}
                  </h3>
                  <p className="text-[#FFB84C] font-semibold flex items-center">
                    <FontAwesomeIcon
                      icon={faStethoscope}
                      className="mr-2 text-sm"
                    />
                    {doctor.specialization}
                  </p>
                </div>

                {/* Clinic & Location */}
                <div className="mb-4 space-y-2">
                  <p className="text-gray-600 text-sm font-medium">
                    {doctor.clinic_name}
                  </p>
                  <p className="text-gray-500 text-sm flex items-center">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="mr-2 text-[#FFB84C]"
                    />
                    {doctor.location}
                  </p>
                </div>

                {/* Services */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Services:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {doctor.services.slice(0, 3).map((service, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {service}
                      </span>
                    ))}
                    {doctor.services.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        +{doctor.services.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact & Fee */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Consultation Fee
                      </p>
                      <p className="text-2xl font-bold text-[#002A48]">
                        {formatBdt(doctor.meeting_fee_bdt)}
                      </p>
                    </div>
                    <button className="bg-[#002A48] text-white px-6 py-3 rounded-full hover:bg-[#FFB84C] hover:text-[#002A48] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Doctors Message */}
        {doctors.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No doctors available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
