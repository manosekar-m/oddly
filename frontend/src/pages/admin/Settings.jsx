import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const [marqueeMessage, setMarqueeMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/settings');
      if (res.data) {
        setMarqueeMessage(res.data.marqueeMessage || '');
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/settings', { marqueeMessage });
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--accent)', marginBottom: 8 }}>Store Settings</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Manage global configuration and visual elements.</p>
        </div>
      </div>

      <div style={{ background: 'var(--bg2)', padding: 32, borderRadius: 16, border: '1px solid var(--border)', maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="label" style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>Top Marquee Message (Running Text)</label>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>Leave blank to hide the marquee completely.</p>
            <input 
              type="text" 
              value={marqueeMessage}
              onChange={(e) => setMarqueeMessage(e.target.value)}
              placeholder="e.g. FREE SHIPPING ON ORDERS OVER $150"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary"
            style={{ width: '100%', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
