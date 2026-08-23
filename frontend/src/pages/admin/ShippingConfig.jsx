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
              <tr key={rate._id} style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px' }}><strong style={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 13 }}>{rate.zone}</strong></td>
                <td style={{ padding: '16px' }}>
                  <input type="number" className="table-input" value={rate.baseRate} onChange={e => handleRateChange(idx, 'baseRate', e.target.value)} />
                </td>
                <td style={{ padding: '16px' }}>
                  <input type="number" className="table-input" value={rate.extraRatePer500g} onChange={e => handleRateChange(idx, 'extraRatePer500g', e.target.value)} />
                </td>
                <td style={{ padding: '16px' }}>
                  <input type="number" className="table-input" value={rate.codCharge} onChange={e => handleRateChange(idx, 'codCharge', e.target.value)} />
                </td>
                <td style={{ padding: '16px' }}>
                  <input type="number" className="table-input" value={rate.freeShippingThreshold} onChange={e => handleRateChange(idx, 'freeShippingThreshold', e.target.value)} />
                </td>
                <td style={{ textAlign: 'center', padding: '16px' }}>
                  <input type="checkbox" className="custom-checkbox" checked={rate.codAvailableDefault} onChange={e => handleRateChange(idx, 'codAvailableDefault', e.target.checked)} />
                </td>
                <td style={{ padding: '16px' }}>
                  <button onClick={() => handleSaveRate(rate)} className="btn-save-row">Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-input {
          width: 100%;
          max-width: 120px;
          padding: 8px 12px;
          background: rgba(20, 20, 20, 0.6);
          border: 1px solid var(--border);
          color: var(--text);
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .table-input:focus {
          outline: none;
          border-color: var(--accent);
          background: var(--bg);
        }
        .custom-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--accent);
        }
        .btn-save-row {
          background: var(--accent);
          color: #000;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-save-row:hover {
          background: #fff;
        }
        .admin-table th {
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 12px;
          color: var(--text2);
          padding: 16px;
          border-bottom: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.2);
        }
        .admin-table td {
          font-size: 14px;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
      `}</style>
    </div>
  );
}
