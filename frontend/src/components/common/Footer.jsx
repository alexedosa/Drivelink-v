import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Cars for Rent', to: '/?category=rental' },
  { label: 'Cars for Sale', to: '/?category=purchase' },
  { label: 'About Us', to: '/#about' },
];

const LEGAL_LINKS = [
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Refund Policy', to: '/refund' },
  { label: 'FAQ', to: '/faq' },
];

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.grid}>

          {/* Column 1 – Brand */}
          <div className={styles.col}>
            <Link to="/" className={styles.logo} aria-label="DriveLink home">
              DriveLink
            </Link>
            <p className={styles.tagline}>Rent or buy. Drive with confidence.</p>
            <div className={styles.socials} aria-label="Social media links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Twitter">
                <TwitterIcon />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Column 2 – Quick Links */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Quick Links</h3>
            <nav aria-label="Quick links">
              {QUICK_LINKS.map((link) => (
                <Link key={link.label} to={link.to} className={styles.navLink}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3 – Legal */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Legal</h3>
            <nav aria-label="Legal links">
              {LEGAL_LINKS.map((link) => (
                <Link key={link.label} to={link.to} className={styles.navLink}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4 – Contact */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Contact</h3>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <MailIcon />
                <a href="mailto:support@drivelink.com" className={styles.contactLink}>
                  support@drivelink.com
                </a>
              </li>
              <li className={styles.contactItem}>
                <PhoneIcon />
                <a href="tel:+2348001234567" className={styles.contactLink}>
                  +234 800 123 4567
                </a>
              </li>
              <li className={styles.contactItem}>
                <ClockIcon />
                <span>Mon–Fri, 9am – 6pm WAT</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright bar */}
        <div className={styles.copyright} role="contentinfo">
          <p>© {new Date().getFullYear()} DriveLink. All rights reserved. Mzn.</p>
        </div>
      </div>
    </footer>
  );
}