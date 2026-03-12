import React from 'react';
import { useCart } from '../context/CartContext';

const PublicMedicineCard = ({ medicine }) => {
    const { addToCart, updateQuantity, getCartItem } = useCart();
    
    // Check if item is in cart and its quantity
    const cartItem = getCartItem(medicine._id);
    const cartQuantity = cartItem ? cartItem.cartQuantity : 0;
    const isOutOfStock = !medicine.stockStatus || medicine.quantity === 0;
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
        <div className="card h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Image */}
            <div className="h-24 sm:h-40 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden relative">
                {medicine.image ? (
                    <img
                        src={medicine.image}
                        alt={medicine.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <svg className="w-12 h-12 sm:w-20 sm:h-20 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                )}
                {medicine.requiresPrescription && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        ℞ Rx Required
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-2 sm:p-3 flex-1 flex flex-col">
                {/* Name and Category */}
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">
                    {medicine.name}
                </h3>
                <p className="text-xs text-gray-600 capitalize mb-1.5">{medicine.category}</p>

                {/* Manufacturer */}
                {medicine.manufacturer && (
                    <p className="text-xs text-gray-500 mb-2 italic">by {medicine.manufacturer}</p>
                )}

                {/* Price and Stock */}
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <p className="text-lg sm:text-xl font-bold text-primary-600">₹{medicine.price.toFixed(2)}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-semibold ${getStockBadgeClass(medicine.stockStatus)}`}>
                        {medicine.stockStatus ? '✓ In Stock' : '✗ Out of Stock'}
                    </span>
                </div>

                {/* Alerts */}
                {(isLowStock() || isExpiringSoon()) && (
                    <div className="mb-2 space-y-1">
                        {isLowStock() && (
                            <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Limited Stock Available
                            </div>
                        )}
                        {isExpiringSoon() && (
                            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                Expiring Soon
                            </div>
                        )}
                    </div>
                )}

                {/* Description if available */}
                {medicine.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{medicine.description}</p>
                )}

                {/* Expiry Date */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1.5 border-t border-gray-100 mb-3">
                    <span>Expiry: {formatDate(medicine.expiryDate)}</span>
                    {medicine.batchNumber && (
                        <span className="text-gray-400">Batch: {medicine.batchNumber}</span>
                    )}
                </div>

                {/* Cart Action */}
                <div className="mt-auto pt-2">
                    {cartQuantity > 0 ? (
                        <div className="flex items-center justify-between border border-primary-500 rounded-lg overflow-hidden h-9">
                            <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(medicine._id, -1); }}
                                className="w-10 h-full bg-primary-50 text-primary-700 hover:bg-primary-100 font-bold flex items-center justify-center transition"
                            >
                                -
                            </button>
                            <span className="flex-1 text-center font-bold text-gray-800">
                                {cartQuantity} in Cart
                            </span>
                            <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(medicine._id, 1); }}
                                disabled={cartQuantity >= medicine.quantity}
                                className={`w-10 h-full font-bold flex items-center justify-center transition ${cartQuantity >= medicine.quantity ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'}`}
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(medicine); }}
                            disabled={isOutOfStock}
                            className={`w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                                isOutOfStock 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicMedicineCard;
