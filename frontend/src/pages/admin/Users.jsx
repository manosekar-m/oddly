import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiTrash2, FiSearch, FiMail, FiPhone, FiCalendar, FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email?.toLowerCase().includes(search.toLowerCase()) ||
                          u.mobile?.includes(search);
    
    let matchesDate = true;
    if (filterMonth !== 'all' || filterYear !== 'all') {
      const date = new Date(u.createdAt);
      if (filterMonth !== 'all' && date.getMonth().toString() !== filterMonth) matchesDate = false;
      if (filterYear !== 'all' && date.getFullYear().toString() !== filterYear) matchesDate = false;
    }
    
    return matchesSearch && matchesDate;
  });

  const exportToExcel = () => {
    if (filteredUsers.length === 0) return toast.error('No users to export');
    
    const data = filteredUsers.map(u => ({
      'Name': u.name,
      'Email': u.email || 'N/A',
      'Phone No': u.mobile || 'N/A',
      'Date of Joined': new Date(u.createdAt).toLocaleDateString()
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `Users_Report_${filterMonth}_${filterYear}.xlsx`);
  };

  return (
    <div>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>Users</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Manage customer accounts and access</p>
        </div>
        <button onClick={exportToExcel} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 20px', fontSize: 13 }}>
          <FiDownload size={16} /> Export to Excel
        </button>
      </div>

      <div style={{ 
        background: 'var(--bg2)', 
        borderRadius: 16, 
        border: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
            <input 
              type="text" 
              placeholder="Search by name, email or mobile..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 40, background: 'var(--bg3)', border: 'none' }}
            />
          </div>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ width: 140, background: 'var(--bg3)', border: 'none' }}>
            <option value="all">All Months</option>
            {Array.from({length: 12}).map((_, i) => (
              <option key={i} value={i.toString()}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ width: 120, background: 'var(--bg3)', border: 'none' }}>
            <option value="all">All Years</option>
            {Array.from({length: 5}).map((_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year.toString()}>{year}</option>;
            })}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Contact</th>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Joined</th>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', 
                        color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)' }}>
                      <FiMail size={12} /> {user.email || 'N/A'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
                      <FiPhone size={12} /> {user.mobile || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiCalendar size={12} /> {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      fontSize: 11, padding: '2px 8px', borderRadius: 4, 
                      background: user.isVerified ? 'rgba(92, 184, 92, 0.1)' : 'rgba(224, 82, 82, 0.1)', 
                      color: user.isVerified ? 'var(--success)' : 'var(--danger)',
                      border: `1px solid ${user.isVerified ? 'rgba(92, 184, 92, 0.2)' : 'rgba(224, 82, 82, 0.2)'}`,
                    }}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button onClick={() => handleDelete(user._id)} style={{ padding: 8, background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--danger)', cursor: 'pointer' }}>
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
