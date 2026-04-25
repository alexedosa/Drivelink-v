import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import styles from './AdminDashboard.module.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await api.get('/users/all/');
        setUsers(res.data.results || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className={styles.layout}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.body}>
        <AdminNavbar onMenuToggle={() => setSidebarOpen(p => !p)} />
        <main className={styles.main}>
          <div className={styles.inner}>
            <h1 className={styles.pageTitle}>All Users</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Manage platform users</p>

            <div className={styles.recentCard}>
              {loading ? (
                <div style={{ padding: '24px' }}>Loading users...</div>
              ) : users.length === 0 ? (
                <div style={{ padding: '24px' }}>No users found.</div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 500 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {u.profile_picture ? (
                                <img src={u.profile_picture} alt={u.first_name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                                  {u.first_name?.[0] || 'U'}
                                </div>
                              )}
                              {u.first_name} {u.last_name}
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td>{u.phone || '—'}</td>
                          <td>
                            <span className={styles.badge} style={{ backgroundColor: u.role === 'admin' ? 'var(--primary)' : 'var(--bg-secondary)', color: u.role === 'admin' ? '#fff' : 'var(--text-main)' }}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{u.city ? `${u.city}${u.address ? `, ${u.address}` : ''}` : '—'}</td>
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
