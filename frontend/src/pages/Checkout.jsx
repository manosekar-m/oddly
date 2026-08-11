import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// ✅ Change this to YOUR actual UPI ID
const YOUR_UPI_ID = '7448432423@superyes';
const YOUR_UPI_NAME = 'ODDLY Store';

export default function Checkout() {
  const { cart, cartTotal, finalTotal, discountAmount, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [form, setForm] = useState({
    mobile: user?.mobile || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    district: user?.address?.district || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });
  const [errors, setErrors] = useState({ mobile: '', district: '', city: '', pincode: '' });

  if (cart.length === 0) { navigate('/cart'); return null; }

  const handleMobileChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, mobile: val }));
    if (/[^0-9]/.test(val)) setErrors(prev => ({ ...prev, mobile: 'Mobile must contain only numbers' }));
    else if (val.length > 0 && val.length !== 10) setErrors(prev => ({ ...prev, mobile: 'Mobile must be exactly 10 digits' }));
    else setErrors(prev => ({ ...prev, mobile: '' }));
  };

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, district: val }));
    if (/[^a-zA-Z\s]/.test(val)) setErrors(prev => ({ ...prev, district: 'District must contain only alphabets' }));
    else setErrors(prev => ({ ...prev, district: '' }));
  };

  const handleCityChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, city: val }));
    if (/[0-9]/.test(val)) setErrors(prev => ({ ...prev, city: 'City must not contain numbers' }));
    else setErrors(prev => ({ ...prev, city: '' }));
  };

  const handlePincodeChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, pincode: val }));
    if (/[^0-9]/.test(val)) setErrors(prev => ({ ...prev, pincode: 'Pincode must contain only numbers' }));
    else if (val.length > 0 && val.length !== 6) setErrors(prev => ({ ...prev, pincode: 'Pincode must be exactly 6 digits' }));
    else setErrors(prev => ({ ...prev, pincode: '' }));
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (errors.mobile || errors.district || errors.city || errors.pincode) {
      return toast.error('Please fix the errors in the form before proceeding');
    }
    if (!form.street || !form.city || !form.district || !form.state || !form.pincode)
      return toast.error('All address fields are required');
    if (!form.mobile || form.mobile.length !== 10) 
      return toast.error('Valid 10-digit mobile number is required');
    if (form.pincode.length !== 6)
      return toast.error('Valid 6-digit pincode is required');
    setStep(2);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) { setScreenshot(file); setScreenshotPreview(URL.createObjectURL(file)); }
  };

  const handlePlaceOrder = async () => {
    if (!transactionId.trim()) { toast.error('Please enter your UPI Transaction ID'); return; }
    if (transactionId.trim().length < 4) { toast.error('Please enter a valid Transaction ID'); return; }

    setLoading(true);
    try {
      // ✅ Build items with correct 'product' field (not 'productId')
      const orderItems = cart.map(i => ({
        product: i.productId,
        name: i.name,
        image: i.image || '',
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      }));

      const shippingAddress = { street: form.street, city: form.city, district: form.district, state: form.state, pincode: form.pincode };

      if (screenshot) {
        // ✅ FormData path — stringify arrays/objects
        const fd = new FormData();
        fd.append('items', JSON.stringify(orderItems));
        fd.append('shippingAddress', JSON.stringify(shippingAddress));
        fd.append('mobile', form.mobile);
        fd.append('paymentMethod', 'UPI');
        fd.append('transactionId', transactionId.trim());
        fd.append('paymentScreenshot', screenshot);
        fd.append('totalAmount', finalTotal);
        if (coupon && coupon._id) fd.append('couponId', coupon._id);
        await axios.post('/orders', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        // ✅ JSON path — no screenshot
        await axios.post('/orders', {
          items: orderItems,
          shippingAddress,
          mobile: form.mobile,
          paymentMethod: 'UPI',
          transactionId: transactionId.trim(),
          totalAmount: finalTotal,
          couponId: (coupon && coupon._id) ? coupon._id : undefined
        });
      }

      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/profile');
    } catch (err) {
      console.error('Order error:', err.response?.data);
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="container page">
      <h1 className="page-title" style={{ marginBottom: 8 }}>Checkout</h1>
      {/* Steps */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 32 }}>
        {[['1', 'Address'], ['2', 'Payment']].map(([num, label], idx) => (
          <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {idx > 0 && <div style={{ height: 1, width: 32, background: 'var(--border)' }} />}
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= Number(num) ? 'var(--accent)' : 'var(--border)', color: step >= Number(num) ? '#000' : 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{num}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: step >= Number(num) ? 'var(--accent)' : 'var(--text2)' }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
        <div>
          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleAddressSubmit}>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>Contact Info</h3>
                <div className="form-group">
                  <label className="label">Mobile Number *</label>
                  <input value={form.mobile} onChange={handleMobileChange} className={errors.mobile ? 'input-error' : ''} placeholder="9876543210" required />
                  {errors.mobile && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.mobile}</p>}
                </div>
              </div>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>Delivery Address</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="label">State *</label>
                    <input list="checkout-india-states" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="Type to search state..." required />
                    <datalist id="checkout-india-states">{indianStates.map(st => <option key={st} value={st} />)}</datalist>
                  </div>
                  <div className="form-group">
                    <label className="label">District *</label>
                    <input value={form.district} onChange={handleDistrictChange} className={errors.district ? 'input-error' : ''} placeholder="District" required />
                    {errors.district && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.district}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">City / Town *</label>
                  <input value={form.city} onChange={handleCityChange} className={errors.city ? 'input-error' : ''} placeholder="City or Town" required />
                  {errors.city && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.city}</p>}
                </div>

                <div className="form-group">
                  <label className="label">Street Address *</label>
                  <input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} placeholder="123, MG Road, House No" required />
                </div>

                <div className="form-group">
                  <label className="label">Pincode *</label>
                  <input value={form.pincode} onChange={handlePincodeChange} className={errors.pincode ? 'input-error' : ''} placeholder="560001" required maxLength={6} />
                  {errors.pincode && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.pincode}</p>}
                </div>
              </div>
              <button className="btn-primary" type="submit" style={{ width: '100%', padding: 16, marginTop: 20, fontSize: 15 }}>Continue to Payment →</button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>Pay via UPI</h3>
                <div style={{ background: 'linear-gradient(135deg, #1a1500, #2a2000)', border: '1px solid var(--accent)', borderRadius: 14, padding: 24, marginBottom: 24, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Send payment to</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>{YOUR_UPI_ID}</p>
                  <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>{YOUR_UPI_NAME}</p>
                  <div style={{ background: 'rgba(232,201,126,0.1)', borderRadius: 10, padding: '12px 20px', display: 'inline-block' }}>
                    <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 2 }}>Amount to Pay</p>
                    <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)' }}>₹{finalTotal}</p>
                    {coupon && <p style={{ fontSize: 11, color: '#6ecf6e', marginTop: 4 }}>₹{discountAmount} discount applied</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
                  {[
                    { name: 'Google Pay', short: 'G Pay', bg: 'linear-gradient(135deg, #4285F4, #34A853)', text: '#fff' },
                    { name: 'PhonePe', short: 'Ph Pe', bg: 'linear-gradient(135deg, #5f259f, #7b3fbf)', text: '#fff' },
                    { name: 'Paytm', short: 'Paytm', bg: 'linear-gradient(135deg, #002970, #00b9f5)', text: '#fff' },
                    { name: 'BHIM UPI', short: 'BHIM', bg: 'linear-gradient(135deg, #00529B, #FF6B00)', text: '#fff' },
                  ].map(app => (
                    <div key={app.name} style={{
                      background: '#fff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 12,
                      padding: '8px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 5,
                      minWidth: 72
                    }}>
                      <div style={{
                        background: app.bg,
                        borderRadius: 10,
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: app.text,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 0.3
                      }}>
                        {app.short}
                      </div>
                      <span style={{ fontSize: 10, color: '#444', fontWeight: 700, whiteSpace: 'nowrap' }}>{app.name}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, border: '1px solid var(--border)' }}>
                  <strong style={{ color: 'var(--text)' }}>How to pay:</strong><br />
                  1. Open any UPI app (GPay, PhonePe, Paytm)<br />
                  2. Send <strong style={{ color: 'var(--accent)' }}>₹{finalTotal}</strong> to <strong style={{ color: 'var(--accent)' }}>{YOUR_UPI_ID}</strong><br />
                  3. Copy the <strong style={{ color: 'var(--text)' }}>Transaction ID</strong> after payment<br />
                  4. Paste it below and place your order
                </div>
                <div className="form-group">
                  <label className="label">UPI Transaction ID <span style={{ color: 'var(--danger)' }}>* Required</span></label>
                  <input value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="e.g. 407311558279" style={{ borderColor: transactionId.trim().length >= 4 ? '#5cb85c' : 'var(--border)' }} />
                  <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6 }}>Find in UPI app → History → tap this payment → copy Transaction ID</p>
                </div>
                <div className="form-group">
                  <label className="label">Payment Screenshot <span style={{ color: 'var(--text2)', fontWeight: 400 }}>(Optional)</span></label>
                  <input type="file" accept="image/*" onChange={handleScreenshotChange} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text2)', cursor: 'pointer', width: 'auto', fontSize: 13 }} />
                  {screenshotPreview && (
                    <div style={{ marginTop: 12 }}>
                      <img src={screenshotPreview} alt="Payment screenshot" style={{ maxWidth: 180, maxHeight: 260, borderRadius: 10, border: '2px solid var(--accent)', objectFit: 'cover' }} />
                      <p style={{ fontSize: 11, color: '#5cb85c', marginTop: 6 }}>✓ Screenshot attached</p>
                    </div>
                  )}
                </div>
              </div>
              <button className="btn-primary" onClick={handlePlaceOrder} disabled={loading || !transactionId.trim()} style={{ width: '100%', padding: 18, fontSize: 16, opacity: !transactionId.trim() ? 0.5 : 1 }}>
                {loading ? 'Placing Order...' : !transactionId.trim() ? 'Enter Transaction ID First' : '✓ Place Order'}
              </button>
              {!transactionId.trim() && <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--danger)', marginTop: 8 }}>⚠ Transaction ID is required to confirm your payment</p>}
              <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13 }}>← Back to Address</button>
            </div>
          )}
        </div>

        {/* Summary */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, position: 'sticky', top: 80 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Order ({cart.length} items)</h3>
          {cart.map(item => (
            <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <img src={item.image || 'https://via.placeholder.com/56x70'} alt={item.name} style={{ width: 56, height: 70, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text2)' }}>Size: {item.size} × {item.quantity}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>₹{item.price * item.quantity}</p>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
            <span>Total</span><span style={{ color: 'var(--accent)' }}>₹{finalTotal}</span>
          </div>
          {step === 2 && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--surface)', borderRadius: 10, fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
              <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Delivering to:</p>
              <p>{[form.street, form.city, form.district, form.state].filter(Boolean).join(', ')} - {form.pincode}</p>
              <p>📞 {form.mobile}</p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media(max-width:768px){div[style*="grid-template-columns: 1fr 340px"]{grid-template-columns:1fr!important}}
        .input-error { border-color: var(--danger) !important; background: rgba(224, 82, 82, 0.05) !important; }
      `}</style>
    </div>
  );
}
