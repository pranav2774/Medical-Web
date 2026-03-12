import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllOrders, updateOrderStatus } from '../utils/adminOrderService';
import { authService } from '../utils/authService';
import UserDropdown from '../components/UserDropdown';
import logoImg from '../assets/logo.png';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        if (currentUser?.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        fetchOrders();
    }, [navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getAllOrders();
            if (response.success) {
                setOrders(response.data);
            } else {
                setError('Failed to load orders');
            }
        } catch (err) {
            setError(err.message || 'Error loading orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, { status: newStatus });
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
        try {
            await updateOrderStatus(orderId, { paymentStatus: newPaymentStatus });
            setOrders(orders.map(o => o._id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
        } catch (err) {
            alert('Failed to update payment status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'packed': return 'bg-indigo-100 text-indigo-800';
            case 'ready_for_pickup': return 'bg-purple-100 text-purple-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'paid': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2 sm:gap-8">
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
                                <div className="text-xl sm:text-2xl font-bold text-gray-900 hidden sm:block">Admin Portal</div>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            {user && <UserDropdown user={user} />}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`fixed md:static w-64 bg-white shadow-sm min-h-[calc(100vh-64px)] z-40 transform transition-transform duration-300 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>
                    <div className="p-4 sm:p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">Menu</h3>
                        <nav className="space-y-2">
                            <Link
                                to="/admin"
                                className="block px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/admin/store"
                                className="block px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                                Medicine Catalog
                            </Link>
                            <Link
                                to="/admin/customers"
                                className="block px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                                Customers
                            </Link>
                            <Link
                                to="/admin/orders"
                                className="block px-4 py-2 rounded-lg text-sm bg-primary-50 text-primary-600 font-semibold transition"
                            >
                                Pickup Orders
                            </Link>
                        </nav>
                    </div>
                </aside>

                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pickup Orders</h1>
                            <p className="text-gray-600 mt-1">Manage and track customer pickup requests</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Summary</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{order.patientId?.name || 'Unknown User'}</div>
                                                    <div className="text-sm text-gray-500">{order.patientId?.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs break-words">
                                                        <ul className="list-disc pl-4 space-y-1">
                                                            {order.medicines.map((m, idx) => (
                                                                <li key={idx}>
                                                                    <span className="font-medium text-gray-700">{m.quantity}x</span> {m.medicineId?.name || 'Unknown'}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-gray-600 space-y-1">
                                                        <p><span className="font-semibold text-gray-800">Mo:</span> {order.phone}</p>
                                                        <p><span className="font-semibold text-gray-800">Pickup:</span> {new Date(order.pickupDate).toLocaleDateString()} at {order.pickupTime}</p>
                                                        {order.notes && <p className="italic text-gray-500 line-clamp-1">"{order.notes}"</p>}
                                                        {order.prescriptionImageUrl && (
                                                            <a href={order.prescriptionImageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium mt-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                                                                Rx Attached
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    ₹{order.totalPrice.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        className={`text-sm rounded-full px-3 py-1 font-semibold border-none cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 ${getStatusColor(order.status)}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="packed">Packed</option>
                                                        <option value="ready_for_pickup">Ready for Pickup</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={order.paymentStatus}
                                                        onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                                                        className={`text-sm rounded-full px-3 py-1 font-semibold border-none cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 ${getPaymentStatusColor(order.paymentStatus)}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="paid">Paid</option>
                                                        <option value="failed">Failed</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                    No pickup orders found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminOrders;
