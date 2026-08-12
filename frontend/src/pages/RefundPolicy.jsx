export default function RefundPolicy() {
  return (
    <div className="container page" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--accent)', marginBottom: 24 }}>Refund Policy</h1>

      <div style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.8 }}>
        <p style={{ marginBottom: 16 }}>
          <strong>Returns & Exchanges</strong><br />
          We want you to be completely satisfied with your purchase from ODDLY. We accept returns and exchanges within 7 days of order delivery. The items must be unused, unwashed, and in their original condition with all tags attached.
        </p>

        <p style={{ marginBottom: 16 }}>
          <strong>Refunds</strong><br />
          Once your return is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds will be processed and automatically applied to your original method of payment within 5-7 business days.
        </p>

        <p style={{ marginBottom: 16 }}>
          <strong>How to Initiate a Return</strong><br />
          To initiate a return or exchange, please contact us at <strong>support@oddly.in</strong> with your order number and reason for return.
        </p>
      </div>
    </div>
  );
}
