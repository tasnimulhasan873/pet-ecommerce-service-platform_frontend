# Appointment Booking System Documentation

## Overview

Complete veterinary appointment booking system with Stripe payment integration and auto-generated Google Meet links.

## Features

✅ Doctor listing page with full profiles  
✅ Appointment date, day, and time selection  
✅ Stripe Checkout payment integration  
✅ Auto-generated Google Meet links  
✅ Appointment confirmation with meeting details  
✅ Email confirmation (Meet link displayed on success page)  
✅ Duplicate appointment prevention

## Backend Implementation

### New Collections

- **appointments**: Stores all appointment records with Meet links

### New Endpoints

#### 1. Create Appointment Checkout

**POST** `/appointment/create-checkout`

**Request Body:**

```json
{
  "doctorId": "VET001",
  "doctorName": "Dr. Sarah Williams",
  "doctorFee": 1500,
  "selectedDate": "2024-01-15",
  "selectedTime": "10:00 AM",
  "userId": "firebase-uid",
  "userEmail": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/xxx"
}
```

#### 2. Verify Appointment Payment

**POST** `/appointment/verify-payment`

**Request Body:**

```json
{
  "sessionId": "cs_test_xxx"
}
```

**Response:**

```json
{
  "success": true,
  "appointment": {
    "appointmentId": "APT-1234567890-abc123",
    "userId": "firebase-uid",
    "userEmail": "user@example.com",
    "doctorId": "VET001",
    "doctorName": "Dr. Sarah Williams",
    "appointmentDate": "2024-01-15",
    "appointmentTime": "10:00 AM",
    "meetLink": "https://meet.google.com/abc-defg-hij",
    "feeBDT": 1500,
    "feeUSD": 12.5,
    "status": "confirmed",
    "paymentStatus": "completed"
  }
}
```

#### 3. Get User Appointments

**GET** `/appointments/:userId`

**Response:**

```json
{
  "success": true,
  "appointments": [...]
}
```

#### 4. Get Single Appointment

**GET** `/appointment/:appointmentId`

**Response:**

```json
{
  "success": true,
  "appointment": {...}
}
```

### Google Meet Link Generator

```javascript
function generateGoogleMeetLink() {
  const randomKey = Math.random().toString(36).substring(2, 12);
  const meetId = randomKey.match(/.{1,3}/g).join("-");
  return `https://meet.google.com/${meetId}`;
}
```

**Note:** This generates a mock Meet link format. For production, integrate with Google Calendar API.

## Frontend Implementation

### New Components

#### 1. DoctorDetails.jsx (Updated)

- Added date picker for appointment date
- Integrated Stripe checkout flow
- Validates user authentication
- Redirects to Stripe payment page

**Key Features:**

- Date input with minimum date validation (today)
- Day of week selection
- Time slot selection
- Real-time appointment summary
- Loading state during booking

#### 2. AppointmentSuccess.jsx (New)

- Displays appointment confirmation
- Shows Google Meet link with copy functionality
- Lists all appointment details
- Provides important notes for the user

**Route:** `/appointment-success?session_id=xxx`

### User Flow

1. User browses doctor listings on `/services`
2. Clicks "View Profile" to see `/doctor/:doctorId`
3. Selects appointment date, day, and time slot
4. Clicks "Book Appointment Now"
5. Redirected to Stripe Checkout
6. Completes payment with card
7. Redirected to `/appointment-success?session_id=xxx`
8. Backend verifies payment and generates Meet link
9. Appointment details and Meet link displayed
10. User can join meeting or copy link

## Database Schema

### Appointments Collection

```javascript
{
  appointmentId: "APT-1234567890-abc123",  // Unique ID
  userId: "firebase-uid",                   // Firebase user ID
  userEmail: "user@example.com",           // User email
  doctorId: "VET001",                      // Doctor ID from JSON
  doctorName: "Dr. Sarah Williams",        // Doctor name
  appointmentDate: "2024-01-15",           // Selected date
  appointmentTime: "10:00 AM",             // Selected time
  meetLink: "https://meet.google.com/abc-defg-hij", // Auto-generated
  feeBDT: 1500,                            // Fee in BDT
  feeUSD: 12.5,                            // Fee in USD
  status: "confirmed",                     // Status
  paymentIntentId: "pi_xxx",               // Stripe payment intent
  sessionId: "cs_test_xxx",                // Stripe session
  paymentStatus: "completed",              // Payment status
  createdAt: ISODate(),                    // Creation timestamp
  updatedAt: ISODate()                     // Update timestamp
}
```

### Indexes

```javascript
// Unique index on appointmentId
db.appointments.createIndex(
  { appointmentId: 1 },
  { unique: true, sparse: true }
);

// Index on userId for fast user queries
db.appointments.createIndex({ userId: 1 });

// Index on sessionId for duplicate prevention
db.appointments.createIndex({ sessionId: 1 });
```

## Testing

### Test Flow

1. **Start Backend:** `node index.js`
2. **Start Frontend:** `npm run dev`
3. **Login:** Use Firebase authentication
4. **Navigate:** Go to Services → Select any doctor
5. **Book Appointment:**
   - Select a date (today or future)
   - Select a day from available days
   - Select a time slot
   - Click "Book Appointment Now"
6. **Payment:** Use Stripe test card `4242 4242 4242 4242`
7. **Success:** View appointment details and Meet link

### Test Cards

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- Use any future expiry date, any CVC, any ZIP

## Currency Conversion

- **Display:** All prices shown in BDT (৳)
- **Stripe:** Processes in USD
- **Conversion Rate:** 1 USD = 120 BDT
- **Example:** ৳1500 → $12.50

## Error Handling

### Duplicate Prevention

- **In-memory check:** Session ID tracked during verification
- **Database check:** Query existing appointments before insert
- **Unique index:** MongoDB enforces uniqueness on `appointmentId`
- **Graceful response:** Returns existing appointment instead of error

### Payment Verification

- Validates session ID presence
- Checks payment status from Stripe
- Verifies user authentication
- Handles network errors gracefully

## Environment Variables

### Backend (.env)

```
MONGO_URI=mongodb://localhost:27017/petplatform
STRIPE_SECRET_KEY=sk_test_xxxxx
CLIENT_URL=http://localhost:5173
PORT=3000
```

### Frontend (.env)

```
VITE_PAYMENT_KEY=pk_test_xxxxx
```

## Future Enhancements

- [ ] Real Google Calendar API integration
- [ ] Email notifications with Meet link
- [ ] SMS reminders
- [ ] Appointment rescheduling
- [ ] Cancellation with refund
- [ ] Doctor availability calendar
- [ ] Video call directly in app (not redirect to Meet)
- [ ] Appointment history page
- [ ] Rating and review system

## Security Notes

- ✅ User authentication required
- ✅ Payment processed securely via Stripe
- ✅ Duplicate appointments prevented
- ✅ Session validation on backend
- ⚠️ Meet links are mock URLs (not real Google Calendar events)

## API Response Codes

- **200:** Success
- **400:** Bad request (missing data, invalid payment)
- **404:** Not found (doctor, appointment)
- **500:** Server error

## Dependencies

### Backend

- express
- cors
- dotenv
- mongodb
- stripe

### Frontend

- react
- react-router-dom
- axios
- @fortawesome/react-fontawesome
- @fortawesome/free-solid-svg-icons

---

**Last Updated:** 2024
**Version:** 1.0.0
