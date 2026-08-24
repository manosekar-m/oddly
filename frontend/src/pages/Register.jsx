import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [shownOtp, setShownOtp] = useState('');
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/auth/register', form);
      setUserId(data.userId);
      if (data.otp) setShownOtp(data.otp);
      toast.success('OTP sent! Check your email.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/auth/verify-otp', { userId, otp });
      toast.success('Account verified! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      const { data } = await axios.post('/auth/resend-otp', { userId });
      if (data.otp) setShownOtp(data.otp);
      toast.success('OTP resent!');
    } catch { toast.error('Failed to resend'); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--accent)' }}>ODDLY</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 6 }}>{step === 1 ? 'Create your account' : 'Verify your email'}</p>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
          {step === 1 ? (
            <form onSubmit={handleRegister}>
              <div className="form-group"><label className="label">Full Name *</label><input placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label className="label">Email</label><input type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label className="label">Mobile</label><input placeholder="9876543210" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} /></div>
              <div className="form-group">
                <label className="label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={form.password} 
                    onChange={e => setForm({ ...form, password: e.target.value })} 
                    required 
                    minLength={6} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 4, display: 'flex' }}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>{loading ? 'Sending OTP...' : 'Send OTP'}</button>
              <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text2)', fontSize: 14 }}>Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Login</Link></p>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>Enter the 4-digit OTP sent to your email and mobile</p>
              {shownOtp && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Your OTP (dev mode)</p>
                  <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: 8, color: 'var(--accent)' }}>{shownOtp}</p>
                </div>
              )}
              <div className="form-group">
                <label className="label">OTP</label>
                <input placeholder="1234" value={otp} onChange={e => setOtp(e.target.value)} maxLength={4} required style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center' }} />
              </div>
              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
              <button type="button" onClick={handleResend} style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13 }}>Didn't receive? Resend OTP</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
