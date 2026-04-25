import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './Hero.module.css';
import carImage from '../../assets/hellcat-hero.png'; // Import the cinematic car image

export default function Hero() {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const subtextRef = useRef(null);
  const carImageRef = useRef(null);
  const scrollRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Initial state setup
    gsap.set(
      [headlineRef.current, subtextRef.current, carImageRef.current, scrollRef.current],
      { opacity: 0 }
    );

    tl.to(containerRef.current, { opacity: 1, duration: 0.5 })
      // 1. Headline Entrance with Stagger
      .fromTo(
        headlineRef.current,
        { opacity: 0, y: 80, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'expo.out' },
        '+=0.3'
      )
      // 2. Subtext Fade In
      .fromTo(
        subtextRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.8'
      )
      // 3. Car Image Slides In with Zoom
      .fromTo(
        carImageRef.current,
        { opacity: 0, scale: 1.15, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 1.5, ease: 'power3.out' },
        '-=0.6'
      )
      // 4. Glow Pulse Animation
      .fromTo(
        glowRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 0.7, scale: 1.3, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' },
        '-=1'
      )
      // 5. Scroll Indicator
      .fromTo(
        scrollRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=1.2'
      );

    // Parallax effect on mouse move
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 15;
      const yPos = (clientY / window.innerHeight - 0.5) * 15;

      gsap.to(carImageRef.current, {
        x: xPos,
        y: yPos,
        duration: 1.2,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleScrollDown = () => {
    const nextSection = document.getElementById('features');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.hero} ref={containerRef} aria-label="DriveLink Cinematic Hero">
      {/* Background Layers */}
      <div className={styles.overlay} />
      <div className={styles.noise} />
      <div className={styles.fog} />

      {/* Main Content */}
      <div className={styles.content}>
        {/* Text Section with Spacing */}
        <div className={styles.textSection}>
          <h1 ref={headlineRef} className={styles.headline}>
            GET <br />
            <span className={styles.accentText}>YOUR CAR NOW</span>
          </h1>

          <p ref={subtextRef} className={styles.subtext}>
            Rent or Buy the Legend. Lagos Streets. Zero Limits.
          </p>
        </div>

        {/* Car Image Section */}
        <div className={styles.carSection}>
          <div ref={glowRef} className={styles.redGlow} />
          <img
            ref={carImageRef}
            src={carImage}
            alt="Dodge Hellcat - The Beast"
            className={styles.carImage}
          />
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <button
        ref={scrollRef}
        className={styles.scrollIndicator}
        onClick={handleScrollDown}
        aria-label="Scroll to content"
      >
        <span className={styles.scrollText}>SCROLL</span>
        <div className={styles.scrollLine} />
      </button>
    </section>
  );
}
