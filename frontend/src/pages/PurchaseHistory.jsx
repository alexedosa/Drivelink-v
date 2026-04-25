import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchasesService } from '../services/purchases';
import UserNavbar from '../components/user/UserNavbar';
import Footer from '../components/common/Footer';
import styles from './History.module.css';

function fmt(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);
}

function StatusBadge({ status }) {
  const cls = { confirmed: 'green', pending: 'yellow', cancelled: 'red', failed: 'red' }[status] || 'gray';
  return <span className={`${styles.badge} ${styles['badge' + cls.charAt(0).toUpperCase() + cls.slice(1)]}`}>{status}</span>;
}

function TableSkeleton() {
  return (
    <div className={styles.skeletonWrap}>
      {[1,2,3].map(i => <div key={i} className={styles.skeletonRow} />)}
    </div>
  );
}

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  const loadPurchases = async () => {
    try {
      const response = await purchasesService.getMy();
      setPurchases(response.data.results || response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  return (
    <div className={styles.page}>
      <UserNavbar activeTab="buy" />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Purchases</h1>
          <p className={styles.subtitle}>View and track your car purchase history.</p>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : purchases.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className={styles.emptyIcon}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h3>No purchased cars yet</h3>
            <p>You haven't made any car purchases.</p>
            <button className={styles.browseBtn} onClick={() => navigate('/home?tab=buy')}>Browse Cars</button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Car</th><th>Qty</th><th>Total</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr className={styles.tableRow} onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                      <td><span className={styles.carName}>{p.car_name || p.car}</span></td>
                      <td className={styles.tdMuted}>{p.quantity}</td>
                      <td className={styles.tdPrice}>{fmt(p.total_amount)}</td>
                      <td><StatusBadge status={p.status} /></td>
                    </tr>
                    {expanded === p.id && (
                      <tr className={styles.expandRow}>
                        <td colSpan={4}>
                          <div className={styles.expandContent}>
                            <div><span className={styles.expLabel}>Paystack Ref</span><span>{p.paystack_reference || '—'}</span></div>
                            <div><span className={styles.expLabel}>Created</span><span>{p.created_at ? new Date(p.created_at).toLocaleString() : '—'}</span></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
