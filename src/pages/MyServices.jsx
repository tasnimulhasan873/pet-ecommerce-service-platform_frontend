import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import { formatBdt } from "../utils/currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faConciergeBell,
  faCalendarAlt,
  faCheckCircle,
  faClock,
  faVideo,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const Services = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        "http://localhost:3000/api/services/user-services",
        { userEmail: user?.email }
      );

      if (response.data.success) {
        setServices(response.data.services || []);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err.response?.data?.message || "Failed to load services");

      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchServices();
  }, [user, navigate, fetchServices]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            Active
          </span>
        );
      case "scheduled":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            Scheduled
          </span>
        );
      case "completed":
        return (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-700 text-xl font-bold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchServices}
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#002A48] mb-2">
            My Services
          </h1>
          <p className="text-gray-600">
            View and manage your subscribed services
          </p>
        </div>

        {/* Services List */}
        {services.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FontAwesomeIcon
              icon={faConciergeBell}
              className="text-gray-300 text-6xl mb-4"
            />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No Services Found
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't subscribed to any services yet.
            </p>
            <button
              onClick={() => navigate("/services")}
              className="bg-[#002A48] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#004080] transition-colors"
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="bg-gradient-to-r from-[#002A48] to-[#004080] text-white p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        {service.serviceName || "Service"}
                      </h3>
                      <p className="text-sm opacity-90">
                        Service ID: #{service._id?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>

                  {service.doctorName && (
                    <p className="text-sm opacity-90">
                      Provider:{" "}
                      <span className="font-semibold">
                        {service.doctorName}
                      </span>
                    </p>
                  )}
                </div>

                <div className="p-6">
                  {/* Service Details */}
                  <div className="space-y-3 mb-4">
                    {service.appointmentDate && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="text-[#FFB84C]"
                        />
                        <span>
                          <strong>Date:</strong>{" "}
                          {new Date(service.appointmentDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}

                    {service.appointmentTime && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="text-[#FFB84C]"
                        />
                        <span>
                          <strong>Time:</strong> {service.appointmentTime}
                        </span>
                      </div>
                    )}

                    {service.meetLink && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <FontAwesomeIcon
                          icon={faVideo}
                          className="text-[#FFB84C]"
                        />
                        <a
                          href={service.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}

                    {service.feeBDT && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-green-500"
                        />
                        <span>
                          <strong>Amount Paid:</strong>{" "}
                          {formatBdt(service.feeBDT)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status-specific information */}
                  {service.status?.toLowerCase() === "active" &&
                    service.meetLink && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-green-700 font-semibold mb-2">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mr-2"
                          />
                          Service is Active
                        </p>
                        <a
                          href={service.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                        >
                          Join Now
                        </a>
                      </div>
                    )}

                  {service.status?.toLowerCase() === "scheduled" && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <p className="text-blue-700 font-semibold">
                        <FontAwesomeIcon icon={faClock} className="mr-2" />
                        Your appointment is scheduled. You'll receive a meeting
                        link before the appointment time.
                      </p>
                    </div>
                  )}

                  {service.status?.toLowerCase() === "completed" && (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 font-semibold">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="mr-2"
                        />
                        This service has been completed.
                      </p>
                    </div>
                  )}

                  {service.status?.toLowerCase() === "cancelled" && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <p className="text-red-700 font-semibold">
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        This service has been cancelled.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Book New Service Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/services")}
            className="bg-[#FFB84C] text-[#002A48] px-8 py-3 rounded-lg font-bold hover:bg-[#ff9f1c] transition-colors inline-flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faConciergeBell} />
            Book New Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;
