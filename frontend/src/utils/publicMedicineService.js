import apiClient from './apiClient';

// Get all public medicines with filters
export const getPublicMedicines = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.search) queryParams.append('search', params.search);
        if (params.category && params.category !== 'all') queryParams.append('category', params.category);
        if (params.stockStatus && params.stockStatus !== 'all') queryParams.append('stockStatus', params.stockStatus);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.order) queryParams.append('order', params.order);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const queryString = queryParams.toString();
        const url = `/public/medicines${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching public medicines:', error);
        throw error;
    }
};

// Get single public medicine by ID
export const getPublicMedicineById = async (id) => {
    try {
        const response = await apiClient.get(`/public/medicines/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching public medicine:', error);
        throw error;
    }
};

export default {
    getPublicMedicines,
    getPublicMedicineById,
};
