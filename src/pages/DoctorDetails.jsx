import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatBdt } from "../utils/currency";
import axios from "axios";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentFormComponent from "../components/PaymentFormComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStethoscope,
  faMapMarkerAlt,
  faEnvelope,
  faCalendarAlt,
  faClock,
  faCheckCircle,
  faArrowLeft,
  faHospital,
  faStar,
  faAward,
} from "@fortawesome/free-solid-svg-icons";

const stripePromise = loadStripe(import.meta.env.VITE_PAYMENT_KEY);

const DoctorDetails = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch doctor data from MongoDB API
    const fetchDoctor = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("http://localhost:3000/api/doctors");

        if (response.data.success) {
          // Find doctor by email (doctorId param is actually the doctor's email)
          const foundDoctor = response.data.doctors.find(
            (doc) => doc.userEmail === doctorId || doc._id === doctorId
          );

          if (foundDoctor) {
            // Map MongoDB user fields to component's expected doctor structure
            setDoctor({
              id: foundDoctor._id,
              name: foundDoctor.userName,
              email: foundDoctor.userEmail,

              specialization:
                foundDoctor.specialization || "General Veterinary",
              experience_years: foundDoctor.experience_years || 0,
              clinic_name: foundDoctor.clinic_name || "Private Clinic",
              location:
                foundDoctor.address ||
                foundDoctor.city ||
                "Location not specified",
              meeting_fee_bdt: foundDoctor.meeting_fee_bdt || 800,
              image:
                foundDoctor.photoURL ||
                "https://via.placeholder.com/400x400?text=Doctor",
              available_days: foundDoctor.available_days || [
                "Saturday",
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
              ],
              services: foundDoctor.services || [
                "General Checkup",
                "Vaccination",
                "Consultation",
              ],
            });

            if (
              foundDoctor.available_days &&
              foundDoctor.available_days.length > 0
            ) {
              setSelectedDay(foundDoctor.available_days[0]);
            }
          } else {
            setError("Doctor not found");
          }
        } else {
          setError("Failed to fetch doctors");
        }
      } catch (err) {
        console.error("Error loading doctor data:", err);
        setError(err.response?.data?.message || "Error loading doctor data");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  const handleBookAppointment = async () => {
    if (!user) {
      alert("Please login to book an appointment");
      navigate("/login");
      return;
    }

    if (!selectedTime || !selectedDate) {
      alert("Please select a date and time for your appointment");
      return;
    }

    setIsProcessing(true);

    try {
      // Create Payment Intent for appointment
      const response = await axios.post(
        "http://localhost:3000/appointment/create-payment-intent",
        {
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorEmail: doctor.email,
          doctorFee: doctor.meeting_fee_bdt,
          selectedDate: selectedDate,
          selectedTime: selectedTime,
          userId: user.uid,
          userEmail: user.email,
        }
      );

      if (response.data.success) {
        setClientSecret(response.data.clientSecret);
        setAppointmentData({
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorEmail: doctor.email,
          doctorFee: doctor.meeting_fee_bdt,
          selectedDate,
          selectedTime,
        });
        setShowPayment(true);
      } else {
        alert("Error creating appointment. Please try again.");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);

      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;

        if (status === 409 && data.conflict) {
          // Appointment conflict
          alert(
            `Time slot not available!\n\n${data.message}\n\nPlease select a different time.`
          );
        } else if (status === 400 && data.message) {
          // Account incomplete or validation error
          alert(data.message);
          if (data.message.includes("Account Details")) {
            navigate("/account-details");
          }
        } else {
          alert(data.message || "Error booking appointment. Please try again.");
        }
      } else {
        alert("Error booking appointment. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      // Verify payment and create appointment
      const response = await axios.post(
        "http://localhost:3000/appointment/verify-payment",
        {
          paymentIntentId: paymentIntent.id,
          appointmentData,
          userId: user.uid,
          userEmail: user.email,
        }
      );

      if (response.data.success) {
        // Navigate to success page with appointment ID
        navigate(
          `/appointment-success?appointment_id=${response.data.appointment.appointmentId}`
        );
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert(
        "Payment successful but error confirming appointment. Please contact support."
      );
    }
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    alert("Payment failed. Please try again.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading doctor details from database...
          </p>
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
            Error Loading Doctor
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/services")}
            className="bg-[#002A48] text-white px-6 py-3 rounded-lg hover:bg-[#FFB84C] hover:text-[#002A48] transition-all"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#002A48] mb-4">
            Doctor not found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested doctor profile does not exist in our database.
          </p>
          <button
            onClick={() => navigate("/services")}
            className="bg-[#002A48] text-white px-6 py-3 rounded-lg hover:bg-[#FFB84C] hover:text-[#002A48] transition-all"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="container mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/services")}
          className="mb-6 flex items-center text-[#002A48] hover:text-[#FFB84C] transition-colors font-semibold"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to All Doctors
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Doctor Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-32">
              {/* Doctor Image */}
              <div className="relative h-80 bg-gradient-to-br from-[#FFB84C] to-[#ff9f1c]">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x400?text=Doctor";
                  }}
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-full shadow-lg">
                  <FontAwesomeIcon
                    icon={faStar}
                    className="text-[#FFB84C] mr-1"
                  />
                  <span className="font-bold text-[#002A48]">
                    {doctor.experience_years}+ yrs
                  </span>
                </div>
              </div>

              {/* Doctor Basic Info */}
              <div className="p-6">
                <h1 className="text-3xl font-bold text-[#002A48] mb-2">
                  {doctor.name}
                </h1>
                <p className="text-[#FFB84C] font-semibold text-lg mb-4 flex items-center">
                  <FontAwesomeIcon icon={faStethoscope} className="mr-2" />
                  {doctor.specialization}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start text-gray-700">
                    <FontAwesomeIcon
                      icon={faHospital}
                      className="mr-3 mt-1 text-[#FFB84C]"
                    />
                    <div>
                      <p className="font-semibold">{doctor.clinic_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start text-gray-700">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="mr-3 mt-1 text-[#FFB84C]"
                    />
                    <p>{doctor.location}</p>
                  </div>

                  <div className="flex items-start text-gray-700">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="mr-3 mt-1 text-[#FFB84C]"
                    />
                    <p className="break-all">{doctor.email}</p>
                  </div>
                </div>

                {/* Consultation Fee */}
                <div className="bg-gradient-to-r from-[#002A48] to-[#004080] text-white p-4 rounded-xl">
                  <p className="text-sm opacity-90 mb-1">Consultation Fee</p>
                  <p className="text-3xl font-bold">
                    {formatBdt(doctor.meeting_fee_bdt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details & Booking */}
          <div className="lg:col-span-2 space-y-6">
            {/* Experience Badge */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon
                  icon={faAward}
                  className="text-[#FFB84C] text-3xl mr-4"
                />
                <div>
                  <h2 className="text-2xl font-bold text-[#002A48]">
                    {doctor.experience_years} Years of Experience
                  </h2>
                  <p className="text-gray-600">
                    Specializing in {doctor.specialization}
                  </p>
                </div>
              </div>
            </div>

            {/* Services Offered */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#002A48] mb-4 flex items-center">
                <FontAwesomeIcon
                  icon={faStethoscope}
                  className="mr-3 text-[#FFB84C]"
                />
                Services Offered
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {doctor.services.map((service, idx) => (
                  <div
                    key={idx}
                    className="flex items-center p-3 bg-blue-50 rounded-lg"
                  >
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 mr-3"
                    />
                    <span className="text-gray-700 font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointment Booking */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#002A48] mb-4 flex items-center">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="mr-3 text-[#FFB84C]"
                />
                Select Appointment Date
              </h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#002A48] focus:outline-none text-gray-700 font-semibold"
              />
            </div>

            {/* Time Slots */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#002A48] mb-4 flex items-center">
                <FontAwesomeIcon
                  icon={faClock}
                  className="mr-3 text-[#FFB84C]"
                />
                Select Time Slot
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {timeSlots.map((time, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg font-semibold transition-all ${
                      selectedTime === time
                        ? "bg-[#FFB84C] text-[#002A48] shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking Summary & Button */}
            <div className="bg-gradient-to-r from-[#002A48] to-[#004080] rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-4">Appointment Summary</h2>
              <div className="space-y-2 mb-6">
                <p>
                  <span className="opacity-80">Doctor:</span>{" "}
                  <span className="font-semibold">{doctor.name}</span>
                </p>
                <p>
                  <span className="opacity-80">Appointment Date:</span>{" "}
                  <span className="font-semibold">
                    {selectedDate || "Not selected"}
                  </span>
                </p>
                <p>
                  <span className="opacity-80">Selected Day:</span>{" "}
                  <span className="font-semibold">
                    {selectedDay || "Not selected"}
                  </span>
                </p>
                <p>
                  <span className="opacity-80">Selected Time:</span>{" "}
                  <span className="font-semibold">
                    {selectedTime || "Not selected"}
                  </span>
                </p>
                <p>
                  <span className="opacity-80">Consultation Fee:</span>{" "}
                  <span className="font-semibold text-2xl">
                    {formatBdt(doctor.meeting_fee_bdt)}
                  </span>
                </p>
              </div>
              {!showPayment ? (
                <button
                  onClick={handleBookAppointment}
                  disabled={isProcessing}
                  className={`w-full bg-[#FFB84C] text-[#002A48] py-4 rounded-xl font-bold text-lg hover:bg-white transition-all shadow-lg hover:shadow-xl ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isProcessing
                    ? "Preparing Payment..."
                    : "Continue to Payment"}
                </button>
              ) : (
                <button
                  onClick={() => setShowPayment(false)}
                  className="w-full bg-gray-200 text-[#002A48] py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  ← Back to Appointment Details
                </button>
              )}
            </div>

            {/* Payment Form Section */}
            {showPayment && clientSecret && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-[#002A48] mb-4">
                  Complete Payment
                </h2>
                <Elements stripe={stripePromise}>
                  <PaymentFormComponent
                    billingData={{
                      fullName: user?.displayName || user?.email || "Guest",
                      email: user?.email || "",
                      phone: "",
                      address: "",
                      city: "",
                      zip: "",
                    }}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    clientSecret={clientSecret}
                  />
                </Elements>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
