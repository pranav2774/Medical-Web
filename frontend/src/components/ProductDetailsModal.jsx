import React, { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';

const ProductDetailsModal = ({ medicine, isOpen, onClose }) => {
    const { addToCart, updateQuantity, getCartItem } = useCart();
    const modalRef = useRef(null);

    // Check if item is in cart and its quantity
    const cartItem = getCartItem(medicine?._id);
    const cartQuantity = cartItem ? cartItem.cartQuantity : 0;
    const isOutOfStock = !medicine?.stockStatus || medicine?.quantity === 0;

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    if (!isOpen || !medicine) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    // Helper functions for badges (reused from card)
    const getStockBadgeClass = (stockStatus) => {
        return stockStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    };

    const isExpiringSoon = () => {
        if (!medicine.expiryDate) return false;
        const expiryDate = new Date(medicine.expiryDate);
        const today = new Date();
        const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysToExpiry <= 30 && daysToExpiry > 0;
    };

    const isLowStock = () => {
        return medicine.quantity > 0 && medicine.quantity <= 10;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 transition-opacity" onClick={handleBackdropClick}>
            <div 
                ref={modalRef} 
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200 relative"
            >
                {/* Close Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="absolute top-4 right-4 z-[110] bg-white/80 backdrop-blur rounded-full p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Left side: Image */}
                <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 sm:p-10 border-b md:border-b-0 md:border-r border-gray-100 min-h-[250px] sm:min-h-[300px] md:min-h-[400px] relative">
                    {medicine.image ? (
                        <img
                            src={medicine.image}
                            alt={medicine.name}
                            className="w-full h-full object-contain max-h-[300px] md:max-h-[400px]"
                        />
                    ) : (
                        <svg className="w-24 h-24 sm:w-32 sm:h-32 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    )}
                    {medicine.requiresPrescription && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-sm z-[110]">
                            ℞ Prescription Required
                        </div>
                    )}
                </div>

                {/* Right side: Details */}
                <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="mb-2">
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider rounded">
                            {medicine.category}
                        </span>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{medicine.name}</h2>
                    
                    {medicine.manufacturer && (
                        <p className="text-sm text-gray-500 mb-4 font-medium flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {medicine.manufacturer}
                        </p>
                    )}

                    <div className="flex items-end gap-4 mb-6">
                        <div className="text-3xl sm:text-4xl font-extrabold text-primary-600 tracking-tight">
                            ₹{medicine.price.toFixed(2)}
                        </div>
                        <span className={`mb-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${getStockBadgeClass(medicine.stockStatus)}`}>
                            {medicine.stockStatus ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>

                    <div className="prose prose-sm text-gray-600 mb-8 flex-1">
                        <h4 className="text-gray-900 font-semibold mb-2">Description</h4>
                        <p>{medicine.description || "No detailed description available for this product."}</p>
                    </div>

                    {/* Alerts Area */}
                    <div className="mb-6 space-y-2">
                        {isLowStock() && (
                            <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>Hurry! Only <strong>{medicine.quantity}</strong> left in stock.</span>
                            </div>
                        )}
                        {isExpiringSoon() && (
                            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span>Note: Product expires on {formatDate(medicine.expiryDate)}.</span>
                            </div>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600 grid grid-cols-2 gap-y-2">
                        <div>
                            <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold">Expiry Date</span>
                            <span className="font-medium text-gray-900">{formatDate(medicine.expiryDate)}</span>
                        </div>
                        {medicine.batchNumber && (
                            <div>
                                <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold">Batch Number</span>
                                <span className="font-medium text-gray-900">{medicine.batchNumber}</span>
                            </div>
                        )}
                    </div>

                    {/* Action Area */}
                    <div className="mt-auto">
                        {cartQuantity > 0 ? (
                            <div className="flex items-center justify-between border-2 border-primary-500 rounded-lg overflow-hidden h-12 bg-primary-50 relative z-10">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(medicine._id, -1); }}
                                    className="w-14 h-full text-primary-600 hover:bg-primary-100 hover:text-primary-700 font-bold text-lg flex items-center justify-center transition-colors"
                                >
                                    -
                                </button>
                                <span className="flex-1 text-center font-bold text-primary-700">
                                    {cartQuantity} in Cart
                                </span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(medicine._id, 1); }}
                                    disabled={cartQuantity >= medicine.quantity}
                                    className={`w-14 h-full font-bold text-lg flex items-center justify-center transition-colors ${cartQuantity >= medicine.quantity ? 'text-gray-400 bg-gray-50 cursor-not-allowed border-l border-gray-200' : 'text-primary-600 hover:bg-primary-100 hover:text-primary-700'}`}
                                >
                                    +
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); addToCart(medicine); }}
                                disabled={isOutOfStock}
                                className={`w-full py-3.5 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all relative z-10 ${
                                    isOutOfStock 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                        : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transform active:scale-[0.98]'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsModal;
