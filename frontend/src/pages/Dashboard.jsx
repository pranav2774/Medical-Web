import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../utils/authService';
import UserDropdown from '../components/UserDropdown';
import logoImg from '../assets/logo.png';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition">
              <img src={logoImg} alt="Morya Medical Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
              <div className="text-xl sm:text-2xl font-bold text-primary-600">Morya Medical</div>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {user && <UserDropdown user={user} />}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-4">Welcome to Morya Medical</h2>
          <p className="text-gray-500">Your trusted medical shop</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
