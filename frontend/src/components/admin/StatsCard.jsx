import styles from './StatsCard.module.css';

const COLOR_MAP = {
  red:    { bg: 'var(--red-soft)',      color: 'var(--red-primary)' },
  green:  { bg: 'var(--success-soft)', color: 'var(--success)' },
  blue:   { bg: 'var(--info-soft)',    color: 'var(--info)' },
  yellow: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
};

function TrendUp() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  );
}

function TrendDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

export default function StatsCard({ title, value, icon, trend, color = 'red' }) {
  const theme = COLOR_MAP[color] || COLOR_MAP.red;
  const isPositive = trend >= 0;

  function formatValue(val) {
    if (typeof val === 'number' && val >= 1000) {
      return new Intl.NumberFormat('en-NG', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(val);
    }
    return val;
  }

  return (
    <article
      className={styles.card}
      aria-label={`${title}: ${formatValue(value)}${trend != null ? `, ${isPositive ? '+' : ''}${trend}% vs last month` : ''}`}
    >
      <div className={styles.left}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>{formatValue(value)}</span>

        {trend != null && (
          <div
            className={`${styles.trend} ${isPositive ? styles.trendUp : styles.trendDown}`}
            aria-label={`${isPositive ? 'Up' : 'Down'} ${Math.abs(trend)}% vs last month`}
          >
            {isPositive ? <TrendUp /> : <TrendDown />}
            <span>{Math.abs(trend)}%</span>
            <span className={styles.trendLabel}>vs last month</span>
          </div>
        )}
      </div>

      <div
        className={styles.iconWrap}
        style={{ background: theme.bg, color: theme.color }}
        aria-hidden="true"
      >
        {icon}
      </div>
    </article>
  );
}