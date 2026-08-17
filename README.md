<div align="center">
  <img src="https://img.icons8.com/nolan/96/1A6DFF/C822FF/online-store.png" alt="Oddly Logo" />
  <h1>🛍️ Oddly</h1>
  <p><strong>A modern, high-performance e-commerce platform for premium apparel.</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#installation">Installation</a> •
    <a href="#admin-dashboard">Admin Dashboard</a> •
    <a href="#api-endpoints">API Reference</a>
  </p>
</div>

---

## 🌟 About The Project

**Oddly** is a sleek, fully responsive e-commerce web application built on the MERN stack (MongoDB, Express, React, Node.js). It delivers a seamless shopping experience for users with intuitive cart management, dynamic promo codes, and real-time order tracking. 

For store owners, Oddly provides a comprehensive **Admin Dashboard** to effortlessly manage products, track revenue analytics, fulfill orders, process customer queries, and generate custom discount coupons.

---

## ✨ Features

### 🛒 For Customers
- **Modern UI/UX**: Glassmorphism design elements, responsive grid layouts, and smooth animations.
- **User Authentication**: Secure JWT-based login and registration.
- **Product Catalog**: Browse categories, view product details, and dynamic image galleries.
- **Smart Cart & Wishlist**: Persistent cart state, save items for later, and automatic total calculations.
- **Checkout & Coupons**: Apply dynamic promo codes, support for online payment uploads (UPI screenshots), or Cash on Delivery.
- **Order Tracking**: View order history and real-time status updates from the user profile.

### 🛡️ For Administrators
- **Analytics Dashboard**: Real-time overview of total revenue, recent orders, and product counts.
- **Inventory Management**: Full CRUD operations for products with multi-image uploads.
- **Order Fulfillment**: Track and update order statuses (Processing, Shipped, Delivered) and payment verification.
- **Coupon Engine**: Create, manage, and expire custom promotional codes.
- **Customer Support**: Built-in query management system to read, reply, and resolve contact form submissions.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- React Router DOM
- Axios
- Vanilla CSS (Custom Design System)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT (JSON Web Tokens)
- Multer (Image Uploads)

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/manosekar-m/Oddly.git
cd Oddly
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 👑 Admin Access

To access the admin dashboard, you can create a new account and manually change the `role` field to `admin` directly in your MongoDB database.

Navigate to `http://localhost:5173/admin` to access the control panel.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/manosekar-m">manosekar-m</a></p>
</div>
