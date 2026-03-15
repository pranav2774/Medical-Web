import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PublicMedicineCard from '../components/PublicMedicineCard';
import { getPublicMedicines } from '../utils/publicMedicineService';
import { authService } from '../utils/authService';
import UserDropdown from '../components/UserDropdown';
import logoImg from '../assets/logo.png';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer';

const UserMedicineStore = () => {
    const [user, setUser] = useState(null);
    const location = useLocation();
    const { getCartItemCount } = useCart();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter and search states
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [illnessCategory, setIllnessCategory] = useState('all');
    const [stockStatus, setStockStatus] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'tablet', label: 'Tablet' },
        { value: 'capsule', label: 'Capsule' },
        { value: 'syrup', label: 'Syrup' },
        { value: 'injection', label: 'Injection' },
        { value: 'cream', label: 'Cream' },
        { value: 'other', label: 'Other' },
    ];

    const illnesses = [
        { value: 'all', label: 'All Illnesses' },
        { value: 'headache', label: 'Headache' },
        { value: 'stomach-pain', label: 'Stomach Pain' },
        { value: 'fever', label: 'Fever / Temperature' },
        { value: 'cough', label: 'Cough' },
        { value: 'cold', label: 'Cold' },
        { value: 'allergy', label: 'Allergy' },
        { value: 'pain-relief', label: 'Pain Relief' },
        { value: 'diabetes', label: 'Diabetes' },
        { value: 'hypertension', label: 'Hypertension' },
        { value: 'other', label: 'Other' },
    ];

    const sortOptions = [
        { value: 'name-asc', label: 'Name: A-Z', sortBy: 'name', order: 'asc' },
        { value: 'name-desc', label: 'Name: Z-A', sortBy: 'name', order: 'desc' },
    ];

    const stockFilters = [
        { value: 'all', label: 'All Items' },
        { value: 'true', label: 'In Stock Only' },
        { value: 'false', label: 'Out of Stock' },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        if (currentUser?.role === 'admin') {
            window.location.href = '/admin';
        }
    }, []);

    useEffect(() => {
        fetchMedicines();
    }, [searchQuery, category, illnessCategory, stockStatus, sortBy, sortOrder, page]);

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                search: searchQuery || undefined,
                category: category !== 'all' ? category : undefined,
                illnessCategory: illnessCategory !== 'all' ? illnessCategory : undefined,
                stockStatus: stockStatus !== 'all' ? stockStatus : undefined,
                sortBy,
                order: sortOrder,
                page,
                limit: 12,
            };

            const response = await getPublicMedicines(params);

            if (response.success) {
                setMedicines(response.data);
                setTotalPages(response.pages);
                setTotal(response.total);
            } else {
                setError('Failed to fetch medicines');
            }
        } catch (err) {
            console.error('Error fetching medicines:', err);
            setError('Error loading medicines. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleSortChange = (e) => {
        const selectedOption = sortOptions.find(opt => opt.value === e.target.value);
        if (selectedOption) {
            setSortBy(selectedOption.sortBy);
            setSortOrder(selectedOption.order);
            setPage(1);
        }
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setPage(1);
    };

    const handleStockFilterChange = (e) => {
        setStockStatus(e.target.value);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2 sm:gap-8">

                            <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition">
                                <img src={logoImg} alt="Morya Medical Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
                                <div className="text-xl sm:text-2xl font-bold text-primary-600">Morya Medical</div>
                            </Link>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {getCartItemCount() > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                                        {getCartItemCount()}
                                    </span>
                                )}
                            </Link>
                            {user && <UserDropdown user={user} />}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1">
                <main className="flex-1 w-full pb-12">
                    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                        {/* Page Title */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Medicine Store</h1>
                            <p className="text-gray-500 text-sm">Browse and search our collection of medicines.</p>
                        </div>

                        {/* Search and Filters - Flat Design */}
                        <div className="mb-10">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-6">
                                {/* Search Bar */}
                                <div className="relative w-full xl:max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Search medicines by name, manufacturer..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
                                    />
                                    <svg
                                        className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>

                                {/* Filters Row */}
                                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 hidden xl:block">Category</label>
                                        <select
                                            value={category}
                                            onChange={handleCategoryChange}
                                            className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm min-w-[140px]"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Illness Category Filter */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 hidden xl:block">Illness</label>
                                        <select
                                            value={illnessCategory}
                                            onChange={(e) => {
                                                setIllnessCategory(e.target.value);
                                                setPage(1);
                                            }}
                                            className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm min-w-[140px]"
                                        >
                                            {illnesses.map(illness => (
                                                <option key={illness.value} value={illness.value}>{illness.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Stock Filter */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 hidden xl:block">Availability</label>
                                        <select
                                            value={stockStatus}
                                            onChange={handleStockFilterChange}
                                            className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm min-w-[140px]"
                                        >
                                            {stockFilters.map(filter => (
                                                <option key={filter.value} value={filter.value}>{filter.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Sort Options */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 hidden xl:block">Sort</label>
                                        <select
                                            value={`${sortBy}-${sortOrder}`}
                                            onChange={handleSortChange}
                                            className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm min-w-[140px]"
                                        >
                                            {sortOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="flex items-center text-sm text-gray-500 border-b border-gray-200 pb-4">
                                {loading ? 'Searching...' : `Showing ${medicines.length} of ${total} products`}
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white border border-gray-100 rounded-sm p-4 animate-pulse">
                                        <div className="h-40 bg-gray-100 mb-4 rounded-sm"></div>
                                        <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
                                        <div className="h-8 bg-gray-100 rounded w-full"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="text-center py-12 border border-gray-200 bg-white rounded-sm shadow-sm max-w-lg mx-auto">
                                <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-600 font-medium">{error}</p>
                                <button
                                    onClick={fetchMedicines}
                                    className="mt-6 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-sm border border-transparent hover:bg-gray-800 transition"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && medicines.length === 0 && (
                            <div className="text-center py-16 border border-gray-200 bg-white rounded-sm shadow-sm">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">No Medicines Found</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">Try adjusting your search criteria or resetting the filters to find what you're looking for.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setCategory('all');
                                        setIllnessCategory('all');
                                        setStockStatus('all');
                                        setPage(1);
                                    }}
                                    className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-sm hover:bg-gray-800 transition shadow-sm"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}

                        {/* Medicine Grid */}
                        {!loading && !error && medicines.length > 0 && (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-10">
                                    {medicines.map(medicine => (
                                        <PublicMedicineCard key={medicine._id} medicine={medicine} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-1.5 mt-10">
                                        <button
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                            className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors border ${page === 1
                                                ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
                                                }`}
                                        >
                                            Prev
                                        </button>

                                        <div className="flex gap-1 mx-2">
                                            {[...Array(totalPages)].map((_, i) => {
                                                const pageNum = i + 1;
                                                if (pageNum <= 3 || pageNum === totalPages || Math.abs(pageNum - page) <= 1) {
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`w-8 h-8 rounded-sm text-sm font-medium transition-colors border ${page === pageNum
                                                                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                } else if (pageNum === 4 && page > 5) {
                                                    return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === totalPages}
                                            className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors border ${page === totalPages
                                                ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
                                                }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default UserMedicineStore;
