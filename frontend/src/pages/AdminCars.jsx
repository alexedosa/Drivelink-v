import { useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminNavbar from "../components/admin/AdminNavbar";
import CarTable from "../components/admin/CarTable";
import AdminCarModal from "../components/admin/AdminCarModal";
import styles from "./AdminCars.module.css";

export default function AdminCars() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [tableKey, setTableKey] = useState(0);

  function handleAdd() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function handleEdit(car) {
    setEditTarget(car);
    setModalOpen(true);
  }

  function handleSuccess() {
    setModalOpen(false);
    setTableKey((k) => k + 1);
  }

  return (
    <div className={styles.layout}>
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={styles.body}>
        <AdminNavbar onMenuToggle={() => setSidebarOpen((p) => !p)} />

        <main className={styles.main} aria-label="Cars management">
          <div className={styles.inner}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Cars Management</h1>
              <p className={styles.pageSub}>
                Add, edit, and manage your vehicle inventory.
              </p>
            </div>

            <div className={styles.tableCard}>
              <CarTable key={tableKey} onAdd={handleAdd} onEdit={handleEdit} />
            </div>
          </div>
        </main>
      </div>

      <AdminCarModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        car={editTarget}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
