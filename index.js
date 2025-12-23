const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");
const Stripe = require("stripe");

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");

// Currency Utilities
const USD_TO_BDT_RATE = 120;
const usdToBdt = (usd) => Math.round(usd * USD_TO_BDT_RATE);
const bdtToUsd = (bdt) => parseFloat((bdt / USD_TO_BDT_RATE).toFixed(2));
const formatBdt = (amount) => `৳${Math.round(amount).toLocaleString()}`;

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://petecommerce-9eef4.web.app",
  "https://petecommerce-9eef4.firebaseapp.com",
  "https://puchito.netlify.app",
];

// CORS configuration for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      const msg = "The CORS policy does not allow access from the specified origin.";
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory lock to prevent duplicate concurrent requests
const processingPayments = new Set();

// MongoDB client with connection pooling for serverless
const client = new MongoClient(process.env.MONGO_URI, {
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 10000,
});

let usersCollection;
let cartsCollection;
let couponsCollection;
let ordersCollection;
let appointmentsCollection;
let productsCollection;
let wishlistCollection;

// Track connection state
let isConnected = false;
let communityCollection;

// Google Meet Link Generator
function generateGoogleMeetLink() {
  const randomKey = Math.random().toString(36).substring(2, 12);
  const meetId = randomKey.match(/.{1,3}/g).join("-");
  return `https://meet.google.com/${meetId}`;
}

// Convert 12-hour time (HH:MM AM/PM) to minutes since midnight
function timeToMinutes(timeString) {
  const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  const match = timeString.trim().match(timeRegex);

  if (!match) {
    throw new Error(`Invalid time format: ${timeString}. Expected format: HH:MM AM/PM`);
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  // Validate hours and minutes
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time values: ${timeString}`);
  }

  // Convert to 24-hour format
  if (period === "AM") {
    if (hours === 12) hours = 0; // 12:00 AM = 00:00
  } else {
    if (hours !== 12) hours += 12; // PM times except 12:00 PM
  }

  return hours * 60 + minutes;
}

// Check if a doctor has an appointment conflict at the given date/time
// Must be called within async context where appointmentsCollection is available
async function isAppointmentConflict(doctorId, appointmentDate, appointmentTime, appointmentsCollection) {
  try {
    // Convert appointment time to minutes
    const appointmentMinutes = timeToMinutes(appointmentTime);

    // Calculate 1-hour window (±60 minutes)
    const startMinutes = appointmentMinutes - 60;
    const endMinutes = appointmentMinutes + 60;

    // Find all appointments for this doctor on the same date
    const existingAppointments = await appointmentsCollection
      .find({
        doctorId: doctorId,
        appointmentDate: appointmentDate,
        status: { $ne: "cancelled" } // Exclude cancelled appointments
      })
      .toArray();

    // Check each existing appointment for time conflict
    for (const appointment of existingAppointments) {
      try {
        const existingMinutes = timeToMinutes(appointment.appointmentTime);

        // Check if times overlap within 1-hour window
        // Conflict exists if: existingMinutes is between (startMinutes, endMinutes)
        if (existingMinutes > startMinutes && existingMinutes < endMinutes) {
          return {
            conflict: true,
            message: `Doctor already has an appointment at ${appointment.appointmentTime}`,
            existingAppointment: {
              appointmentId: appointment.appointmentId,
              time: appointment.appointmentTime,
              patientEmail: appointment.userEmail
            }
          };
        }
      } catch (timeError) {
        console.error(`Error parsing time for appointment ${appointment.appointmentId}:`, timeError);
        // Skip malformed appointment times
        continue;
      }
    }

    // No conflict found
    return { conflict: false };

  } catch (error) {
    console.error("Error checking appointment conflict:", error);
    throw new Error("Failed to check appointment availability");
  }
}

// Connect to MongoDB with caching for serverless
async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    await client.connect();
    isConnected = true;
    console.log("MongoDB Connected Successfully 🟢");

    const db = client.db("petplatform");
    usersCollection = db.collection("users");
    cartsCollection = db.collection("carts");
    couponsCollection = db.collection("coupons");
    ordersCollection = db.collection("orders");
    appointmentsCollection = db.collection("appointments");
    productsCollection = db.collection("products");
    communityCollection = db.collection("communityPosts");
    wishlistCollection = db.collection("wishlists");

    // Create unique index on transactionId to prevent duplicate orders
    try {
      await ordersCollection.createIndex(
        { transactionId: 1 },
        { unique: true, sparse: true }
      );
      console.log("✅ Unique index created on orders.transactionId");
    } catch (indexError) {
      console.log("⚠️ Index might already exist:", indexError.message);
    }

    // Create unique index on appointmentId to prevent duplicate appointments
    try {
      await appointmentsCollection.createIndex(
        { appointmentId: 1 },
        { unique: true, sparse: true }
      );
      console.log("✅ Unique index created on appointments.appointmentId");
    } catch (indexError) {
      console.log("⚠️ Appointments index might already exist:", indexError.message);
    }

    app.get("/", (req, res) => {
      res.send("Backend running successfully 🚀");
    });

    app.post("/create-payment-intent", async (req, res) => {
      try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
          return res.status(400).json({ message: "Invalid amount" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: "usd",
          payment_method_types: ["card"],
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {

        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Get all users
    app.get("/users", async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.json(users);
      } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
      }
    });

    // Add new user
    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Error creating user" });
      }
    });

    // Get user by email
    app.get("/api/users/email/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const user = await usersCollection.findOne({ userEmail: email });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Don't send password back
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } catch (error) {
        console.error("Error fetching user by email:", error);
        res.status(500).json({ message: "Error fetching user" });
      }
    });

    // Register new user (for authentication)
    app.post("/api/auth/register", async (req, res) => {
      try {
        const userData = req.body;

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ userEmail: userData.userEmail });
        if (existingUser) {
          return res.status(400).json({ message: "User already exists with this email" });
        }

        // Set default values (do not collect phone/address/zip at registration)
        const newUser = {
          ...userData,
          role: userData.role || "customer",
          accountStatus: userData.accountStatus || "active",
          isComplete: false, // Account details not yet completed
          createdAt: new Date().toISOString(),
          lastLoginTime: new Date().toISOString()
        };

        // Add isVerified: false for doctors (if not already provided)
        if (newUser.role === "doctor" && newUser.isVerified === undefined) {
          newUser.isVerified = false;
        }

        // Insert new user
        const result = await usersCollection.insertOne(newUser);

        res.status(201).json({
          message: "User registered successfully",
          userId: result.insertedId,
          user: { ...newUser, password: undefined } // Don't send password back
        });
      } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Registration failed. Please try again." });
      }
    });

    // Reusable function to handle social login user creation/update
    async function handleSocialLogin(userData) {
      const { email, displayName, photoURL, role } = userData;

      if (!email) {
        throw new Error("Email is required for social login");
      }

      // Check if user exists
      const existingUser = await usersCollection.findOne({ userEmail: email });

      if (existingUser) {
        // Update existing user - preserve their existing role and isVerified
        const updateData = {
          lastLoginTime: new Date().toISOString(),
          photoURL: photoURL || existingUser.photoURL,
        };

        await usersCollection.updateOne(
          { userEmail: email },
          { $set: updateData }
        );

        // Return updated user
        return {
          ...existingUser,
          ...updateData,
          password: undefined, // Never send password
        };
      } else {
        // Create new user
        const newUser = {
          userName: displayName || email.split("@")[0],
          userEmail: email,
          password: null, // No password for social login
          photoURL: photoURL || "",
          role: role || "customer",
          accountStatus: "active",
          isComplete: false, // Account details not yet completed
          createdAt: new Date().toISOString(),
          lastLoginTime: new Date().toISOString(),
        };

        // Add isVerified: false for doctors
        if (newUser.role === "doctor") {
          newUser.isVerified = false;
        }

        const result = await usersCollection.insertOne(newUser);

        return {
          ...newUser,
          _id: result.insertedId,
          password: undefined,
        };
      }
    }

    // Social login endpoint
    app.post("/api/auth/social-login", async (req, res) => {
      try {
        const { email, displayName, photoURL, role } = req.body;

        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }

        const user = await handleSocialLogin({ email, displayName, photoURL, role });

        res.status(200).json({
          message: "Social login successful",
          user,
        });
      } catch (error) {
        console.error("Social login error:", error);
        res.status(500).json({ message: "Social login failed. Please try again." });
      }
    });

    // Utility function to check if account details are complete
    // Accepts either userId (MongoDB ObjectId) or userEmail
    async function isAccountDetailsComplete(identifier) {
      try {
        let user;

        // Check if identifier is a valid MongoDB ObjectId
        if (identifier && ObjectId.isValid(identifier)) {
          user = await usersCollection.findOne({ _id: new ObjectId(identifier) });
        } else if (identifier && identifier.includes('@')) {
          // Treat as email
          user = await usersCollection.findOne({ userEmail: identifier });
        } else {
          console.log("Invalid identifier format (not ObjectId or email):", identifier);
          return false;
        }

        if (!user) {
          return false;
        }

        // Check isComplete field - this is set to true only when ALL required fields are filled
        return user.isComplete === true;
      } catch (error) {
        console.error("Error checking account details:", error);
        return false;
      }
    }

    /**
     * Check user profile completion with detailed field validation
     * @param {string} identifier - userId (MongoDB ObjectId) or userEmail
     * @returns {Object} - { isComplete: boolean, missing: string[], user: object }
     */
    async function checkUserProfileCompletion(identifier) {
      try {
        let user;

        // Step 1: Find user by ObjectId or email
        if (identifier && ObjectId.isValid(identifier)) {
          user = await usersCollection.findOne({ _id: new ObjectId(identifier) });
        } else if (identifier && identifier.includes('@')) {
          user = await usersCollection.findOne({ userEmail: identifier });
        } else {
          return {
            isComplete: false,
            missing: ["user_not_found"],
            message: "Invalid user identifier"
          };
        }

        // Step 2: Check if user exists
        if (!user) {
          return {
            isComplete: false,
            missing: ["user_not_found"],
            message: "User not found in database"
          };
        }

        // Step 3: Primary check - isComplete field
        // If isComplete is false, user has not completed profile at all
        if (user.isComplete === false) {
          return {
            isComplete: false,
            missing: ["all"],
            message: "Profile not completed. Please fill all required fields in Account Details.",
            user: {
              userName: user.userName || "",
              userEmail: user.userEmail || "",
              phone: user.phone || "",
              address: user.address || "",
              city: user.city || "",
              zip: user.zip || ""
            }
          };
        }

        // Step 4: Secondary validation - verify all required fields
        // Even if isComplete is true, validate actual field values
        const requiredFields = {
          userName: user.userName,
          userEmail: user.userEmail,
          phone: user.phone,
          address: user.address,
          city: user.city,
          zip: user.zip
        };

        const missingFields = [];

        for (const [field, value] of Object.entries(requiredFields)) {
          if (!value || value.toString().trim() === "") {
            missingFields.push(field);
          }
        }

        // Step 5: Return result
        if (missingFields.length > 0) {
          // Fields are missing despite isComplete being true
          // This handles edge cases where data integrity is compromised
          return {
            isComplete: false,
            missing: missingFields,
            message: `Missing required fields: ${missingFields.join(", ")}`,
            user: {
              userName: user.userName || "",
              userEmail: user.userEmail || "",
              phone: user.phone || "",
              address: user.address || "",
              city: user.city || "",
              zip: user.zip || ""
            }
          };
        }

        // All checks passed - profile is complete
        return {
          isComplete: true,
          missing: [],
          message: "Profile is complete",
          user: {
            userName: user.userName,
            userEmail: user.userEmail,
            phone: user.phone,
            address: user.address,
            city: user.city,
            zip: user.zip
          }
        };

      } catch (error) {
        console.error("Error checking profile completion:", error);
        return {
          isComplete: false,
          missing: ["error"],
          message: "Error checking profile completion",
          error: error.message
        };
      }
    }

    // Get user by ID
    app.get("/users/:id", async (req, res) => {
      try {
        const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
      } catch (error) {
        res.status(500).json({ message: "Error fetching user" });
      }
    });

    // Update user
    app.put("/users/:id", async (req, res) => {
      try {
        const result = await usersCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body }
        );
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Error updating user" });
      }
    });

    // Delete user
    app.delete("/users/:id", async (req, res) => {
      try {
        const result = await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
      }
    });

    /**
     * API Route: Check if user profile is complete
     * GET /api/check-profile/:identifier
     * 
     * @param identifier - userId (MongoDB ObjectId) or userEmail
     * @returns JSON response with completion status and missing fields
     * 
     * Example responses:
     * Success: { success: true, isComplete: true, missing: [], message: "Profile is complete" }
     * Incomplete: { success: true, isComplete: false, missing: ["phone", "city"], message: "..." }
     * Error: { success: false, message: "Error message" }
     */
    app.get("/api/check-profile/:identifier", async (req, res) => {
      try {
        const { identifier } = req.params;

        // Validate identifier parameter
        if (!identifier) {
          return res.status(400).json({
            success: false,
            message: "User identifier is required"
          });
        }

        // Call the profile completion checker function
        const result = await checkUserProfileCompletion(identifier);

        // Return response based on result
        if (result.isComplete) {
          return res.status(200).json({
            success: true,
            isComplete: true,
            missing: [],
            message: result.message,
            user: result.user
          });
        } else {
          return res.status(200).json({
            success: true,
            isComplete: false,
            missing: result.missing,
            message: result.message,
            user: result.user || null
          });
        }

      } catch (error) {
        console.error("Error in check-profile endpoint:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error while checking profile",
          error: error.message
        });
      }
    });

    /**
     * API Route: Check profile completion by email (POST method)
     * POST /api/check-profile
     * Body: { email: "user@example.com" }
     * 
     * Alternative endpoint that accepts email in request body
     */
    app.post("/api/check-profile", async (req, res) => {
      try {
        const { email, userId } = req.body;
        const identifier = email || userId;

        if (!identifier) {
          return res.status(400).json({
            success: false,
            message: "Email or userId is required"
          });
        }

        const result = await checkUserProfileCompletion(identifier);

        return res.status(200).json({
          success: true,
          isComplete: result.isComplete,
          missing: result.missing || [],
          message: result.message,
          user: result.user || null
        });

      } catch (error) {
        console.error("Error in check-profile POST endpoint:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error while checking profile",
          error: error.message
        });
      }
    });

    /**
     * Get user role by identifier (userId or email)
     * @param {string} identifier - MongoDB ObjectId or user email
     * @returns {Object} - { success: boolean, role: string, user: object }
     */
    async function getUserRole(identifier) {
      try {
        let user;

        // Find user by ObjectId or email
        if (identifier && ObjectId.isValid(identifier)) {
          user = await usersCollection.findOne({ _id: new ObjectId(identifier) });
        } else if (identifier && identifier.includes('@')) {
          user = await usersCollection.findOne({ userEmail: identifier });
        } else {
          return {
            success: false,
            role: null,
            message: "Invalid user identifier"
          };
        }

        // Check if user exists
        if (!user) {
          return {
            success: false,
            role: null,
            message: "User not found"
          };
        }

        // Return user role (default to "customer" if not set)
        const result = {
          success: true,
          role: user.role || "customer",
          user: {
            id: user._id,
            userName: user.userName,
            userEmail: user.userEmail,
            role: user.role || "customer",
            accountStatus: user.accountStatus
          }
        };

        // Add isVerified field for doctors
        if (user.role === "doctor") {
          result.isVerified = user.isVerified || false;
          result.user.isVerified = user.isVerified || false;
        }

        return result;

      } catch (error) {
        console.error("Error getting user role:", error);
        return {
          success: false,
          role: null,
          message: "Error retrieving user role",
          error: error.message
        };
      }
    }

    /**
     * API Route: Get user role
     * GET /api/user/role/:identifier
     * 
     * @param identifier - userId (MongoDB ObjectId) or userEmail
     * @returns JSON response with user role
     */
    app.get("/api/user/role/:identifier", async (req, res) => {
      try {
        const { identifier } = req.params;

        if (!identifier) {
          return res.status(400).json({
            success: false,
            message: "User identifier is required"
          });
        }

        const result = await getUserRole(identifier);

        if (!result.success) {
          return res.status(404).json(result);
        }

        return res.status(200).json(result);

      } catch (error) {
        console.error("Error in get role endpoint:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message
        });
      }
    });

    /**
     * API Route: Get user role by email (POST method)
     * POST /api/user/role
     * Body: { email: "user@example.com" } or { userId: "..." }
     */
    app.post("/api/user/role", async (req, res) => {
      try {
        const { email, userId } = req.body;
        const identifier = email || userId;

        if (!identifier) {
          return res.status(400).json({
            success: false,
            message: "Email or userId is required"
          });
        }

        const result = await getUserRole(identifier);

        if (!result.success) {
          return res.status(404).json(result);
        }

        return res.status(200).json(result);

      } catch (error) {
        console.error("Error in get role POST endpoint:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message
        });
      }
    });

    // ====================================
    // CART ROUTES
    // ====================================

    // Get cart by userId
    app.get("/cart/:userId", async (req, res) => {
      try {
        const { userId } = req.params;
        let cart = await cartsCollection.findOne({ userId });

        if (!cart) {
          cart = { userId, items: [], createdAt: new Date(), updatedAt: new Date() };
          await cartsCollection.insertOne(cart);
        }

        res.json({ success: true, items: cart.items });
      } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ success: false, message: "Error fetching cart" });
      }
    });

    // Add item to cart
    app.post("/cart/add", async (req, res) => {
      try {
        const { userId, productId, productName, productImage, priceUSD, priceBDT, quantity } = req.body;

        if (!userId || !productId) {
          return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Allow adding to cart without profile completion
        // Profile completion will be checked during checkout instead

        let cart = await cartsCollection.findOne({ userId });

        if (!cart) {
          cart = {
            userId,
            items: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
          item => item.productId === productId
        );

        if (existingItemIndex > -1) {
          // Update quantity if item exists
          cart.items[existingItemIndex].quantity += quantity;
        } else {
          // Add new item with both USD and BDT prices
          cart.items.push({
            _id: new ObjectId(),
            productId,
            productName,
            productImage,
            priceUSD: priceUSD || 0,
            priceBDT: priceBDT || 0,
            quantity,
            addedAt: new Date()
          });
        }

        cart.updatedAt = new Date();

        await cartsCollection.updateOne(
          { userId },
          { $set: cart },
          { upsert: true }
        );

        res.json({ success: true, cart, message: "Item added to cart" });
      } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, message: "Error adding to cart" });
      }
    });

    // Update cart item quantity
    app.patch("/cart/update/:itemId", async (req, res) => {
      try {
        const { itemId } = req.params;
        const { userId, quantity } = req.body;

        if (!userId || quantity < 1) {
          return res.status(400).json({ success: false, message: "Invalid request" });
        }

        const cart = await cartsCollection.findOne({ userId });

        if (!cart) {
          return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(
          item => item._id.toString() === itemId
        );

        if (itemIndex === -1) {
          return res.status(404).json({ success: false, message: "Item not found in cart" });
        }

        cart.items[itemIndex].quantity = quantity;
        cart.updatedAt = new Date();

        await cartsCollection.updateOne(
          { userId },
          { $set: { items: cart.items, updatedAt: cart.updatedAt } }
        );

        res.json({ success: true, cart, message: "Quantity updated" });
      } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ success: false, message: "Error updating cart" });
      }
    });

    // Remove item from cart
    app.delete("/cart/remove/:itemId", async (req, res) => {
      try {
        const { itemId } = req.params;
        const { userId } = req.body;

        if (!userId) {
          return res.status(400).json({ success: false, message: "userId is required" });
        }

        const cart = await cartsCollection.findOne({ userId });

        if (!cart) {
          return res.status(404).json({ success: false, message: "Cart not found" });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        cart.updatedAt = new Date();

        await cartsCollection.updateOne(
          { userId },
          { $set: { items: cart.items, updatedAt: cart.updatedAt } }
        );

        res.json({ success: true, cart, message: "Item removed from cart" });
      } catch (error) {
        console.error("Error removing item:", error);
        res.status(500).json({ success: false, message: "Error removing item" });
      }
    });

    // Clear entire cart
    app.delete("/cart/clear", async (req, res) => {
      try {
        const { userId } = req.body;

        if (!userId) {
          return res.status(400).json({ success: false, message: "userId is required" });
        }

        await cartsCollection.updateOne(
          { userId },
          { $set: { items: [], updatedAt: new Date() } },
          { upsert: true }
        );

        res.json({ success: true, message: "Cart cleared" });
      } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ success: false, message: "Error clearing cart" });
      }
    });

    // ====================================
    // WISHLIST ROUTES
    // ====================================

    // Toggle wishlist item (add/remove)
    app.post("/api/wishlist/toggle", async (req, res) => {
      try {
        const { userEmail, productId, productSnapshot } = req.body;

        if (!userEmail || !productId) {
          return res.status(400).json({ success: false, message: "User email and product ID are required" });
        }

        // Check if item already exists in wishlist
        const existingItem = await wishlistCollection.findOne({
          userEmail,
          productId
        });

        if (existingItem) {
          // Remove from wishlist
          await wishlistCollection.deleteOne({ userEmail, productId });
          return res.json({
            success: true,
            action: "removed",
            message: "Product removed from wishlist"
          });
        } else {
          // Add to wishlist
          const wishlistItem = {
            userEmail,
            productId,
            productSnapshot: productSnapshot || {},
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await wishlistCollection.insertOne(wishlistItem);
          return res.json({
            success: true,
            action: "added",
            message: "Product added to wishlist"
          });
        }
      } catch (error) {
        console.error("Error toggling wishlist:", error);
        res.status(500).json({ success: false, message: "Error updating wishlist" });
      }
    });

    // Get user's wishlist
    app.get("/api/wishlist/:email", async (req, res) => {
      try {
        const { email } = req.params;

        if (!email) {
          return res.status(400).json({ success: false, message: "Email is required" });
        }

        const wishlist = await wishlistCollection
          .find({ userEmail: email })
          .sort({ createdAt: -1 })
          .toArray();

        res.json({ success: true, wishlist });
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ success: false, message: "Error fetching wishlist" });
      }
    });

    // Remove item from wishlist
    app.delete("/api/wishlist/remove", async (req, res) => {
      try {
        const { userEmail, productId } = req.body;

        if (!userEmail || !productId) {
          return res.status(400).json({ success: false, message: "User email and product ID are required" });
        }

        const result = await wishlistCollection.deleteOne({ userEmail, productId });

        if (result.deletedCount === 0) {
          return res.status(404).json({ success: false, message: "Item not found in wishlist" });
        }

        res.json({ success: true, message: "Item removed from wishlist" });
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ success: false, message: "Error removing item" });
      }
    });

    // Clear entire wishlist
    app.delete("/api/wishlist/clear/:email", async (req, res) => {
      try {
        const { email } = req.params;

        if (!email) {
          return res.status(400).json({ success: false, message: "Email is required" });
        }

        await wishlistCollection.deleteMany({ userEmail: email });
        res.json({ success: true, message: "Wishlist cleared" });
      } catch (error) {
        console.error("Error clearing wishlist:", error);
        res.status(500).json({ success: false, message: "Error clearing wishlist" });
      }
    });

    // Check wishlist status for multiple products
    app.post("/api/wishlist/check", async (req, res) => {
      try {
        const { userEmail, productIds } = req.body;

        if (!userEmail || !Array.isArray(productIds)) {
          return res.status(400).json({ success: false, message: "User email and product IDs array are required" });
        }

        const wishlistItems = await wishlistCollection
          .find({
            userEmail,
            productId: { $in: productIds }
          })
          .toArray();

        const wishlistedIds = wishlistItems.map(item => item.productId);
        res.json({ success: true, wishlistedIds });
      } catch (error) {
        console.error("Error checking wishlist status:", error);
        res.status(500).json({ success: false, message: "Error checking wishlist" });
      }
    });

    // ====================================
    // COUPON ROUTES
    // ===================================="

    // Apply coupon
    app.post("/coupon/apply", async (req, res) => {
      try {
        const { userId, couponCode, subtotal } = req.body;

        if (!userId || !couponCode) {
          return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const coupon = await couponsCollection.findOne({
          code: couponCode.toUpperCase(),
          isActive: true
        });

        if (!coupon) {
          return res.status(404).json({ success: false, message: "Invalid or expired coupon code" });
        }

        // Check if coupon has expiry date
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
          return res.status(400).json({ success: false, message: "Coupon has expired" });
        }

        // Check minimum purchase amount
        if (coupon.minPurchase && subtotal < coupon.minPurchase) {
          return res.status(400).json({
            success: false,
            message: `Minimum purchase of $${coupon.minPurchase} required`
          });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
        }

        res.json({
          success: true,
          coupon: {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            description: coupon.description
          },
          message: "Coupon applied successfully"
        });
      } catch (error) {
        console.error("Error applying coupon:", error);
        res.status(500).json({ success: false, message: "Error applying coupon" });
      }
    });

    // Get all active coupons (for admin or display)
    app.get("/coupons", async (req, res) => {
      try {
        const coupons = await couponsCollection.find({ isActive: true }).toArray();
        res.json({ success: true, coupons });
      } catch (error) {
        console.error("Error fetching coupons:", error);
        res.status(500).json({ success: false, message: "Error fetching coupons" });
      }
    });

    // Create sample coupons (for testing)
    app.post("/coupons/seed", async (req, res) => {
      try {
        const sampleCoupons = [
          {
            code: "WELCOME10",
            type: "percentage",
            value: 10,
            description: "10% off on your first order",
            minPurchase: 0,
            isActive: true,
            usageLimit: 100,
            usedCount: 0,
            createdAt: new Date()
          },
          {
            code: "SAVE20",
            type: "percentage",
            value: 20,
            description: "20% off on orders above $50",
            minPurchase: 50,
            isActive: true,
            usageLimit: 50,
            usedCount: 0,
            createdAt: new Date()
          },
          {
            code: "FLAT50",
            type: "fixed",
            value: 50,
            description: "$50 off on orders above $100",
            minPurchase: 100,
            isActive: true,
            usageLimit: 30,
            usedCount: 0,
            createdAt: new Date()
          }
        ];

        await couponsCollection.insertMany(sampleCoupons);
        res.json({ success: true, message: "Sample coupons created", coupons: sampleCoupons });
      } catch (error) {
        console.error("Error creating sample coupons:", error);
        res.status(500).json({ success: false, message: "Error creating coupons" });
      }
    });

    // ====================================
    // PAYMENT & ORDER ROUTES
    // ====================================

    // Create Stripe Checkout Session
    app.post("/payment/create-checkout-session", async (req, res) => {
      try {
        const { items, totalBDT, couponCode, billingDetails } = req.body;

        if (!items || items.length === 0) {
          return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // Validate items have valid prices
        const invalidItems = items.filter(item => {
          const price = item.priceUSD || bdtToUsd(item.priceBDT || 0);
          return !price || price <= 0;
        });

        if (invalidItems.length > 0) {
          console.error("Invalid items with zero or missing prices:", invalidItems);
          return res.status(400).json({
            success: false,
            message: "Some items have invalid prices. Please refresh your cart."
          });
        }

        // Calculate individual totals
        const subtotalBDT = items.reduce((sum, item) => sum + (item.priceBDT * item.quantity), 0);
        const shippingBDT = subtotalBDT > 12000 ? 0 : 600; // Free shipping over ৳12,000 (approx $100)
        const taxBDT = Math.round(subtotalBDT * 0.05);

        // Create line items for Stripe
        const lineItems = items.map(item => {
          // Use priceUSD if available, otherwise convert from BDT
          const priceInUSD = item.priceUSD || bdtToUsd(item.priceBDT || 0);
          const priceInCents = Math.round(priceInUSD * 100);

          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.productName,
                images: item.productImage ? [item.productImage] : [],
              },
              unit_amount: priceInCents, // Price in cents
            },
            quantity: item.quantity,
          };
        });

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/cart`,
          metadata: {
            userId: billingDetails?.userId || "guest",
            userEmail: billingDetails?.userEmail || billingDetails?.email,
            billingDetails: JSON.stringify(billingDetails),
            totalBDT: totalBDT.toString(),
            subtotalBDT: subtotalBDT.toString(),
            shippingBDT: shippingBDT.toString(),
            taxBDT: taxBDT.toString(),
            couponCode: couponCode || "",
            items: JSON.stringify(items),
          },
        });

        res.json({ success: true, sessionId: session.id, url: session.url });
      } catch (error) {
        console.error("Error creating checkout session:", error);
        console.error("Error details:", {
          message: error.message,
          type: error.type,
          code: error.code,
          stack: error.stack
        });
        res.status(500).json({
          success: false,
          message: "Error creating payment session",
          error: error.message
        });
      }
    });

    // Create Payment Intent (for confirmCardPayment)
    app.post("/payment/create-payment-intent", async (req, res) => {
      try {
        const { items, totalBDT, couponCode, billingDetails } = req.body;

        if (!items || items.length === 0) {
          return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // Validate items have valid prices
        const invalidItems = items.filter(item => {
          const price = item.priceUSD || bdtToUsd(item.priceBDT || 0);
          return !price || price <= 0;
        });

        if (invalidItems.length > 0) {
          console.error("Invalid items with zero or missing prices:", invalidItems);
          return res.status(400).json({
            success: false,
            message: "Some items have invalid prices. Please refresh your cart."
          });
        }

        // Calculate totals in BDT
        const subtotalBDT = items.reduce((sum, item) => sum + (item.priceBDT * item.quantity), 0);
        const shippingBDT = subtotalBDT > 12000 ? 0 : 600;
        const taxBDT = Math.round(subtotalBDT * 0.05);

        // Convert total to USD for Stripe (Stripe requires USD)
        const totalUSD = bdtToUsd(totalBDT);
        const amountInCents = Math.round(totalUSD * 100);

        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: "usd",
          payment_method_types: ["card"],
          metadata: {
            userId: billingDetails?.userId || "guest",
            userEmail: billingDetails?.userEmail || billingDetails?.email,
            billingDetails: JSON.stringify(billingDetails),
            totalBDT: totalBDT.toString(),
            subtotalBDT: subtotalBDT.toString(),
            shippingBDT: shippingBDT.toString(),
            taxBDT: taxBDT.toString(),
            couponCode: couponCode || "",
            items: JSON.stringify(items),
          },
        });

        res.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        });
      } catch (error) {
        console.error("Error creating payment intent:", error);
        console.error("Error details:", {
          message: error.message,
          type: error.type,
          code: error.code,
          stack: error.stack
        });
        res.status(500).json({
          success: false,
          message: "Error creating payment intent",
          error: error.message
        });
      }
    });

    // Verify Payment Intent and create order
    app.post("/payment/verify-payment", async (req, res) => {
      try {
        const { paymentIntentId, userId } = req.body;

        if (!paymentIntentId) {
          return res.status(400).json({ success: false, message: "Payment Intent ID is required" });
        }

        // Check if this payment is already being processed (in-memory lock)
        if (processingPayments.has(paymentIntentId)) {
          console.log(`⏳ Payment ${paymentIntentId} is already being processed, waiting...`);
          // Wait a bit and check database
          await new Promise(resolve => setTimeout(resolve, 1000));
          const existingOrder = await ordersCollection.findOne({
            transactionId: paymentIntentId
          });
          if (existingOrder) {
            return res.status(200).json({
              success: true,
              message: "Order already created (concurrent request)",
              order: existingOrder,
              isDuplicate: true
            });
          }
        }

        // Add to processing set
        processingPayments.add(paymentIntentId);

        try {
          // Check if order already exists for this transaction (IDEMPOTENCY)
          const existingOrder = await ordersCollection.findOne({
            transactionId: paymentIntentId
          });

          if (existingOrder) {
            console.log(`✅ Order already exists for transaction: ${paymentIntentId}`);
            return res.status(200).json({
              success: true,
              message: "Order already created",
              order: existingOrder,
              isDuplicate: true
            });
          }

          // Retrieve the payment intent from Stripe
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

          if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({ success: false, message: "Payment not completed" });
          }

          // Parse metadata
          const metadata = paymentIntent.metadata;
          const billingDetails = JSON.parse(metadata.billingDetails || "{}");
          const items = JSON.parse(metadata.items || "[]");

          // Create order in database
          const order = {
            userId: metadata.userId || userId,
            billingDetails,
            items,
            subtotal: parseFloat(metadata.subtotalBDT || "0"),
            shipping: parseFloat(metadata.shippingBDT || "0"),
            tax: parseFloat(metadata.taxBDT || "0"),
            discount: 0,
            totalBDT: parseFloat(metadata.totalBDT || "0"),
            totalUSD: paymentIntent.amount / 100,
            paymentStatus: "completed",
            transactionId: paymentIntent.id,
            paymentMethod: "stripe",
            orderStatus: "processing",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const result = await ordersCollection.insertOne(order);

          // Clear user's cart after successful order
          if (metadata.userId && metadata.userId !== "guest") {
            await cartsCollection.updateOne(
              { userId: metadata.userId },
              { $set: { items: [], updatedAt: new Date() } }
            );
          }

          res.json({
            success: true,
            message: "Payment verified and order created",
            order: { ...order, _id: result.insertedId },
          });
        } catch (innerError) {
          console.error("Error verifying payment:", innerError);

          // Check if it's a duplicate key error (MongoDB error code 11000)
          if (innerError.code === 11000 || innerError.message.includes('duplicate key')) {
            console.log(`⚠️ Duplicate order attempt for transaction: ${paymentIntentId}`);

            // Find and return the existing order instead of throwing error
            const existingOrder = await ordersCollection.findOne({
              transactionId: paymentIntentId
            });

            return res.status(200).json({
              success: true,
              message: "Order already exists",
              order: existingOrder,
              isDuplicate: true
            });
          }

          throw innerError; // Re-throw if not duplicate error
        } finally {
          // Remove from processing set when done
          processingPayments.delete(paymentIntentId);
        }
      } catch (error) {
        console.error("Error verifying payment outer:", error);
        processingPayments.delete(paymentIntentId); // Clean up on error
        res.status(500).json({ success: false, message: "Error verifying payment" });
      }
    });

    // Verify payment session and create order
    app.post("/payment/verify-session", async (req, res) => {
      try {
        const { sessionId, userId } = req.body;

        if (!sessionId) {
          return res.status(400).json({ success: false, message: "Session ID is required" });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Check if order already exists for this transaction (IDEMPOTENCY)
        const existingOrder = await ordersCollection.findOne({
          transactionId: session.payment_intent
        });

        if (existingOrder) {
          console.log(`✅ Order already exists for session: ${sessionId}`);
          return res.status(200).json({
            success: true,
            message: "Order already created",
            order: existingOrder,
            isDuplicate: true
          });
        }

        if (session.payment_status !== "paid") {
          return res.status(400).json({ success: false, message: "Payment not completed" });
        }

        // Parse metadata
        const metadata = session.metadata;
        const billingDetails = JSON.parse(metadata.billingDetails || "{}");
        const items = JSON.parse(metadata.items || "[]");

        // Create order in database
        const order = {
          userId: metadata.userId || userId,
          billingDetails,
          items,
          subtotal: parseFloat(metadata.subtotalBDT || "0"),
          shipping: parseFloat(metadata.shippingBDT || "0"),
          tax: parseFloat(metadata.taxBDT || "0"),
          discount: 0,
          totalBDT: parseFloat(metadata.totalBDT || "0"),
          totalUSD: session.amount_total / 100, // Stripe amount is in cents
          paymentStatus: "completed",
          transactionId: session.payment_intent,
          paymentMethod: "stripe",
          orderStatus: "processing",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await ordersCollection.insertOne(order);

        // Clear user's cart after successful order
        if (metadata.userId && metadata.userId !== "guest") {
          await cartsCollection.updateOne(
            { userId: metadata.userId },
            { $set: { items: [], updatedAt: new Date() } }
          );
        }

        res.json({
          success: true,
          message: "Payment verified and order created",
          order: { ...order, _id: result.insertedId },
        });
      } catch (error) {
        console.error("Error verifying payment session:", error);

        // Check if it's a duplicate key error (MongoDB error code 11000)
        if (error.code === 11000 || error.message.includes('duplicate key')) {
          console.log(`⚠️ Duplicate order attempt for session: ${req.body.sessionId}`);

          // Find and return the existing order instead of throwing error
          const session = await stripe.checkout.sessions.retrieve(req.body.sessionId);
          const existingOrder = await ordersCollection.findOne({
            transactionId: session.payment_intent
          });

          return res.status(200).json({
            success: true,
            message: "Order already exists",
            order: existingOrder,
            isDuplicate: true
          });
        }

        // For other errors, return 500
        res.status(500).json({ success: false, message: "Error verifying payment" });
      }
    });

    // ============================================
    // APPOINTMENT BOOKING ROUTES
    // ============================================

    // Create Payment Intent for Appointment (On-site payment)
    app.post("/appointment/create-payment-intent", async (req, res) => {
      try {
        const {
          doctorId,
          doctorName,
          doctorEmail,
          doctorFee,
          selectedDate,
          selectedTime,
          userId,
          userEmail,
        } = req.body;

        console.log("📅 Appointment booking request:", { doctorId, doctorName, doctorEmail, selectedDate, selectedTime, userId, userEmail });

        if (!doctorId || !doctorName || !doctorEmail || !doctorFee || !selectedDate || !selectedTime || !userId || !userEmail) {
          console.error("❌ Missing required fields:", { doctorId, doctorName, doctorEmail, doctorFee, selectedDate, selectedTime, userId, userEmail });
          return res.status(400).json({
            success: false,
            message: "Missing required appointment details",
          });
        }

        // ========== VALIDATE DOCTOR AVAILABILITY ==========

        // Fetch doctor details from database
        const doctor = await usersCollection.findOne({
          $or: [
            { _id: ObjectId.isValid(doctorId) ? new ObjectId(doctorId) : null },
            { userEmail: doctorEmail }
          ],
          role: "doctor"
        });

        if (!doctor) {
          return res.status(404).json({
            success: false,
            message: "Doctor not found"
          });
        }

        // Check if doctor has availability settings
        if (!doctor.availableDays || doctor.availableDays.length === 0) {
          // If no availability set, allow booking (backward compatibility)
          console.log("⚠️ Doctor has no availability settings, allowing booking");
        } else {
          // Validate selected date matches available days
          const selectedDateObj = new Date(selectedDate);
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const selectedDayName = dayNames[selectedDateObj.getDay()];

          if (!doctor.availableDays.includes(selectedDayName)) {
            return res.status(400).json({
              success: false,
              message: `Doctor is not available on ${selectedDayName}. Available days: ${doctor.availableDays.join(", ")}`
            });
          }

          // Validate selected time is within available time range
          if (doctor.availableTimeStart && doctor.availableTimeEnd) {
            // Convert 12-hour time to 24-hour for comparison
            const convertTo24Hour = (time12h) => {
              const [time, period] = time12h.split(" ");
              let [hours, minutes] = time.split(":").map(Number);

              if (period === "PM" && hours !== 12) hours += 12;
              if (period === "AM" && hours === 12) hours = 0;

              return hours * 60 + minutes; // Return total minutes
            };

            const selectedTimeMinutes = convertTo24Hour(selectedTime);
            const [startHour, startMin] = doctor.availableTimeStart.split(":").map(Number);
            const [endHour, endMin] = doctor.availableTimeEnd.split(":").map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;

            if (selectedTimeMinutes < startMinutes || selectedTimeMinutes >= endMinutes) {
              return res.status(400).json({
                success: false,
                message: `Selected time is outside doctor's available hours (${doctor.availableTimeStart} - ${doctor.availableTimeEnd})`
              });
            }
          }
        }

        // Check if account details are complete (using email)
        const isComplete = await isAccountDetailsComplete(userEmail);
        if (!isComplete) {
          return res.status(400).json({
            success: false,
            message: "Please complete your Account Details to continue."
          });
        }

        // Check for appointment time conflict
        const conflictCheck = await isAppointmentConflict(doctorId, selectedDate, selectedTime, appointmentsCollection);
        if (conflictCheck.conflict) {
          return res.status(409).json({
            success: false,
            message: conflictCheck.message,
            conflict: true,
            existingAppointment: conflictCheck.existingAppointment
          });
        }

        // doctorFee is already in USD from frontend
        // Ensure it's a valid number
        const feeUSD = parseFloat(doctorFee);
        const feeBDT = usdToBdt(feeUSD);

        if (isNaN(feeUSD) || feeUSD <= 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid consultation fee"
          });
        }

        // Create Payment Intent with USD amount
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(feeUSD * 100), // Convert USD to cents for Stripe
          currency: "usd",
          metadata: {
            type: "appointment",
            doctorId,
            doctorName,
            doctorEmail,
            appointmentDate: selectedDate,
            appointmentTime: selectedTime,
            userId,
            userEmail,
            feeBDT: feeBDT.toString(),
            feeUSD: feeUSD.toString(),
          },
        });

        res.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        });
      } catch (error) {
        console.error("Error creating appointment payment intent:", error);
        res.status(500).json({
          success: false,
          message: "Error creating appointment payment",
        });
      }
    });

    // Verify Appointment Payment and Create Appointment
    app.post("/appointment/verify-payment", async (req, res) => {
      try {
        const { paymentIntentId, appointmentData, userId, userEmail } = req.body;

        if (!paymentIntentId) {
          return res.status(400).json({
            success: false,
            message: "Payment Intent ID is required",
          });
        }

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
          return res.status(400).json({
            success: false,
            message: "Payment not completed",
          });
        }

        const metadata = paymentIntent.metadata;

        // Generate unique appointment ID
        const appointmentId = `APT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // Generate Google Meet link
        const meetLink = generateGoogleMeetLink();

        // Create appointment record
        const appointment = {
          appointmentId,
          userId: metadata.userId || userId,
          userEmail: metadata.userEmail || userEmail,
          doctorId: metadata.doctorId || appointmentData.doctorId,
          doctorName: metadata.doctorName || appointmentData.doctorName,
          doctorEmail: metadata.doctorEmail || appointmentData.doctorEmail,
          appointmentDate: metadata.appointmentDate || appointmentData.selectedDate,
          appointmentTime: metadata.appointmentTime || appointmentData.selectedTime,
          meetLink,
          feeBDT: parseFloat(metadata.feeBDT || appointmentData.doctorFee),
          feeUSD: parseFloat(metadata.feeUSD || bdtToUsd(appointmentData.doctorFee)),
          status: "confirmed",
          paymentIntentId: paymentIntentId,
          paymentStatus: "completed",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Check for duplicate appointment
        const existingAppointment = await appointmentsCollection.findOne({
          paymentIntentId: paymentIntentId,
        });

        if (existingAppointment) {
          console.log(`⚠️ Duplicate appointment attempt for payment: ${paymentIntentId}`);
          return res.status(200).json({
            success: true,
            message: "Appointment already exists",
            appointment: existingAppointment,
            isDuplicate: true,
          });
        }

        const result = await appointmentsCollection.insertOne(appointment);

        res.json({
          success: true,
          message: "Appointment confirmed successfully",
          appointment: { ...appointment, _id: result.insertedId },
        });
      } catch (error) {
        console.error("Error verifying appointment payment:", error);

        // Handle duplicate key error
        if (error.code === 11000 || error.message.includes("duplicate key")) {
          const existingAppointment = await appointmentsCollection.findOne({
            paymentIntentId: req.body.paymentIntentId,
          });

          return res.status(200).json({
            success: true,
            message: "Appointment already exists",
            appointment: existingAppointment,
            isDuplicate: true,
          });
        }

        res.status(500).json({
          success: false,
          message: "Error verifying appointment payment",
        });
      }
    });

    // Get all appointments for a user
    app.get("/appointments/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        const appointments = await appointmentsCollection
          .find({ userId })
          .sort({ createdAt: -1 })
          .toArray();

        res.json({
          success: true,
          appointments,
        });
      } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({
          success: false,
          message: "Error fetching appointments",
        });
      }
    });

    // Get single appointment by ID
    app.get("/appointment/:appointmentId", async (req, res) => {
      try {
        const { appointmentId } = req.params;

        const appointment = await appointmentsCollection.findOne({
          appointmentId,
        });

        if (!appointment) {
          return res.status(404).json({
            success: false,
            message: "Appointment not found",
          });
        }

        res.json({
          success: true,
          appointment,
        });
      } catch (error) {
        console.error("Error fetching appointment:", error);
        res.status(500).json({
          success: false,
          message: "Error fetching appointment",
        });
      }
    });

    // ============================================
    // END APPOINTMENT ROUTES
    // ============================================

    // Create Order after payment success
    app.post("/order/create", async (req, res) => {
      try {
        const { userId, billingDetails, items, totals, paymentDetails } = req.body;

        if (!userId || !items || items.length === 0) {
          return res.status(400).json({ success: false, message: "Invalid order data" });
        }

        const order = {
          userId,
          billingDetails,
          items,
          subtotalBDT: totals.subtotalBDT,
          discountBDT: totals.discountBDT || 0,
          taxBDT: totals.taxBDT,
          shippingBDT: totals.shippingBDT,
          totalBDT: totals.totalBDT,
          totalUSD: totals.totalUSD,
          paymentStatus: "completed",
          transactionId: paymentDetails?.transactionId || null,
          paymentMethod: paymentDetails?.method || "stripe",
          orderStatus: "processing",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await ordersCollection.insertOne(order);

        // Clear user's cart after successful order
        await cartsCollection.updateOne(
          { userId },
          { $set: { items: [], updatedAt: new Date() } }
        );

        res.json({
          success: true,
          message: "Order created successfully",
          orderId: result.insertedId,
          order: { ...order, _id: result.insertedId },
        });
      } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: "Error creating order" });
      }
    });

    // Get user orders
    app.get("/orders/:userId", async (req, res) => {
      try {
        const { userId } = req.params;
        const orders = await ordersCollection
          .find({ userId })
          .sort({ createdAt: -1 })
          .toArray();

        res.json({ success: true, orders });
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Error fetching orders" });
      }
    });

    // Get single order
    app.get("/order/:orderId", async (req, res) => {
      try {
        const { orderId } = req.params;

        if (!ObjectId.isValid(orderId)) {
          return res.status(400).json({ success: false, message: "Invalid order ID" });
        }

        const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });

        if (!order) {
          return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, order });
      } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ success: false, message: "Error fetching order" });
      }
    });


    // ============ USER PROFILE ROUTES ============
    // Get user profile with stats (POST body)
    app.post("/api/user/profile", async (req, res) => {
      try {
        // Accept either { email } or { userEmail } for compatibility
        const email = (req.body && (req.body.email || req.body.userEmail)) || null;

        if (!email) {
          return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Find user in database by email
        const user = await usersCollection.findOne({ userEmail: email });
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }

        // Calculate user stats by userEmail
        const totalOrders = await ordersCollection.countDocuments({ "billingDetails.userEmail": email });
        const totalServices = await appointmentsCollection.countDocuments({ userEmail: email });

        // Calculate total spent
        const orders = await ordersCollection.find({ "billingDetails.userEmail": email }).toArray();
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalBDT || order.totalAmount || 0), 0);

        res.json({
          success: true,
          profile: {
            name: user.userName || user.displayName || "",
            email: user.userEmail || "",
            phone: user.phone || "",
            address: user.address || "",
            city: user.city || "",
            zip: user.zip || "",
            isComplete: user.isComplete || false,
            memberSince: user.createdAt || new Date().toISOString(),
            // Doctor-specific fields
            specialization: user.specialization || "",
            qualification: user.qualification || "",
            experience: user.experience || "",
            consultationFee: user.consultationFee || "",
            bio: user.bio || "",
            availableDays: user.availableDays || [],
            availableTimeStart: user.availableTimeStart || "",
            availableTimeEnd: user.availableTimeEnd || "",
          },
          stats: {
            totalOrders,
            totalServices,
            totalSpent,
          },
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ success: false, message: "Failed to load profile" });
      }
    });

    // Get user profile with stats (GET query) - supports ?userEmail=...
    app.get("/api/user/profile", async (req, res) => {
      try {
        const userEmail = req.query.userEmail;

        if (!userEmail) {
          return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Find user in database
        const user = await usersCollection.findOne({ userEmail });
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }

        // Calculate user stats by userEmail
        const totalOrders = await ordersCollection.countDocuments({ "billingDetails.userEmail": userEmail });
        const totalServices = await appointmentsCollection.countDocuments({ userEmail: userEmail });

        // Calculate total spent
        const orders = await ordersCollection.find({ "billingDetails.userEmail": userEmail }).toArray();
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalBDT || order.totalAmount || 0), 0);

        res.json({
          success: true,
          profile: {
            name: user.userName || user.displayName || "",
            email: user.userEmail || "",
            phone: user.phone || "",
            address: user.address || "",
            city: user.city || "",
            zip: user.zip || "",
            isComplete: user.isComplete || false,
            memberSince: user.createdAt || new Date().toISOString(),
            // Doctor-specific fields
            specialization: user.specialization || "",
            qualification: user.qualification || "",
            experience: user.experience || "",
            consultationFee: user.consultationFee || "",
            bio: user.bio || "",
            availableDays: user.availableDays || [],
            availableTimeStart: user.availableTimeStart || "",
            availableTimeEnd: user.availableTimeEnd || "",
          },
          stats: {
            totalOrders,
            totalServices,
            totalSpent,
          },
        });
      } catch (error) {
        console.error("Error fetching profile (GET):", error);
        res.status(500).json({ success: false, message: "Failed to load profile" });
      }
    });

    // Update user profile
    app.put("/api/user/update-profile", async (req, res) => {
      try {
        const { userEmail, name, email, phone, address, city, zip } = req.body;

        if (!userEmail) {
          return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Validate ALL required fields are filled (mandatory)
        const requiredFields = { name, email, phone, address, city, zip };
        const missingFields = [];

        for (const [field, value] of Object.entries(requiredFields)) {
          if (!value || value.toString().trim() === "") {
            missingFields.push(field);
          }
        }

        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: "All fields are required to complete your profile.",
            missingFields: missingFields,
          });
        }

        // All fields are filled - update user and set isComplete to true
        const updateData = {
          userName: name,
          userEmail: email,
          phone,
          address,
          city,
          zip,
          isComplete: true, // Mark account as complete
          updatedAt: new Date().toISOString(),
        };

        const result = await usersCollection.updateOne(
          { userEmail },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
          success: true,
          message: "Profile updated successfully! Your account is now complete.",
          profile: updateData,
        });
      } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Failed to update profile" });
      }
    });

    // Update doctor profile with doctor-specific fields
    app.put("/api/user/update-doctor-profile", async (req, res) => {
      try {
        const {
          userEmail,
          userName,
          phone,
          address,
          city,
          zip,
          specialization,
          qualification,
          experience,
          consultationFee,
          bio,
          availableDays,
          availableTimeStart,
          availableTimeEnd
        } = req.body;

        if (!userEmail) {
          return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Build update data object
        const updateData = {
          userName,
          phone,
          address,
          city,
          zip,
          specialization,
          qualification,
          experience,
          consultationFee,
          bio,
          availableDays: availableDays || [],
          availableTimeStart,
          availableTimeEnd,
          isComplete: true,
          updatedAt: new Date().toISOString(),
        };

        const result = await usersCollection.updateOne(
          { userEmail },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
          success: true,
          message: "Doctor profile updated successfully!",
          profile: updateData,
        });
      } catch (error) {
        console.error("Error updating doctor profile:", error);
        res.status(500).json({ success: false, message: "Failed to update doctor profile" });
      }
    });

    // ============ ORDERS ROUTE ============
    // Get user's orders
    app.post("/api/orders/my-orders", async (req, res) => {
      try {
        const { userEmail } = req.body;

        if (!userEmail) {
          return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Find user to confirm existence
        const user = await usersCollection.findOne({ userEmail });
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }

        // Query orders by userEmail in billingDetails
        const orders = await ordersCollection
          .find({ "billingDetails.userEmail": userEmail })
          .sort({ createdAt: -1 })
          .toArray();

        res.json({
          success: true,
          orders,
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Failed to load orders" });
      }
    });

    // ============ SERVICES ROUTE ============
    // Get user's services/appointments
    app.post("/api/services/user-services", async (req, res) => {
      try {
        const { userEmail } = req.body;

        if (!userEmail) {
          return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Find user to confirm existence
        const user = await usersCollection.findOne({ userEmail });
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }

        // Query appointments by userEmail directly
        const appointments = await appointmentsCollection
          .find({ userEmail: userEmail })
          .sort({ appointmentDate: -1 })
          .toArray();

        // Map appointments to services format
        const services = appointments.map((apt) => ({
          _id: apt._id,
          serviceId: apt.appointmentId,
          serviceName: `Veterinary Consultation - ${apt.doctorName || "Doctor"}`,
          status: apt.status || "scheduled",
          providerName: apt.doctorName || "N/A",
          date: apt.appointmentDate,
          time: apt.appointmentTime,
          meetLink: apt.meetLink,
          amount: apt.paymentAmount || 0,
          createdAt: apt.createdAt,
        }));

        res.json({
          success: true,
          services,
        });
      } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ success: false, message: "Failed to load services" });
      }
    });

    // ============ DOCTOR DASHBOARD ROUTES ============
    // Get doctor appointments filtered by doctor's email
    app.get("/api/doctor/appointments", async (req, res) => {
      try {
        const { email } = req.query;

        if (!email) {
          return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Fetch all appointments for this doctor by doctorEmail
        const appointments = await appointmentsCollection
          .find({ doctorEmail: email })
          .sort({ appointmentDate: -1, appointmentTime: -1 })
          .toArray();

        res.json({
          success: true,
          appointments,
        });
      } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        res.status(500).json({ success: false, message: "Failed to load appointments" });
      }
    });

    // Get doctor earnings and statistics filtered by doctor's email
    app.get("/api/doctor/earnings", async (req, res) => {
      try {
        const { email } = req.query;

        if (!email) {
          return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Fetch all completed appointments for this doctor by doctorEmail
        const completedAppointments = await appointmentsCollection
          .find({
            doctorEmail: email,
            status: "completed",
            paymentStatus: "completed"
          })
          .toArray();

        // Calculate earnings
        const total = completedAppointments.reduce((sum, apt) => sum + (apt.feeUSD || 0), 0);

        // Calculate today's earnings
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEarnings = completedAppointments
          .filter(apt => new Date(apt.createdAt) >= today)
          .reduce((sum, apt) => sum + (apt.feeUSD || 0), 0);

        // Calculate this week's earnings
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekEarnings = completedAppointments
          .filter(apt => new Date(apt.createdAt) >= weekAgo)
          .reduce((sum, apt) => sum + (apt.feeUSD || 0), 0);

        // Calculate this month's earnings
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const monthEarnings = completedAppointments
          .filter(apt => new Date(apt.createdAt) >= monthAgo)
          .reduce((sum, apt) => sum + (apt.feeUSD || 0), 0);

        // Calculate pending earnings
        const pendingAppointments = await appointmentsCollection
          .find({
            doctorEmail: email,
            status: "confirmed",
            paymentStatus: "completed"
          })
          .toArray();
        const pending = pendingAppointments.reduce((sum, apt) => sum + (apt.feeUSD || 0), 0);        // Create transaction history
        const transactions = completedAppointments.map(apt => ({
          id: apt._id.toString(),
          appointmentId: apt.appointmentId,
          patientName: apt.userName || "Patient",
          patientEmail: apt.userEmail,
          date: apt.createdAt,
          amount: apt.feeUSD || 0,
          status: "completed",
          paymentMethod: "Credit Card",
        }));

        res.json({
          success: true,
          earnings: {
            total,
            today: todayEarnings,
            thisWeek: weekEarnings,
            thisMonth: monthEarnings,
            pending,
          },
          transactions,
        });
      } catch (error) {
        console.error("Error fetching doctor earnings:", error);
        res.status(500).json({ success: false, message: "Failed to load earnings" });
      }
    });

    // Get doctor dashboard statistics
    app.get("/api/doctor/stats", async (req, res) => {
      try {
        const { email } = req.query;

        if (!email) {
          return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Count total appointments by doctorEmail
        const totalAppointments = await appointmentsCollection.countDocuments({
          doctorEmail: email
        });

        // Count today's appointments
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const todayAppointments = await appointmentsCollection.countDocuments({
          doctorEmail: email,
          appointmentDate: todayStr
        });

        // Calculate total earnings from completed appointments
        const completedAppointments = await appointmentsCollection
          .find({
            doctorEmail: email,
            status: "completed",
            paymentStatus: "completed"
          })
          .toArray();
        const totalEarnings = completedAppointments.reduce((sum, apt) => sum + (apt.feeUSD || 0), 0);

        // Get unique patient count
        const uniquePatients = await appointmentsCollection
          .distinct("userEmail", { doctorEmail: email });
        const totalPatients = uniquePatients.length;

        // Get upcoming appointments (confirmed status, future dates)
        const upcomingAppointments = await appointmentsCollection
          .find({
            doctorEmail: email,
            status: "confirmed"
          })
          .sort({ appointmentDate: 1, appointmentTime: 1 })
          .limit(5)
          .toArray(); res.json({
            success: true,
            stats: {
              totalAppointments,
              todayAppointments,
              totalEarnings,
              totalPatients,
              upcomingAppointments,
            },
          });
      } catch (error) {
        console.error("Error fetching doctor stats:", error);
        res.status(500).json({ success: false, message: "Failed to load statistics" });
      }
    });

    // ============ DOCTORS LIST ROUTE ============
    // Get all doctors (users with role: 'doctor')
    app.get("/api/doctors", async (req, res) => {
      try {
        const doctors = await usersCollection
          .find({ role: "doctor" })
          .project({
            password: 0, // Exclude password field
          })
          .toArray();

        res.status(200).json({
          success: true,
          count: doctors.length,
          doctors,
        });
      } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({
          success: false,
          message: "Error fetching doctors",
          error: error.message,
        });
      }
    });

    // ============ VERIFY DOCTOR ROUTE ============
    // Admin endpoint to verify a doctor
    app.patch("/api/doctors/:id/verify", async (req, res) => {
      try {
        const doctorId = req.params.id;

        if (!ObjectId.isValid(doctorId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid doctor ID",
          });
        }

        const result = await usersCollection.updateOne(
          { _id: new ObjectId(doctorId), role: "doctor" },
          {
            $set: {
              isVerified: true,
              verifiedAt: new Date().toISOString()
            }
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Doctor not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Doctor verified successfully",
        });
      } catch (error) {
        console.error("Error verifying doctor:", error);
        res.status(500).json({
          success: false,
          message: "Error verifying doctor",
          error: error.message,
        });
      }
    });

    // ============ APPOINTMENT STATUS UPDATE ROUTES ============
    // Mark appointment as completed
    app.put("/api/doctor/appointments/:appointmentId/complete", async (req, res) => {
      try {
        const { appointmentId } = req.params;
        const { doctorEmail } = req.body;

        if (!doctorEmail) {
          return res.status(400).json({ success: false, message: "Doctor email is required" });
        }

        const result = await appointmentsCollection.updateOne(
          { appointmentId, doctorEmail }, // Ensure doctor owns this appointment
          { $set: { status: "completed", completedAt: new Date().toISOString() } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        res.json({
          success: true,
          message: "Appointment marked as completed",
        });
      } catch (error) {
        console.error("Error completing appointment:", error);
        res.status(500).json({ success: false, message: "Failed to update appointment" });
      }
    });

    // Cancel appointment
    app.put("/api/doctor/appointments/:appointmentId/cancel", async (req, res) => {
      try {
        const { appointmentId } = req.params;
        const { doctorEmail } = req.body;

        if (!doctorEmail) {
          return res.status(400).json({ success: false, message: "Doctor email is required" });
        }

        const result = await appointmentsCollection.updateOne(
          { appointmentId, doctorEmail }, // Ensure doctor owns this appointment
          { $set: { status: "cancelled", cancelledAt: new Date().toISOString() } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        res.json({
          success: true,
          message: "Appointment cancelled successfully",
        });
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        res.status(500).json({ success: false, message: "Failed to cancel appointment" });
      }
    });

    // ============ ADMIN API ROUTES ============

    // Admin Dashboard Stats
    app.get("/api/admin/dashboard-stats", async (req, res) => {
      try {
        const totalUsers = await usersCollection.countDocuments();
        const totalDoctors = await usersCollection.countDocuments({ role: "doctor" });
        const totalOrders = await ordersCollection.countDocuments();
        const totalAppointments = await appointmentsCollection.countDocuments();
        const activeCoupons = await couponsCollection.countDocuments({ isActive: true });

        // Calculate total revenue from delivered orders only
        const orders = await ordersCollection.find({ status: "delivered" }).toArray();
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalUSD || 0), 0);

        res.json({
          success: true,
          stats: {
            totalUsers,
            totalDoctors,
            totalOrders,
            totalRevenue,
            totalAppointments,
            activeCoupons,
            communityPosts: 0,
            pendingApprovals: 0,
          },
          recentActivity: [],
        });
      } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
        res.status(500).json({ success: false, message: "Failed to load stats" });
      }
    });

    // Get all orders (admin)
    app.get("/api/admin/all-orders", async (req, res) => {
      try {
        const orders = await ordersCollection.find().sort({ createdAt: -1 }).toArray();

        // Fetch customer names for each order
        const ordersWithCustomerNames = await Promise.all(
          orders.map(async (order) => {
            const user = await usersCollection.findOne({ userEmail: order.userEmail });
            return {
              ...order,
              customerName: user?.userName || user?.displayName || order.userEmail?.split('@')[0] || 'Unknown Customer'
            };
          })
        );

        res.json({ success: true, orders: ordersWithCustomerNames });
      } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({ success: false, message: "Failed to load orders" });
      }
    });

    // Update order status (admin)
    app.put("/api/admin/orders/:id/status", async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await ordersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status, updatedAt: new Date() } }
        );

        if (result.modifiedCount > 0) {
          res.json({ success: true, message: "Order status updated successfully" });
        } else {
          res.status(404).json({ success: false, message: "Order not found" });
        }
      } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: "Failed to update order status" });
      }
    });

    // Get all appointments (admin)
    app.get("/api/admin/all-appointments", async (req, res) => {
      try {
        const appointments = await appointmentsCollection.find().sort({ createdAt: -1 }).toArray();
        res.json({ success: true, appointments });
      } catch (error) {
        console.error("Error fetching all appointments:", error);
        res.status(500).json({ success: false, message: "Failed to load appointments" });
      }
    });

    // Get payment analytics (admin)
    app.get("/api/admin/payments", async (req, res) => {
      try {
        // Only count delivered orders for revenue
        const orders = await ordersCollection.find({ status: "delivered" }).toArray();
        const appointments = await appointmentsCollection.find({ status: "completed" }).toArray();

        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalUSD || 0), 0) +
          appointments.reduce((sum, a) => sum + (a.feeUSD || 0), 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const todayRevenue = orders
          .filter(o => new Date(o.createdAt) >= today)
          .reduce((sum, o) => sum + (o.totalUSD || 0), 0) +
          appointments
            .filter(a => new Date(a.createdAt) >= today)
            .reduce((sum, a) => sum + (a.feeUSD || 0), 0);

        const weekRevenue = orders
          .filter(o => new Date(o.createdAt) >= weekAgo)
          .reduce((sum, o) => sum + (o.totalUSD || 0), 0) +
          appointments
            .filter(a => new Date(a.createdAt) >= weekAgo)
            .reduce((sum, a) => sum + (a.feeUSD || 0), 0);

        const monthRevenue = orders
          .filter(o => new Date(o.createdAt) >= monthAgo)
          .reduce((sum, o) => sum + (o.totalUSD || 0), 0) +
          appointments
            .filter(a => new Date(a.createdAt) >= monthAgo)
            .reduce((sum, a) => sum + (a.feeUSD || 0), 0);

        const transactions = [...orders, ...appointments].map(item => ({
          _id: item._id,
          transactionId: item.orderId || item.appointmentId,
          userEmail: item.userEmail,
          type: item.orderId ? "Order" : "Appointment",
          amount: item.totalUSD || item.feeUSD || 0,
          status: item.orderId ? "delivered" : "completed",
          createdAt: item.createdAt,
        }));

        res.json({
          success: true,
          stats: { totalRevenue, todayRevenue, weekRevenue, monthRevenue },
          transactions,
        });
      } catch (error) {
        console.error("Error fetching payment analytics:", error);
        res.status(500).json({ success: false, message: "Failed to load payments" });
      }
    });

    // Get appointment payments analytics (admin)
    app.get("/api/admin/payments/appointments", async (req, res) => {
      try {
        const appointments = await appointmentsCollection.find({ status: "completed", paymentStatus: "completed" }).toArray();

        const total = appointments.reduce((sum, a) => sum + (a.feeUSD || 0), 0);

        // Monthly breakdown
        const monthlyData = {};
        appointments.forEach(apt => {
          const date = new Date(apt.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (apt.feeUSD || 0);
        });

        const transactions = appointments.map(apt => ({
          _id: apt._id,
          transactionId: apt.appointmentId,
          userName: apt.userName || "Patient",
          userEmail: apt.userEmail,
          doctorName: apt.doctorName,
          type: "Doctor Appointment",
          amount: apt.feeUSD || 0,
          date: apt.createdAt,
          status: "completed"
        }));

        res.json({
          success: true,
          total,
          monthlyData,
          transactions: transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
        });
      } catch (error) {
        console.error("Error fetching appointment payments:", error);
        res.status(500).json({ success: false, message: "Failed to load appointment payments" });
      }
    });

    // Get order payments analytics (admin)
    app.get("/api/admin/payments/orders", async (req, res) => {
      try {
        const orders = await ordersCollection.find({ status: "delivered" }).toArray();

        const total = orders.reduce((sum, o) => sum + (o.totalUSD || 0), 0);

        // Monthly breakdown
        const monthlyData = {};
        orders.forEach(order => {
          const date = new Date(order.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (order.totalUSD || 0);
        });

        const transactions = orders.map(order => ({
          _id: order._id,
          transactionId: order.orderId || order._id.toString().slice(-8),
          userName: order.billingDetails?.fullName || order.customerName || "Customer",
          userEmail: order.userEmail || order.billingDetails?.email,
          type: "Order",
          amount: order.totalUSD || 0,
          date: order.createdAt,
          status: "delivered"
        }));

        res.json({
          success: true,
          total,
          monthlyData,
          transactions: transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
        });
      } catch (error) {
        console.error("Error fetching order payments:", error);
        res.status(500).json({ success: false, message: "Failed to load order payments" });
      }
    });

    // ========== PRODUCT MANAGEMENT API ==========

    // Get all products (public route)
    app.get("/api/products", async (req, res) => {
      try {
        const products = await productsCollection.find({}).toArray();
        res.json({ success: true, products });
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products" });
      }
    });

    // Get single product by ID (public route)
    app.get("/api/products/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const product = await productsCollection.findOne({ _id: new ObjectId(id) });

        if (!product) {
          return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, product });
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ success: false, message: "Failed to fetch product" });
      }
    });

    // Admin: Create new product
    app.post("/api/admin/products", async (req, res) => {
      try {
        const productData = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await productsCollection.insertOne(productData);
        res.json({
          success: true,
          message: "Product created successfully",
          productId: result.insertedId
        });
      } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, message: "Failed to create product" });
      }
    });

    // Admin: Update product
    app.put("/api/admin/products/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = {
          ...req.body,
          updatedAt: new Date(),
        };

        const result = await productsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Product updated successfully" });
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: "Failed to update product" });
      }
    });

    // Admin: Delete product
    app.delete("/api/admin/products/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Product deleted successfully" });
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, message: "Failed to delete product" });
      }
    });

    // Admin: Update product stock
    app.patch("/api/admin/products/:id/stock", async (req, res) => {
      try {
        const { id } = req.params;
        const { stock } = req.body;

        const result = await productsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              stock: parseInt(stock),
              updatedAt: new Date()
            }
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Stock updated successfully" });
      } catch (error) {
        console.error("Error updating stock:", error);
        res.status(500).json({ success: false, message: "Failed to update stock" });
      }
    });

    // Coupon CRUD routes
    app.post("/api/admin/coupons", async (req, res) => {
      try {
        const couponData = {
          ...req.body,
          usedCount: 0,
          createdAt: new Date(),
        };
        await couponsCollection.insertOne(couponData);
        res.json({ success: true, message: "Coupon created successfully" });
      } catch (error) {
        console.error("Error creating coupon:", error);
        res.status(500).json({ success: false, message: "Failed to create coupon" });
      }
    });

    app.put("/api/admin/coupons/:id", async (req, res) => {
      try {
        const { id } = req.params;
        await couponsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: req.body }
        );
        res.json({ success: true, message: "Coupon updated successfully" });
      } catch (error) {
        console.error("Error updating coupon:", error);
        res.status(500).json({ success: false, message: "Failed to update coupon" });
      }
    });

    app.delete("/api/admin/coupons/:id", async (req, res) => {
      try {
        const { id } = req.params;
        await couponsCollection.deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true, message: "Coupon deleted successfully" });
      } catch (error) {
        console.error("Error deleting coupon:", error);
        res.status(500).json({ success: false, message: "Failed to delete coupon" });
      }
    });

    // ============ COMMUNITY POSTS ROUTES ============

    // Get all community posts (public)
    app.get("/api/community", async (req, res) => {
      try {
        const posts = await communityCollection
          .find({})
          .sort({ createdAt: -1 }) // Latest first
          .toArray();

        res.json({ success: true, posts });
      } catch (error) {
        console.error("Error fetching community posts:", error);
        res.status(500).json({ success: false, message: "Failed to load posts" });
      }
    });

    // Admin: Get all community posts
    app.get("/api/admin/community-posts", async (req, res) => {
      try {
        const posts = await communityCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();

        res.json({ success: true, posts });
      } catch (error) {
        console.error("Error fetching community posts:", error);
        res.status(500).json({ success: false, message: "Failed to load posts" });
      }
    });

    // Admin: Create new community post
    app.post("/api/admin/community", async (req, res) => {
      try {
        const { imageURL, title, description } = req.body;

        // Validation
        if (!title || !description) {
          return res.status(400).json({
            success: false,
            message: "Title and description are required"
          });
        }

        const newPost = {
          imageURL: imageURL || "",
          title,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const result = await communityCollection.insertOne(newPost);

        res.status(201).json({
          success: true,
          message: "Post created successfully",
          post: { ...newPost, _id: result.insertedId }
        });
      } catch (error) {
        console.error("Error creating community post:", error);
        res.status(500).json({ success: false, message: "Failed to create post" });
      }
    });

    // Admin: Delete community post
    app.delete("/api/admin/community-posts/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ success: false, message: "Invalid post ID" });
        }

        const result = await communityCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ success: false, message: "Post not found" });
        }

        res.json({ success: true, message: "Post deleted successfully" });
      } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ success: false, message: "Failed to delete post" });
      }
    });

    app.post("/api/admin/ban-user", async (req, res) => {
      try {
        const { userEmail } = req.body;
        await usersCollection.updateOne(
          { userEmail },
          { $set: { accountStatus: "inactive" } }
        );
        res.json({ success: true, message: "User banned successfully" });
      } catch (error) {
        console.error("Error banning user:", error);
        res.status(500).json({ success: false, message: "Failed to ban user" });
      }
    });


    // Start server only in non-serverless environment
    if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    }

  } catch (err) {
    console.log("Error connecting to MongoDB:", err);
    throw err;
  }
}

// Initialize database connection and routes
connectToDatabase().catch(console.error);

// Health check route
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend API is running",
    timestamp: new Date().toISOString()
  });
});

// Export the Express app for Vercel
module.exports = app;
