import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faClock,
  faCalendar,
  faToggleOn,
  faToggleOff,
  faSave,
  faUserCircle,
  faLock,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

const DoctorSettings = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    appointmentReminders: true,
    newAppointmentAlerts: true,
    paymentNotifications: true,

    // Availability Settings
    autoAcceptAppointments: false,
    bufferTimeBetweenAppointments: 15, // minutes
    maxAppointmentsPerDay: 10,
    allowWeekendAppointments: false,

    // Account Settings
    accountStatus: "active", // active, away, inactive
    displayProfilePublicly: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);

        // TODO: Replace with actual API call
        // const response = await axios.get(
        //   `http://localhost:3000/api/doctor/settings/${user.email}`
        // );

        // Mock: Settings loaded from localStorage or use defaults above

        setLoading(false);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  const handleToggle = (field) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // TODO: Replace with actual API call
      // const response = await axios.put(
      //   "http://localhost:3000/api/doctor/settings",
      //   {
      //     userEmail: user.email,
      //     settings,
      //   }
      // );

      // Mock success
      setTimeout(() => {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        setSaving(false);
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }, 1000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Failed to save settings" });
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match!" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // TODO: Replace with actual API call
      // const response = await axios.put(
      //   "http://localhost:3000/api/user/change-password",
      //   {
      //     userEmail: user.email,
      //     currentPassword: passwordData.currentPassword,
      //     newPassword: passwordData.newPassword,
      //   }
      // );

      // Mock success
      setTimeout(() => {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setSaving(false);
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }, 1000);
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({ type: "error", text: "Failed to update password" });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and notifications
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

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
              <FontAwesomeIcon icon={faBell} className="mr-2 text-blue-600" />
              Notification Preferences
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-600">
                    Receive email updates about your account
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("emailNotifications")}
                  className="text-3xl"
                >
                  <FontAwesomeIcon
                    icon={
                      settings.emailNotifications ? faToggleOn : faToggleOff
                    }
                    className={
                      settings.emailNotifications
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    Appointment Reminders
                  </p>
                  <p className="text-sm text-gray-600">
                    Get notified 1 hour before appointments
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("appointmentReminders")}
                  className="text-3xl"
                >
                  <FontAwesomeIcon
                    icon={
                      settings.appointmentReminders ? faToggleOn : faToggleOff
                    }
                    className={
                      settings.appointmentReminders
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    New Appointment Alerts
                  </p>
                  <p className="text-sm text-gray-600">
                    Notify when patients book appointments
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("newAppointmentAlerts")}
                  className="text-3xl"
                >
                  <FontAwesomeIcon
                    icon={
                      settings.newAppointmentAlerts ? faToggleOn : faToggleOff
                    }
                    className={
                      settings.newAppointmentAlerts
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    Payment Notifications
                  </p>
                  <p className="text-sm text-gray-600">
                    Get updates about earnings and payments
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("paymentNotifications")}
                  className="text-3xl"
                >
                  <FontAwesomeIcon
                    icon={
                      settings.paymentNotifications ? faToggleOn : faToggleOff
                    }
                    className={
                      settings.paymentNotifications
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Availability Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
              <FontAwesomeIcon
                icon={faCalendar}
                className="mr-2 text-blue-600"
              />
              Availability Management
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    Auto-Accept Appointments
                  </p>
                  <p className="text-sm text-gray-600">
                    Automatically confirm new appointments
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("autoAcceptAppointments")}
                  className="text-3xl"
                >
                  <FontAwesomeIcon
                    icon={
                      settings.autoAcceptAppointments ? faToggleOn : faToggleOff
                    }
                    className={
                      settings.autoAcceptAppointments
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    Allow Weekend Appointments
                  </p>
                  <p className="text-sm text-gray-600">
                    Accept bookings on Saturdays and Sundays
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("allowWeekendAppointments")}
                  className="text-3xl"
                >
                  <FontAwesomeIcon
                    icon={
                      settings.allowWeekendAppointments
                        ? faToggleOn
                        : faToggleOff
                    }
                    className={
                      settings.allowWeekendAppointments
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    Buffer Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="bufferTimeBetweenAppointments"
                    value={settings.bufferTimeBetweenAppointments}
                    onChange={handleChange}
                    min="0"
                    max="60"
                    step="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Break time between appointments
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                    Max Appointments/Day
                  </label>
                  <input
                    type="number"
                    name="maxAppointmentsPerDay"
                    value={settings.maxAppointmentsPerDay}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Daily appointment limit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
              <FontAwesomeIcon
                icon={faUserCircle}
                className="mr-2 text-blue-600"
              />
              Account Status
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status
                </label>
                <select
                  name="accountStatus"
                  value={settings.accountStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">
                    Active - Accepting Appointments
                  </option>
                  <option value="away">Away - Temporarily Unavailable</option>
                  <option value="inactive">Inactive - Not Accepting</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    Display Profile Publicly
                  </p>
                  <p className="text-sm text-gray-600">
                    Show your profile in doctor listings
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("displayProfilePublicly")}
                  className="text-3xl"
                >
                  <FontAwesomeIcon
                    icon={
                      settings.displayProfilePublicly ? faToggleOn : faToggleOff
                    }
                    className={
                      settings.displayProfilePublicly
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faSave} />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </form>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
            <FontAwesomeIcon icon={faLock} className="mr-2 text-blue-600" />
            Change Password
          </h2>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;
