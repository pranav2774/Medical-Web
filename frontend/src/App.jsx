import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import StoreManagement from './pages/StoreManagement';
import CustomerManagement from './pages/CustomerManagement';
import AdminOrders from './pages/AdminOrders';
import UserProfile from './pages/UserProfile';
import UserSettings from './pages/UserSettings';
import MedicineCatalog from './pages/MedicineCatalog';
import UserMedicineStore from './pages/UserMedicineStore';
import VerifyEmail from './pages/VerifyEmail';
import CartPage from './pages/CartPage';
import MyOrders from './pages/MyOrders';
import EnvIndicator from './components/EnvIndicator';
import { authService } from './utils/authService';
import { CartProvider } from './context/CartContext';

const PrivateRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <CartProvider>
      <Router>
        <EnvIndicator />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MedicineCatalog />} />
          <Route path="/medicines" element={<MedicineCatalog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Private Routes */}
          <Route path="/dashboard" element={<PrivateRoute><UserMedicineStore /></PrivateRoute>} />
          <Route path="/store" element={<PrivateRoute><UserMedicineStore /></PrivateRoute>} />
          <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
          <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/store" element={<PrivateRoute><StoreManagement /></PrivateRoute>} />
          <Route path="/admin/customers" element={<PrivateRoute><CustomerManagement /></PrivateRoute>} />
          <Route path="/admin/orders" element={<PrivateRoute><AdminOrders /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><UserSettings /></PrivateRoute>} />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;
