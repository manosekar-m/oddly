import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiMapPin, FiSend, FiInstagram, FiTwitter } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user && !form.name && !form.email) {
      setForm(prev => ({ ...prev, name: user.name || '', email: user.email || '' }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Please fill all required fields');
    setSending(true);
    try {
      await api.post('/queries', form);
      toast.success("Message sent! We'll get back to you soon. 🎉");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container page">
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: 'var(--accent)', textTransform: 'uppercase' }}>Get In Touch</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 52px)', margin: '12px 0 16px' }}>Contact Us</h1>
        <p style={{ color: 'var(--text2)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Have a question, feedback, or just want to say hello? We'd love to hear from you.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 40, alignItems: 'start' }}>

        {/* Left — Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { icon: <FiMail size={22} />, label: 'Email Us', value: 'oddlymenswear@gmail.com', sub: 'We reply within 24 hours' },
            { icon: <FiPhone size={22} />, label: 'Call Us', value: '+91 63798 33844', sub: 'Mon–Sat, 10am–6pm IST' },
            { icon: <FiMapPin size={22} />, label: 'Visit Us', value: 'Tamil Nadu, India', sub: 'ODDLY HQ' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start',
              transition: 'border-color 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(232,201,126,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(232,201,126,0.1)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{item.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{item.sub}</div>
              </div>
            </div>
          ))}

          {/* Social links */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Follow Us</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { icon: <FiInstagram size={18} />, label: 'Instagram', href: 'https://www.instagram.com/oddly_wear/' },
                { icon: <FiTwitter size={18} />, label: 'Twitter', href: '#' },
              ].map(s => (
                <a key={s.label} href={s.href} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px 16px', fontSize: 13,
                  color: 'var(--text2)', fontWeight: 500, transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Contact Form */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: 36 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 28 }}>Send a Message</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label">Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
              </div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label">Subject</label>
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Order issue, feedback, etc." />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label">Message *</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us how we can help you..."
                required
                style={{ resize: 'vertical' }}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={sending} style={{ padding: '14px 28px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
              <FiSend size={16} />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media(max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1.4fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
