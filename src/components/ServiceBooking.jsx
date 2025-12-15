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
  faArrowRight,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";

const ServiceBooking = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:3000/api/doctors");
        if (res.data && res.data.success) {
          // Filter to show only verified doctors
          const verifiedDoctors = res.data.doctors.filter(
            (d) => d.role === "doctor" && d.isVerified === true
          );

          // Map backend data to UI format
          const mapped = verifiedDoctors.map((d) => ({
            id: d._id || d.id || d.userEmail,
            _id: d._id,
            name: d.userName || d.name || "Dr. Unknown",
            email: d.userEmail || d.email,
            specialization: d.specialization || "General Veterinary",
            experience: d.experience || d.experience_years || "5+ years",
            location: d.city || d.address || d.location || "Available Online",
            consultationFee: d.consultationFee || d.meeting_fee_bdt || 800,
            image:
              d.photoURL ||
              d.image ||
              "https://via.placeholder.com/300x300?text=Doctor",
            bio: d.bio || "Experienced veterinary professional",
            availableDays: d.availableDays || d.available_days || [],
          }));

          // Show only first 3 doctors for homepage
          setDoctors(mapped.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        // Don't show error on homepage, just hide section
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleDoctorClick = (doctorId) => {
    navigate(`/doctor/${doctorId}`);
  };

  const handleViewAll = () => {
    navigate("/services");
  };

  // Don't render if no doctors or still loading
  if (loading || doctors.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <FontAwesomeIcon icon={faCalendarCheck} />
            <span className="text-sm font-semibold">
              Professional Veterinary Care
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#002A48] mb-4">
            Book Appointment with Expert Veterinarians
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Connect with verified veterinary professionals for online
            consultations and expert pet care advice.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              onClick={() => handleDoctorClick(doctor.email || doctor.id)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group"
            >
              {/* Doctor Image */}
              <div className="relative h-56 bg-gradient-to-br from-[#FFB84C] to-[#ff9f1c] overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x300?text=Doctor";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center">
                    <FontAwesomeIcon
                      icon={faUserMd}
                      className="mr-2 text-[#FFB84C]"
                    />
                    {doctor.name}
                  </h3>
                  <p className="text-white/90 text-sm flex items-center">
                    <FontAwesomeIcon
                      icon={faStethoscope}
                      className="mr-2 text-xs"
                    />
                    {doctor.specialization}
                  </p>
                </div>
                {doctor.experience && (
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="text-[#FFB84C] mr-1 text-sm"
                    />
                    <span className="font-semibold text-[#002A48] text-sm">
                      {doctor.experience}
                    </span>
                  </div>
                )}
              </div>

              {/* Doctor Info */}
              <div className="p-5">
                {/* Bio */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {doctor.bio}
                </p>

                {/* Location */}
                {doctor.location && (
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="mr-2 text-[#FFB84C]"
                    />
                    <span>{doctor.location}</span>
                  </div>
                )}

                {/* Available Days */}
                {doctor.availableDays && doctor.availableDays.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Available:</p>
                    <div className="flex flex-wrap gap-2">
                      {doctor.availableDays.slice(0, 3).map((day, idx) => (
                        <span
                          key={idx}
                          className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Consultation Fee & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Consultation Fee
                    </p>
                    <p className="text-xl font-bold text-[#002A48]">
                      {formatBdt(doctor.consultationFee)}
                    </p>
                  </div>
                  <button className="bg-[#002A48] text-white px-5 py-2.5 rounded-full hover:bg-[#FFB84C] hover:text-[#002A48] transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg group-hover:scale-105">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button
            onClick={handleViewAll}
            className="inline-flex items-center gap-2 bg-[#002A48] text-white px-8 py-4 rounded-full hover:bg-[#FFB84C] hover:text-[#002A48] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>View All Veterinarians</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-[#002A48] mb-2">
              {doctors.length}+
            </div>
            <p className="text-gray-600 text-sm">Verified Veterinarians</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-[#002A48] mb-2">100%</div>
            <p className="text-gray-600 text-sm">Secure Consultations</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-[#002A48] mb-2">24/7</div>
            <p className="text-gray-600 text-sm">Online Booking</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceBooking;
