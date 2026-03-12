import apiClient from './apiClient';

export const getAllOrders = async () => {
    try {
        const response = await apiClient.get('/orders');
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const updateOrderStatus = async (orderId, updates) => {
    try {
        const response = await apiClient.put(`/orders/${orderId}/status`, updates);
        return response.data;
    } catch (error) {
        console.error('Error updating order:', error);
        throw error;
    }
};

export default {
    getAllOrders,
    updateOrderStatus
};
