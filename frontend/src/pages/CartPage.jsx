import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { authService } from '../utils/authService';

const CartPage = () => {
    const { cartItems, getCartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // Form States
    const [phone, setPhone] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [notes, setNotes] = useState('');
    const [prescriptionImageBase64, setPrescriptionImageBase64] = useState(null);

    const requiresPrescription = cartItems.some(item => item.requiresPrescription);

    const getTodayDateString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPrescriptionImageBase64(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const token = authService.getToken();
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${baseUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cartItems,
                    totalPrice: getCartTotal(),
                    phone,
                    pickupDate,
                    pickupTime,
                    notes,
                    prescriptionImageBase64
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                clearCart();
            } else {
                setError(data.message || 'Failed to place order');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError('An error occurred during checkout. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h2>
                    <p className="text-gray-600 mb-6">Your pickup order has been successfully created. We will prepare your medicines shortly.</p>
                    <button 
                        onClick={() => navigate('/store')}
                        className="btn-primary w-full py-2 px-4 rounded-lg"
                    >
                        Return to Store
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
                    <button 
                        onClick={() => navigate('/store')}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        &larr; Continue Shopping
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
                        <p className="text-gray-500 mb-6">Looks like you haven't added any medicines yet.</p>
                        <button 
                            onClick={() => navigate('/store')}
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row shadow-md border border-gray-100 items-start">
                        {/* Cart Items List */}
                        <div className="w-full md:w-2/3 p-6 border-b md:border-b-0 md:border-r border-gray-200">
                            <ul className="divide-y divide-gray-200">
                                {cartItems.map(item => (
                                    <li key={item._id} className="py-6 flex gap-4 items-center">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                                            ) : (
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <div>
                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                    <h3>{item.name}</h3>
                                                    <p className="ml-4">₹{(item.price * item.cartQuantity).toFixed(2)}</p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                                            </div>
                                            <div className="flex flex-1 items-end justify-between text-sm mt-4">
                                                <div className="flex items-center border border-gray-300 rounded-md">
                                                    <button 
                                                        onClick={() => updateQuantity(item._id, -1)}
                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-3 py-1 border-x border-gray-300 text-gray-800 font-medium">
                                                        {item.cartQuantity}
                                                    </span>
                                                    <button 
                                                        onClick={() => updateQuantity(item._id, 1)}
                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md font-bold"
                                                        disabled={item.cartQuantity >= item.quantity}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item._id)}
                                                    className="font-medium text-red-500 hover:text-red-600 transition"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Order Summary Form */}
                        <div className="w-full md:w-1/3 p-6 bg-gray-50 flex flex-col h-full self-stretch">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Checkout Details</h2>
                            <form onSubmit={handleCheckout} className="flex flex-col gap-4 flex-1">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                    <input 
                                        type="tel" 
                                        required 
                                        value={phone} 
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2 px-3 border"
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date *</label>
                                        <input 
                                            type="date" 
                                            required 
                                            min={getTodayDateString()}
                                            value={pickupDate} 
                                            onChange={e => setPickupDate(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2 px-3 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time *</label>
                                        <input 
                                            type="time" 
                                            required 
                                            value={pickupTime} 
                                            onChange={e => setPickupTime(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2 px-3 border"
                                        />
                                    </div>
                                </div>

                                {requiresPrescription && (
                                    <div className="bg-red-50 p-3 rounded-md border border-red-100">
                                        <label className="block text-sm font-bold text-red-700 mb-1">Prescription Required *</label>
                                        <p className="text-xs text-red-600 mb-2">One or more medicines in your cart require a doctor's prescription.</p>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            required 
                                            onChange={handleImageUpload}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions Context</label>
                                    <textarea 
                                        rows="2"
                                        value={notes} 
                                        onChange={e => setNotes(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2 px-3 border"
                                        placeholder="Any notes for the pharmacy?"
                                    />
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between text-gray-600 text-sm mb-1">
                                        <span>Subtotal</span>
                                        <span>₹{getCartTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-gray-900 text-lg mb-4">
                                        <span>Total Amount</span>
                                        <span>₹{getCartTotal().toFixed(2)}</span>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full py-3 px-4 rounded-xl text-white font-bold transition ${
                                            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 shadow-lg'
                                        }`}
                                    >
                                        {isSubmitting ? 'Processing...' : 'Confirm Pickup Order'}
                                    </button>
                                    
                                    <p className="mt-3 text-xs text-center text-gray-500">
                                        Payment is collected securely at pickup.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
