import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminNavbar.module.css';

const BREADCRUMB_MAP = {
  '/admin':          'Dashboard',
  '/admin/cars':     'Cars Management',
  '/admin/bookings': 'Bookings',
  '/admin/users':    'Users',
};

const NOTIFICATIONS = [
  { id: 1, text: 'New booking #B-2041', time: '2m ago' },
  { id: 2, text: 'Low stock: Toyota Camry (1 left)', time: '14m ago' },
  { id: 3, text: 'New user registered', time: '1h ago' },
];

export default function AdminNavbar({ onMenuToggle, onSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);

  const profileRef = useRef(null);
  const bellRef = useRef(null);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  const currentPage = BREADCRUMB_MAP[location.pathname] || 'Admin';

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSearchChange(e) {
    setSearchVal(e.target.value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => onSearch?.(e.target.value), 400);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'A'
    : 'A';

  return (
    <header className={styles.nav} role="banner">
      {/* Left */}
      <div className={styles.left}>
        <button
          className={styles.menuToggle}
          onClick={onMenuToggle}
          aria-label="Toggle sidebar menu"
        >
          <span /><span /><span />
        </button>
        <div className={styles.breadcrumb} aria-label="Breadcrumb">
          <span className={styles.breadcrumbBrand}>DriveLink Admin</span>
          <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
          <span className={styles.breadcrumbPage}>{currentPage}</span>
        </div>
      </div>

      {/* Right */}
      <div className={styles.right}>

        {/* Search */}
        <div className={`${styles.searchWrap} ${searchExpanded ? styles.searchExpanded : ''}`}>
          <button
            className={styles.searchToggle}
            onClick={() => { setSearchExpanded((p) => !p); setTimeout(() => searchRef.current?.focus(), 60); }}
            aria-label="Toggle search"
          >
            <SearchIcon />
          </button>
          <input
            ref={searchRef}
            type="search"
            className={styles.searchInput}
            placeholder="Search cars, bookings, users…"
            value={searchVal}
            onChange={handleSearchChange}
            aria-label="Global admin search"
          />
        </div>

        {/* Bell */}
        <div className={styles.bellWrap} ref={bellRef}>
          <button
            className={styles.iconBtn}
            onClick={() => { setBellOpen((p) => !p); setProfileOpen(false); }}
            aria-label={`Notifications, ${NOTIFICATIONS.length} unread`}
            aria-expanded={bellOpen}
          >
            <BellIcon />
            <span className={styles.bellBadge} aria-hidden="true">{NOTIFICATIONS.length}</span>
          </button>

          {bellOpen && (
            <div className={styles.bellDropdown} role="menu" aria-label="Notifications">
              <div className={styles.ddHeader}>
                <span className={styles.ddTitle}>Notifications</span>
              </div>
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className={styles.notifItem} role="menuitem">
                  <div className={styles.notifDot} aria-hidden="true" />
                  <div className={styles.notifBody}>
                    <span className={styles.notifText}>{n.text}</span>
                    <span className={styles.notifTime}>{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className={styles.profileWrap} ref={profileRef}>
          <button
            className={styles.avatar}
            onClick={() => { setProfileOpen((p) => !p); setBellOpen(false); }}
            aria-label="Open admin profile menu"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            style={user?.profile_picture ? { padding: 0, border: 'none', background: 'transparent' } : {}}
          >
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </button>

          {profileOpen && (
            <div className={styles.dropdown} role="menu" aria-label="Admin profile menu">
              <div className={styles.ddUser}>
                <span className={styles.ddName}>{user?.first_name} {user?.last_name}</span>
                <span className={styles.ddRole}>Administrator</span>
              </div>
              <div className={styles.ddDivider} />
              <button className={styles.ddItem} role="menuitem" onClick={() => { navigate('/admin/settings'); setProfileOpen(false); }}>
                <SettingsIcon /> Account Settings
              </button>
              <div className={styles.ddDivider} />
              <button className={`${styles.ddItem} ${styles.ddItemDanger}`} role="menuitem" onClick={handleLogout}>
                <LogoutIcon /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function BellIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function SettingsIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function LogoutIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}