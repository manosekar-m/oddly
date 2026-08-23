import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { FiTrash2, FiEdit, FiUpload } from 'react-icons/fi';

export default function Delivery() {
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ pincode: '', city: '', state: '', zone: 'local', estimatedDays: 3, codAvailable: true });
  const [editingId, setEditingId] = useState(null);
  
  // Bulk upload state
  const [bulkData, setBulkData] = useState('');

  useEffect(() => {
    fetchPincodes();
  }, []);

  const fetchPincodes = async () => {
    try {
      const { data } = await axios.get('/admin/delivery/pincodes');
      setPincodes(data);
    } catch (err) {
      toast.error('Failed to load pincodes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/admin/delivery/pincodes/${editingId}`, form);
        toast.success('Pincode updated');
      } else {
        await axios.post('/admin/delivery/pincodes', form);
        toast.success('Pincode added');
      }
      setForm({ pincode: '', city: '', state: '', zone: 'local', estimatedDays: 3, codAvailable: true });
      setEditingId(null);
      fetchPincodes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save pincode');
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditingId(item._id);
  };

  const handleDisable = async (id) => {
    if (!window.confirm('Are you sure you want to disable this pincode?')) return;
    try {
      await axios.delete(`/admin/delivery/pincodes/${id}`);
      toast.success('Pincode disabled');
      fetchPincodes();
    } catch (err) {
      toast.error('Failed to disable pincode');
    }
  };

  const handleBulkUpload = async () => {
    try {
      const parsedData = JSON.parse(bulkData);
      if (!Array.isArray(parsedData)) throw new Error('Data must be an array of objects');
      
      const res = await axios.post('/admin/delivery/pincodes/bulk', { pincodes: parsedData });
      toast.success(`Success: ${res.data.successCount}, Failed: ${res.data.failCount}`);
      setBulkData('');
      fetchPincodes();
    } catch (err) {
      toast.error(err.message || 'Invalid JSON format');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Serviceable Pincodes</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
        {/* Single Add/Edit */}
        <div style={{ background: 'var(--surface)', padding: 20, borderRadius: 10 }}>
          <h3 style={{ marginBottom: 16 }}>{editingId ? 'Edit Pincode' : 'Add Pincode'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <input className="custom-input" placeholder="Pincode (6 digits)" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} required maxLength={6} />
              <input className="custom-input" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
              <input className="custom-input" placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})} required />
              <select className="custom-input" value={form.zone} onChange={e => setForm({...form, zone: e.target.value})}>
                <option value="local">Local</option>
                <option value="regional">Regional</option>
                <option value="metro">Metro</option>
                <option value="national">National</option>
                <option value="remote">Remote</option>
              </select>
              <input className="custom-input" type="number" placeholder="Est. Days" value={form.estimatedDays} onChange={e => setForm({...form, estimatedDays: e.target.value})} required min={1} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input className="custom-checkbox" type="checkbox" checked={form.codAvailable} onChange={e => setForm({...form, codAvailable: e.target.checked})} />
                COD Available
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>{editingId ? 'Update' : 'Add'}</button>
              {editingId && <button type="button" className="btn-outline" onClick={() => { setEditingId(null); setForm({ pincode: '', city: '', state: '', zone: 'local', estimatedDays: 3, codAvailable: true })}} style={{ padding: '8px 16px', fontSize: 13 }}>Cancel</button>}
            </div>
          </form>
        </div>

        {/* Bulk Upload */}
        <div style={{ background: 'var(--surface)', padding: 20, borderRadius: 10 }}>
          <h3 style={{ marginBottom: 16 }}><FiUpload /> Bulk Upload (JSON)</h3>
          <textarea 
            className="custom-input"
            placeholder='[{"pincode":"110001","city":"New Delhi","state":"Delhi","zone":"metro","estimatedDays":4}]'
            value={bulkData}
            onChange={e => setBulkData(e.target.value)}
            style={{ width: '100%', height: 120, marginBottom: 10, fontFamily: 'monospace' }}
          />
          <button onClick={handleBulkUpload} className="btn-outline" style={{ padding: '8px 16px', fontSize: 13 }}>Upload JSON</button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pincode</th>
              <th>City / State</th>
              <th>Zone</th>
              <th>Est. Days</th>
              <th>COD</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pincodes.map(p => (
              <tr key={p._id} style={{ opacity: p.isServiceable ? 1 : 0.5 }}>
                <td><strong>{p.pincode}</strong></td>
                <td>{p.city}, {p.state}</td>
                <td><span className="badge badge-gold">{p.zone}</span></td>
                <td>{p.estimatedDays} days</td>
                <td>{p.codAvailable ? 'Yes' : 'No'}</td>
                <td>{p.isServiceable ? 'Active' : 'Disabled'}</td>
                <td>
                  <button onClick={() => handleEdit(p)} style={{ background: 'none', border: 'none', color: '#ffb703', cursor: 'pointer', marginRight: 12 }}><FiEdit /></button>
                  <button onClick={() => handleDisable(p._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
            {pincodes.length === 0 && !loading && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No pincodes found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .custom-input {
          width: 100%;
          padding: 10px 14px;
          background: rgba(20, 20, 20, 0.6);
          border: 1px solid var(--border);
          color: var(--text);
          border-radius: 8px;
          font-size: 13px;
          transition: all 0.2s;
        }
        .custom-input:focus {
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
        .admin-table th {
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 12px;
          color: var(--text2);
        }
        .admin-table td {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
