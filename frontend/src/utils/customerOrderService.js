import apiClient from './apiClient';

export const getMyOrders = async () => {
    try {
        const response = await apiClient.get('/orders/myorders');
        return response.data;
    } catch (error) {
        console.error('Error fetching my orders:', error);
        throw error;
    }
};
