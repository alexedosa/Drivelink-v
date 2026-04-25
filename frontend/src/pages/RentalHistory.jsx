import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRentals, cancelRental } from '../services/rentals';
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

export default function RentalHistory() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  const loadRentals = async () => {
    try {
      const data = await getMyRentals();
      setRentals(data.results || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals();
  }, []);

  const handleCancel = async (id, e) => {
    e.stopPropagation();
    await cancelRental(id);
    await loadRentals();
  };

  return (
    <div className={styles.page}>
      <UserNavbar activeTab="rent" />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Rentals</h1>
          <p className={styles.subtitle}>View and manage your car rental bookings.</p>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : rentals.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className={styles.emptyIcon}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <h3>No rented cars yet</h3>
            <p>You haven't made any rental bookings.</p>
            <button className={styles.browseBtn} onClick={() => navigate('/home')}>Browse Cars</button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Car</th><th>Dates</th><th>Total</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((r) => (
                  <React.Fragment key={r.id}>
                    <tr className={styles.tableRow} onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                      <td><span className={styles.carName}>{r.car_name || r.car}</span></td>
                      <td className={styles.tdMuted}>{r.start_date} → {r.end_date}</td>
                      <td className={styles.tdPrice}>{fmt(r.total_amount)}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>
                        {r.status === 'pending' && (
                          <button className={styles.cancelBtn} onClick={(e) => handleCancel(r.id, e)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                    {expanded === r.id && (
                      <tr className={styles.expandRow}>
                        <td colSpan={5}>
                          <div className={styles.expandContent}>
                            <div><span className={styles.expLabel}>Paystack Ref</span><span>{r.paystack_reference || '—'}</span></div>
                            <div><span className={styles.expLabel}>Created</span><span>{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</span></div>
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
