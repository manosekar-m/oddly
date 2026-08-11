import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import { FiSearch, FiChevronDown } from 'react-icons/fi';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    axios.get('/products')
      .then(({ data }) => setProducts(data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filtered = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => category === 'All' || p.category === category)
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.discountedPrice - b.discountedPrice;
      if (sortBy === 'price-high') return b.discountedPrice - a.discountedPrice;
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const newArrivals = products.filter(p => p.isNewArrival);

  return (
    <div className="home-container">
      {/* Full Page Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="page-video-bg"
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-sparkles-of-golden-light-falling-in-the-dark-44220-large.mp4" type="video/mp4" />
      </video>
      <div className="page-video-overlay"></div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="container hero-content">
          <p className="hero-subtitle animate-slide-up">Premium Quality</p>
          <h1 className="hero-title animate-slide-up delay-1">
            Wear Your<br />
            <span className="hero-title-accent">
              Story.
              <span className="hero-title-glow">Story.</span>
            </span>
          </h1>
          <p className="hero-description animate-slide-up delay-2">
            Discover our exclusive collection of handpicked apparel crafted from the finest, ultra-soft fabrics. Designed for those who appreciate true elegance in every thread.
          </p>
          <div className="animate-slide-up delay-3">
            <button 
              className="btn-primary hero-btn" 
              onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Collection
            </button>
          </div>
        </div>
      </div>

      <div className="container page">
        {/* New Arrivals Section */}
        {newArrivals.length > 0 && (
          <section className="section-block fade-in">
            <div className="section-header">
              <h2 className="page-title" style={{ marginBottom: 0 }}>New Arrivals</h2>
              <span className="badge badge-gold pulse-badge">Fresh Drop</span>
            </div>
            
            <div className="marquee-container">
              <div className="marquee-track">
                {/* Duplicating multiple times to ensure the marquee fills large screens and loops seamlessly */
                 [...newArrivals, ...newArrivals, ...newArrivals, ...newArrivals, ...newArrivals, ...newArrivals, ...newArrivals, ...newArrivals].map((p, i) => (
                  <div key={`${p._id}-${i}`} className="marquee-item zoom-on-hover">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Products Section */}
        <section id="shop" className="section-block fade-in delay-1">
          <div className="shop-header">
            <h2 className="page-title" style={{ marginBottom: 0 }}>All Products</h2>
            
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-wrapper">
                <FiSearch className="search-icon" />
                <input 
                  placeholder="Search premium apparel..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  className="search-input"
                />
              </div>

              <div className="custom-select-wrapper" ref={sortRef} onClick={() => setSortOpen(!sortOpen)}>
                <div className={`premium-select ${sortOpen ? 'open' : ''}`}>
                  {sortOptions.find(opt => opt.value === sortBy)?.label || 'Newest First'}
                </div>
                <FiChevronDown className={`select-icon ${sortOpen ? 'open' : ''}`} />
                
                {sortOpen && (
                  <div className="custom-options-menu">
                    {sortOptions.map(opt => (
                      <div 
                        key={opt.value} 
                        className={`custom-option ${sortBy === opt.value ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSortBy(opt.value);
                          setSortOpen(false);
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 32, overflowX: 'auto', paddingBottom: 8 }}>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                style={{ 
                  padding: '8px 20px', 
                  borderRadius: 30, 
                  background: category === cat ? 'var(--accent)' : 'rgba(255,255,255,0.03)', 
                  color: category === cat ? '#000' : 'var(--text2)', 
                  border: '1px solid',
                  borderColor: category === cat ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {loading ? (
            <div className="product-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-body">
                    <div className="skeleton-title" />
                    <div className="skeleton-price" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">🛍️</p>
              <p className="empty-text">No products match your search</p>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map(p => (
                <div key={p._id} className="zoom-on-hover">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        /* Hero Section */
        .hero-section {
          position: relative;
          min-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .page-video-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          z-index: -2;
          opacity: 0.9;
          pointer-events: none;
        }

        .page-video-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(180deg, rgba(14,14,14,0.3) 0%, rgba(14,14,14,0.7) 40%, rgba(14,14,14,0.95) 100%);
          z-index: -1;
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 3;
          padding: 80px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-subtitle {
          color: var(--accent);
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 5px;
          text-transform: uppercase;
          margin-bottom: 24px;
          text-shadow: 0 0 10px rgba(232, 201, 126, 0.3);
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(48px, 10vw, 100px);
          font-weight: 700;
          line-height: 1.05;
          margin-bottom: 30px;
          color: #fff;
          text-shadow: 0 10px 30px rgba(0,0,0,0.8);
        }

        .hero-title-accent {
          color: var(--accent);
          position: relative;
          display: inline-block;
        }

        .hero-title-glow {
          position: absolute;
          top: 0;
          left: 0;
          color: var(--accent);
          filter: blur(20px);
          opacity: 0.6;
          animation: pulseGlow 3s infinite alternate;
          pointer-events: none;
        }

        @keyframes pulseGlow {
          0% { filter: blur(15px); opacity: 0.5; transform: scale(0.95); }
          100% { filter: blur(25px); opacity: 0.9; transform: scale(1.05); }
        }

        .hero-description {
          color: #f0ede8;
          font-size: 18px;
          max-width: 600px;
          margin: 0 auto 40px;
          line-height: 1.7;
          opacity: 0.9;
          text-shadow: 0 2px 5px rgba(0,0,0,0.8);
        }

        .hero-btn {
          padding: 16px 48px;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          box-shadow: 0 10px 30px rgba(232, 201, 126, 0.3);
          transition: all 0.3s ease;
          border-radius: 30px;
          position: relative;
          overflow: hidden;
        }

        .hero-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-25deg);
          animation: shine 5s infinite;
        }

        @keyframes shine {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }

        .hero-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 15px 40px rgba(232, 201, 126, 0.5);
        }

        /* Layout & Spacing */
        .section-block {
          margin-bottom: 80px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .shop-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .search-wrapper {
          position: relative;
          min-width: 320px;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          color: var(--text2);
          pointer-events: none;
          transition: color 0.3s ease;
        }

        .search-wrapper:focus-within .search-icon {
          color: var(--accent);
        }

        .search-input {
          width: 100%;
          padding: 16px 20px 16px 52px;
          background: rgba(22, 22, 22, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          color: #fff;
          font-size: 14px;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .search-input:focus {
          background: rgba(26, 26, 26, 0.8);
          border-color: rgba(232, 201, 126, 0.4);
          box-shadow: 0 0 0 4px rgba(232, 201, 126, 0.1), 0 10px 30px rgba(0,0,0,0.3);
          outline: none;
        }

        .custom-select-wrapper {
          position: relative;
          min-width: 180px;
          user-select: none;
        }

        .premium-select {
          width: 100%;
          background: rgba(22, 22, 22, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          padding: 16px 44px 16px 24px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .premium-select:hover, .premium-select.open {
          background: rgba(26, 26, 26, 0.8);
          border-color: rgba(232, 201, 126, 0.3);
        }

        .premium-select.open {
          box-shadow: 0 0 0 4px rgba(232, 201, 126, 0.1);
        }

        .select-icon {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text2);
          pointer-events: none;
          font-size: 18px;
          transition: transform 0.3s ease;
        }
        
        .select-icon.open {
          transform: translateY(-50%) rotate(180deg);
          color: var(--accent);
        }
        
        .custom-options-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 100%;
          background: rgba(22, 22, 22, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 8px;
          z-index: 100;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
          animation: slideDown 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          transform-origin: top;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: scaleY(0.95); }
          to { opacity: 1; transform: scaleY(1); }
        }

        .custom-option {
          padding: 12px 16px;
          color: var(--text2);
          font-size: 14px;
          font-weight: 500;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .custom-option:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }

        .custom-option.active {
          background: rgba(232, 201, 126, 0.1);
          color: var(--accent);
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 30px;
        }

        /* Marquee Display */
        .marquee-container {
          overflow: hidden;
          position: relative;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          padding: 20px 0 40px 0;
        }

        .marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeScroll 50s linear infinite;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        .marquee-item {
          width: 260px;
          margin-right: 30px;
          flex-shrink: 0;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Hover animations */
        .zoom-on-hover {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .zoom-on-hover:hover {
          transform: translateY(-10px);
        }

        /* Skeleton Loading */
        .skeleton-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          animation: pulseBG 1.5s infinite;
        }
        
        .skeleton-img {
          aspect-ratio: 3/4;
          background: var(--surface);
        }

        .skeleton-body {
          padding: 20px;
        }

        .skeleton-title {
          height: 18px;
          background: var(--surface);
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .skeleton-price {
          height: 14px;
          background: var(--surface);
          border-radius: 4px;
          width: 50%;
        }

        @keyframes pulseBG {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 100px 20px;
          background: rgba(255,255,255,0.02);
          border-radius: 20px;
          border: 1px dashed var(--border);
        }

        .empty-icon {
          font-size: 56px;
          margin-bottom: 16px;
          opacity: 0.8;
          animation: float 3s ease-in-out infinite;
        }

        .empty-text {
          font-size: 18px;
          color: var(--text2);
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        /* Entry Animations */
        .animate-slide-up {
          opacity: 0;
          transform: translateY(30px);
          animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .fade-in {
          opacity: 0;
          animation: fadeIn 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        .delay-3 { animation-delay: 0.6s; }

        @keyframes slideUpFade {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        .pulse-badge {
          animation: badgePulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
          box-shadow: 0 0 0 0 rgba(232, 201, 126, 0.4);
        }

        @keyframes badgePulse {
          to { box-shadow: 0 0 0 10px rgba(232, 201, 126, 0); }
        }
      `}</style>
    </div>
  );
}
