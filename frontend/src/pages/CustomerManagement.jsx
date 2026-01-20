import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../utils/userService';
import { authService } from '../utils/authService';
import logoImg from '../assets/logo.png';

const CustomerManagement = () => {
    const [user, setUser] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        if (currentUser?.role !== 'admin') {
            window.location.href = '/dashboard';
        }

        fetchCustomers();
    }, []);

    useEffect(() => {
        // Filter customers based on search term
        if (searchTerm.trim() === '') {
            setFilteredCustomers(customers);
        } else {
            const filtered = customers.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (customer.phone && customer.phone.includes(searchTerm))
            );
            setFilteredCustomers(filtered);
        }
    }, [searchTerm, customers]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userService.getAllCustomers();
            setCustomers(response.data);
            setFilteredCustomers(response.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch customers');
            console.error('Fetch customers error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const exportToCSV = () => {
        if (filteredCustomers.length === 0) {
            alert('No customers to export');
            return;
        }

        // Create CSV header
        const headers = ['Name', 'Email', 'Phone', 'Address', 'Registration Date'];

        // Create CSV rows
        const rows = filteredCustomers.map(customer => [
            customer.name,
            customer.email,
            customer.phone || 'N/A',
            customer.address || 'N/A',
            formatDate(customer.createdAt)
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2 sm:gap-3">
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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Back Button */}
                <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 text-sm font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </Link>

                {/* Header with Actions */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Management</h1>
                            <p className="text-gray-600 mt-1">{filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} {searchTerm && '(filtered)'}</p>
                        </div>
                        <button
                            onClick={exportToCSV}
                            disabled={filteredCustomers.length === 0}
                            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export to CSV
                        </button>
                    </div>

                    {/* Search */}
                    <div className="card p-4">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading customers...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="card p-6 bg-red-50 border border-red-200">
                        <p className="text-red-700">{error}</p>
                        <button onClick={fetchCustomers} className="mt-4 btn-primary">
                            Retry
                        </button>
                    </div>
                )}

                {/* Customer Table */}
                {!loading && !error && (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-max">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-3 sm:px-4 py-3 text-left text-gray-700 font-semibold whitespace-nowrap">Name</th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-gray-700 font-semibold whitespace-nowrap">Email</th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-gray-700 font-semibold whitespace-nowrap">Phone</th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-gray-700 font-semibold whitespace-nowrap">Address</th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-gray-700 font-semibold whitespace-nowrap">Registered</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                                {searchTerm ? 'No customers found matching your search' : 'No customers registered yet'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCustomers.map((customer) => (
                                            <tr key={customer._id} className="border-b hover:bg-gray-50">
                                                <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{customer.name}</div>
                                                </td>
                                                <td className="px-3 sm:px-4 py-3 text-gray-700">
                                                    <div className="max-w-[200px] truncate">{customer.email}</div>
                                                </td>
                                                <td className="px-3 sm:px-4 py-3 text-gray-700 whitespace-nowrap">
                                                    {customer.phone || 'N/A'}
                                                </td>
                                                <td className="px-3 sm:px-4 py-3 text-gray-700">
                                                    <div className="max-w-[150px] truncate">{customer.address || 'N/A'}</div>
                                                </td>
                                                <td className="px-3 sm:px-4 py-3 text-gray-600 whitespace-nowrap">
                                                    {formatDate(customer.createdAt)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerManagement;
