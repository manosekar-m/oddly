import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin-login', { email, password });
      login(data.user, data.token);
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg)',
      padding: 20
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: 400, 
        background: 'var(--bg2)', 
        padding: 40, 
        borderRadius: 20, 
        border: '1px solid var(--border)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 32, 
            color: 'var(--accent)',
            marginBottom: 8
          }}>ODDLY</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Administrator Portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Admin Email</label>
            <input 
              type="email" 
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: 10, height: 48 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text2)', 
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            ← Back to Storefront
          </button>
        </div>
      </div>
    </div>
  );
}
