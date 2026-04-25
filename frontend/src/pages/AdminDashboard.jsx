import { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import StatsCard from '../components/admin/StatsCard';
import styles from './AdminDashboard.module.css';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getCars } from '../services/cars';
import { getAllRentals } from '../services/rentals';
import { purchasesService } from '../services/purchases';

/* ── Stat icons ──────────────────────────────────────────── */
function CarIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>;
}
function RentIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function BagIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
}
function MoneyIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}

function fmt(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

function StatusBadge({ status }) {
  const map = { confirmed: styles.badgeGreen, pending: styles.badgeYellow, failed: styles.badgeRed, cancelled: styles.badgeGray };
  return <span className={`${styles.badge} ${map[status] || styles.badgeGray}`}>{status}</span>;
}

function TypeBadge({ type }) {
  return <span className={`${styles.badge} ${type === 'rental' ? styles.badgeBlue : styles.badgeGreen}`}>{type}</span>;
}

const SKELETON_CARDS = [1, 2, 3, 4];

// Mock data (remove when backend is ready)
const MOCK_STATS = {
  total_cars: 6,
  active_rentals: 3,
  total_purchases: 2,
  total_revenue: 12500000,
  cars_trend: '+12%',
  rentals_trend: '+5%',
  purchases_trend: '-2%',
  revenue_trend: '+18%',
};

const MOCK_CHARTS = {
  bookings_trend: [
    { month: 'Jan', rentals: 4, purchases: 1 },
    { month: 'Feb', rentals: 6, purchases: 2 },
    { month: 'Mar', rentals: 8, purchases: 3 },
    { month: 'Apr', rentals: 7, purchases: 4 },
    { month: 'May', rentals: 10, purchases: 5 },
    { month: 'Jun', rentals: 12, purchases: 6 },
  ],
  revenue_trend: [
    { month: 'Jan', revenue: 250000 },
    { month: 'Feb', revenue: 400000 },
    { month: 'Mar', revenue: 550000 },
    { month: 'Apr', revenue: 480000 },
    { month: 'May', revenue: 720000 },
    { month: 'Jun', revenue: 890000 },
  ],
};

const MOCK_RECENT = [
  { user_email: 'john@test.com', car_name: 'Toyota Camry', type: 'rental', amount: 175000, status: 'confirmed', date: '2024-06-15' },
  { user_email: 'jane@test.com', car_name: 'BMW X5', type: 'purchase', amount: 45000000, status: 'pending', date: '2024-06-14' },
  { user_email: 'mike@test.com', car_name: 'Honda Civic', type: 'rental', amount: 66000, status: 'confirmed', date: '2024-06-13' },
  { user_email: 'sarah@test.com', car_name: 'Tesla Model 3', type: 'purchase', amount: 65000000, status: 'confirmed', date: '2024-06-12' },
  { user_email: 'david@test.com', car_name: 'Mercedes GLE', type: 'purchase', amount: 55000000, status: 'failed', date: '2024-06-11' },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [carsRes, rentalsRes, purchasesRes] = await Promise.all([
          getCars(),
          getAllRentals(),
          purchasesService.getAll()
        ]);
        
        const cars = carsRes?.results || carsRes || [];
        const rentals = rentalsRes?.results || rentalsRes || [];
        const purchases = purchasesRes?.data?.results || purchasesRes?.data || purchasesRes?.results || purchasesRes || [];

        const total_cars = cars.length;
        const active_rentals = rentals.filter(r => r.status === 'CONFIRMED').length;
        const total_purchases = purchases.filter(p => p.status === 'CONFIRMED').length;
        
        let total_revenue = 0;
        rentals.filter(r => r.status === 'CONFIRMED').forEach(r => total_revenue += parseFloat(r.total_amount || 0));
        purchases.filter(p => p.status === 'CONFIRMED').forEach(p => total_revenue += parseFloat(p.total_amount || 0));

        setStats({
          total_cars,
          active_rentals,
          total_purchases,
          total_revenue,
          cars_trend: '+0%',
          rentals_trend: '+0%',
          purchases_trend: '+0%',
          revenue_trend: '+0%',
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartDataMap = {};

        const today = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const m = months[d.getMonth()];
          chartDataMap[m] = { month: m, rentals: 0, purchases: 0, revenue: 0 };
        }

        const aggregate = (items, type) => {
          items.forEach(item => {
            if (item.status === 'CONFIRMED' && item.created_at) {
              const date = new Date(item.created_at);
              const month = months[date.getMonth()];
              if (!chartDataMap[month]) {
                chartDataMap[month] = { month, rentals: 0, purchases: 0, revenue: 0 };
              }
              if (type === 'rental') {
                chartDataMap[month].rentals += 1;
                chartDataMap[month].revenue += parseFloat(item.total_amount || 0);
              } else {
                chartDataMap[month].purchases += 1;
                chartDataMap[month].revenue += parseFloat(item.total_amount || 0);
              }
            }
          });
        };

        aggregate(rentals, 'rental');
        aggregate(purchases, 'purchase');

        const trends = months.filter(m => chartDataMap[m]).map(m => chartDataMap[m]);
        
        setCharts({
          bookings_trend: trends.length ? trends : MOCK_CHARTS.bookings_trend,
          revenue_trend: trends.length ? trends : MOCK_CHARTS.revenue_trend,
        });

        const allActivity = [
          ...rentals.map(r => ({
            user_email: r.user_email || r.user || 'User',
            car_name: r.car_name || (r.car?.name) || 'Car',
            type: 'rental',
            amount: parseFloat(r.total_amount || 0),
            status: (r.status || 'pending').toLowerCase(),
            date: r.created_at
          })),
          ...purchases.map(p => ({
            user_email: p.user_email || p.user || 'User',
            car_name: p.car_name || (p.car?.name) || 'Car',
            type: 'purchase',
            amount: parseFloat(p.total_amount || 0),
            status: (p.status || 'pending').toLowerCase(),
            date: p.created_at
          }))
        ];

        allActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecent(allActivity.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Dashboard fetch error", err);
        setError('Failed to load dashboard data.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className={styles.layout}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.body}>
        <AdminNavbar onMenuToggle={() => setSidebarOpen(p => !p)} />

        <main className={styles.main} aria-label="Admin dashboard">
          <div className={styles.inner}>
            <h1 className={styles.pageTitle}>Dashboard</h1>

            {error && <div className={styles.errorBanner} role="alert">{error}</div>}

            {/* ── Stats grid ── */}
            <div className={styles.statsGrid} aria-label="Key metrics">
              {loading
                ? SKELETON_CARDS.map(i => <div key={i} className={styles.statSkeleton} aria-hidden="true" />)
                : <>
                    <StatsCard title="Total Cars" value={stats?.total_cars ?? 0} icon={<CarIcon />} trend={stats?.cars_trend} color="red" />
                    <StatsCard title="Active Rentals" value={stats?.active_rentals ?? 0} icon={<RentIcon />} trend={stats?.rentals_trend} color="blue" />
                    <StatsCard title="Total Purchases" value={stats?.total_purchases ?? 0} icon={<BagIcon />} trend={stats?.purchases_trend} color="green" />
                    <StatsCard title="Total Revenue" value={stats?.total_revenue ?? 0} icon={<MoneyIcon />} trend={stats?.revenue_trend} color="yellow" />
                  </>
              }
            </div>

            {/* ── Charts ── */}
            {!loading && charts && (
              <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                  <h2 className={styles.chartTitle}>Bookings Trend</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={charts.bookings_trend || []} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="rentals" stroke="#E63939" strokeWidth={2} dot={true} name="Rentals" />
                      <Line type="monotone" dataKey="purchases" stroke="#3B82F6" strokeWidth={2} dot={true} name="Purchases" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className={styles.chartCard}>
                  <h2 className={styles.chartTitle}>Revenue Trend</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={charts.revenue_trend || []} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                      <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <Tooltip
                        formatter={(v) => fmt(v)}
                        contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 12 }}
                      />
                      <Bar dataKey="revenue" fill="#E63939" radius={[4, 4, 0, 0]} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {loading && (
              <div className={styles.chartsGrid}>
                <div className={styles.chartSkeleton} aria-hidden="true" />
                <div className={styles.chartSkeleton} aria-hidden="true" />
              </div>
            )}

            {/* ── Recent activity ── */}
            <div className={styles.recentCard}>
              <div className={styles.recentHeader}>
                <h2 className={styles.chartTitle}>Recent Activity</h2>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table} aria-label="Recent activity">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Car</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} aria-hidden="true">
                            {[1,2,3,4,5,6].map(j => <td key={j}><div className={styles.cellSkeleton} /></td>)}
                          </tr>
                        ))
                      : recent.length === 0
                        ? <tr><td colSpan={6} className={styles.emptyCell}>No recent activity.</td></tr>
                        : recent.map((row, i) => (
                            <tr key={i} className={styles.tableRow}>
                              <td className={styles.tdUser}>{row.user_email || row.user}</td>
                              <td>{row.car_name || row.car}</td>
                              <td><TypeBadge type={row.type} /></td>
                              <td className={styles.tdAmount}>{fmt(row.amount)}</td>
                              <td><StatusBadge status={row.status} /></td>
                              <td className={styles.tdDate}>{row.date ? new Date(row.date).toLocaleDateString() : '—'}</td>
                            </tr>
                          ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}