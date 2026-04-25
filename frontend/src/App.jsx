import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import RentalHistory from './pages/RentalHistory';
import PurchaseHistory from './pages/PurchaseHistory';
import Checkout from './pages/Checkout';
import PaymentCallback from './pages/PaymentCallback';
import AdminDashboard from './pages/AdminDashboard';
import AdminCars from './pages/AdminCars';
import AdminBookings from './pages/AdminBookings';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import NotFound from './pages/NotFound';
import Website from './pages/Website';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>  
          {/* Public routes */}
          <Route path="/" element={<Website />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected user routes */}
          <Route path="/home" element={
            <ProtectedRoute requiredRole="user">
              <UserHome />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute requiredRole="user">
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/wishlist" element={
            <ProtectedRoute requiredRole="user">
              <Wishlist />
            </ProtectedRoute>
          } />

          <Route path="/history/rentals" element={
            <ProtectedRoute requiredRole="user">
              <RentalHistory />
            </ProtectedRoute>
          } />

          <Route path="/history/purchases" element={
            <ProtectedRoute requiredRole="user">
              <PurchaseHistory />
            </ProtectedRoute>
          } />
          
          <Route path="/checkout/:id" element={
            <ProtectedRoute requiredRole="user">
              <Checkout />
            </ProtectedRoute>
          } />
          
          <Route path="/payment/callback" element={
            <ProtectedRoute requiredRole="user">
              <PaymentCallback />
            </ProtectedRoute>
          } />
          
          {/* Protected admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/cars" element={
            <ProtectedRoute requiredRole="admin">
              <AdminCars />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/bookings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminBookings />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;