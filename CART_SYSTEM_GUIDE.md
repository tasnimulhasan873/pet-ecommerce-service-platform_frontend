# 🛒 Complete Cart System - Setup & Testing Guide

## ✅ What Has Been Created

### **Frontend Components:**

1. ✅ `CartContext` - Global cart state management
2. ✅ `CartProvider` - Cart context provider with all cart operations
3. ✅ `CartPage.jsx` - Main cart view page
4. ✅ `CartItem.jsx` - Individual cart item component
5. ✅ `CouponBox.jsx` - Coupon input and validation component
6. ✅ `OrderSummary.jsx` - Order summary with totals

### **Backend API Routes:**

1. ✅ `GET /cart/:userId` - Get user's cart
2. ✅ `POST /cart/add` - Add item to cart
3. ✅ `PATCH /cart/update/:itemId` - Update item quantity
4. ✅ `DELETE /cart/remove/:itemId` - Remove item from cart
5. ✅ `DELETE /cart/clear` - Clear entire cart
6. ✅ `POST /coupon/apply` - Apply coupon code
7. ✅ `GET /coupons` - Get all active coupons
8. ✅ `POST /coupons/seed` - Create sample coupons

---

## 🚀 Setup Instructions

### **1. Start Backend Server**

```bash
cd f:\web-11\IDP_Project\ClientSide\puchito
node index.js
```

### **2. Seed Sample Coupons** (One-time setup)

Open your browser or Postman and make a POST request:

```
POST http://localhost:3000/coupons/seed
```

This will create 3 sample coupons:

- **WELCOME10** - 10% off (no minimum)
- **SAVE20** - 20% off (min $50)
- **FLAT50** - $50 off (min $100)

### **3. Start Frontend**

```bash
npm run dev
```

---

## 🧪 Testing the Cart System

### **Step 1: Add Products to Cart**

1. Navigate to Products page
2. Click "Add to Cart" on any product
3. Check navbar - cart count should update

### **Step 2: View Cart**

1. Click cart icon in navbar
2. You should see all added items

### **Step 3: Update Quantity**

1. Use +/- buttons or input field
2. Subtotal should update automatically

### **Step 4: Apply Coupon**

1. Enter coupon code: `WELCOME10`
2. Click "Apply"
3. Discount should appear in Order Summary

### **Step 5: Remove Items**

1. Click trash icon on any item
2. Confirm deletion
3. Cart should update

---

## 📊 Order Summary Calculations

- **Subtotal**: Sum of all items (price × quantity)
- **Shipping**: Flat $60 (or $0 if cart is empty)
- **Tax**: 5% of (Subtotal - Discount)
- **Discount**: Based on coupon type
  - Percentage: `(Subtotal × Coupon Value) / 100`
  - Fixed: `Min(Coupon Value, Subtotal)`
- **Total**: `Subtotal - Discount + Tax + Shipping`

---

## 🎯 Available Coupons for Testing

| Code      | Type       | Value | Min Purchase | Description                  |
| --------- | ---------- | ----- | ------------ | ---------------------------- |
| WELCOME10 | Percentage | 10%   | $0           | 10% off on your first order  |
| SAVE20    | Percentage | 20%   | $50          | 20% off on orders above $50  |
| FLAT50    | Fixed      | $50   | $100         | $50 off on orders above $100 |

---

## 🔧 Backend API Examples

### **Add to Cart**

```json
POST http://localhost:3000/cart/add
Content-Type: application/json

{
  "userId": "user@example.com",
  "productId": 1,
  "productName": "Royal Canin Puppy Dry Food",
  "productImage": "https://example.com/image.jpg",
  "price": 25.99,
  "quantity": 2
}
```

### **Update Quantity**

```json
PATCH http://localhost:3000/cart/update/ITEM_ID
Content-Type: application/json

{
  "userId": "user@example.com",
  "quantity": 3
}
```

### **Apply Coupon**

```json
POST http://localhost:3000/coupon/apply
Content-Type: application/json

{
  "userId": "user@example.com",
  "couponCode": "WELCOME10",
  "subtotal": 100
}
```

---

## ✨ Features Implemented

### **Cart Features:**

- ✅ Add products to cart
- ✅ Update item quantity (+ / - buttons or input)
- ✅ Remove individual items
- ✅ Clear entire cart
- ✅ Real-time cart count in navbar
- ✅ Persistent cart (saved in MongoDB)
- ✅ Beautiful, responsive UI

### **Coupon Features:**

- ✅ Apply coupon codes
- ✅ Percentage discounts
- ✅ Fixed amount discounts
- ✅ Minimum purchase validation
- ✅ Coupon usage limits
- ✅ Expiry date support
- ✅ Visual feedback on success/error

### **Order Summary:**

- ✅ Dynamic subtotal calculation
- ✅ Shipping cost (flat $60)
- ✅ Tax calculation (5%)
- ✅ Discount display
- ✅ Total amount
- ✅ Proceed to checkout button

---

## 🎨 UI/UX Highlights

- **Modern Design**: Glassmorphism effects, gradients, animations
- **Responsive**: Works on all screen sizes
- **Intuitive**: Clear buttons, icons, and feedback
- **Fast**: Optimized API calls and state management
- **Accessible**: Proper labels, ARIA attributes, keyboard navigation

---

## 🗂️ MongoDB Collections

### **carts**

```json
{
  "userId": "user@example.com",
  "items": [
    {
      "_id": "ObjectId",
      "productId": 1,
      "productName": "Product Name",
      "productImage": "image-url",
      "price": 25.99,
      "quantity": 2,
      "addedAt": "2025-12-07T..."
    }
  ],
  "createdAt": "2025-12-07T...",
  "updatedAt": "2025-12-07T..."
}
```

### **coupons**

```json
{
  "code": "WELCOME10",
  "type": "percentage",
  "value": 10,
  "description": "10% off on your first order",
  "minPurchase": 0,
  "isActive": true,
  "usageLimit": 100,
  "usedCount": 0,
  "expiryDate": null,
  "createdAt": "2025-12-07T..."
}
```

---

## 🚨 Troubleshooting

### **Cart not updating?**

- Check if backend is running on port 3000
- Verify MongoDB connection
- Check browser console for errors

### **Coupon not applying?**

- Ensure coupons are seeded (run `/coupons/seed`)
- Check minimum purchase requirement
- Verify coupon code is correct (case-sensitive)

### **Cart count showing 0?**

- Make sure you're logged in
- Check CartContext is properly wrapped in main.jsx
- Verify backend API is responding

---

## 📝 Next Steps

- [ ] Implement checkout page
- [ ] Add payment integration
- [ ] Order history page
- [ ] Email notifications
- [ ] Wishlist functionality
- [ ] Product reviews and ratings

---

## 🎉 Success!

Your complete cart system is now ready! All components, backend routes, and integrations are in place. Test the features and enjoy your fully functional e-commerce cart! 🚀
