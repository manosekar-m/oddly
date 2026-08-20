import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiRefreshCcw } from 'react-icons/fi';

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const { data } = await api.get('/orders/admin/all');
      // Filter orders where a return has been requested
      const returnOrders = data.filter(o => o.returnRequested);
      setReturns(returnOrders);
    } catch (err) {
      toast.error('Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/return-status`, { returnStatus: status });
      toast.success(`Return request ${status}`);
      fetchReturns();
    } catch (err) {
      toast.error('Failed to update return status');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>Returns Management</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Review and manage customer return requests</p>
        </div>
        <button onClick={fetchReturns} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 20px', fontSize: 13 }}>
          <FiRefreshCcw size={16} /> Refresh
        </button>
      </div>

      <div style={{ 
        background: 'var(--bg2)', 
        borderRadius: 16, 
        border: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>Loading returns...</div>
        ) : returns.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text2)' }}>
            <FiRefreshCcw size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <p>No return requests found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Order ID</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Customer Details</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Items & Reason</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontSize: 13, fontFamily: 'monospace', color: 'var(--text2)', verticalAlign: 'top' }}>
                      #{order._id.slice(-6).toUpperCase()}
                      <div style={{ fontSize: 11, marginTop: 4 }}>
                        Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{order.user?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{order.mobile}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6, maxWidth: 200, lineHeight: 1.4 }}>
                        {order.shippingAddress.street}, {order.shippingAddress.city},<br/>
                        {order.shippingAddress.district}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                      <div style={{ marginBottom: 12 }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: 12, display: 'flex', gap: 8, marginBottom: 4 }}>
                            <span style={{ color: 'var(--text2)' }}>{item.quantity}x</span>
                            <span>{item.name} ({item.size})</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: 'var(--bg3)', padding: '8px 12px', borderRadius: 8, fontSize: 12, borderLeft: '2px solid var(--accent)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Reason:</span>
                        {order.returnReason}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                      <span style={{ 
                        fontSize: 11, padding: '4px 8px', borderRadius: 6, fontWeight: 600,
                        background: order.returnStatus === 'approved' ? 'rgba(110, 207, 110, 0.15)' : 
                                    order.returnStatus === 'rejected' ? 'rgba(224, 82, 82, 0.15)' : 
                                    'rgba(96, 165, 250, 0.15)',
                        color: order.returnStatus === 'approved' ? 'var(--success)' : 
                               order.returnStatus === 'rejected' ? 'var(--danger)' : 
                               '#60a5fa',
                        textTransform: 'capitalize'
                      }}>
                        {order.returnStatus}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                      {order.returnStatus === 'requested' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            onClick={() => handleReturnStatus(order._id, 'approved')} 
                            style={{ padding: '6px 10px', background: 'var(--success)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                            title="Accept Return"
                          >
                            <FiCheck size={14} /> Accept
                          </button>
                          <button 
                            onClick={() => handleReturnStatus(order._id, 'rejected')} 
                            style={{ padding: '6px 10px', background: 'rgba(224, 82, 82, 0.1)', border: '1px solid rgba(224, 82, 82, 0.3)', borderRadius: 6, color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                            title="Reject Return"
                          >
                            <FiX size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
