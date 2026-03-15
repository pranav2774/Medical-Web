import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { medicineService } from '../utils/medicineService';
import AddMedicineModal from '../components/AddMedicineModal';
import EditMedicineModal from '../components/EditMedicineModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import MedicineCard from '../components/MedicineCard';
import { authService } from '../utils/authService';
import logoImg from '../assets/logo.png';
import AdminNavbar from '../components/AdminNavbar';

const StoreManagement = () => {
    const [user, setUser] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [illnessFilter, setIllnessFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        if (currentUser?.role !== 'admin') {
            window.location.href = '/dashboard';
        }

        fetchMedicines();
    }, [currentPage, searchTerm, categoryFilter, illnessFilter, stockFilter]);

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: currentPage,
                limit: 20,
            };

            if (searchTerm) params.search = searchTerm;
            if (categoryFilter) params.category = categoryFilter;
            if (illnessFilter) params.illnessCategory = illnessFilter;
            if (stockFilter !== '') params.stockStatus = stockFilter;

            const response = await medicineService.getAllMedicines(params);

            setMedicines(response.data);
            setTotalPages(response.pages);
            setTotalCount(response.total);
        } catch (err) {
            setError(err.message || 'Failed to fetch medicines');
            console.error('Fetch medicines error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedicine = async (medicineData) => {
        try {
            await medicineService.createMedicine(medicineData);
            setShowAddModal(false);
            fetchMedicines();
            showToast('Medicine added successfully!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to add medicine', 'error');
        }
    };

    const handleEditMedicine = async (medicineData) => {
        try {
            await medicineService.updateMedicine(selectedMedicine._id, medicineData);
            setShowEditModal(false);
            setSelectedMedicine(null);
            fetchMedicines();
            showToast('Medicine updated successfully!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to update medicine', 'error');
        }
    };

    const handleDeleteMedicine = async () => {
        try {
            await medicineService.deleteMedicine(selectedMedicine._id);
            setShowDeleteDialog(false);
            setSelectedMedicine(null);
            fetchMedicines();
            showToast('Medicine deleted successfully!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to delete medicine', 'error');
        }
    };

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    const showToast = (message, type) => {
        // Simple toast implementation - you can enhance this
        alert(message);
    };

    const openEditModal = (medicine) => {
        setSelectedMedicine(medicine);
        setShowEditModal(true);
    };

    const openDeleteDialog = (medicine) => {
        setSelectedMedicine(medicine);
        setShowDeleteDialog(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    const getStockBadgeClass = (stockStatus) => {
        return stockStatus
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700';
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
                            <span className="hidden sm:inline text-gray-600 text-sm font-medium">Welcome, {user?.name}!</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-sm hover:bg-gray-800 transition-colors"
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
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Medicine Inventory</h1>
                            <p className="text-gray-600 mt-1">{totalCount} total medicines</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Medicine
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white p-4 border border-gray-200 rounded-sm mb-6 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <input
                                    type="text"
                                    placeholder="Search by name, manufacturer, or illness..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm transition-colors"
                                />
                            </div>

                            {/* Category Filter */}
                            <div>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => {
                                        setCategoryFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                                >
                                    <option value="">All Categories</option>
                                    <option value="tablet">Tablet</option>
                                    <option value="capsule">Capsule</option>
                                    <option value="syrup">Syrup</option>
                                    <option value="injection">Injection</option>
                                    <option value="cream">Cream</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Illness Category Filter */}
                            <div>
                                <select
                                    value={illnessFilter}
                                    onChange={(e) => {
                                        setIllnessFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                                >
                                    <option value="">All Illnesses</option>
                                    <option value="headache">Headache</option>
                                    <option value="stomach-pain">Stomach Pain</option>
                                    <option value="fever">Fever</option>
                                    <option value="cough">Cough</option>
                                    <option value="cold">Cold</option>
                                    <option value="allergy">Allergy</option>
                                    <option value="pain-relief">Pain Relief</option>
                                    <option value="diabetes">Diabetes</option>
                                    <option value="hypertension">Hypertension</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Stock Filter */}
                            <div>
                                <select
                                    value={stockFilter}
                                    onChange={(e) => {
                                        setStockFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                                >
                                    <option value="">All Stock Status</option>
                                    <option value="true">In Stock</option>
                                    <option value="false">Out of Stock</option>
                                </select>
                            </div>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2 mt-4 justify-end">
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">View:</span>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors border ${viewMode === 'table'
                                    ? 'bg-gray-900 text-white border-transparent'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                Table
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors border ${viewMode === 'grid'
                                    ? 'bg-gray-900 text-white border-transparent'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                Grid
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading medicines...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="card p-6 bg-red-50 border border-red-200">
                        <p className="text-red-700">{error}</p>
                        <button onClick={fetchMedicines} className="mt-4 btn-primary">
                            Retry
                        </button>
                    </div>
                )}

                {/* Table View */}
                {!loading && !error && viewMode === 'table' && (
                    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-gray-700 font-semibold">Name</th>
                                        <th className="px-4 py-3 text-left text-gray-700 font-semibold hidden md:table-cell">Category</th>
                                        <th className="px-4 py-3 text-left text-gray-700 font-semibold">Price</th>
                                        <th className="px-4 py-3 text-left text-gray-700 font-semibold">Stock</th>
                                        <th className="px-4 py-3 text-left text-gray-700 font-semibold hidden lg:table-cell">Expiry</th>
                                        <th className="px-4 py-3 text-left text-gray-700 font-semibold">Status</th>
                                        <th className="px-4 py-3 text-center text-gray-700 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicines.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                                No medicines found
                                            </td>
                                        </tr>
                                    ) : (
                                        medicines.map((medicine) => (
                                            <tr key={medicine._id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{medicine.name}</div>
                                                    {medicine.manufacturer && (
                                                        <div className="text-xs text-gray-500">{medicine.manufacturer}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 hidden md:table-cell">
                                                    <span className="capitalize">{medicine.category}</span>
                                                </td>
                                                <td className="px-4 py-3 font-medium">₹{medicine.price}</td>
                                                <td className="px-4 py-3">{medicine.quantity}</td>
                                                <td className="px-4 py-3 hidden lg:table-cell">
                                                    {formatDate(medicine.expiryDate)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStockBadgeClass(medicine.stockStatus)}`}>
                                                        {medicine.stockStatus ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => openEditModal(medicine)}
                                                            className="text-primary-600 hover:text-primary-700 p-1"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteDialog(medicine)}
                                                            className="text-red-600 hover:text-red-700 p-1"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Grid View */}
                {!loading && !error && viewMode === 'grid' && (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {medicines.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No medicines found
                            </div>
                        ) : (
                            medicines.map((medicine) => (
                                <MedicineCard
                                    key={medicine._id}
                                    medicine={medicine}
                                    onEdit={() => openEditModal(medicine)}
                                    onDelete={() => openDeleteDialog(medicine)}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-1.5 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors border ${currentPage === 1
                                ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
                                }`}
                        >
                            Prev
                        </button>
                        <span className="text-sm font-medium text-gray-600 mx-2">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors border ${currentPage === totalPages
                                ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>

            {/* Modals */}
            {showAddModal && (
                <AddMedicineModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddMedicine}
                />
            )}

            {showEditModal && selectedMedicine && (
                <EditMedicineModal
                    medicine={selectedMedicine}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedMedicine(null);
                    }}
                    onSubmit={handleEditMedicine}
                />
            )}

            {showDeleteDialog && selectedMedicine && (
                <DeleteConfirmDialog
                    title="Delete Medicine"
                    message={`Are you sure you want to delete "${selectedMedicine.name}"? This action cannot be undone.`}
                    onConfirm={handleDeleteMedicine}
                    onCancel={() => {
                        setShowDeleteDialog(false);
                        setSelectedMedicine(null);
                    }}
                />
            )}
        </div>
    );
};

export default StoreManagement;
