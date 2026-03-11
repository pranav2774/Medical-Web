import apiClient from './apiClient';

// ==================== EXPENSE CRUD ====================

/**
 * Get all expenses with filters and pagination
 */
export const getAllExpenses = async (params = {}) => {
  try {
    const response = await apiClient.get('/expenses', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching expenses' };
  }
};

/**
 * Get single expense by ID
 */
export const getExpenseById = async (id) => {
  try {
    const response = await apiClient.get(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching expense' };
  }
};

/**
 * Create new expense with optional receipt file
 */
export const createExpense = async (expenseData) => {
  try {
    const formData = new FormData();
    
    // Add receipt file if provided
    if (expenseData.receipt) {
      formData.append('receipt', expenseData.receipt);
    }

    // Add other fields
    formData.append('quantity', expenseData.quantity);
    formData.append('unitCost', expenseData.unitCost);
    formData.append('date', expenseData.date);
    formData.append('vendor', expenseData.vendor);
    formData.append('category', expenseData.category);
    
    if (expenseData.description) {
      formData.append('description', expenseData.description);
    }
    if (expenseData.medicineId) {
      formData.append('medicineId', expenseData.medicineId);
    }
    if (expenseData.isRecurring) {
      formData.append('isRecurring', expenseData.isRecurring);
      formData.append('recurringType', expenseData.recurringType);
      if (expenseData.recurringEndDate) {
        formData.append('recurringEndDate', expenseData.recurringEndDate);
      }
    }

    const response = await apiClient.post('/expenses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creating expense' };
  }
};

/**
 * Update expense with optional receipt replacement
 */
export const updateExpense = async (id, expenseData) => {
  try {
    const formData = new FormData();
    
    // Add receipt file if provided
    if (expenseData.receipt) {
      formData.append('receipt', expenseData.receipt);
    }

    // Add other fields
    if (expenseData.quantity !== undefined) {
      formData.append('quantity', expenseData.quantity);
    }
    if (expenseData.unitCost !== undefined) {
      formData.append('unitCost', expenseData.unitCost);
    }
    if (expenseData.date) {
      formData.append('date', expenseData.date);
    }
    if (expenseData.vendor) {
      formData.append('vendor', expenseData.vendor);
    }
    if (expenseData.category) {
      formData.append('category', expenseData.category);
    }
    if (expenseData.description !== undefined) {
      formData.append('description', expenseData.description);
    }
    if (expenseData.medicineId !== undefined) {
      formData.append('medicineId', expenseData.medicineId);
    }
    if (expenseData.isRecurring !== undefined) {
      formData.append('isRecurring', expenseData.isRecurring);
      formData.append('recurringType', expenseData.recurringType);
      if (expenseData.recurringEndDate) {
        formData.append('recurringEndDate', expenseData.recurringEndDate);
      }
    }

    const response = await apiClient.put(`/expenses/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating expense' };
  }
};

/**
 * Delete expense
 */
export const deleteExpense = async (id) => {
  try {
    const response = await apiClient.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting expense' };
  }
};

// ==================== BUDGET MANAGEMENT ====================

/**
 * Set or update budget
 */
export const setBudget = async (budgetData) => {
  try {
    const response = await apiClient.post('/expenses/budget', budgetData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error setting budget' };
  }
};

/**
 * Get budget for specific month/category
 */
export const getBudget = async (category, monthYear) => {
  try {
    const response = await apiClient.get('/expenses/budget', {
      params: { category, monthYear },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching budget' };
  }
};

/**
 * Get all budgets for a specific month
 */
export const getBudgetsByMonth = async (monthYear) => {
  try {
    const response = await apiClient.get(`/expenses/budget/month/${monthYear}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching budgets' };
  }
};

/**
 * Check budget status (identify exceeded/warning)
 */
export const checkBudgetStatus = async (month) => {
  try {
    const response = await apiClient.get('/expenses/budget/check', {
      params: { month },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error checking budget status' };
  }
};

/**
 * Update budget
 */
export const updateBudget = async (id, budgetData) => {
  try {
    const response = await apiClient.put(`/expenses/budget/${id}`, budgetData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating budget' };
  }
};

/**
 * Delete budget
 */
export const deleteBudget = async (id) => {
  try {
    const response = await apiClient.delete(`/expenses/budget/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting budget' };
  }
};

// ==================== ANALYTICS ====================

/**
 * Get monthly spending trend (for line chart)
 */
export const getMonthlyTrend = async (months = 12) => {
  try {
    const response = await apiClient.get('/expenses/analytics/monthly', {
      params: { months },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching monthly trend' };
  }
};

/**
 * Get category breakdown (for pie chart)
 */
export const getCategoryBreakdown = async (monthYear = null) => {
  try {
    const response = await apiClient.get('/expenses/analytics/category', {
      params: monthYear ? { monthYear } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching category breakdown' };
  }
};

/**
 * Get KPI data for dashboard
 */
export const getKPIData = async () => {
  try {
    const response = await apiClient.get('/expenses/analytics/kpi');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching KPI data' };
  }
};

/**
 * Get budget vs actual comparison
 */
export const getBudgetVsActual = async (monthYear = null) => {
  try {
    const response = await apiClient.get('/expenses/analytics/budget-vs-actual', {
      params: monthYear ? { monthYear } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching budget vs actual' };
  }
};

// ==================== EXPORT ====================

/**
 * Export expenses to CSV
 */
export const exportExpensesToCSV = async (filters = {}) => {
  try {
    const response = await apiClient.post('/expenses/export/csv', filters, {
      responseType: 'blob',
    });

    // Create blob and download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentChild.removeChild(link);

    return { success: true };
  } catch (error) {
    throw error.response?.data || { message: 'Error exporting expenses' };
  }
};

export const expenseService = {
  // CRUD
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  // Budget
  setBudget,
  getBudget,
  getBudgetsByMonth,
  checkBudgetStatus,
  updateBudget,
  deleteBudget,
  // Analytics
  getMonthlyTrend,
  getCategoryBreakdown,
  getKPIData,
  getBudgetVsActual,
  // Export
  exportExpensesToCSV,
};

export default expenseService;
