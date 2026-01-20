import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../utils/authService';
import logoImg from '../assets/logo.png';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

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

  const isActive = (path) => {
    return location.pathname === path;
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

              <Link to="/admin" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition">
                <img src={logoImg} alt="Morya Medical Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
                <div className="text-xl sm:text-2xl font-bold text-primary-600">Morya Medical</div>
              </Link>
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
        <aside className={`fixed md:static w-64 bg-white shadow-sm min-h-[calc(100vh-64px)] z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}>
          <div className="p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Menu</h3>
            <nav className="space-y-2">
              <Link
                to="/admin"
                className={`block px-4 py-2 rounded-lg text-sm hover:bg-primary-100 transition ${isActive('/admin')
                  ? 'bg-primary-50 text-primary-600 font-semibold'
                  : 'text-gray-700'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/store"
                className={`block px-4 py-2 rounded-lg text-sm hover:bg-primary-100 transition ${isActive('/admin/store')
                  ? 'bg-primary-50 text-primary-600 font-semibold'
                  : 'text-gray-700'
                  }`}
              >
                Store Management
              </Link>
              <Link
                to="/admin/customers"
                className={`block px-4 py-2 rounded-lg text-sm hover:bg-primary-100 transition ${isActive('/admin/customers')
                  ? 'bg-primary-50 text-primary-600 font-semibold'
                  : 'text-gray-700'
                  }`}
              >
                User Management
              </Link>
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
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Welcome to Admin Dashboard</h2>
            <p className="text-gray-500">Use the sidebar to navigate to different sections</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
