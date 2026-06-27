import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WebNavbar from "../components/website/WebNavbar";
import Hero from "../components/website/Hero";
import Features from "../components/website/Features";
import Footer from "../components/common/Footer";
import styles from "./Website.module.css";

gsap.registerPlugin(ScrollTrigger);

/* ── Stats Bar ───────────────────────────────────────────── */
const STATS = [
  { value: 500, suffix: "+", label: "Vehicles Available" },
  { value: 24, suffix: "/7", label: "Customer Support" },
  { value: 100, suffix: "%", label: "Secure Payments" },
];

function StatsBar() {
  const sectionRef = useRef(null);
  const numRefs = useRef([]);

  useEffect(() => {
    numRefs.current.forEach((el, i) => {
      if (!el) return;
      const target = STATS[i].value;
      const suffix = STATS[i].suffix;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: "power2.out",
        onUpdate() {
          el.textContent = Math.round(obj.val) + suffix;
        },
        onComplete() {
          el.textContent = target + suffix;
        },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      });
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.statsBar}
      aria-label="Platform statistics"
    >
      <div className={styles.statsInner}>
        {STATS.map((s, i) => (
          <div key={i} className={styles.statItem}>
            <span
              ref={(el) => (numRefs.current[i] = el)}
              className={styles.statNum}
              aria-label={`${s.value}${s.suffix} ${s.label}`}
            >
              0{s.suffix}
            </span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── How It Works ────────────────────────────────────────── */
const HOW_STEPS = [
  {
    num: "01",
    title: "Create Account",
    desc: "Sign up for free in under 2 minutes.",
  },
  {
    num: "02",
    title: "Browse Fleet",
    desc: "Filter by type, price, brand, and more.",
  },
  {
    num: "03",
    title: "Book & Pay",
    desc: "Secure checkout powered by Paystack.",
  },
  {
    num: "04",
    title: "Drive Away",
    desc: "Pick up or get your car delivered.",
  },
];

function HowItWorks() {
  const sectionRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(
      itemsRef.current.filter(Boolean),
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
      },
    );
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className={styles.howSection}
      aria-labelledby="how-heading"
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.badge}>How It Works</span>
          <h2 id="how-heading" className={styles.sectionHeadline}>
            Up and running in 4 steps
          </h2>
        </div>
        <div className={styles.howGrid}>
          {HOW_STEPS.map((step, i) => (
            <div
              key={i}
              ref={(el) => (itemsRef.current[i] = el)}
              className={styles.howCard}
              style={{ opacity: 0 }}
            >
              <span className={styles.howNum}>{step.num}</span>
              <h3 className={styles.howTitle}>{step.title}</h3>
              <p className={styles.howDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Sample car listings preview ─────────────────────────── */
const SAMPLE_CARS = [
  {
    id: 1,
    name: "Camry XSE",
    brand: "Toyota",
    year: 2023,
    price: "₦35,000",
    type: "Rent",
    tag: "Popular",
  },
  {
    id: 2,
    name: "CR-V Sport",
    brand: "Honda",
    year: 2022,
    price: "₦28,000",
    type: "Rent",
    tag: "Available",
  },
  {
    id: 3,
    name: "X5 xDrive40i",
    brand: "BMW",
    year: 2023,
    price: "₦75,000",
    type: "Rent",
    tag: "Premium",
  },
  {
    id: 4,
    name: "Hilux Revo",
    brand: "Toyota",
    year: 2021,
    price: "₦9,800,000",
    type: "Buy",
    tag: "Verified",
  },
  {
    id: 5,
    name: "Accord 2.0T",
    brand: "Honda",
    year: 2022,
    price: "₦12,500,000",
    type: "Buy",
    tag: "Low Mileage",
  },
  {
    id: 6,
    name: "Range Evoque",
    brand: "Land Rover",
    year: 2020,
    price: "₦22,000,000",
    type: "Buy",
    tag: "Certified",
  },
];

function PreviewCard({ car }) {
  return (
    <div className={styles.previewCard}>
      {/* car-preview-placeholder: vehicle silhouette on gradient */}
      <div className={styles.previewImg} aria-hidden="true">
        <svg viewBox="0 0 200 90" fill="none" className={styles.previewSvg}>
          <path
            d="M18 66 Q24 50 42 40 L60 28 Q90 18 118 22 L148 32 Q168 42 176 62 L178 72 H16Z"
            fill="rgba(255,255,255,0.1)"
          />
          <circle cx="50" cy="72" r="14" fill="rgba(255,255,255,0.12)" />
          <circle cx="148" cy="72" r="14" fill="rgba(255,255,255,0.12)" />
        </svg>
        <span
          className={`${styles.previewTypeBadge} ${car.type === "Rent" ? styles.pBadgeRent : styles.pBadgeBuy}`}
        >
          {car.type}
        </span>
      </div>
      <div className={styles.previewBody}>
        <div className={styles.previewTop}>
          <h3 className={styles.previewName}>{car.name}</h3>
          <p className={styles.previewMeta}>
            {car.brand} · {car.year}
          </p>
        </div>
        <div className={styles.previewBottom}>
          <span className={styles.previewPrice}>
            {car.price}
            {car.type === "Rent" && <span className={styles.perDay}>/day</span>}
          </span>
          <span className={styles.previewTag}>{car.tag}</span>
        </div>
      </div>
    </div>
  );
}

function ListingsSection() {
  const [tab, setTab] = useState("rent");
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(
      cardsRef.current.filter(Boolean),
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
      },
    );
  }, []);

  const filtered = SAMPLE_CARS.filter((c) =>
    tab === "rent" ? c.type === "Rent" : c.type === "Buy",
  );

  return (
    <section
      id="listings"
      ref={sectionRef}
      className={styles.listingsSection}
      aria-labelledby="listings-heading"
    >
      <div className={styles.container}>
        <div className={styles.listingsTop}>
          <div>
            <span className={styles.badge}>Our Fleet</span>
            <h2 id="listings-heading" className={styles.sectionHeadline}>
              Explore our vehicles
            </h2>
            <p className={styles.sectionSub}>
              A curated selection of premium cars available now.
            </p>
          </div>
          <div
            className={styles.tabGroup}
            role="tablist"
            aria-label="Vehicle type"
          >
            <button
              role="tab"
              className={`${styles.tabBtn} ${tab === "rent" ? styles.tabBtnActive : ""}`}
              onClick={() => setTab("rent")}
              aria-selected={tab === "rent"}
            >
              For Rent
            </button>
            <button
              role="tab"
              className={`${styles.tabBtn} ${tab === "buy" ? styles.tabBtnActive : ""}`}
              onClick={() => setTab("buy")}
              aria-selected={tab === "buy"}
            >
              For Sale
            </button>
          </div>
        </div>

        <div className={styles.previewGrid} role="list">
          {filtered.map((car, i) => (
            <div
              key={car.id}
              ref={(el) => (cardsRef.current[i] = el)}
              style={{ opacity: 0 }}
              role="listitem"
            >
              <PreviewCard car={car} />
            </div>
          ))}
        </div>

        <div className={styles.listingsCTA}>
          <Link to="/login" className={styles.ctaOutlineBtn}>
            View All {tab === "rent" ? "Rentals" : "Sales"}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── CTA Banner ──────────────────────────────────────────── */
function CTABanner() {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
      },
    );
  }, []);

  return (
    <section
      ref={ref}
      className={styles.ctaSection}
      style={{ opacity: 0 }}
      aria-labelledby="cta-heading"
    >
      <div className={styles.ctaInner}>
        <h2 id="cta-heading" className={styles.ctaHeadline}>
          Ready to drive?
        </h2>
        <p className={styles.ctaSub}>
          Create an account in 2 minutes. No credit card required.
        </p>
        <Link to="/register" className={styles.ctaMainBtn}>
          Get Started. It's Free
        </Link>
      </div>
    </section>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function Website() {
  return (
    <>
      <WebNavbar />
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <ListingsSection />
      <CTABanner />
      <Footer />
    </>
  );
}
