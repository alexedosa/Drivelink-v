import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Features.module.css';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    id: 'renters',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: 'For Renters',
    bullets: [
      'Daily, weekly, or monthly rates',
      'Insurance included in every booking',
      'Free delivery within 40km of Lagos',
      '24/7 roadside assistance',
    ],
  },
  {
    id: 'buyers',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'For Buyers',
    bullets: [
      'Verified ownership documents',
      'Full mechanical inspection report',
      '7-day money-back guarantee',
      'Free document processing',
    ],
  },
  {
    id: 'trust',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'DriveLink Trust',
    bullets: [
      'No hidden fees or surprises',
      'Paystack secure payment',
      'Real-time availability tracking',
      'Dedicated support team',
    ],
  },
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon} aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

export default function Features() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const cards = cardsRef.current;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 48 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      }
    );
  }, []);

  return (
    <section
      id="features"
      className={styles.section}
      ref={sectionRef}
      aria-labelledby="features-headline"
    >
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.badge} aria-hidden="true">Why Choose DriveLink</span>
          <h2 id="features-headline" className={styles.headline}>
            Built for trust.<br />Powered by speed.
          </h2>
          <p className={styles.sub}>
            Everything you need to rent or buy a car with confidence
          </p>
        </div>

        {/* Cards grid */}
        <div className={styles.grid} role="list">
          {FEATURES.map((feat, i) => (
            <article
              key={feat.id}
              className={styles.card}
              ref={(el) => (cardsRef.current[i] = el)}
              style={{ opacity: 0 }}
              role="listitem"
              aria-label={feat.title}
            >
              <div className={styles.iconWrap}>{feat.icon}</div>
              <h3 className={styles.cardTitle}>{feat.title}</h3>
              <ul className={styles.bullets}>
                {feat.bullets.map((point) => (
                  <li key={point} className={styles.bullet}>
                    <CheckIcon />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}