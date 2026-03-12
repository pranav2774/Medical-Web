import api from './apiClient';

export const getDashboardStats = async () => {
    try {
        const response = await api.get('/dashboard/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Server error' };
    }
};
