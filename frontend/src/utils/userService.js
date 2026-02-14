import axios from 'axios';
import { authService } from './authService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${API_BASE.replace(/\/$/, '')}/users`;

// Get all customers
const getAllCustomers = async () => {
    try {
        const token = authService.getToken();
        const response = await axios.get(`${API_URL}/customers`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch customers' };
    }
};

export const userService = {
    getAllCustomers,
};
