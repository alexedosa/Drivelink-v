import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import UserNavbar from '../components/user/UserNavbar';
import CarGrid from '../components/user/CarGrid';
import CarModal from '../components/user/CarModal';
import Footer from '../components/common/Footer';

export default function Wishlist() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { api } = useAuth();

  const fetchWishlistCars = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/cars/wishlist/');
      const fetchedCars = response.data.results || response.data || [];
      setCars(fetchedCars);
      setWishlist(fetchedCars.map(car => car.id));
    } catch (err) {
      console.error("Failed to fetch wishlist cars", err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchWishlistCars();
  }, [fetchWishlistCars]);

  const handleCarClick = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
  };

  const handleHeartClick = async (carId) => {
    try {
      await api.post(`/cars/${carId}/wishlist/`);
      // Optimistically remove from grid
      setWishlist(prev => prev.filter(id => id !== carId));
      setCars(prev => prev.filter(car => car.id !== carId));
    } catch (err) {
      console.error("Failed to toggle wishlist", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <UserNavbar activeTab="wishlist" />
      
      <main style={{ flex: 1, maxWidth: 'var(--container-max)', margin: '0 auto', width: '100%', padding: '40px var(--container-pad)' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>My Wishlist</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Your saved vehicles for future rentals or purchases.</p>
        </div>

        {cars.length === 0 && !loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>Your wishlist is empty</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Browse cars and click the heart icon to save them here.</p>
          </div>
        ) : (
          <CarGrid
            cars={cars}
            loading={loading}
            wishlist={wishlist}
            onCarClick={handleCarClick}
            onHeartClick={handleHeartClick}
          />
        )}
      </main>

      <Footer />

      {selectedCar && (
        <CarModal
          car={selectedCar}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
