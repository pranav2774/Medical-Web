import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../utils/authService';
import { getDashboardStats } from '../utils/dashboardService';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import logoImg from '../assets/logo.png';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Redirect if not admin
    if (currentUser?.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      if (res.success) {
        setStats(res.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

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
              <Link
                to="/admin/orders"
                className={`block px-4 py-2 rounded-lg text-sm hover:bg-primary-100 transition ${isActive('/admin/orders')
                  ? 'bg-primary-50 text-primary-600 font-semibold'
                  : 'text-gray-700'
                  }`}
              >
                Pickup Orders
              </Link>

              {/* Expense Management */}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-600 px-4 py-2 uppercase">Expense Management</h4>
                <Link
                  to="/admin/expenses"
                  className={`block px-4 py-2 rounded-lg text-sm hover:bg-primary-100 transition ${isActive('/admin/expenses')
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-gray-700'
                    }`}
                >
                  Expenses
                </Link>
                <Link
                  to="/admin/analytics"
                  className={`block px-4 py-2 rounded-lg text-sm hover:bg-primary-100 transition ${isActive('/admin/analytics')
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-gray-700'
                    }`}
                >
                  Analytics
                </Link>
                <Link
                  to="/admin/budget"
                  className={`block px-4 py-2 rounded-lg text-sm hover:bg-primary-100 transition ${isActive('/admin/budget')
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-gray-700'
                    }`}
                >
                  Budget Settings
                </Link>
              </div>
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
        <main className="flex-1 p-4 sm:p-8 w-full bg-gray-50 overflow-x-hidden min-h-screen">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Overview Dashboard</h2>
            <p className="text-gray-500 mt-1">Here's what is happening with your pharmacy today.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
              {error}
              <button onClick={fetchDashboardData} className="ml-4 underline font-medium">Retry</button>
            </div>
          ) : (
            stats && (
              <div className="space-y-6 max-w-7xl mx-auto">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Revenue */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats.kpi.todaysRevenue.toLocaleString()}</h3>
                      </div>
                      <div className="p-3 bg-green-50 rounded-xl text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Expenses */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Today's Expenses</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats.kpi.todaysExpenses.toLocaleString()}</h3>
                      </div>
                      <div className="p-3 bg-red-50 rounded-xl text-red-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 text-sm">
                      <span className={`font-semibold ${stats.kpi.todaysProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {stats.kpi.todaysProfit >= 0 ? '+' : ''}₹{stats.kpi.todaysProfit.toLocaleString()}
                      </span>
                      <span className="text-gray-400 ml-2">Net Profit Today</span>
                    </div>
                  </div>

                  {/* Pending Orders */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.kpi.pendingOrders}</h3>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                      </div>
                    </div>
                    <Link to="/admin/orders" className="mt-4 pt-4 border-t border-gray-50 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
                      View all orders <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </div>

                  {/* Low Stock */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.kpi.lowStockItems}</h3>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                    </div>
                    <Link to="/admin/store" className="mt-4 pt-4 border-t border-gray-50 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
                      Manage Inventory <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue vs Expenses Chart */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">7-Day Financial Performance</h3>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.salesTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `₹${value}`} dx={-10} />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            formatter={(value) => [`₹${value}`, undefined]}
                          />
                          <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                          <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Sub-widgets */}
                   <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Insights</h3>
                      <div className="flex-1 flex flex-col justify-center space-y-6">
                         <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                             <p className="text-sm font-medium text-gray-500 mb-1">Total Customer Base</p>
                             <div className="text-3xl font-black text-primary-700">{stats.kpi.totalCustomers}</div>
                             <p className="text-xs font-semibold text-gray-400 mt-2 uppercase tracking-wide">Registered Accounts</p>
                         </div>
                         <div className="p-4 rounded-xl border border-gray-100 bg-gradient-to-br from-primary-50 to-white">
                             <p className="text-sm font-medium text-gray-700 mb-3">Quick Actions</p>
                             <div className="grid grid-cols-2 gap-2">
                                <Link to="/admin/store" className="text-xs font-semibold bg-white border border-gray-200 rounded-lg p-2 text-center text-gray-600 hover:text-primary-600 hover:border-primary-200 transition">Add Meds</Link>
                                <Link to="/admin/expenses" className="text-xs font-semibold bg-white border border-gray-200 rounded-lg p-2 text-center text-gray-600 hover:text-primary-600 hover:border-primary-200 transition">Log Expense</Link>
                             </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                  <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Recent Pickup Orders</h3>
                    <Link to="/admin/orders" className="text-sm font-medium text-primary-600 hover:text-primary-700">View Full History</Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white text-gray-500 border-b border-gray-100 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-6 py-4">Order ID</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentOrders.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No recent orders.</td>
                          </tr>
                        ) : (
                          stats.recentOrders.map(order => (
                            <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                              <td className="px-6 py-4 font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</td>
                              <td className="px-6 py-4 text-gray-600">{order.patientId?.name || 'Guest'}</td>
                              <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {order.status.replace(/_/g, ' ').toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-gray-900 text-right">₹{order.totalPrice.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
