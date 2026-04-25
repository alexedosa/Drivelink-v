import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentsService } from '../services/payments';
import styles from './PaymentCallback.module.css';

export default function PaymentCallback() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const reference  = params.get('reference') || params.get('trxref');

  const [status, setStatus] = useState('verifying'); // verifying | success | failed
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!reference) { setStatus('failed'); setMessage('No payment reference found.'); return; }
    paymentsService.verify(reference)
      .then(({ data }) => {
        if (data.status === 'success') {
          setStatus('success');
          setOrderId(data.order_id || reference);
        } else {
          setStatus('failed');
          setMessage(data.message || 'Payment could not be verified.');
        }
      })
      .catch(() => { setStatus('failed'); setMessage('Verification failed. Please contact support.'); });
  }, [reference]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {status === 'verifying' && (
          <div className={styles.section} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <h2 className={styles.heading}>Verifying your payment…</h2>
            <p className={styles.sub}>Please wait. Do not close this page.</p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.section} role="status" aria-live="polite">
            <div className={styles.iconWrap} aria-hidden="true">
              <div className={styles.successCircle}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
            <h2 className={styles.heading}>Payment Successful!</h2>
            <p className={styles.sub}>Your order has been confirmed and is being processed.</p>
            {orderId && (
              <div className={styles.orderBadge}>
                <span className={styles.orderLabel}>Order Reference</span>
                <span className={styles.orderId}>{orderId}</span>
              </div>
            )}
            <div className={styles.actions}>
              <button className={styles.primaryBtn} onClick={() => navigate('/profile?tab=orders')}>
                View My Orders
              </button>
              <button className={styles.secondaryBtn} onClick={() => navigate('/home')}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className={styles.section} role="alert">
            <div className={styles.iconWrap} aria-hidden="true">
              <div className={styles.failCircle}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
            </div>
            <h2 className={styles.heading}>Payment Failed</h2>
            <p className={styles.sub}>{message || 'Something went wrong with your payment.'}</p>
            <div className={styles.actions}>
              <button className={styles.primaryBtn} onClick={() => navigate(-2)}>
                Retry Payment
              </button>
              <button className={styles.secondaryBtn} onClick={() => navigate('/home')}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}