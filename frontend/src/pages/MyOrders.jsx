import React, { useState, useEffect } from 'react';
import { getMyOrders } from '../utils/customerOrderService';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            setLoading(true);
            const data = await getMyOrders();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (err) {
            setError('Failed to fetch orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'packed':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'ready_for_pickup':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'completed':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusStyles = (status) => {
        switch (status) {
            case 'paid': return 'text-green-600 bg-green-50';
            case 'failed': return 'text-red-600 bg-red-50';
            default: return 'text-yellow-600 bg-yellow-50';
        }
    };

    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (includeTime) {
            return date.toLocaleString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }
        return date.toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="mt-2 text-sm text-gray-600">Track and view your pickup orders.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-500 mb-6">You haven't placed any pickup orders yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-gray-300 transition-colors">
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase font-semibold mb-0.5">Order Placed</p>
                                            <p className="text-gray-900 font-medium">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase font-semibold mb-0.5">Total</p>
                                            <p className="text-gray-900 font-medium">₹{order.totalPrice.toFixed(2)}</p>
                                        </div>
                                        <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase font-semibold mb-0.5">Order ID</p>
                                            <p className="text-gray-900 font-mono text-xs">{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3 items-center">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize border ${getStatusStyles(order.status)}`}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${getPaymentStatusStyles(order.paymentStatus)}`}>
                                            Payment: {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Body */}
                                <div className="p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2">Items</h4>
                                    <ul className="space-y-3 mb-6">
                                        {order.medicines.map((item, index) => (
                                            <li key={index} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded text-xs">{item.quantity}x</span>
                                                    <span className="text-gray-800">{item.medicineId?.name || 'Unknown Item'}</span>
                                                </div>
                                                <span className="text-gray-600 font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    
                                    <div className="bg-blue-50/50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border border-blue-100">
                                        <div>
                                            <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Pickup Details</p>
                                            <div className="text-gray-800 font-medium mb-1">
                                                Date: {formatDate(order.pickupDate)}
                                            </div>
                                            <div className="text-gray-800 font-medium">
                                                Time: {order.pickupTime}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Contact</p>
                                            <div className="text-gray-800">Mo: {order.phone}</div>
                                            <p className="text-gray-500 text-xs font-semibold uppercase mb-1 mt-3">Notes</p>
                                            <div className="text-gray-800 italic">{order.notes || 'None'}</div>
                                        </div>
                                        {order.prescriptionImageUrl && (
                                            <div className="sm:col-span-2 mt-2 pt-3 border-t border-blue-200">
                                                <a href={order.prescriptionImageUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 flex items-center gap-2 text-sm font-medium">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                                                    View Uploaded Prescription
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
