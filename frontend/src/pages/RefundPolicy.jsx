export default function RefundPolicy() {
  return (
    <div className="container page" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--accent)', marginBottom: 24 }}>Refund Policy</h1>

      <div style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.8 }}>
        <p style={{ marginBottom: 16 }}>
          <strong>Returns & Exchanges</strong><br />
          We offer a <strong>4-day return policy</strong> after the product has been delivered. If you wish to return a product, you can initiate a return request from your account profile within 4 days of delivery. Please provide a reason for your return. After 4 days, all sales are final.
        </p>

        <p style={{ marginBottom: 16 }}>
          <strong>Support</strong><br />
          If you received a defective or incorrect item, please contact us at <strong>oddlymenswear@gmail.com</strong> with your order number and photos of the issue, and we will make it right.
        </p>
      </div>
    </div>
  );
}
