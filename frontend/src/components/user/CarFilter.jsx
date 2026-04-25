import { useState, useEffect } from 'react';
import styles from './CarFilter.module.css';

const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'];
const TRANSMISSIONS = ['manual', 'automatic'];

export default function CarFilter({ activeFilters, onApply, onClose }) {
  const [filters, setFilters] = useState(activeFilters || {});

  useEffect(() => {
    setFilters(activeFilters || {});
  }, [activeFilters]);

  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
  };

  const handleClear = () => {
    setFilters({});
    onApply({});
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sidebar} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Filters</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.body}>
          {/* Brand */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>Brand</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="e.g. Toyota" 
              value={filters.brand || ''}
              onChange={e => handleChange('brand', e.target.value)}
            />
          </div>

          {/* Fuel Type */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>Fuel Type</label>
            <select 
              className={styles.select}
              value={filters.fuel_type || ''}
              onChange={e => handleChange('fuel_type', e.target.value)}
            >
              <option value="">Any</option>
              {FUEL_TYPES.map(f => (
                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Transmission */}
          <div className={styles.filterGroup}>
            <label className={styles.label}>Transmission</label>
            <select 
              className={styles.select}
              value={filters.transmission || ''}
              onChange={e => handleChange('transmission', e.target.value)}
            >
              <option value="">Any</option>
              {TRANSMISSIONS.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.clearBtn} onClick={handleClear}>Clear</button>
          <button className={styles.applyBtn} onClick={handleApply}>Apply Filters</button>
        </div>
      </div>
    </div>
  );
}
