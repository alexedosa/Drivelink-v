import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import UserNavbar from '../components/user/UserNavbar';
import CarGrid from '../components/user/CarGrid';
import CarModal from '../components/user/CarModal';
import CarFilter from '../components/user/CarFilter';
import Footer from '../components/common/Footer';
import styles from './UserHome.module.css';

export default function UserHome() {
  const [activeTab, setActiveTab] = useState('rent');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { api } = useAuth();

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const categoryMap = { rent: 'rental', buy: 'purchase' };
      const category = categoryMap[activeTab];
      
      const params = new URLSearchParams();
      params.append('category', category);
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      Object.entries(activeFilters).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });

      const response = await api.get(`/cars/?${params.toString()}`);
      setCars(response.data.results || response.data || []);
    } catch (err) {
      console.error("Failed to fetch cars", err);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, activeFilters, api]);

  const loadWishlist = useCallback(async () => {
    try {
      const response = await api.get('/cars/wishlist/');
      // Store array of car IDs that are in the user's wishlist
      setWishlist(response.data.results?.map(car => car.id) || []);
    } catch (err) {
      console.error("Failed to load wishlist", err);
    }
  }, [api]);

  useEffect(() => {
    fetchCars();
    loadWishlist();
  }, [fetchCars, loadWishlist]);

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
      setWishlist(prev =>
        prev.includes(carId) ? prev.filter(id => id !== carId) : [...prev, carId]
      );
    } catch (err) {
      console.error("Failed to toggle wishlist", err);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilters({});
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setFilterSidebarOpen(false);
  };

  return (
    <div className={styles.page}>
      <UserNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearch={setSearchQuery}
        filterActive={Object.keys(activeFilters).length > 0}
        onFilterToggle={() => setFilterSidebarOpen(true)}
      />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {activeTab === 'rent' ? 'Cars for Rent' : 'Cars for Sale'}
          </h1>
          <p className={styles.subtitle}>
            {activeTab === 'rent'
              ? 'Find the perfect vehicle for your next road trip or daily commute.'
              : 'Browse our premium selection of vehicles for your own garage.'}
          </p>
        </div>
        <CarGrid
          cars={cars}
          loading={loading}
          wishlist={wishlist}
          onCarClick={handleCarClick}
          onHeartClick={handleHeartClick}
          onClearFilters={handleClearFilters}
        />
      </main>
      <Footer />
      
      {filterSidebarOpen && (
        <CarFilter 
          activeFilters={activeFilters}
          onApply={handleApplyFilters}
          onClose={() => setFilterSidebarOpen(false)}
        />
      )}

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