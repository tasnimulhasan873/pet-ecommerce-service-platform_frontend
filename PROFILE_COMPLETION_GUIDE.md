# Profile Completion Checker - Implementation Guide

## Backend Implementation

### 1. Function: `checkUserProfileCompletion(identifier)`

**Location:** `index.js` (lines 348-445)

**Purpose:** Comprehensive profile validation with detailed field checking

**Parameters:**

- `identifier` (string): MongoDB ObjectId OR user email

**Returns:**

```javascript
{
  isComplete: boolean,
  missing: string[],
  message: string,
  user: {
    userName: string,
    userEmail: string,
    phone: string,
    address: string,
    city: string,
    zip: string
  }
}
```

**Logic Flow:**

```
1. Find user by ObjectId or email
2. Check if user exists → if not, return { isComplete: false }
3. PRIMARY CHECK: if (user.isComplete === false)
   → return { isComplete: false, missing: ["all"] }
4. SECONDARY CHECK: Validate all required fields
   → Check: userName, userEmail, phone, address, city, zip
   → If any field is empty, add to missing array
5. Return result with detailed missing fields
```

**Example Usage:**

```javascript
const result = await checkUserProfileCompletion("user@example.com");
if (!result.isComplete) {
  console.log("Missing fields:", result.missing);
}
```

---

### 2. API Endpoint: GET `/api/check-profile/:identifier`

**Location:** `index.js` (lines 498-532)

**Method:** GET

**Parameters:**

- `identifier` (URL param): MongoDB ObjectId or email

**Response Examples:**

**✅ Complete Profile:**

```json
{
  "success": true,
  "isComplete": true,
  "missing": [],
  "message": "Profile is complete",
  "user": {
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "zip": "10001"
  }
}
```

**❌ Incomplete Profile (isComplete = false):**

```json
{
  "success": true,
  "isComplete": false,
  "missing": ["all"],
  "message": "Profile not completed. Please fill all required fields in Account Details.",
  "user": {
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "phone": "",
    "address": "",
    "city": "",
    "zip": ""
  }
}
```

**❌ Missing Specific Fields:**

```json
{
  "success": true,
  "isComplete": false,
  "missing": ["phone", "city", "zip"],
  "message": "Missing required fields: phone, city, zip",
  "user": {
    /* partial user data */
  }
}
```

---

### 3. API Endpoint: POST `/api/check-profile`

**Location:** `index.js` (lines 539-568)

**Method:** POST

**Request Body:**

```json
{
  "email": "user@example.com"
}
// OR
{
  "userId": "507f1f77bcf86cd799439011"
}
```

**Response:** Same as GET endpoint

---

## Frontend Implementation

### React Hook Example

```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const useProfileCompletion = () => {
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  /**
   * Check if user profile is complete before proceeding
   * @param {string} identifier - User email or MongoDB ObjectId
   * @returns {Promise<boolean>} - true if complete, false if redirected
   */
  const checkProfileCompletion = async (identifier) => {
    try {
      setChecking(true);

      const response = await axios.get(
        `http://localhost:3000/api/check-profile/${identifier}`
      );

      const { isComplete, missing, message, user } = response.data;

      if (!isComplete) {
        // Profile is incomplete - show message and redirect
        const missingFieldsText = missing.includes("all")
          ? "all required fields"
          : missing.join(", ");

        alert(
          `⚠️ Profile Incomplete!\n\n` +
            `You need to complete: ${missingFieldsText}\n\n` +
            `Redirecting to Account Details page...`
        );

        // Redirect to account details page
        navigate("/account-details", {
          state: {
            from: window.location.pathname,
            missingFields: missing,
            message: message,
          },
        });

        return false;
      }

      // Profile is complete - allow continuation
      console.log("✅ Profile is complete:", user);
      return true;
    } catch (error) {
      console.error("Error checking profile:", error);
      alert("Error checking profile completion. Please try again.");
      return false;
    } finally {
      setChecking(false);
    }
  };

  return { checkProfileCompletion, checking };
};
```

---

### Usage in Service Booking Component

```javascript
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import { useProfileCompletion } from "../hooks/useProfileCompletion";

const ServiceBooking = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { checkProfileCompletion, checking } = useProfileCompletion();

  /**
   * Handle "Continue to Payment" button click
   * Checks profile completion before proceeding
   */
  const handleContinueToPayment = async () => {
    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    // Check if profile is complete
    const isComplete = await checkProfileCompletion(user.email);

    if (!isComplete) {
      // User was redirected to account details
      return;
    }

    // Profile is complete - proceed to payment
    navigate("/payment", {
      state: {
        serviceId: selectedService,
        amount: totalAmount,
      },
    });
  };

  return (
    <div>
      <button
        onClick={handleContinueToPayment}
        disabled={checking}
        className="btn-primary"
      >
        {checking ? "Checking Profile..." : "Continue to Payment"}
      </button>
    </div>
  );
};

export default ServiceBooking;
```

---

### Alternative: Inline Implementation

```javascript
const handleBookAppointment = async () => {
  if (!user) {
    alert("Please login to book an appointment");
    navigate("/login");
    return;
  }

  try {
    setIsProcessing(true);

    // Step 1: Check profile completion
    const profileCheck = await axios.get(
      `http://localhost:3000/api/check-profile/${user.email}`
    );

    if (!profileCheck.data.isComplete) {
      // Profile incomplete - redirect
      alert(
        `⚠️ Please complete your profile first!\n\n` +
          `Missing: ${profileCheck.data.missing.join(", ")}`
      );
      navigate("/account-details");
      return;
    }

    // Step 2: Profile is complete - proceed with booking
    const response = await axios.post(
      "http://localhost:3000/appointment/create-payment-intent",
      {
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorFee: doctor.meeting_fee_bdt,
        selectedDate: selectedDate,
        selectedTime: selectedTime,
        userId: user.uid,
        userEmail: user.email,
      }
    );

    if (response.data.success) {
      setClientSecret(response.data.clientSecret);
      setShowPayment(true);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error processing request. Please try again.");
  } finally {
    setIsProcessing(false);
  }
};
```

---

### Usage in Cart Component

```javascript
const handleCheckout = async () => {
  if (!user) {
    navigate("/login", { state: { from: "/cart" } });
    return;
  }

  try {
    // Check profile completion before checkout
    const response = await axios.post(
      "http://localhost:3000/api/check-profile",
      { email: user.email }
    );

    if (!response.data.isComplete) {
      const missingFields = response.data.missing.join(", ");

      alert(
        `⚠️ Please complete your profile!\n\n` +
          `Required fields: ${missingFields}\n\n` +
          `You'll be redirected to Account Details.`
      );

      navigate("/account-details", {
        state: {
          returnTo: "/cart",
          requiredAction: "Complete profile to checkout",
        },
      });
      return;
    }

    // Profile complete - proceed to checkout
    navigate("/checkout");
  } catch (error) {
    console.error("Error checking profile:", error);
    alert("Error validating profile. Please try again.");
  }
};
```

---

## Integration Checklist

### Backend ✅

- [x] `checkUserProfileCompletion()` function created
- [x] GET `/api/check-profile/:identifier` endpoint created
- [x] POST `/api/check-profile` endpoint created
- [x] Validates `isComplete` field first
- [x] Secondary validation for all required fields
- [x] Returns detailed missing fields array

### Frontend ✅

- [ ] Create `useProfileCompletion` hook (optional)
- [ ] Update `DoctorDetails.jsx` booking handler
- [ ] Update `CartPage.jsx` checkout handler
- [ ] Update any other payment/booking flows
- [ ] Add profile completion check before Stripe payment
- [ ] Handle redirect to `/account-details`
- [ ] Display appropriate error messages

---

## Testing Scenarios

### Scenario 1: New User (isComplete = false)

```
1. Register new user → MongoDB: isComplete = false
2. Try to book service → Profile check fails
3. Alert shown: "Profile not completed. Please fill all required fields"
4. Redirect to /account-details
5. Fill all fields → isComplete = true
6. Try booking again → Success ✅
```

### Scenario 2: Social Login User

```
1. Login with Google → MongoDB: isComplete = false
2. Try to add to cart → Profile check fails
3. Redirect to /account-details
4. Complete profile → isComplete = true
5. Add to cart → Success ✅
```

### Scenario 3: Existing User with Missing Fields

```
1. User has isComplete = true BUT phone field is empty
2. Profile check → Secondary validation catches it
3. Response: { isComplete: false, missing: ["phone"] }
4. User redirected to complete missing fields
```

---

## API Testing (cURL Examples)

**Check by Email:**

```bash
curl -X GET http://localhost:3000/api/check-profile/user@example.com
```

**Check by ObjectId:**

```bash
curl -X GET http://localhost:3000/api/check-profile/507f1f77bcf86cd799439011
```

**Check via POST:**

```bash
curl -X POST http://localhost:3000/api/check-profile \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

---

## Response Status Codes

| Status | Meaning                                  |
| ------ | ---------------------------------------- |
| 200    | Success (check response.data.isComplete) |
| 400    | Bad request (missing identifier)         |
| 500    | Server error                             |

---

## Summary

✅ **Backend:** Two API endpoints ready (`GET` and `POST`)
✅ **Function:** `checkUserProfileCompletion()` validates both `isComplete` flag and actual fields
✅ **Frontend:** Example React handlers for booking, cart, and payment flows
✅ **Validation:** Two-level check (isComplete flag + field validation)
✅ **User Flow:** Automatic redirect to `/account-details` if incomplete

**Next Steps:**

1. Restart backend server
2. Implement frontend handlers in your components
3. Test with both new and existing users
4. Verify redirect behavior
