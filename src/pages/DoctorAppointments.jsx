import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faClock,
  faUser,
  faVideo,
  faCheckCircle,
  faTimesCircle,
  faFilter,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

const DoctorAppointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, confirmed, completed, cancelled
  const [updating, setUpdating] = useState(null); // Track which appointment is being updated

  const fetchAppointments = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/api/doctor/appointments?email=${user.email}`
      );

      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    if (!window.confirm("Mark this appointment as completed?")) return;

    setUpdating(appointmentId);
    try {
      const response = await axios.put(
        `http://localhost:3000/api/doctor/appointments/${appointmentId}/complete`,
        { doctorEmail: user.email }
      );

      if (response.data.success) {
        // Refresh appointments
        await fetchAppointments();
        alert("Appointment marked as completed!");
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      alert(error.response?.data?.message || "Failed to update appointment");
    } finally {
      setUpdating(null);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    setUpdating(appointmentId);
    try {
      const response = await axios.put(
        `http://localhost:3000/api/doctor/appointments/${appointmentId}/cancel`,
        { doctorEmail: user.email }
      );

      if (response.data.success) {
        // Refresh appointments
        await fetchAppointments();
        alert("Appointment cancelled successfully!");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert(error.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setUpdating(null);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "all") return true;
    return apt.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
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
            <h1 className="text-4xl font-bold text-[#002A48] mb-2">
              My Appointments
            </h1>
            <p className="text-gray-600">Manage your patient appointments</p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002A48] focus:outline-none"
            >
              <option value="all">All Appointments</option>
              <option value="confirmed">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="text-gray-300 text-6xl mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">
              No Appointments Found
            </h2>
            <p className="text-gray-500">
              {filter === "all"
                ? "You don't have any appointments yet."
                : `No ${filter} appointments found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.appointmentId}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  {/* Appointment Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        #{appointment.appointmentId}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="flex items-center text-[#002A48] font-semibold text-lg">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="mr-2 text-[#FFB84C]"
                        />
                        {appointment.userName || "Patient"}
                      </p>
                      <p className="flex items-center text-gray-600">
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          className="mr-2 text-gray-400"
                        />
                        {appointment.userEmail}
                      </p>
                      <p className="flex items-center text-gray-600">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="mr-2 text-gray-400"
                        />
                        {appointment.appointmentDate}
                      </p>
                      <p className="flex items-center text-gray-600">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="mr-2 text-gray-400"
                        />
                        {appointment.appointmentTime}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 md:mt-0 flex flex-col gap-2">
                    {appointment.status === "confirmed" && (
                      <>
                        <a
                          href={appointment.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#002A48] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#004080] transition-colors flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faVideo} />
                          Join Meeting
                        </a>
                        <button
                          onClick={() =>
                            handleCompleteAppointment(appointment.appointmentId)
                          }
                          disabled={updating === appointment.appointmentId}
                          className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FontAwesomeIcon icon={faCheckCircle} />
                          {updating === appointment.appointmentId
                            ? "Updating..."
                            : "Mark Complete"}
                        </button>
                        <button
                          onClick={() =>
                            handleCancelAppointment(appointment.appointmentId)
                          }
                          disabled={updating === appointment.appointmentId}
                          className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FontAwesomeIcon icon={faTimesCircle} />
                          {updating === appointment.appointmentId
                            ? "Updating..."
                            : "Cancel"}
                        </button>
                      </>
                    )}
                    {appointment.status === "completed" && (
                      <div className="text-center">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-green-500 text-3xl"
                        />
                        <p className="text-green-600 font-semibold mt-2">
                          Completed
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fee Info */}
                <div className="mt-4 pt-4 border-t-2 border-gray-100">
                  <p className="text-gray-600">
                    Consultation Fee:{" "}
                    <span className="font-bold text-[#002A48]">
                      ৳{appointment.feeBDT}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
