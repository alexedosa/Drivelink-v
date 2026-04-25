import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CarModal.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function resolveImageUrl(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  const base = API_BASE.replace('/api', '');
  const cleanSrc = src.replace(/^\/?media\//, '');
  return `${base}/media/${cleanSrc}`;
}

function formatPrice(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(a, b) {
  if (!a || !b) return 0;
  const diff = new Date(b) - new Date(a);
  return Math.max(0, Math.floor(diff / 86400000));
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SpecItem({ label, value }) {
  return (
    <div className={styles.specItem}>
      <span className={styles.specLabel}>{label}</span>
      <span className={styles.specValue}>{value || '—'}</span>
    </div>
  );
}

export default function CarModal({ car, isOpen, onClose, category }) {
  const navigate = useNavigate();
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  const isRental = (category || car?.category) === 'rental';

  /* gallery - FIXED: resolve image URLs */
  const images = car
    ? [resolveImageUrl(car.main_image), ...(car.gallery_images || []).map(resolveImageUrl)].filter(Boolean)
    : [];
  const [activeImg, setActiveImg] = useState(0);

  /* rental widget */
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const days = daysBetween(startDate, endDate);
  const rentalTotal = days * (car?.daily_rate || 0);

  /* purchase widget */
  const [qty, setQty] = useState(1);
  const purchaseTotal = qty * (car?.purchase_price || 0);

  /* description expand */
  const [expanded, setExpanded] = useState(false);

  /* reset on open */
  useEffect(() => {
    if (isOpen) {
      setActiveImg(0);
      setStartDate('');
      setEndDate('');
      setQty(1);
      setExpanded(false);
    }
  }, [isOpen, car?.id]);

  /* ESC to close */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /* lock scroll */
  useEffect(() => {
    document.body.classList.toggle('no-scroll', isOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [isOpen]);

  /* focus trap */
  useEffect(() => {
    if (isOpen) modalRef.current?.focus();
  }, [isOpen]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  function handleCheckout() {
    if (isRental) {
      navigate(`/checkout/${car.id}`, {
        state: { car, startDate, endDate, days, total: rentalTotal, type: 'rental' },
      });
    } else {
      navigate(`/checkout/${car.id}`, {
        state: { car, quantity: qty, total: purchaseTotal, type: 'purchase' },
      });
    }
    onClose();
  }

  if (!isOpen || !car) return null;

  const outOfStock = car.stock === 0;
  const descPreview = (car.description || '').slice(0, 160);
  const hasMore = (car.description || '').length > 160;
  const canCheckout = isRental ? days > 0 : qty > 0 && !outOfStock;
  
  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`${car.name} details`}
    >
      <div
        ref={modalRef}
        className={styles.modal}
        tabIndex={-1}
      >
        {/* Close btn */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <CloseIcon />
        </button>

        <div className={styles.grid}>
          {/* ── Left: Gallery ── */}
          <div className={styles.gallery}>
            <div className={styles.mainImgWrap}>
              {images.length > 0 ? (
                <img
                  src={images[activeImg]}
                  alt={`${car.brand} ${car.name} – view ${activeImg + 1}`}
                  className={styles.mainImg}
                />
              ) : (
                /* car-placeholder-image: luxury vehicle studio shot */
                <div className={styles.imgPlaceholder} aria-hidden="true">
                  <svg viewBox="0 0 200 100" fill="none" width="120">
                    <path d="M20 72 Q25 55 42 45 L60 32 Q90 22 120 28 L150 38 Q170 48 178 68 L180 76 H18Z" fill="currentColor" opacity="0.12"/>
                    <circle cx="52" cy="76" r="16" fill="currentColor" opacity="0.18"/>
                    <circle cx="148" cy="76" r="16" fill="currentColor" opacity="0.18"/>
                  </svg>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className={styles.thumbStrip} role="list" aria-label="Image thumbnails">
                {images.map((src, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                    role="listitem"
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info + Booking ── */}
          <div className={styles.info}>
            {/* Header */}
            <div className={styles.infoHeader}>
              <div>
                <h2 className={styles.carTitle}>
                  {car.name} <span className={styles.carBrand}>{car.brand}</span>
                </h2>
                <span className={styles.carYear}>{car.model_year}</span>
              </div>
              <div className={styles.priceBlock}>
                <span className={styles.price}>
                  {isRental
                    ? <>{formatPrice(car.daily_rate)}<span className={styles.perDay}>/day</span></>
                    : formatPrice(car.purchase_price)
                  }
                </span>
                <span className={`${styles.stockDot} ${outOfStock ? styles.dotRed : styles.dotGreen}`} aria-hidden="true" />
                <span className={styles.stockLabel}>
                  {outOfStock ? 'Out of Stock' : `${car.stock} available`}
                </span>
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className={styles.desc}>
                <p>
                  {expanded ? car.description : descPreview}
                  {hasMore && !expanded && '…'}
                </p>
                {hasMore && (
                  <button className={styles.expandBtn} onClick={() => setExpanded((p) => !p)}>
                    {expanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Specs */}
            <div className={styles.specs} aria-label="Car specifications">
              <SpecItem label="Fuel Type"    value={car.fuel_type} />
              <SpecItem label="Transmission" value={car.transmission} />
              <SpecItem label="Seats"        value={car.seats} />
              <SpecItem label="Color"        value={car.color} />
              <SpecItem label="Category"     value={isRental ? 'For Rent' : 'For Sale'} />
              <SpecItem label="Year"         value={car.model_year} />
            </div>

            <div className={styles.divider} />

            {/* ── Booking widget ── */}
            {isRental ? (
              <div className={styles.widget} aria-label="Rental booking">
                <h3 className={styles.widgetTitle}>Book this Car</h3>
                <div className={styles.dateRow}>
                  <div className={styles.dateGroup}>
                    <label htmlFor="startDate" className={styles.dateLabel}>Start Date</label>
                    <input
                      id="startDate"
                      type="date"
                      className={styles.dateInput}
                      min={todayStr()}
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (endDate && e.target.value >= endDate) setEndDate('');
                      }}
                    />
                  </div>
                  <div className={styles.dateGroup}>
                    <label htmlFor="endDate" className={styles.dateLabel}>End Date</label>
                    <input
                      id="endDate"
                      type="date"
                      className={styles.dateInput}
                      min={startDate || todayStr()}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={!startDate}
                    />
                  </div>
                </div>
                {days > 0 && (
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>{days} day{days !== 1 ? 's' : ''} × {formatPrice(car.daily_rate)}</span>
                    <span className={styles.totalAmount}>{formatPrice(rentalTotal)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.widget} aria-label="Purchase booking">
                <h3 className={styles.widgetTitle}>Purchase</h3>
                <div className={styles.qtyRow}>
                  <span className={styles.qtyLabel}>Quantity</span>
                  <div className={styles.qtyControl}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => setQty((p) => Math.max(1, p - 1))}
                      disabled={qty <= 1}
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className={styles.qtyVal} aria-live="polite">{qty}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => setQty((p) => Math.min(car.stock, p + 1))}
                      disabled={qty >= car.stock || outOfStock}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                </div>
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>{qty} × {formatPrice(car.purchase_price)}</span>
                  <span className={styles.totalAmount}>{formatPrice(purchaseTotal)}</span>
                </div>
              </div>
            )}

            <button
              className={styles.checkoutBtn}
              onClick={handleCheckout}
              disabled={!canCheckout}
              aria-label="Proceed to checkout"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}