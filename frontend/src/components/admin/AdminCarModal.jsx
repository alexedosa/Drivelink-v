import { useState, useEffect, useRef } from 'react';
import { api } from '../../context/AuthContext';
import styles from './AdminCarModal.module.css';

const DEFAULTS = {
  name: '', brand: '', model_year: new Date().getFullYear(),
  category: 'rental', description: '',
  fuel_type: 'petrol', transmission: 'automatic', seats: 5, color: '',
  daily_rate: '', purchase_price: '', stock: 0,
  is_available: true, is_active: true,
};

const MAX_GALLERY = 5;
const MAX_FILE_MB = 5;
const ACCEPTED    = ['image/jpeg', 'image/png', 'image/webp'];

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
      onClick={onChange}
    >
      <span className={styles.toggleThumb} />
      <span className={styles.toggleLabel}>{checked ? 'Yes' : 'No'}</span>
    </button>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label} {required && <span className={styles.req} aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <span className={styles.fieldError} role="alert">{error}</span>}
    </div>
  );
}

export default function AdminCarModal({ isOpen, onClose, car, onSuccess }) {
  const isEdit = !!car;
  const [form, setForm] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});
  const [mainImg, setMainImg] = useState(null);
  const [mainPreview, setMainPreview] = useState('');
  const [gallery, setGallery] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const mainInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const firstFieldRef = useRef(null);

  /* populate form when editing */
  useEffect(() => {
    if (isOpen) {
      setForm(car ? { ...DEFAULTS, ...car } : DEFAULTS);
      setMainPreview(car?.main_image || '');
      setMainImg(null);
      setGallery([]);
      setErrors({});
      setApiError('');
      setTimeout(() => firstFieldRef.current?.focus(), 80);
    }
  }, [isOpen, car]);

  /* lock scroll */
  useEffect(() => {
    document.body.classList.toggle('no-scroll', isOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [isOpen]);

  /* ESC close */
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  function set(key, val) {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: '' }));
  }

  function validateFile(file) {
    if (!ACCEPTED.includes(file.type)) return 'Only JPG, PNG, WEBP allowed.';
    if (file.size > MAX_FILE_MB * 1024 * 1024) return `Max ${MAX_FILE_MB}MB per image.`;
    return '';
  }

  function handleMainImg(e) {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { setErrors((p) => ({ ...p, main_image: err })); return; }
    setMainImg(file);
    setMainPreview(URL.createObjectURL(file));
    setErrors((p) => ({ ...p, main_image: '' }));
  }

  function handleGallery(e) {
    const files = Array.from(e.target.files);
    const remaining = MAX_GALLERY - gallery.length;
    const toAdd = files.slice(0, remaining);
    const invalid = toAdd.find((f) => validateFile(f));
    if (invalid) { setErrors((p) => ({ ...p, gallery: validateFile(invalid) })); return; }
    const previews = toAdd.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setGallery((p) => [...p, ...previews]);
    setErrors((p) => ({ ...p, gallery: '' }));
  }

  function removeGallery(i) {
    setGallery((p) => p.filter((_, idx) => idx !== i));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required.';
    if (!form.brand.trim()) e.brand = 'Brand is required.';
    if (!form.model_year || form.model_year < 1900 || form.model_year > new Date().getFullYear() + 1)
      e.model_year = 'Enter a valid year.';
    if (form.category === 'rental' && (!form.daily_rate || Number(form.daily_rate) <= 0))
      e.daily_rate = 'Daily rate must be greater than 0.';
    if (form.category === 'purchase' && (!form.purchase_price || Number(form.purchase_price) <= 0))
      e.purchase_price = 'Purchase price must be greater than 0.';
    if (form.stock < 0) e.stock = 'Stock cannot be negative.';
    if (!isEdit && !mainImg) e.main_image = 'Main image is required.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
          if (form.category === 'rental' && k === 'purchase_price') return;
          if (form.category === 'purchase' && k === 'daily_rate') return;
          fd.append(k, v);
        }
      });
      if (mainImg) fd.append('main_image', mainImg);
      gallery.forEach((g) => fd.append('gallery_images', g.file));

      if (isEdit) {
        await api.patch(`/cars/admin/update/${car.id}/`, fd);
      } else {
        await api.post('/cars/admin/create/', fd);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        Object.entries(data).forEach(([k, v]) => { fieldErrors[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(fieldErrors);
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit car' : 'Add new car'}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? 'Edit Car' : 'Add New Car'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {apiError && <div className={styles.apiBanner} role="alert">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate className={styles.form} encType="multipart/form-data">

          {/* ── Section 1: Basic Info ── */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>
            <div className={styles.row2}>
              <Field label="Car Name" required error={errors.name}>
                <input ref={firstFieldRef} type="text" className={`${styles.input} ${errors.name ? styles.inputError : ''}`} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Camry XSE" />
              </Field>
              <Field label="Brand" required error={errors.brand}>
                <input type="text" className={`${styles.input} ${errors.brand ? styles.inputError : ''}`} value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Toyota" />
              </Field>
            </div>
            <div className={styles.row2}>
              <Field label="Model Year" required error={errors.model_year}>
                <input type="number" className={`${styles.input} ${errors.model_year ? styles.inputError : ''}`} value={form.model_year} min="1900" max={new Date().getFullYear() + 1} onChange={(e) => set('model_year', Number(e.target.value))} />
              </Field>
              <Field label="Category" required>
                <div className={styles.radioGroup} role="radiogroup" aria-label="Category">
                  {['rental', 'purchase'].map((cat) => (
                    <label key={cat} className={`${styles.radioLabel} ${form.category === cat ? styles.radioActive : ''}`}>
                      <input type="radio" name="category" value={cat} checked={form.category === cat} onChange={() => set('category', cat)} className={styles.radioInput} />
                      {cat === 'rental' ? 'Rent' : 'Sale'}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
            <Field label="Description" error={errors.description}>
              <textarea className={styles.textarea} rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the car in detail…" />
            </Field>
          </section>

          {/* ── Section 2: Specs ── */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Specifications</h3>
            <div className={styles.row3}>
              <Field label="Fuel Type">
                <select className={styles.select} value={form.fuel_type} onChange={(e) => set('fuel_type', e.target.value)}>
                  {['petrol', 'diesel', 'electric', 'hybrid'].map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </select>
              </Field>
              <Field label="Transmission">
                <select className={styles.select} value={form.transmission} onChange={(e) => set('transmission', e.target.value)}>
                  {['automatic', 'manual'].map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </Field>
              <Field label="Seats" error={errors.seats}>
                <input type="number" className={styles.input} value={form.seats} min="1" max="15" onChange={(e) => set('seats', Number(e.target.value))} />
              </Field>
            </div>
            <Field label="Color">
              <input type="text" className={styles.input} value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="e.g. Pearl White" />
            </Field>
          </section>

          {/* ── Section 3: Pricing ── */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Pricing & Stock</h3>
            <div className={styles.row2}>
              {form.category === 'rental' ? (
                <Field label="Daily Rate (₦)" required error={errors.daily_rate}>
                  <input type="number" className={`${styles.input} ${errors.daily_rate ? styles.inputError : ''}`} value={form.daily_rate} min="0" onChange={(e) => set('daily_rate', e.target.value)} placeholder="0" />
                </Field>
              ) : (
                <Field label="Purchase Price (₦)" required error={errors.purchase_price}>
                  <input type="number" className={`${styles.input} ${errors.purchase_price ? styles.inputError : ''}`} value={form.purchase_price} min="0" onChange={(e) => set('purchase_price', e.target.value)} placeholder="0" />
                </Field>
              )}
              <Field label="Stock" error={errors.stock}>
                <input type="number" className={`${styles.input} ${errors.stock ? styles.inputError : ''}`} value={form.stock} min="0" onChange={(e) => set('stock', Number(e.target.value))} />
              </Field>
            </div>
          </section>

          {/* ── Section 4: Images ── */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Images</h3>
            <Field label="Main Image" required error={errors.main_image}>
              <div className={styles.uploadArea} onClick={() => mainInputRef.current?.click()} role="button" tabIndex={0} aria-label="Upload main image" onKeyDown={(e) => { if (e.key === 'Enter') mainInputRef.current?.click(); }}>
                {mainPreview ? (
                  <img src={mainPreview} alt="Main car preview" className={styles.uploadPreview} />
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>Click to upload main image</span>
                    <span className={styles.uploadHint}>JPG, PNG, WEBP · Max {MAX_FILE_MB}MB</span>
                  </div>
                )}
                <input ref={mainInputRef} type="file" accept={ACCEPTED.join(',')} className={styles.fileInput} onChange={handleMainImg} aria-hidden="true" tabIndex={-1} />
              </div>
            </Field>

            <Field label={`Gallery Images (${gallery.length}/${MAX_GALLERY})`} error={errors.gallery}>
              <div className={styles.galleryRow}>
                {gallery.map((g, i) => (
                  <div key={i} className={styles.galleryThumb}>
                    <img src={g.url} alt={`Gallery ${i + 1}`} />
                    <button type="button" className={styles.galleryRemove} onClick={() => removeGallery(i)} aria-label={`Remove gallery image ${i + 1}`}>×</button>
                  </div>
                ))}
                {gallery.length < MAX_GALLERY && (
                  <button type="button" className={styles.galleryAdd} onClick={() => galleryInputRef.current?.click()} aria-label="Add gallery images">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                )}
              </div>
              <input ref={galleryInputRef} type="file" accept={ACCEPTED.join(',')} multiple className={styles.fileInput} onChange={handleGallery} aria-hidden="true" tabIndex={-1} />
            </Field>
          </section>

          {/* ── Section 5: Status ── */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Status</h3>
            <div className={styles.toggleRow}>
              <div className={styles.toggleItem}>
                <span className={styles.toggleItemLabel}>Available</span>
                <Toggle checked={form.is_available} onChange={() => set('is_available', !form.is_available)} label="Toggle availability" />
              </div>
              <div className={styles.toggleItem}>
                <span className={styles.toggleItemLabel}>Active</span>
                <Toggle checked={form.is_active} onChange={() => set('is_active', !form.is_active)} label="Toggle active status" />
              </div>
            </div>
          </section>

          {/* ── Actions ── */}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={submitting} aria-busy={submitting}>
              {submitting ? <span className={styles.spinner} aria-hidden="true" /> : (isEdit ? 'Save Changes' : 'Add Car')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}