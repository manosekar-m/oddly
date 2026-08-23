import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import { FiSearch, FiChevronDown, FiFilter, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

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
    .filter(p => {
      if (selectedSizes.length === 0) return true;
      return p.sizes.some(s => selectedSizes.includes(s.size) && s.quantity > 0);
    })
    .filter(p => {
      const min = priceRange.min === '' ? 0 : Number(priceRange.min);
      const max = priceRange.max === '' ? Infinity : Number(priceRange.max);
      return p.discountedPrice >= min && p.discountedPrice <= max;
    })
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

      <div className="hero-section">
        <motion.div 
          className="container hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="hero-title">ODDLY</h1>
          <p className="hero-description">The New Collection</p>
          <div>
            <button 
              className="btn-primary hero-btn" 
              onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })}
            >
              DISCOVER
            </button>
          </div>
        </motion.div>
      </div>

      <div className="container page">
        {/* New Arrivals Section */}
        {newArrivals.length > 0 && (
          <motion.section 
            className="section-block"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
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
          </motion.section>
        )}

        {/* All Products Section */}
        <motion.section 
          id="shop" 
          className="section-block"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
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

              <button 
                className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter className="filter-icon" />
                Filters
                {(category !== 'All' || selectedSizes.length > 0 || priceRange.min !== '' || priceRange.max !== '') && (
                  <span className="filter-badge"></span>
                )}
              </button>

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

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                className="filters-panel"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="filters-grid">
                  <div className="filter-group">
                    <h4 className="filter-title">Category</h4>
                    <div className="filter-chips">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`filter-chip ${category === cat ? 'active' : ''}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filter-group">
                    <h4 className="filter-title">Size</h4>
                    <div className="filter-chips">
                      {availableSizes.map(size => (
                        <button
                          key={size}
                          onClick={() => {
                            if (selectedSizes.includes(size)) {
                              setSelectedSizes(selectedSizes.filter(s => s !== size));
                            } else {
                              setSelectedSizes([...selectedSizes, size]);
                            }
                          }}
                          className={`filter-chip ${selectedSizes.includes(size) ? 'active' : ''}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filter-group">
                    <h4 className="filter-title">Price Range</h4>
                    <div className="price-inputs">
                      <div className="price-input-wrapper">
                        <span className="price-currency">₹</span>
                        <input 
                          type="number" 
                          placeholder="Min" 
                          value={priceRange.min}
                          onChange={e => setPriceRange({ ...priceRange, min: e.target.value })}
                          className="price-input"
                        />
                      </div>
                      <span className="price-separator">-</span>
                      <div className="price-input-wrapper">
                        <span className="price-currency">₹</span>
                        <input 
                          type="number" 
                          placeholder="Max" 
                          value={priceRange.max}
                          onChange={e => setPriceRange({ ...priceRange, max: e.target.value })}
                          className="price-input"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {(category !== 'All' || selectedSizes.length > 0 || priceRange.min !== '' || priceRange.max !== '') && (
                    <div className="filter-actions">
                      <button 
                        className="clear-filters-btn"
                        onClick={() => {
                          setCategory('All');
                          setSelectedSizes([]);
                          setPriceRange({ min: '', max: '' });
                        }}
                      >
                        <FiX size={14} /> Clear All
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          
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
        </motion.section>
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

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(80px, 18vw, 220px);
          font-weight: 400;
          line-height: 0.9;
          margin-bottom: 20px;
          color: #fff;
          letter-spacing: 0px;
          text-transform: uppercase;
          position: relative;
        }

        .hero-description {
          color: #fff;
          font-size: 15px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 4px;
          margin-bottom: 40px;
          opacity: 0.9;
        }

        .hero-btn {
          padding: 16px 40px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.3s ease;
          border-radius: 0px;
          background: #fff;
          color: #000;
          border: 1px solid #fff;
        }

        .hero-btn:hover {
          background: #000;
          color: #fff;
          border-color: #fff;
        }

        /* Layout & Spacing */
        .section-block {
          margin-bottom: 80px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: flex-start;
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
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
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
          width: 380px;
          margin-right: 40px;
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

        @media (max-width: 768px) {
          .search-wrapper { min-width: 100%; }
          .custom-select-wrapper { min-width: 100%; }
          .filters-grid { grid-template-columns: 1fr; }
        }

        /* Filter Styles */
        .filter-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 24px;
          height: 52px;
          background: rgba(22, 22, 22, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .filter-toggle-btn:hover, .filter-toggle-btn.active {
          background: rgba(26, 26, 26, 0.8);
          border-color: rgba(232, 201, 126, 0.4);
        }

        .filter-badge {
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
          position: absolute;
          top: 14px;
          right: 14px;
        }

        .filters-panel {
          background: rgba(22, 22, 22, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 32px;
        }

        .filters-grid {
          padding: 32px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
          position: relative;
        }

        .filter-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text2);
          margin-bottom: 16px;
          font-weight: 600;
        }

        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .filter-chip {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          color: var(--text);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-chip:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .filter-chip.active {
          background: rgba(232, 201, 126, 0.1);
          border-color: var(--accent);
          color: var(--accent);
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .price-input-wrapper {
          position: relative;
          flex: 1;
        }

        .price-currency {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text2);
          font-size: 14px;
        }

        .price-input {
          width: 100%;
          padding: 12px 14px 12px 28px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .price-input:focus {
          border-color: rgba(232, 201, 126, 0.4);
          outline: none;
        }

        .price-separator {
          color: var(--text2);
        }

        .filter-actions {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .clear-filters-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: var(--text2);
          font-size: 13px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .clear-filters-btn:hover {
          color: var(--text);
        }
      `}</style>
    </div>
  );
}
