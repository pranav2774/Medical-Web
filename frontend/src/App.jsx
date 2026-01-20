import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import StoreManagement from './pages/StoreManagement';
import CustomerManagement from './pages/CustomerManagement';
import UserProfile from './pages/UserProfile';
import UserSettings from './pages/UserSettings';
import { authService } from './utils/authService';

const PrivateRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/store" element={<PrivateRoute><StoreManagement /></PrivateRoute>} />
        <Route path="/admin/customers" element={<PrivateRoute><CustomerManagement /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><UserSettings /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
