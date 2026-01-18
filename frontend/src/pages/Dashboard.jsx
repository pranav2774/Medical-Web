import React, { useEffect, useState } from 'react';
import { authService } from '../utils/authService';
import logoImg from '../assets/logo.png';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={logoImg} alt="Morya Medical Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
              <div className="text-xl sm:text-2xl font-bold text-primary-600">Morya Medical</div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline text-gray-600 text-sm">Welcome, {user?.name}!</span>
              <button
                onClick={handleLogout}
                className="btn-primary text-xs sm:text-sm px-3 sm:px-6 py-1 sm:py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Stats cards will be added here */}
        </div>

        {/* Recent Orders */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold">Order ID</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold hidden sm:table-cell">Patient</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold hidden lg:table-cell">Status</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {/* Orders will be displayed here */}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
