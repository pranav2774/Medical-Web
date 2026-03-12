import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const storedCart = localStorage.getItem('cartItems');
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error("Error loading cart from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Error saving cart to localStorage", error);
        }
    }, [cartItems]);

    const addToCart = (medicine) => {
        setCartItems(prev => {
            const existingItemIndex = prev.findIndex(item => item._id === medicine._id);
            if (existingItemIndex >= 0) {
                // If the item exists, increase quantity up to the available stock
                const availableStock = medicine.quantity || Infinity;
                if (prev[existingItemIndex].cartQuantity < availableStock) {
                    const newCart = [...prev];
                    newCart[existingItemIndex].cartQuantity += 1;
                    return newCart;
                }
                return prev; // Hit stock limit
            } else {
                // Return new item with quantity 1
                return [...prev, { ...medicine, cartQuantity: 1 }];
            }
        });
    };

    const removeFromCart = (medicineId) => {
        setCartItems(prev => prev.filter(item => item._id !== medicineId));
    };

    const updateQuantity = (medicineId, delta) => {
        setCartItems(prev => {
            return prev.map(item => {
                if (item._id === medicineId) {
                    const newQuantity = item.cartQuantity + delta;
                    const availableStock = item.quantity || Infinity;
                    
                    if (newQuantity <= 0) {
                        return null; // Will be filtered out
                    } else if (newQuantity <= availableStock) {
                        return { ...item, cartQuantity: newQuantity };
                    }
                    return item; // Exceeds available stock, do nothing
                }
                return item;
            }).filter(Boolean); // removes nulls
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
    };

    const getCartItemCount = () => {
        return cartItems.reduce((count, item) => count + item.cartQuantity, 0);
    };

    // Calculate item specific total
    const getItemTotal = (medicineId) => {
        const item = cartItems.find(i => i._id === medicineId);
        return item ? item.price * item.cartQuantity : 0;
    };

    const getCartItem = (medicineId) => {
        return cartItems.find(item => item._id === medicineId);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartItemCount,
            getItemTotal,
            getCartItem
        }}>
            {children}
        </CartContext.Provider>
    );
};
