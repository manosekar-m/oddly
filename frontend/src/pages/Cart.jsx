import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiMinus, FiPlus, FiTag, FiX } from 'react-icons/fi';
import DeliveryCheck from '../components/DeliveryCheck';
import toast from 'react-hot-toast';
import { useState } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';

export default function Cart() {
  const { 
    cart, updateQuantity, removeFromCart, cartTotal, 
    coupon, applyCoupon, removeCoupon, discountAmount, finalTotal 
  } = useCart();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState(null);
  const navigate = useNavigate();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) return (
    <div className="container page" style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 56 }}>🛒</p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, margin: '16px 0 8px' }}>Your cart is empty</h2>
      <p style={{ color: 'var(--text2)', marginBottom: 24 }}>Looks like you haven't added anything yet</p>
      <button className="btn-primary" onClick={() => navigate('/')}>Continue Shopping</button>
    </div>
  );

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, cartTotal });
      applyCoupon(data);
      toast.success(data.message);
      setCouponCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = (item) => {
    if (item.quantity >= item.maxStock) {
      toast.error(`Only ${item.maxStock} unit${item.maxStock > 1 ? 's' : ''} available for size ${item.size}!`);
      return;
    }
    updateQuantity(item.productId, item.size, item.quantity + 1);
  };

  const handleProceedCheckout = () => {
    if (!deliveryResult) {
      toast.error('Please enter your pincode and check delivery availability first.');
      return;
    }
    if (!deliveryResult.serviceable) {
      toast.error('Delivery is not available to the entered pincode.');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="container page">
      <h1 className="page-title" style={{ marginBottom: 32 }}>Your Cart</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
        <motion.div 
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {cart.map(item => (
            <div 
              key={`${item.productId}-${item.size}`} 
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, display: 'flex', gap: 20, alignItems: 'center' }}
            >
              <img src={item.image || 'https://via.placeholder.com/90x110'} alt={item.name} style={{ width: 90, height: 110, objectFit: 'cover', borderRadius: 10 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{item.name}</h3>
                <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 4 }}>Size: <strong style={{ color: 'var(--text)' }}>{item.size}</strong></p>
                {/* ✅ Show stock warning */}
                {item.quantity >= item.maxStock && (
                  <p style={{ fontSize: 11, color: 'var(--danger)', marginBottom: 8 }}>⚠ Max stock reached ({item.maxStock} units)</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderRadius: 8, padding: '6px 12px' }}>
                    <button onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} style={{ background: 'none', border: 'none', color: 'var(--text)', display: 'flex' }}>
                      <FiMinus size={14} />
                    </button>
                    <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                    {/* ✅ Disabled when maxStock reached */}
                    <button
                      onClick={() => handleIncrease(item)}
                      disabled={item.quantity >= item.maxStock}
                      style={{ background: 'none', border: 'none', color: item.quantity >= item.maxStock ? 'var(--border)' : 'var(--text)', display: 'flex', cursor: item.quantity >= item.maxStock ? 'not-allowed' : 'pointer' }}>
                      <FiPlus size={14} />
                    </button>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 16 }}>₹{item.price * item.quantity}</span>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.productId, item.size)} style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: 8 }}>
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
        </motion.div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, position: 'sticky', top: 80 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: 'var(--text2)' }}>
            <span>Subtotal ({cart.length} items)</span><span style={{ color: 'var(--text)' }}>₹{cartTotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: 'var(--text2)' }}>
            <span>Shipping</span>
            {deliveryResult ? (
              <span style={{ color: deliveryResult.freeShippingApplied ? '#6ecf6e' : 'var(--text)' }}>
                {deliveryResult.freeShippingApplied ? 'FREE' : `₹${deliveryResult.shippingCost}`}
              </span>
            ) : (
              <span>Check pincode</span>
            )}
          </div>
          
          {coupon ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: '#6ecf6e' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiTag size={12} />
                <span>Coupon ({coupon.code})</span>
              </div>
              <span>-₹{discountAmount}</span>
            </div>
          ) : null}

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
            <span>Total</span><span style={{ color: 'var(--accent)' }}>₹{finalTotal + (deliveryResult ? deliveryResult.shippingCost : 0)}</span>
          </div>
          
          <div style={{ marginTop: 24 }}>
            <DeliveryCheck 
              cartValue={finalTotal}
              totalItems={totalItems}
              paymentMethod="Prepaid"
              onResult={setDeliveryResult}
            />
          </div>

          {!coupon ? (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  placeholder="Promo Code" 
                  value={couponCode} 
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  style={{ fontSize: 13, padding: '10px 14px', textTransform: 'uppercase', letterSpacing: 1 }}
                />
                <button 
                  onClick={handleApplyCoupon}
                  disabled={loading}
                  className="btn-outline" 
                  style={{ padding: '0 16px', fontSize: 13, borderRadius: 'var(--radius)' }}
                >
                  Apply
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 20, padding: '10px 14px', background: 'rgba(110, 207, 110, 0.05)', border: '1px dashed #6ecf6e', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#6ecf6e', fontWeight: 600 }}>
                Code {coupon.code} applied!
              </div>
              <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
                <FiX size={14} />
              </button>
            </div>
          )}
          <button className="btn-primary" onClick={handleProceedCheckout} disabled={loading} style={{ width: '100%', marginTop: 20, padding: 16, fontSize: 15 }}>
            {loading ? 'Checking Delivery...' : 'Proceed to Checkout'}
          </button>
          <button onClick={() => navigate('/')} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13 }}>← Continue Shopping</button>
        </div>
      </div>
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 320px"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
