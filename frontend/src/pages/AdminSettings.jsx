import { useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import styles from './AdminDashboard.module.css';

import formStyles from '../components/admin/AdminCarModal.module.css';

export default function AdminSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [passErr, setPassErr] = useState('');
  const [passSaving, setPassSaving] = useState(false);

  async function handlePicChange(e) {
    const file = e.target.files[0];
    if (file) {
      const fd = new FormData();
      fd.append('profile_picture', file);
      try {
        await api.patch('/me/', fd);
        window.location.reload();
      } catch (err) {
        alert('Failed to update profile picture.');
      }
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await api.patch('/me/', fd);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePassChange(e) {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm) {
      setPassErr('Passwords do not match.');
      return;
    }
    setPassSaving(true);
    setPassErr('');
    try {
      await api.post('/auth/change-password/', {
        current_password: passForm.current_password,
        new_password: passForm.new_password,
      });
      setPassForm({ current_password: '', new_password: '', confirm: '' });
      window.alert('Password updated successfully!');
    } catch (err) {
      setPassErr(err.response?.data?.detail || 'Password change failed.');
    } finally {
      setPassSaving(false);
    }
  }

  return (
    <div className={styles.layout}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.body}>
        <AdminNavbar onMenuToggle={() => setSidebarOpen(p => !p)} />
        <main className={styles.main}>
          <div className={styles.inner}>
            <h1 className={styles.pageTitle}>Admin Settings</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className={styles.recentCard} style={{ padding: '24px' }}>
                <h2 className={styles.chartTitle}>Profile Information</h2>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {success && <div className={formStyles.successBanner}>Profile updated successfully!</div>}
                  {error && <div className={formStyles.errorBanner}>{error}</div>}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                    <div style={{ position: 'relative' }}>
                      {user?.profile_picture ? (
                        <img src={user.profile_picture} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '24px' }}>
                          {user?.first_name?.[0] || 'A'}
                        </div>
                      )}
                      <label style={{ position: 'absolute', bottom: '0px', right: '-5px', background: 'var(--red-primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} title="Update Profile Picture">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePicChange} />
                      </label>
                    </div>
                  </div>

                  <div className={formStyles.row2}>
                    <div className={formStyles.field}>
                      <label className={formStyles.label}>First Name</label>
                      <input type="text" className={formStyles.input} value={form.first_name} onChange={e => setForm(p => ({...p, first_name: e.target.value}))} />
                    </div>
                    <div className={formStyles.field}>
                      <label className={formStyles.label}>Last Name</label>
                      <input type="text" className={formStyles.input} value={form.last_name} onChange={e => setForm(p => ({...p, last_name: e.target.value}))} />
                    </div>
                  </div>

                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Email</label>
                    <input type="email" className={formStyles.input} value={user?.email || ''} disabled style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }} />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Phone</label>
                    <input type="tel" className={formStyles.input} value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
                  </div>
                  
                  <div className={formStyles.row2}>
                    <div className={formStyles.field}>
                      <label className={formStyles.label}>City</label>
                      <input type="text" className={formStyles.input} value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} />
                    </div>
                    <div className={formStyles.field}>
                      <label className={formStyles.label}>Address</label>
                      <input type="text" className={formStyles.input} value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} />
                    </div>
                  </div>

                  <button type="submit" className={formStyles.saveBtn} disabled={saving} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                    {saving ? <span className={formStyles.spinner} /> : 'Save Profile'}
                  </button>
                </form>
              </div>

              <div className={styles.recentCard} style={{ padding: '24px', alignSelf: 'start' }}>
                <h2 className={styles.chartTitle}>Change Password</h2>
                <form onSubmit={handlePassChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {passErr && <div className={formStyles.apiBanner} style={{ margin: 0 }}>{passErr}</div>}
                  
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Current Password</label>
                    <input type="password" className={formStyles.input} value={passForm.current_password} onChange={e => setPassForm(p => ({...p, current_password: e.target.value}))} required />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>New Password</label>
                    <input type="password" className={formStyles.input} value={passForm.new_password} onChange={e => setPassForm(p => ({...p, new_password: e.target.value}))} required />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label}>Confirm New Password</label>
                    <input type="password" className={formStyles.input} value={passForm.confirm} onChange={e => setPassForm(p => ({...p, confirm: e.target.value}))} required />
                  </div>

                  <button type="submit" className={formStyles.saveBtn} disabled={passSaving} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                    {passSaving ? <span className={formStyles.spinner} /> : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
