import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Register.module.css';

export default function Register() {
  const { register, isAuthenticated, isAdmin, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    password: '', confirm_password: '',
  });
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate(isAdmin ? '/admin' : '/home', { replace: true });
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => { if (error) setLocalError(error); }, [error]);

  function handleChange(e) {
    setLocalError('');
    clearError();
    setFieldErrors((p) => ({ ...p, [e.target.name]: '' }));
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function validate() {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required.';
    if (!form.last_name.trim())  errs.last_name  = 'Last name is required.';
    if (!form.email.trim())      errs.email      = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password)          errs.password   = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setSubmitting(true);
    try {
      const { confirm_password, ...payload } = form;
      await register(payload);
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch {
      /* handled by context */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* Brand panel */}
      <aside className={styles.brand} aria-hidden="true">
        <div className={styles.brandInner}>
          <span className={styles.logo}>DriveLink</span>
          <h1 className={styles.brandHeadline}>Join thousands<br />of drivers.</h1>
          <p className={styles.brandSub}>
            Create a free account and unlock rentals, purchases, and 24/7 support. All in one place.
          </p>
          <ul className={styles.perks}>
            {['No hidden fees', 'Paystack-secured payments', 'Free delivery in Reedemption City', '24/7 support'].map((p) => (
              <li key={p} className={styles.perk}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                {p}
              </li>
            ))}
          </ul>
          <div className={styles.blob1} />
          <div className={styles.blob2} />
        </div>
      </aside>

      {/* Form panel */}
      <main className={styles.formPanel}>
        <div className={styles.formCard}>
          <Link to="/" className={styles.mobileLogoLink}>
            <span className={styles.mobileLogo}>DriveLink</span>
          </Link>

          <h2 className={styles.title}>Create your account</h2>
          <p className={styles.subtitle}>Free forever. No credit card required.</p>

          {localError && (
            <div className={styles.errorBanner} role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {localError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            <div className={styles.row2}>
              <FormField label="First Name" error={fieldErrors.first_name}>
                <input name="first_name" type="text" autoComplete="given-name" className={`${styles.input} ${fieldErrors.first_name ? styles.inputErr : ''}`} placeholder="Alex" value={form.first_name} onChange={handleChange} required />
              </FormField>
              <FormField label="Last Name" error={fieldErrors.last_name}>
                <input name="last_name" type="text" autoComplete="family-name" className={`${styles.input} ${fieldErrors.last_name ? styles.inputErr : ''}`} placeholder="Johnson" value={form.last_name} onChange={handleChange} required />
              </FormField>
            </div>

            <FormField label="Email address" error={fieldErrors.email}>
              <input name="email" type="email" autoComplete="email" className={`${styles.input} ${fieldErrors.email ? styles.inputErr : ''}`} placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </FormField>

            <FormField label="Phone (optional)">
              <input name="phone" type="tel" autoComplete="tel" className={styles.input} placeholder="+234 800 000 0000" value={form.phone} onChange={handleChange} />
            </FormField>

            <FormField label="Password" error={fieldErrors.password}>
              <div className={styles.passWrap}>
                <input name="password" type={showPass ? 'text' : 'password'} autoComplete="new-password" className={`${styles.input} ${fieldErrors.password ? styles.inputErr : ''}`} placeholder="Min. 8 characters" value={form.password} onChange={handleChange} required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass((p) => !p)} aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </FormField>

            <FormField label="Confirm Password" error={fieldErrors.confirm_password}>
              <div className={styles.passWrap}>
                <input name="confirm_password" type={showConf ? 'text' : 'password'} autoComplete="new-password" className={`${styles.input} ${fieldErrors.confirm_password ? styles.inputErr : ''}`} placeholder="Repeat password" value={form.confirm_password} onChange={handleChange} required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConf((p) => !p)} aria-label={showConf ? 'Hide confirm password' : 'Show confirm password'}>
                  {showConf ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </FormField>

            <button type="submit" className={styles.submitBtn} disabled={submitting || loading} aria-busy={submitting}>
              {submitting ? <span className={styles.spinner} aria-hidden="true" /> : 'Create Account'}
            </button>
          </form>

          <p className={styles.loginPrompt}>
            Already have an account?{' '}
            <Link to="/login" className={styles.loginLink}>Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
      {error && <span className={styles.fieldError} role="alert">{error}</span>}
    </div>
  );
}

function Eye() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function EyeOff() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}