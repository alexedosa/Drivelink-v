import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './WebNavbar.module.css';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Cars', href: '#listings' },
  { label: 'FAQ', href: '#faq' },
];

export default function WebNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* trap focus in drawer */
  useEffect(() => {
    if (!drawerOpen) return;
    const el = drawerRef.current;
    const focusable = el?.querySelectorAll('a,button');
    focusable?.[0]?.focus();
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  /* lock body scroll when drawer is open */
  useEffect(() => {
    document.body.classList.toggle('no-scroll', drawerOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [drawerOpen]);

  function handleAnchorClick(href) {
    setDrawerOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <>
      <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`} role="banner">
        <div className={styles.inner}>
          {/* Logo */}
          <Link to="/" className={styles.logo} aria-label="DriveLink home">
            DriveLink
          </Link>

          {/* Desktop nav links */}
          <nav className={styles.links} aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                className={styles.navLink}
                onClick={() => handleAnchorClick(link.href)}
                aria-label={`Go to ${link.label} section`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className={styles.actions}>
            <Link to="/login" className={styles.cta}>
              Get Started
            </Link>
            <button
              className={styles.hamburger}
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className={styles.overlay} onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      )}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerLogo}>DriveLink</span>
          <button
            className={styles.closeBtn}
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className={styles.drawerLinks} aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              className={styles.drawerLink}
              onClick={() => handleAnchorClick(link.href)}
            >
              {link.label}
            </button>
          ))}
          <Link
            to="/login"
            className={styles.drawerCta}
            onClick={() => setDrawerOpen(false)}
          >
            Get Started
          </Link>
        </nav>
      </div>
    </>
  );
}