import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import { formatBdt } from "../utils/currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCalendarAlt,
  faClock,
  faVideo,
  faCopy,
  faHome,
  faStethoscope,
} from "@fortawesome/free-solid-svg-icons";

const AppointmentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      const appointmentId = searchParams.get("appointment_id");

      if (!appointmentId) {
        setError("No appointment ID found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/appointment/${appointmentId}`
        );

        if (response.data.success) {
          setAppointment(response.data.appointment);
        } else {
          setError("Failed to retrieve appointment");
        }
      } catch (err) {
        console.error("Error fetching appointment:", err);
        setError("Error fetching appointment");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointment();
    } else {
      setLoading(false);
      setError("Please login to view appointment");
    }
  }, [searchParams, user]);

  const handleCopyMeetLink = () => {
    if (appointment?.meetLink) {
      navigator.clipboard.writeText(appointment.meetLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your appointment...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p>{error || "Appointment not found"}</p>
            <button
              onClick={() => navigate("/services")}
              className="mt-4 bg-[#002A48] text-white px-6 py-3 rounded-lg hover:bg-[#FFB84C] hover:text-[#002A48] transition-all"
            >
              Back to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-28 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-green-600 text-6xl"
            />
          </div>
          <h1 className="text-4xl font-bold text-[#002A48] mb-2">
            Appointment Confirmed!
          </h1>
          <p className="text-gray-600 text-lg">
            Your appointment has been successfully booked
          </p>
        </div>

        {/* Appointment Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-[#002A48] mb-6 flex items-center">
            <FontAwesomeIcon
              icon={faStethoscope}
              className="mr-3 text-[#FFB84C]"
            />
            Appointment Details
          </h2>

          <div className="space-y-4">
            {/* Appointment ID */}
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600 font-semibold">
                Appointment ID:
              </span>
              <span className="text-[#002A48] font-bold">
                {appointment.appointmentId}
              </span>
            </div>

            {/* Doctor Name */}
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600 font-semibold">Doctor:</span>
              <span className="text-[#002A48] font-bold">
                {appointment.doctorName}
              </span>
            </div>

            {/* Appointment Date */}
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600 font-semibold flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Date:
              </span>
              <span className="text-[#002A48] font-bold">
                {appointment.appointmentDate}
              </span>
            </div>

            {/* Appointment Time */}
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600 font-semibold flex items-center">
                <FontAwesomeIcon icon={faClock} className="mr-2" />
                Time:
              </span>
              <span className="text-[#002A48] font-bold">
                {appointment.appointmentTime}
              </span>
            </div>

            {/* Consultation Fee */}
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600 font-semibold">
                Consultation Fee:
              </span>
              <span className="text-green-600 font-bold text-xl">
                {formatBdt(appointment.feeBDT)}
              </span>
            </div>

            {/* Payment Status */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">
                Payment Status:
              </span>
              <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full font-bold">
                {appointment.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Google Meet Link Card */}
        <div className="bg-gradient-to-r from-[#002A48] to-[#004080] rounded-2xl shadow-xl p-8 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FontAwesomeIcon icon={faVideo} className="mr-3 text-[#FFB84C]" />
            Virtual Meeting Link
          </h2>
          <p className="text-sm opacity-90 mb-4">
            Join your appointment using the Google Meet link below:
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <a
                href={appointment.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFB84C] font-bold hover:underline break-all"
              >
                {appointment.meetLink}
              </a>
              <button
                onClick={handleCopyMeetLink}
                className="ml-4 bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-all"
                title="Copy link"
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>
            {copySuccess && (
              <p className="text-green-300 text-sm mt-2">Link copied!</p>
            )}
          </div>

          <div className="flex gap-4">
            <a
              href={appointment.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#FFB84C] text-[#002A48] py-3 rounded-xl font-bold text-center hover:bg-white transition-all shadow-lg"
            >
              Join Meeting
            </a>
            <button
              onClick={handleCopyMeetLink}
              className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold transition-all"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-3">
            📋 Important Notes:
          </h3>
          <ul className="space-y-2 text-yellow-900">
            <li>
              • Please join the meeting 5 minutes before the scheduled time
            </li>
            <li>• Make sure your camera and microphone are working</li>
            <li>• Have your pet ready for the virtual consultation</li>
            <li>• Keep any medical records or previous prescriptions handy</li>
            <li>
              • A confirmation email has been sent to {appointment.userEmail}
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="bg-[#002A48] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#FFB84C] hover:text-[#002A48] transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faHome} />
            Back to Home
          </button>
          <button
            onClick={() => navigate("/services")}
            className="bg-gray-200 text-[#002A48] px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSuccess;
