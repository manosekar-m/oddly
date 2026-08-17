import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiEye, FiSearch, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/admin/all');
      setOrders(data);
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { orderStatus: status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
      if (selectedOrder?._id === id) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: status }));
      }
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const updatePaymentStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/payment`, { paymentStatus: status });
      toast.success(`Payment marked as ${status}`);
      fetchOrders();
      if (selectedOrder?._id === id) {
        setSelectedOrder(prev => ({ ...prev, paymentStatus: status }));
      }
    } catch (err) {
      toast.error('Payment update failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': case 'paid': return 'var(--success)';
      case 'cancelled': case 'failed': return 'var(--danger)';
      case 'shipped': return '#3498db';
      case 'processing': return '#f39c12';
      default: return 'var(--accent)';
    }
  };

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.mobile?.includes(search)
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>Orders</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Track and manage customer orders</p>
      </div>

      <div style={{ 
        background: 'var(--bg2)', 
        borderRadius: 16, 
        border: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
            <input 
              type="text" 
              placeholder="Search by Order ID, Customer Name or Mobile..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 40, background: 'var(--bg3)', border: 'none' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Order ID</th>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Payment</th>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontFamily: 'monospace', color: 'var(--text2)' }}>
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{order.user?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{order.mobile}</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600 }}>₹{order.totalAmount}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      fontSize: 11, padding: '2px 8px', borderRadius: 4, 
                      background: `${getStatusColor(order.paymentStatus)}15`, 
                      color: getStatusColor(order.paymentStatus),
                      border: `1px solid ${getStatusColor(order.paymentStatus)}30`,
                      textTransform: 'capitalize'
                    }}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      fontSize: 11, padding: '2px 8px', borderRadius: 4, 
                      background: `${getStatusColor(order.orderStatus)}15`, 
                      color: getStatusColor(order.orderStatus),
                      border: `1px solid ${getStatusColor(order.orderStatus)}30`,
                      textTransform: 'capitalize'
                    }}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button onClick={() => setSelectedOrder(order)} style={{ padding: 8, background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text2)', cursor: 'pointer' }}>
                      <FiEye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20
        }}>
          <div style={{ 
            background: 'var(--bg2)', width: '100%', maxWidth: 900, 
            maxHeight: '90vh', overflowY: 'auto', borderRadius: 20,
            border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1.5fr 1fr'
          }}>
            <div style={{ padding: 32, borderRight: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Order Details</h3>
                <span style={{ color: 'var(--text2)', fontSize: 14 }}>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
              </div>

              <div style={{ marginBottom: 32 }}>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 16 }}>Items</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 16, marginBottom: 16, background: 'var(--bg3)', padding: 12, borderRadius: 12 }}>
                    <img 
                      src={item.image ? (item.image.startsWith('http') ? item.image : `/api/uploads/${item.image}`) : 'https://placehold.co/50x50'} 
                      alt="" 
                      style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Size: {item.size} | Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div>
                  <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 12 }}>Shipping Address</h4>
                  <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
                    {selectedOrder.shippingAddress.street}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.district}<br />
                    {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}<br />
                    <strong>Mobile:</strong> {selectedOrder.mobile}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 12 }}>Payment Info</h4>
                  <div style={{ fontSize: 14, color: 'var(--text)' }}>
                    Method: {selectedOrder.paymentMethod}<br />
                    Transaction ID: {selectedOrder.transactionId || 'N/A'}<br />
                    Payment Status: <strong style={{ color: getStatusColor(selectedOrder.paymentStatus) }}>{selectedOrder.paymentStatus.toUpperCase()}</strong>
                  </div>
                  {selectedOrder.coupon && (
                    <div style={{ marginTop: 12, fontSize: 13, color: '#6ecf6e', fontWeight: 600 }}>
                      Coupon Used: {selectedOrder.coupon.code}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: 32, background: 'rgba(255,255,255,0.01)' }}>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}
              >
                <FiXCircle size={24} />
              </button>

              <div style={{ marginBottom: 40 }}>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 20 }}>Payment Verification</h4>
                {selectedOrder.paymentScreenshot ? (
                  <div style={{ marginBottom: 16 }}>
                    <label className="label">Screenshot</label>
                    <img 
                      src={selectedOrder.paymentScreenshot.startsWith('http') ? selectedOrder.paymentScreenshot : `/api/uploads/${selectedOrder.paymentScreenshot}`} 
                      alt="Payment" 
                      onClick={() => setExpandedImage(selectedOrder.paymentScreenshot.startsWith('http') ? selectedOrder.paymentScreenshot : `/api/uploads/${selectedOrder.paymentScreenshot}`)}
                      style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer' }}
                    />
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>No screenshot uploaded</p>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button onClick={() => updatePaymentStatus(selectedOrder._id, 'paid')} className="btn-primary" style={{ height: 38, padding: 0, fontSize: 13, background: 'var(--success)' }}>Mark Paid</button>
                  <button onClick={() => updatePaymentStatus(selectedOrder._id, 'failed')} className="btn-danger" style={{ height: 38, padding: 0, fontSize: 13 }}>Mark Failed</button>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 20 }}>Update Order Status</h4>
                <div style={{ display: 'grid', gap: 8 }}>
                  {[
                    { status: 'processing', icon: <FiClock />, label: 'Processing' },
                    { status: 'shipped', icon: <FiTruck />, label: 'Shipped' },
                    { status: 'delivered', icon: <FiCheckCircle />, label: 'Delivered' },
                    { status: 'cancelled', icon: <FiXCircle />, label: 'Cancelled' },
                  ].map(step => (
                    <button 
                      key={step.status}
                      onClick={() => updateOrderStatus(selectedOrder._id, step.status)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: 12, padding: 12, 
                        background: selectedOrder.orderStatus === step.status ? 'rgba(232, 201, 126, 0.1)' : 'var(--bg3)',
                        border: '1px solid',
                        borderColor: selectedOrder.orderStatus === step.status ? 'var(--accent)' : 'var(--border)',
                        borderRadius: 12, color: selectedOrder.orderStatus === step.status ? 'var(--accent)' : 'var(--text)',
                        cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      {step.icon}
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{step.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-size Image Modal */}
      {expandedImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, cursor: 'pointer'
        }} onClick={() => setExpandedImage(null)}>
          <img 
            src={expandedImage} 
            alt="Expanded Payment" 
            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }}
          />
          <button 
            onClick={() => setExpandedImage(null)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <FiXCircle size={32} />
          </button>
        </div>
      )}
    </div>
  );
}
