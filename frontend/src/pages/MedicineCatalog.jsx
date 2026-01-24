import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicMedicineCard from '../components/PublicMedicineCard';
import { getPublicMedicines } from '../utils/publicMedicineService';
import logoImg from '../assets/logo.png';

const MedicineCatalog = () => {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter and search states
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
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

    const sortOptions = [
        { value: 'name-asc', label: 'Name: A-Z', sortBy: 'name', order: 'asc' },
        { value: 'name-desc', label: 'Name: Z-A', sortBy: 'name', order: 'desc' },
    ];

    const stockFilters = [
        { value: 'all', label: 'All Items' },
        { value: 'true', label: 'In Stock Only' },
        { value: 'false', label: 'Out of Stock' },
    ];

    useEffect(() => {
        fetchMedicines();
    }, [searchQuery, category, stockStatus, sortBy, sortOrder, page]);

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                search: searchQuery || undefined,
                category: category !== 'all' ? category : undefined,
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
        setPage(1); // Reset to first page on new search
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Navbar - matching admin style */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <img src={logoImg} alt="Morya Medical Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
                                <div className="text-xl sm:text-2xl font-bold text-primary-600">Morya Medical</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="btn-primary text-xs sm:text-sm px-3 sm:px-6 py-1 sm:py-2"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search medicines by name or manufacturer..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                            />
                            <svg
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                            <select
                                value={category}
                                onChange={handleCategoryChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Stock Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label>
                            <select
                                value={stockStatus}
                                onChange={handleStockFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            >
                                {stockFilters.map(filter => (
                                    <option key={filter.value} value={filter.value}>{filter.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Options */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort By</label>
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={handleSortChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                            {loading ? 'Loading...' : `Showing ${medicines.length} of ${total} medicines`}
                        </p>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="card overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-4">
                                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-12">
                        <div className="inline-block p-4 bg-red-50 rounded-lg">
                            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-600 font-medium">{error}</p>
                            <button
                                onClick={fetchMedicines}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && medicines.length === 0 && (
                    <div className="text-center py-16">
                        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Medicines Found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setCategory('all');
                                setStockStatus('all');
                                setPage(1);
                            }}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Medicine Grid */}
                {!loading && !error && medicines.length > 0 && (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-8">
                            {medicines.map(medicine => (
                                <PublicMedicineCard key={medicine._id} medicine={medicine} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${page === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-primary-600 hover:bg-primary-50 border border-primary-600'
                                        }`}
                                >
                                    Previous
                                </button>

                                <div className="flex gap-1">
                                    {[...Array(totalPages)].map((_, i) => {
                                        const pageNum = i + 1;
                                        // Show first 3 pages, last page, and current page
                                        if (pageNum <= 3 || pageNum === totalPages || Math.abs(pageNum - page) <= 1) {
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`px-3 py-2 rounded-lg font-medium transition ${page === pageNum
                                                        ? 'bg-primary-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        } else if (pageNum === 4 && page > 5) {
                                            return <span key={pageNum} className="px-2">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${page === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-primary-600 hover:bg-primary-50 border border-primary-600'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>


        </div>
    );
};

export default MedicineCatalog;
