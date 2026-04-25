import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext';
import styles from './NotFound.module.css';

export default function NotFound() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const numRef  = useRef(null);
  const textRef = useRef(null);
  const carRef  = useRef(null);
  const btnsRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(numRef.current,  { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.7 })
      .fromTo(textRef.current, { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
      .fromTo(carRef.current,  { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.6, ease: 'back.out(1.4)' }, '-=0.2')
      .fromTo(btnsRef.current, { opacity: 0, y: 16  }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2');
  }, []);

  return (
    <div className={styles.page}>
      {/* Background decoration */}
      <div className={styles.bgDeco} aria-hidden="true" />

      <div className={styles.content}>
        {/* 404 number */}
        <div ref={numRef} className={styles.number} aria-hidden="true" style={{ opacity: 0 }}>
          404
        </div>

        {/* Inline car illustration */}
        <div ref={carRef} className={styles.carWrap} aria-hidden="true" style={{ opacity: 0 }}>
          <svg viewBox="0 0 280 110" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.carSvg}>
            <path d="M24 76 Q30 58 54 46 L80 32 Q110 20 148 22 Q186 22 210 38 L238 56 Q256 66 258 78 L260 86 H18 Z" fill="var(--bg-tertiary)" stroke="var(--border-medium)" strokeWidth="1.5"/>
            <path d="M90 32 Q114 14 150 12 Q186 10 210 32 L196 54 L104 54 Z" fill="var(--bg-secondary)" stroke="var(--border-light)" strokeWidth="1"/>
            <circle cx="64" cy="86" r="20" fill="var(--border-light)" stroke="var(--border-medium)" strokeWidth="2"/>
            <circle cx="64" cy="86" r="11" fill="var(--bg-secondary)" stroke="var(--border-medium)" strokeWidth="1.5"/>
            <circle cx="64" cy="86" r="3" fill="var(--border-dark)"/>
            <circle cx="210" cy="86" r="20" fill="var(--border-light)" stroke="var(--border-medium)" strokeWidth="2"/>
            <circle cx="210" cy="86" r="11" fill="var(--bg-secondary)" stroke="var(--border-medium)" strokeWidth="1.5"/>
            <circle cx="210" cy="86" r="3" fill="var(--border-dark)"/>
            {/* Lost road marks */}
            <line x1="20" y1="100" x2="260" y2="100" stroke="var(--border-light)" strokeWidth="2" strokeDasharray="18 12"/>
            {/* Red headlight glow */}
            <ellipse cx="258" cy="72" rx="8" ry="5" fill="rgba(230,57,57,0.3)"/>
            <ellipse cx="258" cy="72" rx="4" ry="3" fill="rgba(230,57,57,0.5)"/>
          </svg>
          {/* Question marks floating */}
          <span className={`${styles.floatMark} ${styles.m1}`}>?</span>
          <span className={`${styles.floatMark} ${styles.m2}`}>?</span>
          <span className={`${styles.floatMark} ${styles.m3}`}>?</span>
        </div>

        {/* Text */}
        <div ref={textRef} className={styles.textBlock} style={{ opacity: 0 }}>
          <h1 className={styles.heading}>Looks like you took a wrong turn.</h1>
          <p className={styles.sub}>
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>

        {/* Buttons */}
        <div ref={btnsRef} className={styles.buttons} style={{ opacity: 0 }}>
          <button className={styles.homeBtn} onClick={() => navigate(isAuthenticated ? (isAdmin ? '/admin' : '/home') : '/')} aria-label="Go to homepage">
            Go Home
          </button>
          <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}