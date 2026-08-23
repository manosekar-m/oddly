import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import DeliveryCheck from '../components/DeliveryCheck';
import { useCart } from '../context/CartContext';
import SizeChart from '../components/SizeChart';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openAccordion, setOpenAccordion] = useState('details');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [deliveryResult, setDeliveryResult] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setSelectedImage(prev => (prev + 1) % product.images.length);
    }
    if (isRightSwipe) {
      setSelectedImage(prev => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data);
        // Fetch similar products
        axios.get('/products')
          .then(({ data: allProducts }) => {
            setSimilarProducts(allProducts.filter(p => p.category === data.category && p._id !== data._id).slice(0, 4));
          });
      })
      .catch(() => { toast.error('Product not found'); navigate('/'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return false;
    }
    const sizeObj = product.sizes.find(s => s.size === selectedSize);
    if (!sizeObj || sizeObj.quantity === 0) {
      toast.error('This size is out of stock');
      return false;
    }
    addToCart(product, selectedSize);
    toast.success('Added to cart!');
    return true;
  };

  const handleBuyNow = () => {
    if (!deliveryResult) {
      toast.error('Please check delivery availability for your pincode first.');
      return;
    }
    if (!deliveryResult.serviceable) {
      toast.error('Delivery is not available to the entered pincode.');
      return;
    }
    const added = handleAddToCart();
    if (added) navigate('/cart');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80, color: 'var(--text2)' }}>Loading...</div>;
  if (!product) return null;

  const discount = Math.round(((product.price - product.discountedPrice) / product.price) * 100);

  return (
    <div className="container page">
      {showSizeChart && <SizeChart onClose={() => setShowSizeChart(false)} />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>
        <div>
          <div 
            className="product-image-container" 
            style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 12, aspectRatio: '3/4', background: 'var(--bg2)', position: 'relative' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img 
              src={product.images[selectedImage] || 'https://via.placeholder.com/400x500?text=No+Image'} 
              alt={product.name} 
              className="zoom-image"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
            />
          </div>
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
              {product.images.map((img, i) => (
                <div key={i} onClick={() => setSelectedImage(i)} style={{ width: 72, height: 90, borderRadius: 10, overflow: 'hidden', flexShrink: 0, cursor: 'pointer', border: i === selectedImage ? '2px solid var(--accent)' : '2px solid transparent' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div style={{ marginBottom: 28 }}>
            {product.isNewArrival && <span className="badge badge-gold" style={{ marginBottom: 12, display: 'inline-block' }}>New Arrival</span>}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>{product.name}</h1>
            {product.description && <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>{product.description}</p>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)' }}>₹{product.discountedPrice}</span>
            {discount > 0 && <>
              <span style={{ fontSize: 18, color: 'var(--text2)', textDecoration: 'line-through' }}>₹{product.price}</span>
              <span className="badge badge-green">{discount}% OFF</span>
            </>}
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Select Size</span>
              <button onClick={() => setShowSizeChart(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, textDecoration: 'underline' }}>Size Chart</button>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {product.sizes.map(s => (
                <button key={s.size} onClick={() => s.quantity > 0 && setSelectedSize(s.size)} disabled={s.quantity === 0}
                  style={{ width: 52, height: 52, borderRadius: 10, border: '2px solid', borderColor: selectedSize === s.size ? 'var(--accent)' : 'var(--border)', background: selectedSize === s.size ? 'var(--accent)' : 'transparent', color: selectedSize === s.size ? '#000' : s.quantity === 0 ? 'var(--text2)' : 'var(--text)', fontWeight: 700, fontSize: 14, cursor: s.quantity === 0 ? 'not-allowed' : 'pointer', opacity: s.quantity === 0 ? 0.4 : 1, transition: 'all 0.2s' }}>
                  {s.size}
                </button>
              ))}
            </div>
            {selectedSize && <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text2)' }}>{product.sizes.find(s => s.size === selectedSize)?.quantity} units left in stock</p>}
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
            <button className="btn-primary" onClick={handleAddToCart} style={{ flex: 1, padding: '16px' }}>Add to Cart</button>
            <button className="btn-outline" onClick={handleBuyNow} style={{ flex: 1, padding: '16px' }}>Buy Now</button>
          </div>

          <DeliveryCheck 
            cartValue={product.discountedPrice}
            totalItems={1}
            paymentMethod="Prepaid"
            onResult={setDeliveryResult}
          />

          <div style={{ borderTop: '1px solid var(--border)' }}>
            {/* Accordion 1 */}
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <button 
                onClick={() => setOpenAccordion(openAccordion === 'details' ? '' : 'details')}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '16px 0', background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}
              >
                Details <span>{openAccordion === 'details' ? '-' : '+'}</span>
              </button>
              {openAccordion === 'details' && (
                <div style={{ paddingBottom: 16, fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
                  <p>Premium high-quality fabric for ultimate comfort. Durable stitching for long-lasting wear. Exclusive design tailored for the modern look.</p>
                </div>
              )}
            </div>

            {/* Accordion 2 */}
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <button 
                onClick={() => setOpenAccordion(openAccordion === 'materials' ? '' : 'materials')}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '16px 0', background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}
              >
                Materials & Care <span>{openAccordion === 'materials' ? '-' : '+'}</span>
              </button>
              {openAccordion === 'materials' && (
                <div style={{ paddingBottom: 16, fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
                  <p>100% Organic Cotton. Machine wash cold with like colors. Do not bleach. Tumble dry low.</p>
                </div>
              )}
            </div>

            {/* Accordion 3 */}
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <button 
                onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '16px 0', background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}
              >
                Shipping & Returns <span>{openAccordion === 'shipping' ? '-' : '+'}</span>
              </button>
              {openAccordion === 'shipping' && (
                <div style={{ paddingBottom: 16, fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
                  <p>{product.returnPolicy || 'Returns accepted within 4 days with valid reason. Shipping charges based on location.'}</p>
                </div>
              )}
            </div>
          </div>


        </motion.div>
      </div>

      {similarProducts.length > 0 && (
        <motion.div 
          style={{ marginTop: 80 }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 32, textTransform: 'uppercase' }}>Shop the Look</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 30 }}>
            {similarProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Sticky Bottom Add to Cart Bar */}
      <div className="sticky-cart-bar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={product.images[0]} alt="" style={{ width: 40, height: 50, objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{product.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>₹{product.discountedPrice}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {!selectedSize && <span style={{ fontSize: 12, color: 'var(--text2)', display: 'none' }} className="mobile-hide">Select a size above</span>}
            <button className="btn-primary" onClick={handleAddToCart} style={{ padding: '10px 24px', fontSize: 12 }}>ADD TO CART</button>
          </div>
        </div>
      </div>

      <style>{`
        .product-image-container:hover .zoom-image {
          transform: scale(1.5);
          cursor: crosshair;
        }
        .sticky-cart-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-top: 1px solid var(--border);
          padding: 12px 0;
          z-index: 100;
          transform: translateY(100%);
          animation: slideUpBar 0.5s 1s forwards ease-out;
        }
        @keyframes slideUpBar {
          to { transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .product-image-container:hover .zoom-image { transform: none; }
          .mobile-hide { display: none !important; }
        }
      `}</style>
    </div>
  );
}
