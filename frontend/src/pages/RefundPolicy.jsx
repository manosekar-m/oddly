export default function RefundPolicy() {
  return (
    <div className="container page" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--accent)', marginBottom: 24 }}>Refund Policy</h1>

      <div style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.8 }}>
        <p style={{ marginBottom: 16 }}>
          <strong>Returns & Exchanges</strong><br />
          Please note that there are <strong>no returns</strong> once a product is purchased. All sales are final. We encourage you to carefully review your order before completing your purchase.
        </p>

        <p style={{ marginBottom: 16 }}>
          <strong>Support</strong><br />
          If you received a defective or incorrect item, please contact us at <strong>oddlymenswear@gmail.com</strong> with your order number and photos of the issue, and we will make it right.
        </p>
      </div>
    </div>
  );
}
