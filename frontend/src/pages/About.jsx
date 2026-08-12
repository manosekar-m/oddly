import { motion } from 'framer-motion';

export default function About() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div style={{ background: 'linear-gradient(135deg, #0e0e0e, #1a1500)', padding: '150px 0 80px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <motion.div 
          className="container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, marginBottom: 16, color: 'var(--accent)' }}>About ODDLY</h1>
          <p style={{ color: 'var(--text2)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>Redefining casual wear with premium craftsmanship</p>
        </motion.div>
      </div>
      <div className="container page">
        <motion.div 
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 60 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
        >
          {[
            { icon: '🧵', title: 'Premium Fabric', desc: 'We source only the finest 100% combed cotton for softness that lasts through hundreds of washes.' },
            { icon: '🎨', title: 'Unique Designs', desc: 'Every design is crafted by independent artists. You wear art, not just fabric.' },
            { icon: '🌱', title: 'Sustainable', desc: 'Our packaging is 100% recyclable and we offset our carbon footprint on every order.' },
            { icon: '⚡', title: 'Fast Delivery', desc: 'Orders dispatched within 24 hours. Free shipping on all orders across India.' },
          ].map((item, i) => (
            <div 
              key={item.title} 
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 32 }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 10 }}>{item.title}</h3>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </motion.div>
        <motion.div 
          style={{ textAlign: 'center', padding: '40px 0' }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 16 }}>Our Story</h2>
          <p style={{ color: 'var(--text2)', maxWidth: 720, margin: '0 auto', fontSize: 15, lineHeight: 1.9 }}>
            ODDLY was born in 2026 from a simple belief: everyday wear should feel extraordinary. We started as a small team of designers and fabric enthusiasts, sourcing the best cotton from farms across India and collaborating with emerging artists to create designs that spark conversation.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
