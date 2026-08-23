import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from '../api/axios';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiHeart } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [marqueeMessage, setMarqueeMessage] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/settings');
        if (res.data && res.data.marqueeMessage) {
          setMarqueeMessage(res.data.marqueeMessage);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  return (
    <>
      {marqueeMessage && (
        <div className="top-marquee-bar">
          <div className="marquee-content-container">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="marquee-item">{marqueeMessage} &nbsp;&nbsp; • &nbsp;&nbsp; </span>
            ))}
          </div>
          <div className="marquee-content-container" aria-hidden="true">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={`dup-${i}`} className="marquee-item">{marqueeMessage} &nbsp;&nbsp; • &nbsp;&nbsp; </span>
            ))}
          </div>
        </div>
      )}
      <nav className={`premium-nav ${scrolled ? 'scrolled' : ''}`} style={{ top: marqueeMessage ? '30px' : '0' }}>
        <div className="nav-wrapper">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <span className="logo-text">ODDLY</span>
          </Link>

          {/* Desktop Links */}
          <div className="desktop-nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Shop</Link>
            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
          </div>

          {/* Right Section */}
          <div className="nav-actions">
            {user ? (
              <div className="user-actions">
                {user.role === 'admin' && (
                  <Link to="/admin" className="admin-pill">Admin</Link>
                )}
                <Link to="/wishlist" className="icon-btn">
                  <FiHeart size={18} />
                </Link>
                <Link to="/profile" className="icon-btn">
                  <FiUser size={18} />
                </Link>
                <button onClick={handleLogout} className="icon-btn logout">
                  <FiLogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="auth-actions">
                <Link to="/login" className="login-link">Login</Link>
                <Link to="/register" className="signup-pill">Sign Up</Link>
              </div>
            )}
            
            <Link to="/cart" className="cart-btn">
              CART ({cartCount.toString().padStart(2, '0')})
            </Link>
            
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-inner">
            <Link to="/" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            {user ? (
              <>
                <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                {user.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} style={{color: 'var(--accent)'}}>Admin Panel</Link>}
                <button onClick={handleLogout} className="mobile-logout">
                  <FiLogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <div className="mobile-auth-actions">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="login-link">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="signup-pill">Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <style>{`
        /* Floating Premium Nav */
        .top-marquee-bar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 30px;
          background: var(--accent);
          color: #000;
          display: flex;
          align-items: center;
          overflow: hidden;
          z-index: 1002;
          font-size: 11px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 2px;
          white-space: nowrap;
        }
        .marquee-content-container {
          display: flex;
          animation: marquee-slide 30s linear infinite;
        }
        .marquee-item {
          display: inline-block;
        }
        .top-marquee-bar:hover .marquee-content-container {
          animation-play-state: paused;
        }
        @keyframes marquee-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        .premium-nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0 40px;
          transition: all 0.3s ease;
        }
        .premium-nav.scrolled {
          background: #000;
          border-bottom: 1px solid #333;
        }

        .nav-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }

        /* Logo */
        .nav-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
        }
        .logo-text {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 400;
          color: #fff;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }
        .nav-logo:hover .logo-text {
          color: var(--accent);
        }

        /* Desktop Nav */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-link {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text2);
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: color 0.3s ease;
        }
        .nav-link:hover {
          color: #fff;
        }
        .nav-link.active {
          color: #fff;
        }

        /* Actions */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-actions, .auth-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: var(--text);
          background: transparent;
          border: 1px solid transparent;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        .icon-btn.logout:hover {
          color: var(--danger);
          border-color: rgba(224, 82, 82, 0.3);
          background: rgba(224, 82, 82, 0.1);
        }

        .cart-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: color 0.3s ease;
        }
        .cart-btn:hover {
          color: var(--text2);
        }

        .admin-pill {
          font-size: 11px;
          font-weight: 700;
          color: var(--accent);
          border: 1px solid var(--accent);
          padding: 6px 14px;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
        }
        .admin-pill:hover {
          background: var(--accent);
          color: #000;
        }

        .login-link {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          padding: 8px 16px;
          transition: color 0.3s;
        }
        .login-link:hover {
          color: var(--accent);
        }
        .signup-pill {
          font-size: 13px;
          font-weight: 600;
          background: var(--accent);
          color: #000;
          padding: 10px 20px;
          border-radius: 100px;
          transition: all 0.3s;
        }
        .signup-pill:hover {
          background: #fff;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255,255,255,0.1);
        }

        /* Hamburger */
        .hamburger {
          display: none;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 8px;
          z-index: 1001;
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: rgba(10, 10, 10, 0.98);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s ease;
          z-index: 999;
        }
        .mobile-menu.open {
          opacity: 1;
          visibility: visible;
        }
        .mobile-menu-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          transform: translateY(20px);
          transition: all 0.4s ease;
        }
        .mobile-menu.open .mobile-menu-inner {
          transform: translateY(0);
        }
        .mobile-menu-inner a {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          transition: color 0.3s;
        }
        .mobile-menu-inner a:hover {
          color: var(--accent);
        }
        .mobile-logout {
          background: none;
          border: none;
          color: var(--danger);
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
        }

        @media(max-width: 768px) {
          .desktop-nav, .user-actions, .auth-actions { display: none; }
          .hamburger { display: block; }
          .premium-nav { padding: 0 16px; }
        }
      `}</style>
    </>
  );
}
