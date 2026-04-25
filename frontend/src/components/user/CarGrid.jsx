import CarCard from './CarCard';
import styles from './CarGrid.module.css';

/* ── Skeleton card ───────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.skeletonImg} />
      <div className={styles.skeletonBody}>
        <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonSub}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonPrice}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonBtn}`} />
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyState({ onClear }) {
  return (
    <div className={styles.empty} role="status" aria-live="polite">
      <div className={styles.emptyIcon} aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="32" fill="var(--bg-tertiary)" />
          <path d="M20 36 Q22 28 28 24 L32 20 Q36 18 40 20 L46 24 Q50 28 46 36 L44 40 H20 Z" fill="var(--border-medium)" />
          <circle cx="25" cy="40" r="4" fill="var(--border-dark)" />
          <circle cx="41" cy="40" r="4" fill="var(--border-dark)" />
          <line x1="12" y1="12" x2="52" y2="52" stroke="var(--red-primary)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className={styles.emptyTitle}>No cars found</h3>
      <p className={styles.emptyMsg}>Try adjusting your filters or search term</p>
      {onClear && (
        <button className={styles.clearBtn} onClick={onClear}>
          Clear all filters
        </button>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function CarGrid({
  cars = [],
  loading = false,
  wishlist = [],
  onCarClick,
  onHeartClick,
  onClearFilters,
}) {
  if (loading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="Loading cars">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (cars.length === 0) {
    return <EmptyState onClear={onClearFilters} />;
  }

  return (
    <div
      className={styles.grid}
      role="list"
      aria-label={`${cars.length} cars available`}
    >
      {cars.map((car, i) => (
        <div
          key={car.id}
          role="listitem"
          style={{ animationDelay: `${i * 0.05}s` }}
          className={styles.gridItem}
        >
          <CarCard
            car={car}
            isWishlisted={wishlist.includes(car.id)}
            onCardClick={onCarClick}
            onHeartClick={onHeartClick}
          />
        </div>
      ))}
    </div>
  );
}