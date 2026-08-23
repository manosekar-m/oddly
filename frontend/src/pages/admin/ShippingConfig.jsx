import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

export default function ShippingConfig() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ warehousePincode: '' });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rateRes, settingsRes] = await Promise.all([
        axios.get('/admin/delivery/rates'),
        axios.get('/settings')
      ]);
      setRates(rateRes.data);
      if (settingsRes.data) {
        setSettings({ warehousePincode: settingsRes.data.warehousePincode || '' });
      }
    } catch (err) {
      toast.error('Failed to load shipping data');
    } finally {
      setLoading(false);
    }
  };

  const handleRateChange = (index, field, value) => {
    const updatedRates = [...rates];
    if (field === 'codAvailableDefault') {
      updatedRates[index][field] = value;
    } else {
      updatedRates[index][field] = Number(value);
    }
    setRates(updatedRates);
  };

  const handleSaveRate = async (rate) => {
    try {
      await axios.put(`/admin/delivery/rates/${rate._id}`, rate);
      toast.success(`${rate.zone} zone rates updated`);
    } catch (err) {
      toast.error(`Failed to update ${rate.zone} zone`);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await axios.post('/settings', { warehousePincode: settings.warehousePincode });
      toast.success('Settings updated');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Shipping Configuration</h2>
      
      {/* Global Settings */}
      <div style={{ background: 'var(--surface)', padding: 20, borderRadius: 10, marginBottom: 40, maxWidth: 500 }}>
        <h3 style={{ marginBottom: 16 }}>Global Settings</h3>
        <form onSubmit={handleSaveSettings}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="label">Warehouse Origin Pincode (can be changed anytime)</label>
            <input 
              value={settings.warehousePincode} 
              onChange={e => setSettings({ ...settings, warehousePincode: e.target.value })} 
              placeholder="e.g. 600001" 
              maxLength={6}
              required 
            />
            <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>This is your primary dispatch location.</p>
          </div>
          <button type="submit" className="btn-primary" disabled={savingSettings} style={{ padding: '10px 20px' }}>
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      <h3 style={{ marginBottom: 16 }}>Zone Rates</h3>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>Base Rate (₹)</th>
              <th>Extra per 500g (₹)</th>
              <th>COD Charge (₹)</th>
              <th>Free Ship Threshold (₹)</th>
              <th>Allow COD?</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate, idx) => (
              <tr key={rate._id}>
                <td><strong style={{ textTransform: 'capitalize' }}>{rate.zone}</strong></td>
                <td>
                  <input type="number" value={rate.baseRate} onChange={e => handleRateChange(idx, 'baseRate', e.target.value)} style={{ width: 80, padding: 4 }} />
                </td>
                <td>
                  <input type="number" value={rate.extraRatePer500g} onChange={e => handleRateChange(idx, 'extraRatePer500g', e.target.value)} style={{ width: 80, padding: 4 }} />
                </td>
                <td>
                  <input type="number" value={rate.codCharge} onChange={e => handleRateChange(idx, 'codCharge', e.target.value)} style={{ width: 80, padding: 4 }} />
                </td>
                <td>
                  <input type="number" value={rate.freeShippingThreshold} onChange={e => handleRateChange(idx, 'freeShippingThreshold', e.target.value)} style={{ width: 100, padding: 4 }} />
                </td>
                <td>
                  <input type="checkbox" checked={rate.codAvailableDefault} onChange={e => handleRateChange(idx, 'codAvailableDefault', e.target.checked)} />
                </td>
                <td>
                  <button onClick={() => handleSaveRate(rate)} className="btn-outline" style={{ padding: '4px 12px', fontSize: 12 }}>Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
