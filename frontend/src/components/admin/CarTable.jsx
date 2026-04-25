import { useState, useEffect, useCallback } from 'react';
import { api } from '../../context/AuthContext';
import styles from './CarTable.module.css';

function formatPrice(amount) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

function StockDot({ stock }) {
  const cls = stock === 0 ? styles.dotRed : stock <= 3 ? styles.dotYellow : styles.dotGreen;
  return <span className={`${styles.dot} ${cls}`} aria-hidden="true" />;
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
      onClick={onChange}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

function DeleteModal({ car, onConfirm, onCancel }) {
  return (
    <div className={styles.deleteOverlay} role="dialog" aria-modal="true" aria-label="Confirm deletion">
      <div className={styles.deleteModal}>
        <h3 className={styles.deleteTitle}>Delete Car?</h3>
        <p className={styles.deleteMsg}>
          <strong>{car?.name}</strong> will be soft-deleted and hidden from all listings.
        </p>
        <div className={styles.deleteBtns}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function CarTable({ onEdit, onAdd }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const PAGE_SIZE = 10;

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (search)         params.search   = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter)   params.is_active = statusFilter === 'active';

      const { data } = await api.get('/cars/', { params });
      setCars(data.results ?? data);
      if (data.count != null) setTotalPages(Math.ceil(data.count / PAGE_SIZE));
    } catch {
      setError('Failed to load cars. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  async function toggleActive(car) {
    try {
      await api.patch(`/cars/admin/update/${car.id}/`, { is_active: !car.is_active });
      setCars((prev) => prev.map((c) => c.id === car.id ? { ...c, is_active: !c.is_active } : c));
    } catch {
      setError('Could not update status.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/cars/admin/delete/${deleteTarget.id}/`);
      setDeleteTarget(null);
      fetchCars();
    } catch {
      setError('Could not delete car.');
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search cars…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              aria-label="Search cars"
            />
          </div>

          <select
            className={styles.select}
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            <option value="rental">Rental</option>
            <option value="purchase">Purchase</option>
          </select>

          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button className={styles.addBtn} onClick={onAdd} aria-label="Add new car">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New Car
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">{error}</div>
      )}

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table} aria-label="Cars management table">
          <thead>
            <tr>
              <th scope="col">Image</th>
              <th scope="col">Name / Brand</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
              <th scope="col">Stock</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} aria-hidden="true">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j}><div className={styles.skeletonCell} /></td>
                  ))}
                </tr>
              ))
            ) : cars.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyCell}>No cars found.</td>
              </tr>
            ) : (
              cars.map((car) => (
                <tr key={car.id} className={styles.row}>
                  {/* Image */}
                  <td>
                    <div className={styles.thumb}>
                      {car.main_image
                        ? <img src={car.main_image.startsWith('http') ? car.main_image : `${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000'}${car.main_image}`} alt={`${car.brand} ${car.name}`} />
                        : <span className={styles.thumbPlaceholder} aria-hidden="true">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                          </span>
                      }
                    </div>
                  </td>

                  {/* Name */}
                  <td>
                    <span className={styles.carName}>{car.name}</span>
                    <span className={styles.carBrand}>{car.brand} · {car.model_year}</span>
                  </td>

                  {/* Category */}
                  <td>
                    <span className={`${styles.catBadge} ${car.category === 'rental' ? styles.catRent : styles.catSale}`}>
                      {car.category === 'rental' ? 'Rent' : 'Sale'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className={styles.price}>
                    {car.category === 'rental'
                      ? <>{formatPrice(car.daily_rate)}<span className={styles.perDay}>/day</span></>
                      : formatPrice(car.purchase_price)
                    }
                  </td>

                  {/* Stock */}
                  <td>
                    <div className={styles.stockCell}>
                      <StockDot stock={car.stock} />
                      <span>{car.stock}</span>
                    </div>
                  </td>

                  {/* Status toggle */}
                  <td>
                    <Toggle
                      checked={car.is_active}
                      onChange={() => toggleActive(car)}
                      label={`Toggle active status for ${car.name}`}
                    />
                  </td>

                  {/* Actions */}
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => onEdit?.(car)}
                        aria-label={`Edit ${car.name}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteTarget(car)}
                        aria-label={`Delete ${car.name}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination} aria-label="Table pagination">
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            ← Prev
          </button>
          <span className={styles.pageInfo} aria-live="polite">Page {page} of {totalPages}</span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}

      {deleteTarget && (
        <DeleteModal
          car={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}