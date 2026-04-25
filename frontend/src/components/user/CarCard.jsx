import { useState } from 'react';
import styles from './CarCard.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function resolveImg(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  
  const filename = src.split('/').pop();
  return `http://localhost:8000/media/cars/main/${filename}`;
}

function formatPrice(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

function HeartFilled() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--red-primary)" stroke="var(--red-primary)" strokeWidth="2" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function HeartOutline() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function getStockMeta(stock) {
  if (stock === 0) return { label: 'Out of Stock', cls: 'stockOut' };
  if (stock <= 3) return { label: 'Low Stock', cls: 'stockLow' };
  return { label: 'In Stock', cls: 'stockIn' };
}

export default function CarCard({ car, onHeartClick, onCardClick, isWishlisted }) {
  const [imgError, setImgError] = useState(false);
  const isRental = car.category === 'rental';
  const outOfStock = car.stock === 0;
  const stock = getStockMeta(car.stock);
  const imgSrc = resolveImg(car.main_image);

  function handleHeart(e) {
    e.stopPropagation();
    onHeartClick?.(car.id);
  }
  
  return (
    <article
      className={styles.card}
      onClick={() => !outOfStock && onCardClick?.(car)}
      role="button"
      tabIndex={outOfStock ? -1 : 0}
      aria-label={`${car.name} ${car.brand} – ${isRental ? formatPrice(car.daily_rate) + ' per day' : formatPrice(car.purchase_price)}`}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !outOfStock) onCardClick?.(car); }}
    >
      <div className={styles.imageWrap}>
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={`${car.brand} ${car.name}`}
            className={styles.img}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.imgPlaceholder} aria-hidden="true">
            <svg viewBox="0 0 120 60" fill="none" width="80">
              <path d="M10 38 Q15 28 28 22 L40 16 Q60 11 78 16 L95 22 Q108 28 112 38 L114 43 Q100 46 96 46 L24 46 Q6 43 5 43Z" fill="currentColor" opacity="0.15"/>
              <circle cx="30" cy="46" r="9" fill="currentColor" opacity="0.2"/>
              <circle cx="88" cy="46" r="9" fill="currentColor" opacity="0.2"/>
            </svg>
          </div>
        )}
        <button
          className={`${styles.heart} ${isWishlisted ? styles.heartActive : ''}`}
          onClick={handleHeart}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
        >
          {isWishlisted ? <HeartFilled /> : <HeartOutline />}
        </button>
        <span className={styles.categoryBadge}>{isRental ? 'Rent' : 'Sale'}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          <div className={styles.titleRow}>
            <h3 className={styles.name}>{car.name}</h3>
            <span className={styles.brand}>{car.brand}</span>
          </div>
          <span className={styles.year}>{car.model_year}</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.price}>
            {isRental
              ? <>{formatPrice(car.daily_rate)}<span className={styles.perDay}>/day</span></>
              : formatPrice(car.purchase_price)
            }
          </span>
          <span className={`${styles.stockBadge} ${styles[stock.cls]}`}>{stock.label}</span>
        </div>
        <button
          className={styles.viewBtn}
          disabled={outOfStock}
          onClick={(e) => { e.stopPropagation(); onCardClick?.(car); }}
          tabIndex={-1}
          aria-label={`View details for ${car.name}`}
        >
          View Details
        </button>
      </div>
    </article>
  );
}