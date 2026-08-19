import { Link } from 'react-router-dom';
import { FiArrowRight, FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'instant' });
  return (
    <footer className="premium-footer">
      <div className="footer-glow"></div>
      
      <div className="container footer-content">
        {/* Newsletter Section */}
        <div className="newsletter-section">
          <h3 className="footer-heading">Join the Club</h3>
          <p className="footer-subtext">Subscribe for exclusive drops, early access, and 10% off your first order.</p>
          <div className="newsletter-input-wrapper">
            <input type="email" placeholder="Enter your email" className="newsletter-input" />
            <button className="newsletter-btn">
              <FiArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-col">
            <h4 className="footer-col-title">About</h4>
            <p className="footer-subtext" style={{ maxWidth: 280 }}>
              ODDLY crafts premium, unapologetic clothing for those who stand out. 
              Designed with purpose, worn with confidence.
            </p>
            <div className="social-links">
              <a href="https://www.instagram.com/oddly_wear/" target="_blank" rel="noopener noreferrer" className="social-icon"><FiInstagram size={20} /></a>
              <a href="#" className="social-icon"><FiTwitter size={20} /></a>
              <a href="#" className="social-icon"><FiFacebook size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Shop</h4>
            <Link to="/" className="footer-link" onClick={scrollTop}>All Products</Link>
            <Link to="/" className="footer-link" onClick={scrollTop}>New Arrivals</Link>
            <Link to="/about" className="footer-link" onClick={scrollTop}>Our Story</Link>
            <Link to="/cart" className="footer-link" onClick={scrollTop}>Cart</Link>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4 className="footer-col-title">Support</h4>
            <Link to="/contact" className="footer-link" onClick={scrollTop}>Contact Us</Link>
            <Link to="/refund-policy" className="footer-link" onClick={scrollTop}>Refund Policy</Link>
            <a href="mailto:oddlymenswear@gmail.com" className="footer-link">oddlymenswear@gmail.com</a>
            <a href="tel:+916379833844" className="footer-link">+91 63798 33844</a>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © {new Date().getFullYear()} ODDLY STUDIO. All rights reserved.
          </div>
          <div className="footer-legal">
            <Link to="/refund-policy" onClick={scrollTop}>Terms of Service</Link>
            <Link to="/refund-policy" onClick={scrollTop}>Privacy Policy</Link>
          </div>
        </div>
      </div>

      {/* Massive Watermark */}
      <div className="footer-watermark">
        ODDLY
      </div>

      <style>{`
        .premium-footer {
          position: relative;
          background: linear-gradient(180deg, var(--bg) 0%, #050505 100%);
          padding: 80px 0 0 0;
          margin-top: auto;
          overflow: hidden;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .footer-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 300px;
          background: radial-gradient(ellipse at top, rgba(232, 201, 126, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .footer-content {
          position: relative;
          z-index: 2;
        }

        /* Newsletter */
        .newsletter-section {
          max-width: 600px;
          margin: 0 auto 80px;
          text-align: center;
        }
        .footer-heading {
          font-family: var(--font-display);
          font-size: 36px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
        }
        .footer-subtext {
          color: var(--text2);
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .newsletter-input-wrapper {
          display: flex;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          padding: 6px;
          transition: all 0.3s ease;
        }
        .newsletter-input-wrapper:focus-within {
          border-color: var(--accent);
          background: rgba(255,255,255,0.05);
          box-shadow: 0 0 20px rgba(232, 201, 126, 0.1);
        }
        .newsletter-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          padding: 12px 20px;
          font-family: var(--font-body);
          font-size: 15px;
          outline: none;
        }
        .newsletter-btn {
          background: var(--accent);
          color: #000;
          border: none;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .newsletter-btn:hover {
          transform: scale(1.05);
          background: #fff;
        }

        /* Grid */
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 60px;
        }
        .footer-col-title {
          font-family: var(--font-display);
          font-size: 18px;
          color: #fff;
          margin-bottom: 24px;
          letter-spacing: 1px;
        }
        .footer-link {
          display: block;
          color: var(--text2);
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 12px;
          transition: all 0.3s ease;
          width: max-content;
        }
        .footer-link:hover {
          color: var(--accent);
          transform: translateX(4px);
        }

        .social-links {
          display: flex;
          gap: 16px;
          margin-top: 24px;
        }
        .social-icon {
          color: var(--text2);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .social-icon:hover {
          color: #000;
          background: var(--accent);
          border-color: var(--accent);
          transform: translateY(-4px);
        }

        /* Bottom */
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 0;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .footer-copyright {
          color: var(--text2);
          font-size: 13px;
        }
        .footer-legal {
          display: flex;
          gap: 24px;
        }
        .footer-legal a {
          color: var(--text2);
          text-decoration: none;
          font-size: 13px;
          transition: color 0.3s;
        }
        .footer-legal a:hover {
          color: var(--accent);
        }

        /* Watermark */
        .footer-watermark {
          font-family: var(--font-display);
          font-size: 22vw;
          font-weight: 800;
          line-height: 0.75;
          color: rgba(255,255,255,0.02);
          text-align: center;
          margin-bottom: -2vw;
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          overflow: hidden;
        }

        @media(max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .footer-subtext {
            margin-left: auto;
            margin-right: auto;
          }
          .footer-link {
            margin-left: auto;
            margin-right: auto;
          }
          .social-links {
            justify-content: center;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}