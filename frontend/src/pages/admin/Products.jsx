import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUpload } from 'react-icons/fi';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountedPrice: '',
    category: 'T-Shirt',
    isNewArrival: true,
    sizes: [
      { size: 'S', quantity: 0 },
      { size: 'M', quantity: 0 },
      { size: 'L', quantity: 0 },
      { size: 'XL', quantity: 0 },
      { size: 'XXL', quantity: 0 },
      { size: 'XXXL', quantity: 0 },
    ],
    images: [],
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const uploadedImages = [];
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post('/products/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImages.push(data.url);
      }
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedImages] }));
      toast.success('Images uploaded');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSizeChange = (sizeLabel, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map(s => s.size === sizeLabel ? { ...s, quantity: parseInt(value) || 0 } : s)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
        toast.success('Product updated');
      } else {
        await api.post('/products', formData);
        toast.success('Product created');
      }
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    
    const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    const mergedSizes = defaultSizes.map(size => {
      const existing = product.sizes.find(s => s.size === size);
      return existing || { size, quantity: 0 };
    });

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discountedPrice: product.discountedPrice,
      category: product.category,
      isNewArrival: product.isNewArrival,
      sizes: mergedSizes,
      images: product.images,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discountedPrice: '',
      category: 'T-Shirt',
      isNewArrival: true,
      sizes: [
        { size: 'S', quantity: 0 },
        { size: 'M', quantity: 0 },
        { size: 'L', quantity: 0 },
        { size: 'XL', quantity: 0 },
        { size: 'XXL', quantity: 0 },
        { size: 'XXXL', quantity: 0 },
      ],
      images: [],
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>Products</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Manage your inventory and product listings</p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiPlus /> Add New Product
        </button>
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
              placeholder="Search products..." 
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
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Stock</th>
                <th style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img 
                        src={product.images[0] ? (product.images[0].startsWith('http') ? product.images[0] : `/api/uploads/${product.images[0]}`) : 'https://placehold.co/40x40?text=NA'} 
                        alt="" 
                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', background: 'var(--bg3)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{product.name}</div>
                        {product.isNewArrival && <span className="badge badge-gold" style={{ marginTop: 4 }}>New Arrival</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text2)' }}>{product.category}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>₹{product.discountedPrice}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', textDecoration: 'line-through' }}>₹{product.price}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {product.sizes.map(s => (
                        <div key={s.size} style={{ 
                          fontSize: 11, 
                          padding: '2px 6px', 
                          background: s.quantity > 0 ? 'rgba(92, 184, 92, 0.1)' : 'rgba(224, 82, 82, 0.1)',
                          color: s.quantity > 0 ? 'var(--success)' : 'var(--danger)',
                          borderRadius: 4,
                          border: `1px solid ${s.quantity > 0 ? 'rgba(92, 184, 92, 0.2)' : 'rgba(224, 82, 82, 0.2)'}`
                        }}>
                          {s.size}: {s.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(product)} style={{ padding: 8, background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text2)', cursor: 'pointer' }}>
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(product._id)} style={{ padding: 8, background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--danger)', cursor: 'pointer' }}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ 
            background: 'var(--bg2)', width: '100%', maxWidth: 860, 
            maxHeight: '90vh', overflowY: 'auto', borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ padding: '32px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '-0.5px' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>Fill in the details to {editingId ? 'update the' : 'create a new'} product catalog.</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="close-btn">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 40 }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
                {/* Left Column: Basic Details */}
                <div>
                  <h4 style={{ fontSize: 16, marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text)' }}>Basic Information</h4>
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="label">Product Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Vintage Denim Jacket" required style={{ background: 'var(--bg3)', padding: '14px 16px', borderRadius: 12 }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="label">Category</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={['T-Shirt', 'Shirt', 'Hoodie', 'Sports wear', 'Accessories'].includes(formData.category) ? formData.category : 'Other'} 
                        onChange={e => setFormData({ ...formData, category: e.target.value })} 
                        style={{ background: 'var(--bg3)', padding: '14px 16px', borderRadius: 12, appearance: 'none', width: '100%', color: 'var(--text)', border: 'none' }}
                      >
                        <option value="T-Shirt">T-Shirt</option>
                        <option value="Shirt">Shirt</option>
                        <option value="Hoodie">Hoodie</option>
                        <option value="Sports wear">Sports wear</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Other">Other</option>
                      </select>
                      <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text2)' }}>▼</div>
                    </div>
                    {(!['T-Shirt', 'Shirt', 'Hoodie', 'Sports wear', 'Accessories'].includes(formData.category)) && (
                      <input 
                        type="text" 
                        placeholder="Enter custom category name" 
                        value={formData.category === 'Other' ? '' : formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        style={{ background: 'var(--bg3)', padding: '14px 16px', borderRadius: 12, width: '100%', marginTop: 12, border: 'none', color: 'var(--text)' }} 
                        required
                        autoFocus
                      />
                    )}
                  </div>
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="label">Description</label>
                    <textarea rows="5" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the product details, fabric, and fit..." style={{ background: 'var(--bg3)', padding: '14px 16px', borderRadius: 12, resize: 'vertical' }}></textarea>
                  </div>
                </div>

                {/* Right Column: Pricing & Options */}
                <div>
                  <h4 style={{ fontSize: 16, marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text)' }}>Pricing & Options</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div className="form-group">
                      <label className="label">Original Price (₹)</label>
                      <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" required style={{ background: 'var(--bg3)', padding: '14px 16px', borderRadius: 12 }} />
                    </div>
                    <div className="form-group">
                      <label className="label">Discounted Price (₹)</label>
                      <input type="number" value={formData.discountedPrice} onChange={e => setFormData({ ...formData, discountedPrice: e.target.value })} placeholder="0.00" required style={{ background: 'var(--bg3)', padding: '14px 16px', borderRadius: 12 }} />
                    </div>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 28 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', background: 'var(--bg3)', padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', transition: 'border-color 0.2s' }} className="toggle-card">
                      <div style={{ position: 'relative', width: 44, height: 24, background: formData.isNewArrival ? 'var(--text)' : 'var(--border)', borderRadius: 20, transition: 'background 0.3s' }}>
                        <div style={{ position: 'absolute', top: 2, left: formData.isNewArrival ? 22 : 2, width: 20, height: 20, background: formData.isNewArrival ? 'var(--bg)' : '#fff', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                      </div>
                      <input type="checkbox" checked={formData.isNewArrival} onChange={e => setFormData({ ...formData, isNewArrival: e.target.checked })} hidden />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Mark as New Arrival</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Highlight this product on the storefront</div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="label" style={{ marginBottom: 12 }}>Stock Management (Sizes)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      {formData.sizes.map(s => (
                        <div key={s.size} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg3)', padding: '8px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ width: 40, fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{s.size}</div>
                          <div style={{ flex: 1, position: 'relative' }}>
                            <input type="number" value={s.quantity} onChange={e => handleSizeChange(s.size, e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', textAlign: 'right', borderRadius: 8, fontSize: 14, fontWeight: 500 }} />
                            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text2)', pointerEvents: 'none' }}>Qty</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Width: Images */}
              <div style={{ marginTop: 48 }}>
                <h4 style={{ fontSize: 16, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text)' }}>Product Images</span>
                  <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 400 }}>Up to 5 images (1080x1080 recommended)</span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                  {formData.images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }} className="img-preview">
                      <img src={img.startsWith('http') ? img : `/api/uploads/${img}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div className="img-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', opacity: 0, transition: 'all 0.2s ease-out', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                        <button type="button" onClick={() => removeImage(idx)} style={{ background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transform: 'scale(0.8)', transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} className="del-btn">
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <label style={{ 
                      aspectRatio: '1/1', border: '2px dashed rgba(255,255,255,0.15)', 
                      borderRadius: 16, display: 'flex', flexDirection: 'column', 
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      color: 'var(--text2)', transition: 'all 0.2s ease-out', background: 'rgba(255,255,255,0.02)'
                    }} className="upload-btn">
                      {uploading ? <div className="spinner"></div> : (
                        <>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: 'var(--text)', transition: 'all 0.2s' }} className="upload-icon">
                            <FiUpload size={20} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Upload Image</span>
                          <span style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>PNG, JPG, WEBP</span>
                        </>
                      )}
                      <input type="file" multiple style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" />
                    </label>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', borderRadius: 14, fontWeight: 600, fontSize: 14, transition: 'all 0.2s' }} className="btn-cancel">Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '16px', background: 'var(--text)', border: 'none', color: 'var(--bg)', borderRadius: 14, fontWeight: 700, fontSize: 14, transition: 'all 0.2s' }} className="btn-save">{editingId ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .close-btn:hover { background: rgba(255,255,255,0.1) !important; color: var(--text) !important; }
        
        .upload-btn:hover { border-color: rgba(255,255,255,0.4) !important; background: rgba(255,255,255,0.05) !important; }
        .upload-btn:hover .upload-icon { background: var(--text) !important; color: var(--bg) !important; transform: translateY(-2px); }
        
        .img-preview:hover .img-overlay { opacity: 1 !important; }
        .img-preview:hover .del-btn { transform: scale(1) !important; }
        .del-btn:hover { background: #ff1a1a !important; transform: scale(1.1) !important; box-shadow: 0 4px 12px rgba(255,26,26,0.4); }
        
        .toggle-card:hover { border-color: rgba(255,255,255,0.2) !important; background: rgba(255,255,255,0.03) !important; }
        
        .btn-cancel:hover { background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.2) !important; }
        .btn-save:hover { transform: translateY(-1px); box-shadow: 0 8px 16px rgba(255,255,255,0.15); background: #f0f0f0 !important; }
        .btn-save:active { transform: translateY(1px); }
        
        .spinner { width: 28px; height: 28px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--text); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        
        /* Smooth transitions for inputs */
        input, select, textarea { transition: all 0.2s ease-in-out !important; }
        input:focus, select:focus, textarea:focus { border-color: rgba(255,255,255,0.4) !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
}
