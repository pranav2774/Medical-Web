import React from 'react';

const MedicineCard = ({ medicine, onEdit, onDelete }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    const getStockBadgeClass = (stockStatus) => {
        return stockStatus
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700';
    };

    const isExpiringSoon = () => {
        const expiryDate = new Date(medicine.expiryDate);
        const today = new Date();
        const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysToExpiry <= 30 && daysToExpiry > 0;
    };

    const isLowStock = () => {
        return medicine.quantity > 0 && medicine.quantity <= 10;
    };

    return (
        <div className="card overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image - smaller on mobile */}
            <div className="h-28 sm:h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                {medicine.image ? (
                    <img
                        src={medicine.image}
                        alt={medicine.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <svg className="w-12 h-12 sm:w-20 sm:h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                )}
            </div>

            {/* Content - compact on mobile */}
            <div className="p-2 sm:p-4">
                {/* Name and Category */}
                <h3 className="font-bold text-gray-900 text-sm sm:text-lg mb-0.5 sm:mb-1 line-clamp-1">
                    {medicine.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 capitalize mb-1 sm:mb-2">{medicine.category}</p>

                {/* Manufacturer */}
                {medicine.manufacturer && (
                    <p className="text-xs text-gray-500 mb-2">{medicine.manufacturer}</p>
                )}

                {/* Price and Stock */}
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <div>
                        <p className="text-lg sm:text-2xl font-bold text-primary-600">₹{medicine.price}</p>
                        <p className="text-xs text-gray-500">Qty: {medicine.quantity}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-semibold ${getStockBadgeClass(medicine.stockStatus)}`}>
                        {medicine.stockStatus ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>

                {/* Alerts - more compact */}
                {(isLowStock() || isExpiringSoon()) && (
                    <div className="mb-2 space-y-0.5 sm:space-y-1">
                        {isLowStock() && (
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Low Stock
                            </div>
                        )}
                        {isExpiringSoon() && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                Expiring Soon
                            </div>
                        )}
                    </div>
                )}

                {/* Expiry Date */}
                <p className="text-xs text-gray-500 mb-2 sm:mb-4">
                    Exp: {formatDate(medicine.expiryDate)}
                </p>

                {/* Action Buttons - more compact on mobile */}
                <div className="flex gap-1 sm:gap-2">
                    <button
                        onClick={onEdit}
                        className="flex-1 px-2 py-1.5 sm:px-4 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-xs sm:text-sm font-medium"
                    >
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-2 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicineCard;
