import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContext/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faUser,
  faImage,
  faUpload,
  faCheckCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import SocialLogin from "./SocialLogin";

const Register = () => {
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    password: "",
    role: "customer",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const { register, updateUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB.");
        return;
      }

      setSelectedImage(file);
      setError("");

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToImgBB = async (imageFile) => {
    const imgFormData = new FormData();
    imgFormData.append("image", imageFile);
    imgFormData.append("key", "ec38464868721c33778fd355631a2d69");

    try {
      const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        imgFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      if (response.data && response.data.success && response.data.data) {
        return response.data.data.display_url;
      } else {
        throw new Error("Image upload response was invalid");
      }
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        throw new Error("Image upload timeout - please try again");
      }
      if (error.response?.data?.error) {
        throw new Error(`ImgBB error: ${error.response.data.error.message}`);
      }
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate form data
      if (!formData.userName.trim()) {
        throw new Error("Full name is required");
      }
      if (!formData.userEmail.trim()) {
        throw new Error("Email is required");
      }
      if (!formData.password || formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      // phoneNumber and address are not collected at registration

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.userEmail)) {
        throw new Error("Please enter a valid email address");
      }
      let photoURL = "";

      // Step 1: Upload image to ImgBB if selected
      if (selectedImage) {
        setImageUploading(true);
        try {
          photoURL = await uploadImageToImgBB(selectedImage);
          console.log("✅ Image uploaded successfully:", photoURL);
          setImageUploading(false);
        } catch (imageError) {
          setImageUploading(false);
          throw new Error(`Image upload failed: ${imageError.message}`);
        }
      }

      // Step 2: Prepare user data for MongoDB
      const userData = {
        userName: formData.userName,
        userEmail: formData.userEmail,
        password: formData.password,
        photoURL: photoURL,
        role: formData.role,
        accountStatus: "active",
      };

      // Add isVerified: false if role is doctor
      if (formData.role === "doctor") {
        userData.isVerified = false;
      }

      // Step 3: Save user data to MongoDB backend
      try {
        const backendResponse = await axios.post(
          "http://localhost:3000/api/auth/register",
          userData
        );
        console.log("✅ User data saved to MongoDB:", backendResponse.data);
      } catch (backendError) {
        console.error("❌ Backend registration failed:", backendError);
        const errorMessage =
          backendError.response?.data?.message || backendError.message;
        throw new Error(`Database save failed: ${errorMessage}`);
      }

      // Step 4: Register with Firebase Authentication
      try {
        await register(formData.userEmail, formData.password);
        console.log("✅ Firebase user created successfully");
      } catch (firebaseError) {
        console.error("❌ Firebase registration failed:", firebaseError);
        throw new Error(
          `Firebase registration failed: ${firebaseError.message}`
        );
      }

      // Step 5: Update Firebase user profile
      try {
        if (formData.userName || photoURL) {
          await updateUserProfile({
            displayName: formData.userName,
            photoURL: photoURL,
          });
          console.log("✅ Firebase profile updated successfully");
        }
      } catch (profileError) {
        console.error("❌ Profile update failed:", profileError);
        // Don't throw error here as registration was successful
      }

      // Step 6: Success - redirect user based on role
      setSuccess("🎉 Account created successfully! Redirecting...");
      setTimeout(() => {
        if (formData.role === "doctor") {
          navigate("/doctor-dashboard");
        } else {
          navigate("/");
        }
      }, 2000);
    } catch (error) {
      console.error("❌ Registration error:", error);
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="title-text">Create Account</h2>
          <p className="subtitle-text">Join our pet-loving community</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          {/* Full Name */}
          <div className="input-group">
            <label className="input-label">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              Full Name
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="input-primary"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <label className="input-label">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              Email Address
            </label>
            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              className="input-primary"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Role Selection */}
          <div className="input-group">
            <label className="input-label">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              Register as
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-primary"
              required
            >
              <option value="customer">User (Customer)</option>
              <option value="doctor">Doctor (Veterinarian)</option>
            </select>
            {formData.role === "doctor" && (
              <p className="text-sm text-gray-600 mt-2">
                ℹ️ Doctor accounts require verification before accessing doctor
                features.
              </p>
            )}
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-primary"
                placeholder="Create a password"
                minLength="6"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Phone and Address are not collected at registration */}

          {/* Photo Upload */}
          <div className="input-group">
            <label className="input-label">
              <FontAwesomeIcon icon={faImage} className="input-icon" />
              Profile Photo
            </label>

            <div className="image-upload-container">
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <label htmlFor="imageUpload" className="image-upload-btn">
                <FontAwesomeIcon icon={faUpload} className="upload-icon" />
                <span>Choose Profile Photo</span>
              </label>

              {imagePreview && (
                <div className="image-preview">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="preview-image"
                  />
                  <div className="image-info">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="success-icon"
                    />
                    <span>Image selected</span>
                  </div>
                </div>
              )}

              {imageUploading && (
                <div className="upload-progress">
                  <FontAwesomeIcon icon={faSpinner} className="spinner" />
                  <span>Uploading image...</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Success Message */}
          {success && <div className="success-message">{success}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || imageUploading}
            className={`btn-primary ${
              loading || imageUploading ? "loading" : ""
            }`}
          >
            {imageUploading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="spinner" />
                Uploading Image...
              </>
            ) : loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="spinner" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <SocialLogin isRegister={true} />

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
