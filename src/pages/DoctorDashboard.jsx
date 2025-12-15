import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faUsers,
  faDollarSign,
  faChartLine,
  faClock,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalEarnings: 0,
    totalPatients: 0,
    upcomingAppointments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorStats = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3000/api/doctor/stats?email=${user.email}`
        );

        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Error fetching doctor stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
            Doctor Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, Dr. {user?.displayName || "Doctor"}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Appointments */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FontAwesomeIcon
                  icon={faCalendarCheck}
                  className="text-blue-600 text-2xl"
                />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-semibold mb-1">
              Total Appointments
            </h3>
            <p className="text-3xl font-bold text-[#002A48]">
              {stats.totalAppointments || 0}
            </p>
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-green-600 text-2xl"
                />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-semibold mb-1">
              Today's Appointments
            </h3>
            <p className="text-3xl font-bold text-[#002A48]">
              {stats.todayAppointments}
            </p>
          </div>

          {/* Total Patients */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-purple-600 text-2xl"
                />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-semibold mb-1">
              Total Patients
            </h3>
            <p className="text-3xl font-bold text-[#002A48]">
              {stats.totalPatients || 0}
            </p>
          </div>

          {/* Total Earnings */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FontAwesomeIcon
                  icon={faDollarSign}
                  className="text-yellow-600 text-2xl"
                />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-semibold mb-1">
              Total Earnings
            </h3>
            <p className="text-3xl font-bold text-[#002A48]">
              ৳{stats.totalEarnings}
            </p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#002A48] flex items-center">
              <FontAwesomeIcon
                icon={faChartLine}
                className="mr-3 text-[#FFB84C]"
              />
              Upcoming Appointments
            </h2>
          </div>

          {stats.upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon
                icon={faCalendarCheck}
                className="text-gray-300 text-6xl mb-4"
              />
              <p className="text-gray-500 text-lg">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.upcomingAppointments.map((appointment, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-[#002A48]">
                      {appointment.userName || "Patient"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.appointmentDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#FFB84C]">
                      {appointment.appointmentTime}
                    </p>
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 ml-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-[#002A48] to-[#004080] rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">View All Appointments</h3>
            <p className="text-gray-200 mb-4">
              Manage your schedule and view patient appointments
            </p>
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="bg-white text-[#002A48] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              View Appointments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
