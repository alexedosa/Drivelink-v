import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { initializePayment } from '../services/payments';
import { useAuth } from '../context/AuthContext';
import styles from './Checkout.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function resolveImg(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  const base = API_BASE.replace('/api', '');
  const cleanSrc = src.replace(/^\/?media\//, '');
  return `${base}/media/${cleanSrc}`;
}

function fmt(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);
}

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [insurance, setInsurance] = useState(false);
  const [delivery, setDelivery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!state?.car) {
    return (
      <div className={styles.empty}>
        <h2>No order data found.</h2>
        <button onClick={() => navigate('/home')} className={styles.backBtn}>Back to Home</button>
      </div>
    );
  }

  const { car, type, startDate, endDate, days, quantity, total } = state;
  const isRental = type === 'rental';

  const INSURANCE_RATE = 5000;
  const DELIVERY_RATE = 15000;
  const addons = (isRental && insurance ? INSURANCE_RATE : 0) + (!isRental && delivery ? DELIVERY_RATE : 0);
  const grandTotal = total + addons;

  async function handlePay() {
    setLoading(true);
    setError('');
    try {
      let payload;
      if (isRental) {
        // First create rental, then initialize payment with booking_id
        const rentalRes = await api.post('/rentals/create/', {
          car_id: car.id,
          start_date: startDate,
          end_date: endDate
        });
        payload = { booking_id: rentalRes.data.id };
      } else {
        const purchaseRes = await api.post('/purchases/create/', {
          car_id: car.id,
          quantity: quantity
        });
        payload = { purchase_id: purchaseRes.data.id };
      }

      const data = await initializePayment(payload);
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setError('Could not get payment URL. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment initialization failed.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className={styles.page}>
      {/* Back link */}
      <div className={styles.topBar}>
        <button className={styles.backLink} onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h1 className={styles.pageTitle}>Checkout</h1>
      </div>

      <div className={styles.content}>
        {/* Order summary */}
        <section className={styles.summary} aria-labelledby="summary-heading">
          <h2 id="summary-heading" className={styles.sectionTitle}>Order Summary</h2>

          <div className={styles.carRow}>
            <div className={styles.carImgWrap}>
              {car.main_image ? (
                <img src={resolveImg(car.main_image)} alt={`${car.brand} ${car.name}`} className={styles.carImg} />
              ) : (
                <div className={styles.carImgPlaceholder} aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                </div>
              )}
            </div>
            <div className={styles.carInfo}>
              <h3 className={styles.carName}>{car.name}</h3>
              <p className={styles.carMeta}>{car.brand} · {car.model_year}</p>
              <span className={`${styles.typeBadge} ${isRental ? styles.typRent : styles.typBuy}`}>
                {isRental ? 'Rental' : 'Purchase'}
              </span>
            </div>
          </div>

          <div className={styles.lineItems}>
            {isRental ? (
              <>
                <LineItem label="Start Date" value={startDate} />
                <LineItem label="End Date" value={endDate} />
                <LineItem label="Duration" value={`${days} day${days !== 1 ? 's' : ''}`} />
                <LineItem label="Daily Rate" value={fmt(car.daily_rate)} />
                <LineItem label="Subtotal" value={fmt(total)} bold />
              </>
            ) : (
              <>
                <LineItem label="Unit Price" value={fmt(car.purchase_price)} />
                <LineItem label="Quantity" value={quantity} />
                <LineItem label="Subtotal" value={fmt(total)} bold />
              </>
            )}
          </div>

          {/* Add-ons */}
          <div className={styles.addons}>
            <h3 className={styles.addonsTitle}>Optional Add-ons</h3>
            {isRental && (
              <label className={styles.addonItem}>
                <input type="checkbox" checked={insurance} onChange={(e) => setInsurance(e.target.checked)} className={styles.addonCheck} />
                <div className={styles.addonInfo}>
                  <span className={styles.addonLabel}>Rental Insurance</span>
                  <span className={styles.addonDesc}>Comprehensive cover for the rental period</span>
                </div>
                <span className={styles.addonPrice}>{fmt(INSURANCE_RATE)}</span>
              </label>
            )}
            {!isRental && (
              <label className={styles.addonItem}>
                <input type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} className={styles.addonCheck} />
                <div className={styles.addonInfo}>
                  <span className={styles.addonLabel}>Home Delivery</span>
                  <span className={styles.addonDesc}>Delivered to your address within Lagos</span>
                </div>
                <span className={styles.addonPrice}>{fmt(DELIVERY_RATE)}</span>
              </label>
            )}
          </div>

          {addons > 0 && <LineItem label="Add-ons" value={fmt(addons)} />}

          <div className={styles.grandTotal}>
            <span>Total</span>
            <span className={styles.grandAmount}>{fmt(grandTotal)}</span>
          </div>
        </section>

        {/* Payment */}
        <section className={styles.payment} aria-labelledby="payment-heading">
          <h2 id="payment-heading" className={styles.sectionTitle}>Payment</h2>

          <div className={styles.customerCard}>
            <div className={styles.customerAvatar}>{user?.first_name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <p className={styles.customerName}>{user?.first_name} {user?.last_name}</p>
              <p className={styles.customerEmail}>{user?.email}</p>
            </div>
          </div>

          <div className={styles.payInfo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <p>You will be redirected to Paystack's secure payment page to complete your payment.</p>
          </div>

          {error && <div className={styles.errorBanner} role="alert">{error}</div>}

          <div className={styles.orderTotal}>
            <span>Order Total</span>
            <span className={styles.orderAmount}>{fmt(grandTotal)}</span>
          </div>

          <button className={styles.payBtn} onClick={handlePay} disabled={loading} aria-busy={loading}>
            {loading
              ? <span className={styles.spinner} aria-hidden="true" />
              : <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Pay with Paystack
              </>
            }
          </button>

          <p className={styles.payNote}>Secured by Paystack · 256-bit SSL</p>
        </section>
      </div>
    </div>
  );
}

function LineItem({ label, value, bold }) {
  return (
    <div className={`${bold ? 'line-bold' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: bold ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: bold ? 700 : 400 }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}