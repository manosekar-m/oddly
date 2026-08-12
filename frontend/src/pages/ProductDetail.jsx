import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
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
    if (!selectedSize) return toast.error('Please select a size');
    const sizeObj = product.sizes.find(s => s.size === selectedSize);
    if (!sizeObj || sizeObj.quantity === 0) return toast.error('This size is out of stock');
    addToCart(product, selectedSize);
    toast.success('Added to cart!');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80, color: 'var(--text2)' }}>Loading...</div>;
  if (!product) return null;

  const discount = Math.round(((product.price - product.discountedPrice) / product.price) * 100);

  return (
    <div className="container page">
      {showSizeChart && <SizeChart onClose={() => setShowSizeChart(false)} />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>
        <div>
          <div className="product-image-container" style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 12, aspectRatio: '3/4', background: 'var(--bg2)', position: 'relative' }}>
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

          <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            <button className="btn-primary" onClick={handleAddToCart} style={{ flex: 1, padding: '16px' }}>Add to Cart</button>
            <button className="btn-outline" onClick={() => { handleAddToCart(); if (selectedSize) navigate('/cart'); }} style={{ flex: 1, padding: '16px' }}>Buy Now</button>
          </div>

          <div style={{ padding: 24, background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: 14, marginBottom: 12, fontWeight: 600 }}>Product Highlights</h4>
            <ul style={{ fontSize: 13, color: 'var(--text2)', paddingLeft: 18, lineHeight: 1.8 }}>
              <li>Premium high-quality fabric for ultimate comfort</li>
              <li>Durable stitching for long-lasting wear</li>
              <li>Exclusive design tailored for the modern look</li>
              <li>Sustainable and ethically sourced materials</li>
            </ul>
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
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 32 }}>You May Also Like</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 30 }}>
            {similarProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </motion.div>
      )}

      <style>{`
        .product-image-container:hover .zoom-image {
          transform: scale(1.5);
          cursor: crosshair;
        }
        @media (max-width: 768px) {
          .product-image-container:hover .zoom-image { transform: none; }
        }
      `}</style>
    </div>
  );
}
