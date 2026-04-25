import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./UserNavbar.module.css";
import logo from "../../assets/logo.png";

function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback(
    (...args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );
}

export default function UserNavbar({
  activeTab = "rent",
  onTabChange,
  onSearch,
  onFilterToggle,
  filterActive = false,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const debouncedSearch = useDebounce((val) => onSearch?.(val), 300);

  function handleSearchChange(e) {
    setSearchVal(e.target.value);
    debouncedSearch(e.target.value);
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() ||
      user.email?.[0]?.toUpperCase()
    : "?";

  return (
    <header className={styles.nav} role="banner">
      <div className={styles.inner}>
        {/* Hamburger for mobile */}
        <button
          className={styles.hamburger}
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        {/* Logo */}
        <Link to="/home" className={styles.logo} aria-label="DriveLink home">
          <div className="logo">
            <img src={logo} alt="DriveLink" />
          </div>
        </Link>

        {/* Center tabs */}
        <nav className={styles.tabs} aria-label="Browse category">
          <button
            className={`${styles.tab} ${activeTab === "rent" ? styles.tabActive : ""}`}
            onClick={() => onTabChange ? onTabChange("rent") : navigate('/home')}
            aria-pressed={activeTab === "rent"}
          >
            Rent
          </button>
          <button
            className={`${styles.tab} ${activeTab === "buy" ? styles.tabActive : ""}`}
            onClick={() => onTabChange ? onTabChange("buy") : navigate('/home')}
            aria-pressed={activeTab === "buy"}
          >
            Buy
          </button>
        </nav>

        {/* Right controls */}
        <div className={styles.controls}>
          {/* Search bar */}
          <div
            className={`${styles.searchWrap} ${searchExpanded ? styles.searchExpanded : ""}`}
          >
            <button
              className={styles.searchIconBtn}
              onClick={() => {
                setSearchExpanded((p) => !p);
                setTimeout(() => searchRef.current?.focus(), 50);
              }}
              aria-label="Toggle search"
              aria-expanded={searchExpanded}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <input
              ref={searchRef}
              type="search"
              className={styles.searchInput}
              placeholder="Search cars..."
              value={searchVal}
              onChange={handleSearchChange}
              aria-label="Search cars"
            />
          </div>

          {/* Filter button */}
          <button
            className={`${styles.filterBtn} ${filterActive ? styles.filterActive : ""}`}
            onClick={onFilterToggle}
            aria-label="Toggle filters"
            aria-pressed={filterActive}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            <span className={styles.filterLabel}>Filter</span>
          </button>

          {/* Profile dropdown */}
          <div className={styles.profileWrap} ref={dropdownRef}>
            <button
              className={styles.avatar}
              onClick={() => setDropdownOpen((p) => !p)}
              aria-label="Open profile menu"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              style={
                user?.profile_picture
                  ? { padding: 0, border: "none", background: "transparent" }
                  : {}
              }
            >
              {user?.profile_picture ? (
                <img
                  src={
                    user.profile_picture.startsWith("http")
                      ? user.profile_picture
                      : `${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:8000"}${user.profile_picture}`
                  }
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                initials
              )}
            </button>

            {dropdownOpen && (
              <div
                className={styles.dropdown}
                role="menu"
                aria-label="Profile menu"
              >
                <div className={styles.dropdownUser}>
                  <span className={styles.dropdownName}>
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className={styles.dropdownEmail}>{user?.email}</span>
                </div>
                <div className={styles.dropdownDivider} />
                <DropdownItem
                  icon={<PersonIcon />}
                  label="My Profile"
                  onClick={() => {
                    navigate("/profile");
                    setDropdownOpen(false);
                  }}
                />
                <DropdownItem
                  icon={<HeartIcon />}
                  label="My Wishlist"
                  onClick={() => {
                    navigate("/wishlist");
                    setDropdownOpen(false);
                  }}
                />
                <DropdownItem
                  icon={<OrderIcon />}
                  label="My Rentals"
                  onClick={() => {
                    navigate("/history/rentals");
                    setDropdownOpen(false);
                  }}
                />
                <DropdownItem
                  icon={<OrderIcon />}
                  label="My Purchases"
                  onClick={() => {
                    navigate("/history/purchases");
                    setDropdownOpen(false);
                  }}
                />
                <div className={styles.dropdownDivider} />
                <DropdownItem
                  icon={<LogoutIcon />}
                  label="Logout"
                  onClick={handleLogout}
                  danger
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className={styles.mobileSidebar}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.mobileHeader}>
              <span style={{ fontSize: "18px", fontWeight: 800 }}>Menu</span>
              <button
                className={styles.closeBtn}
                onClick={() => setMobileMenuOpen(false)}
              >
                ×
              </button>
            </div>
            <nav className={styles.mobileNav}>
              <div className={styles.mobileNavTitle}>Category</div>
              <button
                className={`${styles.mobileNavItem} ${activeTab === "rent" ? styles.mobileNavActive : ""}`}
                onClick={() => {
                  onTabChange ? onTabChange("rent") : navigate('/home');
                  setMobileMenuOpen(false);
                }}
              >
                Rent Cars
              </button>
              <button
                className={`${styles.mobileNavItem} ${activeTab === "buy" ? styles.mobileNavActive : ""}`}
                onClick={() => {
                  onTabChange ? onTabChange("buy") : navigate('/home');
                  setMobileMenuOpen(false);
                }}
              >
                Buy Cars
              </button>

              <div
                className={styles.dropdownDivider}
                style={{ margin: "16px 0" }}
              />
              <div className={styles.mobileNavTitle}>Account</div>
              <button
                className={styles.mobileNavItem}
                onClick={() => {
                  navigate("/profile");
                  setMobileMenuOpen(false);
                }}
              >
                My Profile
              </button>
              <button
                className={styles.mobileNavItem}
                onClick={() => {
                  navigate("/wishlist");
                  setMobileMenuOpen(false);
                }}
              >
                My Wishlist
              </button>
              <button
                className={styles.mobileNavItem}
                onClick={() => {
                  navigate("/history/rentals");
                  setMobileMenuOpen(false);
                }}
              >
                My Rentals
              </button>
              <button
                className={styles.mobileNavItem}
                onClick={() => {
                  navigate("/history/purchases");
                  setMobileMenuOpen(false);
                }}
              >
                My Purchases
              </button>
              <button
                className={`${styles.mobileNavItem} ${styles.mobileNavDanger}`}
                onClick={handleLogout}
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function DropdownItem({ icon, label, onClick, danger }) {
  return (
    <button
      className={`${styles.dropdownItem} ${danger ? styles.dropdownItemDanger : ""}`}
      onClick={onClick}
      role="menuitem"
    >
      <span className={styles.dropdownItemIcon}>{icon}</span>
      {label}
    </button>
  );
}

function PersonIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function OrderIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
