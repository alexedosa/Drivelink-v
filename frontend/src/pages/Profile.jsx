import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import UserNavbar from '../components/user/UserNavbar';
import Footer from '../components/common/Footer';
import styles from './Profile.module.css';

function fmt(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);
}

function StatusBadge({ status }) {
  const cls = { confirmed: 'green', pending: 'yellow', cancelled: 'red', failed: 'red' }[status] || 'gray';
  return <span className={`${styles.badge} ${styles['badge' + cls.charAt(0).toUpperCase() + cls.slice(1)]}`}>{status}</span>;
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className={styles.skeletonWrap}>
      {[1,2,3].map(i => <div key={i} className={styles.skeletonRow} />)}
    </div>
  );
}

function EmptyState({ msg }) {
  return <div className={styles.emptyState}><p>{msg}</p></div>;
}

/* ── Personal Info Tab ─────────────────────────────────────── */
function InfoTab({ user }) {
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [passModal, setPassModal] = useState(false);
  const [passErr, setPassErr] = useState('');
  const [passSaving, setPassSaving] = useState(false);

  function handlePicChange(e) {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
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
      if (profilePic) {
        fd.append('profile_picture', profilePic);
      }
      await api.patch('/me/', fd);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        window.location.reload(); // Quick refresh to update context
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
      setPassModal(false);
      setPassForm({ current_password: '', new_password: '', confirm: '' });
      window.alert('Password updated successfully!');
    } catch (err) {
      setPassErr(err.response?.data?.detail || 'Password change failed.');
    } finally {
      setPassSaving(false);
    }
  }

  return (
    <div className={styles.infoWrap}>
      <form onSubmit={handleSave} className={styles.infoForm} noValidate>
        {success && <div className={styles.successBanner} role="status">Profile updated successfully!</div>}
        {error && <div className={styles.errorBanner} role="alert">{error}</div>}

        <div className={styles.formRow}>
          <Field label="First Name">
            <input type="text" className={styles.input} value={form.first_name} onChange={(e) => setForm(p => ({ ...p, first_name: e.target.value }))} />
          </Field>
          <Field label="Last Name">
            <input type="text" className={styles.input} value={form.last_name} onChange={(e) => setForm(p => ({ ...p, last_name: e.target.value }))} />
          </Field>
        </div>
        <Field label="Email address">
          <input type="email" className={`${styles.input} ${styles.inputDisabled}`} value={user?.email || ''} disabled aria-readonly="true" />
        </Field>
        <Field label="Phone">
          <input type="tel" className={styles.input} value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+234 800 000 0000" />
        </Field>
        <div className={styles.formRow}>
          <Field label="Address">
            <input type="text" className={styles.input} value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} />
          </Field>
          <Field label="City">
            <input type="text" className={styles.input} value={form.city} onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))} />
          </Field>
        </div>
        <div className={styles.formActions}>
          <button type="button" className={styles.outlineBtn} onClick={() => setPassModal(true)}>Change Password</button>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? <span className={styles.spinner} aria-hidden="true" /> : 'Save Changes'}
          </button>
        </div>
      </form>

      {passModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Change password">
          <div className={styles.passModal}>
            <h3 className={styles.passTitle}>Change Password</h3>
            {passErr && <div className={styles.errorBanner} role="alert">{passErr}</div>}
            <form onSubmit={handlePassChange} noValidate className={styles.passForm}>
              <Field label="Current Password">
                <input type="password" className={styles.input} value={passForm.current_password} onChange={(e) => setPassForm(p => ({ ...p, current_password: e.target.value }))} />
              </Field>
              <Field label="New Password">
                <input type="password" className={styles.input} value={passForm.new_password} onChange={(e) => setPassForm(p => ({ ...p, new_password: e.target.value }))} />
              </Field>
              <Field label="Confirm New Password">
                <input type="password" className={styles.input} value={passForm.confirm} onChange={(e) => setPassForm(p => ({ ...p, confirm: e.target.value }))} />
              </Field>
              <div className={styles.formActions}>
                <button type="button" className={styles.outlineBtn} onClick={() => setPassModal(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={passSaving}>
                  {passSaving ? <span className={styles.spinner} aria-hidden="true" /> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : 'U';

  return (
    <>
      <UserNavbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <div style={{ gridColumn: '1 / -1', marginBottom: '-10px' }}>
            <button 
              onClick={() => navigate('/home')} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, padding: '8px 0', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--red-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back to Home
            </button>
          </div>
          <aside className={styles.sidebar} aria-label="Profile navigation">
            <div className={styles.avatarBlock}>
              <div style={{ position: 'relative' }}>
                {user?.profile_picture ? (
                  <img src={user.profile_picture.startsWith('http') ? user.profile_picture : `${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000'}${user.profile_picture}`} alt="Profile" className={styles.avatar} style={{ objectFit: 'cover', marginBottom: '14px' }} />
                ) : (
                  <div className={styles.avatar}>{initials}</div>
                )}
                <label style={{ position: 'absolute', bottom: '14px', right: '-5px', background: 'var(--red-primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} title="Update Profile Picture">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
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
                  }} />
                </label>
              </div>
              <h2 className={styles.userName}>{user?.first_name} {user?.last_name}</h2>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </aside>

          <main className={styles.main}>
            <h1 className={styles.tabTitle}>Personal Info</h1>
            <InfoTab user={user} />
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}