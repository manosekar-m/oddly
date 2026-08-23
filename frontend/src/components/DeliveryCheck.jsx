import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FiMapPin, FiTruck, FiAlertCircle } from 'react-icons/fi';

export default function DeliveryCheck({ cartValue, totalItems = 1, paymentMethod = 'Prepaid', onResult = () => {}, initialPincode = '' }) {
  const [pincode, setPincode] = useState(initialPincode || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [hasAutoChecked, setHasAutoChecked] = useState(false);

  const performCheck = async (pinToCheck) => {
    if (pinToCheck.length !== 6 || !/^\d+$/.test(pinToCheck)) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/delivery/check', {
        pincode: pinToCheck,
        cartValue,
        totalItems,
        paymentMethod
      });
      setResult(res.data);
      onResult({ pincode: pinToCheck, ...res.data });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to check delivery. Please try again.');
      }
      setResult(null);
      onResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (e) => {
    e.preventDefault();
    performCheck(pincode);
  };

  useEffect(() => {
    if (initialPincode && initialPincode.length === 6 && !hasAutoChecked) {
      setPincode(initialPincode);
      performCheck(initialPincode);
      setHasAutoChecked(true);
    } else if (result && result.serviceable) {
      // Re-run the check automatically if cart value, items, or payment method changes
      performCheck(pincode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartValue, totalItems, paymentMethod, initialPincode]);

  return (
    <div className="delivery-check-widget">
      <h4><FiMapPin /> Delivery Options</h4>
      <form onSubmit={handleCheck} className="pincode-form">
        <input 
          type="text" 
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit Pincode"
          disabled={loading}
        />
        <button type="submit" disabled={loading || pincode.length !== 6} className="btn-check">
          {loading ? 'Checking...' : 'Check'}
        </button>
      </form>

      {error && (
        <div className="delivery-msg error">
          <FiAlertCircle /> {error}
        </div>
      )}

      {result && result.serviceable && (
        <div className="delivery-msg success">
          <div className="delivery-detail">
            <FiTruck /> <span>{result.message}</span>
          </div>
          <div className="delivery-detail highlight">
            <span>Shipping Cost:</span> 
            <strong>{result.freeShippingApplied ? 'FREE' : `₹${result.shippingCost}`}</strong>
          </div>
          {result.codCharge > 0 && paymentMethod === 'COD' && (
            <div className="delivery-detail text-sm">
              <span>COD Charge applied:</span> <span>₹{result.codCharge}</span>
            </div>
          )}
          {!result.codAvailable && paymentMethod === 'COD' && (
            <div className="delivery-msg error" style={{marginTop: '10px'}}>
              <FiAlertCircle /> COD is not available for this location. Please switch to Prepaid.
            </div>
          )}
        </div>
      )}

      <style>{`
        .delivery-check-widget {
          margin: 20px 0;
          padding: 20px;
          border: 1px solid var(--border);
          background: rgba(20, 20, 20, 0.4);
        }
        .delivery-check-widget h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px 0;
          font-family: var(--font-display);
          font-size: 14px;
          letter-spacing: 1px;
          color: var(--accent);
          text-transform: uppercase;
        }
        .pincode-form {
          display: flex;
          gap: 10px;
          margin-bottom: 12px;
        }
        .pincode-form input {
          flex: 1;
          padding: 12px 16px;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 14px;
          transition: border-color 0.3s;
        }
        .pincode-form input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .btn-check {
          padding: 0 24px;
          background: var(--accent);
          color: #000;
          border: none;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-check:hover:not(:disabled) {
          background: #fff;
        }
        .btn-check:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .delivery-msg {
          padding: 12px;
          font-size: 13px;
          border-left: 3px solid;
          margin-top: 12px;
        }
        .delivery-msg.error {
          border-color: var(--danger);
          background: rgba(255, 51, 51, 0.1);
          color: #ff8888;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .delivery-msg.success {
          border-color: var(--success);
          background: rgba(51, 204, 51, 0.05);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .delivery-detail {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--text);
        }
        .delivery-detail span:first-child {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text2);
        }
        .delivery-detail.highlight strong {
          color: var(--accent);
          font-size: 15px;
        }
        .text-sm {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
