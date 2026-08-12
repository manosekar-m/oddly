import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const discount = Math.round(((product.price - product.discountedPrice) / product.price) * 100);
  const isWishlisted = isInWishlist(product._id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.25s', position: 'relative' }}
      onMouseOver={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
      onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; }}>
      
      <button 
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
        style={{ 
          position: 'absolute', top: 12, right: 12, zIndex: 10, 
          background: isWishlisted ? 'var(--accent)' : 'rgba(0,0,0,0.3)', 
          border: 'none', borderRadius: '50%', width: 32, height: 32, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          cursor: 'pointer', color: isWishlisted ? '#000' : '#fff',
          transition: 'all 0.3s ease'
        }}
      >
        <FiHeart fill={isWishlisted ? 'currentColor' : 'none'} size={16} />
      </button>

      <div onClick={() => navigate(`/product/${product._id}`)} style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: 'var(--surface)' }}>
        <motion.img 
          src={product.images[0] || 'https://via.placeholder.com/300x400?text=No+Image'} 
          alt={product.name} 
          initial={{ scale: 1.05 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        {product.isNewArrival && <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--accent)', color: '#000', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: 1 }}>New</span>}
        {discount > 0 && <span style={{ position: 'absolute', bottom: 12, right: 12, background: '#1a3a1a', color: '#6ecf6e', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>{discount}% OFF</span>}
      </div>
      <div style={{ padding: '16px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent)' }}>₹{product.discountedPrice}</span>
          {discount > 0 && <span style={{ fontSize: 13, color: 'var(--text2)', textDecoration: 'line-through' }}>₹{product.price}</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {product.sizes.filter(s => s.quantity > 0).map(s => (
            <span key={s.size} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', fontWeight: 500 }}>{s.size}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
