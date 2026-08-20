import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function Profile() {
  const { user, login, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    mobile: user?.mobile || '', 
    address: { district: '', city: '', state: '', pincode: '', street: '', ...user?.address } 
  });
  const [errors, setErrors] = useState({ name: '', mobile: '', pincode: '', district: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('orders');
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [returnModal, setReturnModal] = useState({ open: false, orderId: '', reason: '' });
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    axios.get('/orders/my').then(({ data }) => setOrders(data)).catch(() => {});
  }, []);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, name: val }));
    if (/[^a-zA-Z\s]/.test(val)) setErrors(prev => ({ ...prev, name: 'Name must contain only alphabets' }));
    else setErrors(prev => ({ ...prev, name: '' }));
  };

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, address: { ...prev.address, district: val } }));
    if (/[^a-zA-Z\s]/.test(val)) setErrors(prev => ({ ...prev, district: 'District must contain only alphabets' }));
    else setErrors(prev => ({ ...prev, district: '' }));
  };

  const handleCityChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, address: { ...prev.address, city: val } }));
    if (/[0-9]/.test(val)) setErrors(prev => ({ ...prev, city: 'City must not contain numbers' }));
    else setErrors(prev => ({ ...prev, city: '' }));
  };

  const handleMobileChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, mobile: val }));
    if (/[^0-9]/.test(val)) setErrors(prev => ({ ...prev, mobile: 'Mobile number must contain only numbers' }));
    else if (val.length > 0 && val.length !== 10) setErrors(prev => ({ ...prev, mobile: 'Mobile number must be exactly 10 digits' }));
    else setErrors(prev => ({ ...prev, mobile: '' }));
  };

  const handlePincodeChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, address: { ...prev.address, pincode: val } }));
    if (/[^0-9]/.test(val)) setErrors(prev => ({ ...prev, pincode: 'Pincode must contain only numbers' }));
    else if (val.length > 0 && val.length !== 6) setErrors(prev => ({ ...prev, pincode: 'Pincode must be exactly 6 digits' }));
    else setErrors(prev => ({ ...prev, pincode: '' }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (errors.name || errors.mobile || errors.pincode || errors.district || errors.city) {
      toast.error('Please fix the errors in the form before saving');
      return;
    }
    
    if (form.mobile && form.mobile.length !== 10) {
      setErrors(prev => ({ ...prev, mobile: 'Mobile number must be exactly 10 digits' }));
      return;
    }
    if (form.address.pincode && form.address.pincode.length !== 6) {
      setErrors(prev => ({ ...prev, pincode: 'Pincode must be exactly 6 digits' }));
      return;
    }
    if (!form.name || form.name.trim() === '') {
       setErrors(prev => ({ ...prev, name: 'Name is required' }));
       return;
    }

    setLoading(true);
    try {
      const { data } = await axios.put('/auth/profile', form);
      login(data.user, token);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Update failed'); 
      console.error(err);
    } finally { 
      setLoading(false); 
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.put('/auth/change-password', { 
        oldPassword: passwordForm.oldPassword, 
        newPassword: passwordForm.newPassword 
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReturn = async (e) => {
    e.preventDefault();
    if (!returnModal.reason.trim()) {
      toast.error('Please provide a reason for return');
      return;
    }
    setReturnLoading(true);
    try {
      const { data } = await axios.post(`/orders/${returnModal.orderId}/return`, { returnReason: returnModal.reason });
      setOrders(orders.map(o => o._id === data._id ? data : o));
      toast.success('Return requested successfully');
      setReturnModal({ open: false, orderId: '', reason: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request return');
    } finally {
      setReturnLoading(false);
    }
  };

  const canReturn = (order) => {
    if (order.orderStatus !== 'delivered' || !order.deliveredAt) return false;
    if (order.returnRequested) return false;
    const diffTime = Math.abs(new Date() - new Date(order.deliveredAt));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 4;
  };

  const statusColor = { placed: '#e8c97e', processing: '#60a5fa', shipped: '#a78bfa', delivered: '#6ecf6e', cancelled: '#e05252', returned: '#a78bfa' };

  return (
    <div className="container page">
      <h1 className="page-title" style={{ marginBottom: 32 }}>My Profile</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>
        <div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#000', margin: '0 auto 16px' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{user?.name}</h3>
            <p style={{ color: 'var(--text2)', fontSize: 13 }}>{user?.email || user?.mobile}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['orders', `📦 My Orders (${orders.length})`], 
              ['settings', '⚙️ Settings'],
              ['security', '🔒 Security']
            ].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid', borderColor: tab === t ? 'var(--accent)' : 'var(--border)', background: tab === t ? 'rgba(232,201,126,0.1)' : 'transparent', color: tab === t ? 'var(--accent)' : 'var(--text2)', fontWeight: 500, textAlign: 'left' }}>{label}</button>
            ))}
          </div>
        </div>

        <div>
           {tab === 'orders' && (
            orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
                <p style={{ fontSize: 40 }}>📦</p>
                <p style={{ fontSize: 16, marginTop: 12 }}>No orders yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map(order => (
                  <div key={order._id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}>Order #{order._id.slice(-8).toUpperCase()}</p>
                        <p style={{ fontSize: 12, color: 'var(--text2)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div style={{ margin: '24px 0 32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                        {/* Connecting Line */}
                        <div style={{ 
                          position: 'absolute', top: 12, left: 0, right: 0, height: 2, 
                          background: 'var(--border)', zIndex: 1 
                        }} />
                        <div style={{ 
                          position: 'absolute', top: 12, left: 0, height: 2, 
                          background: 'var(--accent)', zIndex: 2,
                          width: order.orderStatus === 'placed' ? '0%' : 
                                 order.orderStatus === 'processing' ? '33%' :
                                 order.orderStatus === 'shipped' ? '66%' : 
                                 order.orderStatus === 'delivered' ? '100%' : '0%',
                          transition: 'width 0.5s ease'
                        }} />

                        {['placed', 'processing', 'shipped', order.orderStatus === 'returned' ? 'returned' : 'delivered'].map((s, idx) => {
                          const isActive = ['placed', 'processing', 'shipped', 'delivered', 'returned'].indexOf(order.orderStatus) >= idx;
                          return (
                            <div key={s} style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                              <div style={{ 
                                width: 24, height: 24, borderRadius: '50%', 
                                background: isActive ? 'var(--accent)' : 'var(--bg2)',
                                border: '2px solid',
                                borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.3s'
                              }}>
                                {isActive && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#000' }} />}
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: isActive ? 'var(--text)' : 'var(--text2)' }}>{s}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                        {item.image && <img src={item.image} alt="" style={{ width: 48, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--text2)' }}>Size: {item.size} | Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 14, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <p style={{ color: 'var(--text2)', fontSize: 12 }}>Transaction ID: <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{order.transactionId || '—'}</span></p>
                          <p style={{ color: 'var(--text2)', fontSize: 12 }}>Payment: <span style={{ textTransform: 'capitalize', color: order.paymentStatus === 'paid' ? 'var(--success)' : order.paymentStatus === 'failed' ? 'var(--danger)' : 'var(--accent)' }}>{order.paymentStatus}</span></p>
                          {order.coupon && <p style={{ color: '#6ecf6e', fontSize: 11, fontWeight: 600, marginTop: 4 }}>Coupon: {order.coupon.code}</p>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent)', display: 'block', marginBottom: 8 }}>₹{order.totalAmount}</span>
                          {canReturn(order) && (
                            <button 
                              onClick={() => setReturnModal({ open: true, orderId: order._id, reason: '' })}
                              style={{ padding: '4px 12px', fontSize: 11, borderRadius: 6, border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', cursor: 'pointer' }}
                            >
                              Return Product
                            </button>
                          )}
                          {order.returnRequested && (
                            <span style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, background: 'rgba(232, 201, 126, 0.1)', color: 'var(--accent)' }}>
                              Return: {order.returnStatus}
                            </span>
                          )}
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'settings' && (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Profile Details</h3>
                {!editing && <button className="btn-outline" style={{ padding: '8px 18px', fontSize: 13 }} onClick={() => setEditing(true)}>Edit</button>}
              </div>
              {editing ? (
                <form onSubmit={handleUpdate}>
                  <div className="form-group">
                    <label className="label">First Name</label>
                    <input 
                      value={form.name} 
                      onChange={handleNameChange} 
                      className={errors.name ? 'input-error' : ''} 
                    />
                    {errors.name && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Mobile No</label>
                    <input 
                      value={form.mobile} 
                      onChange={handleMobileChange} 
                      className={errors.mobile ? 'input-error' : ''} 
                      placeholder="10-digit mobile number" 
                    />
                    {errors.mobile && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.mobile}</p>}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="label">State</label>
                      <input 
                        list="india-states" 
                        value={form.address.state} 
                        onChange={e => setForm({ ...form, address: { ...form.address, state: e.target.value } })} 
                        placeholder="Type to search state..."
                      />
                      <datalist id="india-states">
                        {indianStates.map(state => <option key={state} value={state} />)}
                      </datalist>
                    </div>
                    <div className="form-group">
                      <label className="label">District</label>
                      <input 
                        value={form.address.district} 
                        onChange={handleDistrictChange} 
                        className={errors.district ? 'input-error' : ''} 
                        placeholder="District" 
                      />
                      {errors.district && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.district}</p>}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="label">City / Town</label>
                      <input 
                        value={form.address.city} 
                        onChange={handleCityChange} 
                        className={errors.city ? 'input-error' : ''} 
                        placeholder="City or Town" 
                      />
                      {errors.city && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.city}</p>}
                    </div>
                    <div className="form-group">
                      <label className="label">Pincode</label>
                      <input 
                        value={form.address.pincode} 
                        onChange={handlePincodeChange} 
                        className={errors.pincode ? 'input-error' : ''} 
                        placeholder="6-digit pincode" 
                      />
                      {errors.pincode && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.pincode}</p>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Street / House No</label>
                    <input value={form.address.street} onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })} placeholder="House no, Building, Street" />
                  </div>
                  
                  <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                    <button type="button" className="btn-outline" onClick={() => { setEditing(false); setErrors({}); setForm({ name: user?.name || '', mobile: user?.mobile || '', address: { district: '', city: '', state: '', pincode: '', street: '', ...user?.address } }); }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[['First Name', user?.name], ['Email', user?.email], ['Mobile No', user?.mobile], ['Address', user?.address ? [user.address.street, user.address.city, user.address.district, user.address.state, user.address.pincode].filter(Boolean).join(', ') : 'Not added']].map(([label, val]) => (
                    <div key={label} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>{label}</p>
                      <p style={{ fontSize: 15 }}>{val || '—'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'security' && (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 24 }}>Security Settings</h3>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="label">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showOldPass ? 'text' : 'password'} 
                      value={passwordForm.oldPassword} 
                      onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowOldPass(!showOldPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 4, display: 'flex' }}
                    >
                      {showOldPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showNewPass ? 'text' : 'password'} 
                      value={passwordForm.newPassword} 
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                      required 
                      minLength={6}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 4, display: 'flex' }}
                    >
                      {showNewPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showConfirmPass ? 'text' : 'password'} 
                      value={passwordForm.confirmPassword} 
                      onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 4, display: 'flex' }}
                    >
                      {showConfirmPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
                <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 12 }}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media(max-width:768px){div[style*="grid-template-columns: 280px 1fr"]{grid-template-columns:1fr!important}}
        .input-error { border-color: var(--danger) !important; background: rgba(224, 82, 82, 0.05) !important; }
      `}</style>

      {/* Return Modal */}
      {returnModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--bg2)', width: '100%', maxWidth: 400, borderRadius: 16, border: '1px solid var(--border)', padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Request Return</h3>
            <form onSubmit={handleRequestReturn}>
              <div className="form-group">
                <label className="label">Reason for Return *</label>
                <textarea 
                  value={returnModal.reason}
                  onChange={e => setReturnModal({ ...returnModal, reason: e.target.value })}
                  placeholder="Please tell us why you want to return this product..."
                  required
                  rows={4}
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="submit" className="btn-primary" disabled={returnLoading} style={{ flex: 1 }}>
                  {returnLoading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button type="button" className="btn-outline" onClick={() => setReturnModal({ open: false, orderId: '', reason: '' })} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
