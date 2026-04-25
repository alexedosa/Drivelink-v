import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import styles from './AdminDashboard.module.css';

export default function AdminBookings() {
  const [rentals, setRentals] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [renRes, purRes] = await Promise.all([
          api.get('/rentals/all/'),
          api.get('/purchases/all/')
        ]);
        setRentals(renRes.data.results || renRes.data || []);
        setPurchases(purRes.data.results || purRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const allBookings = [...rentals, ...purchases].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className={styles.layout}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.body}>
        <AdminNavbar onMenuToggle={() => setSidebarOpen(p => !p)} />
        <main className={styles.main}>
          <div className={styles.inner}>
            <h1 className={styles.pageTitle}>All Bookings & Purchases</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Manage platform transactions</p>

            <div className={styles.recentCard}>
              {loading ? (
                <div style={{ padding: '24px' }}>Loading bookings...</div>
              ) : allBookings.length === 0 ? (
                <div style={{ padding: '24px' }}>No bookings found.</div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Customer</th>
                        <th>Car</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allBookings.map((b) => (
                        <tr key={`${b.start_date ? 'R' : 'P'}-${b.id}`}>
                          <td>
                            <span className={`${styles.badge} ${b.start_date ? styles.badgeBlue : styles.badgeGreen}`}>
                              {b.start_date ? 'Rental' : 'Purchase'}
                            </span>
                          </td>
                          <td>{b.user_email ? b.user_email.split('@')[0] : 'Unknown User'}</td>
                          <td style={{ fontWeight: 500 }}>{b.car_name || b.car || 'Unknown Car'}</td>
                          <td style={{ fontWeight: 600 }}>₦{Number(b.total_amount).toLocaleString()}</td>
                          <td>
                            <span className={`${styles.badge} ${b.status === 'CONFIRMED' ? styles.badgeGreen : b.status === 'PENDING' ? styles.badgeYellow : styles.badgeRed}`}>
                              {b.status}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{new Date(b.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
