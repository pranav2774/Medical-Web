import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
};

// Medicine Service
const medicineService = {
    // Get all medicines with optional filters
    getAllMedicines: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/medicines`, {
                headers: {
                    Authorization: getAuthToken(),
                },
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error fetching medicines' };
        }
    },

    // Get single medicine by ID
    getMedicineById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/medicines/${id}`, {
                headers: {
                    Authorization: getAuthToken(),
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error fetching medicine' };
        }
    },

    // Create new medicine
    createMedicine: async (medicineData) => {
        try {
            const response = await axios.post(`${API_URL}/medicines`, medicineData, {
                headers: {
                    Authorization: getAuthToken(),
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error creating medicine' };
        }
    },

    // Update medicine
    updateMedicine: async (id, medicineData) => {
        try {
            const response = await axios.put(`${API_URL}/medicines/${id}`, medicineData, {
                headers: {
                    Authorization: getAuthToken(),
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error updating medicine' };
        }
    },

    // Delete medicine
    deleteMedicine: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/medicines/${id}`, {
                headers: {
                    Authorization: getAuthToken(),
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error deleting medicine' };
        }
    },

    // Update stock quantity
    updateStock: async (id, quantity) => {
        try {
            const response = await axios.patch(
                `${API_URL}/medicines/${id}/stock`,
                { quantity },
                {
                    headers: {
                        Authorization: getAuthToken(),
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error updating stock' };
        }
    },

    // Get medicines with low stock
    getLowStock: async (threshold = 10) => {
        try {
            const response = await axios.get(`${API_URL}/medicines/low-stock`, {
                headers: {
                    Authorization: getAuthToken(),
                },
                params: { threshold },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error fetching low stock medicines' };
        }
    },

    // Get medicines expiring soon
    getExpiringSoon: async (days = 30) => {
        try {
            const response = await axios.get(`${API_URL}/medicines/expiring-soon`, {
                headers: {
                    Authorization: getAuthToken(),
                },
                params: { days },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error fetching expiring medicines' };
        }
    },

    // Bulk delete medicines
    bulkDelete: async (ids) => {
        try {
            const response = await axios.post(
                `${API_URL}/medicines/bulk-delete`,
                { ids },
                {
                    headers: {
                        Authorization: getAuthToken(),
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error deleting medicines' };
        }
    },
};

export { medicineService };
