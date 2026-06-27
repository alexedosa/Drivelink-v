import styles from "./Hero.module.css";

export default function Hero() {
  const handleScrollDown = () => {
    const nextSection = document.getElementById("features");

    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <section className={styles.hero} aria-label="DriveLink Hero Section">
      <div className={styles.overlay} />

      <div className={styles.content}>
        <h1 className={styles.headline}>
          Find Your <span>Perfect Ride</span>
        </h1>

        <p className={styles.subtext}>
          Rent or buy premium vehicles with a clean and seamless experience.
        </p>

        <button className={styles.ctaButton} onClick={handleScrollDown}>
          Explore Cars
        </button>
      </div>
    </section>
  );
}
