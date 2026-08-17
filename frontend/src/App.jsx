import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import About from './pages/About';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import RefundPolicy from './pages/RefundPolicy';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';

import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Overview from './pages/admin/Overview';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import Coupons from './pages/admin/Coupons';
import Queries from './pages/admin/Queries';
import Settings from './pages/admin/Settings';

// ✅ Wrapper: redirects to /register if not logged in
function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--accent)' }}>ODDLY</div>
      <div style={{ color: 'var(--text2)', fontSize: 14 }}>Loading...</div>
    </div>
  );
  if (!user) return <Navigate to="/register" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Toaster
              position="top-right"
              toastOptions={{ style: { background: '#1e1e1e', color: '#f0ede8', border: '1px solid #2e2e2e' } }}
            />
            <Routes>
              {/* ── Admin Routes (no Navbar/Footer) ── */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>}>
                <Route index element={<Overview />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Orders />} />
                <Route path="users" element={<Users />} />
                <Route path="coupons" element={<Coupons />} />
                <Route path="queries" element={<Queries />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* ── Auth pages (public, no guard) ── */}
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

              {/* ── Main Layout ── */}
              <Route path="/*" element={
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                  <Navbar />
                  <main style={{ flex: 1 }}>
                    <AnimatedRoutes />
                  </main>
                  <Footer />
                </div>
              } />
            </Routes>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Simple layout wrapper for login/register pages
function PublicLayout({ children }) {
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        {/* Public Store Pages */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/refund-policy" element={<PageTransition><RefundPolicy /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        
        {/* Protected Store Pages */}
        <Route path="/cart" element={<AuthGuard><PageTransition><Cart /></PageTransition></AuthGuard>} />
        <Route path="/checkout" element={<AuthGuard><PageTransition><Checkout /></PageTransition></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><PageTransition><Profile /></PageTransition></AuthGuard>} />
        <Route path="/wishlist" element={<AuthGuard><PageTransition><Wishlist /></PageTransition></AuthGuard>} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
