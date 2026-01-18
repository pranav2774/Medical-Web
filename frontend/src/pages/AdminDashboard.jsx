import React, { useEffect, useState } from 'react';
import { authService } from '../utils/authService';
import logoImg from '../assets/logo.png';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    // Redirect if not admin
    if (currentUser?.role !== 'admin') {
      window.location.href = '/dashboard';
    }
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
            <div className="flex items-center gap-2 sm:gap-8">
              {/* Hamburger Menu - Mobile */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <img src={logoImg} alt="Morya Medical Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
                <div className="text-xl sm:text-2xl font-bold text-primary-600">Morya Medical</div>
              </div>
              <div className="hidden sm:block text-sm font-semibold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                Admin Panel
              </div>
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

      {/* Sidebar & Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed md:static w-64 bg-white shadow-sm min-h-[calc(100vh-64px)] z-40 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Menu</h3>
            <nav className="space-y-2">
              <a href="#" className="block px-4 py-2 rounded-lg bg-primary-50 text-primary-600 font-semibold text-sm hover:bg-primary-100 transition">Dashboard</a>
              <a href="#" className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition">Medicines</a>
              <a href="#" className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition">Orders</a>
              <a href="#" className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition">Users</a>
              <a href="#" className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition">Reports</a>
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {/* Stats Cards will be added here */}
          </div>

          {/* Orders Table */}
          <div className="card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Pending Orders</h2>
              <button className="btn-primary text-xs sm:text-sm w-full sm:w-auto">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold">Order ID</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold hidden sm:table-cell">Patient</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold hidden lg:table-cell">Medicines</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold">Amount</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-700 font-semibold">Action</th>
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
    </div>
  );
};

export default AdminDashboard;
