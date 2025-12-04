// ============================================
// API BASE URL - Where our backend lives
// ============================================
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get authentication token from localStorage
 * We'll use this later for login/cart features
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Build headers for fetch requests
 * @param {boolean} includeAuth - Should we include auth token?
 * @returns {Object} Headers object
 */
const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',  // Tell server we're sending JSON
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
  }
  
  return headers;
};

// ============================================
// PRODUCTS API
// ============================================
export const productsAPI = {
  /**
   * Get all products
   * @param {Object} params - Query parameters (search, category, etc.)
   * @returns {Promise} Product data
   * 
   * Example usage:
   * const data = await productsAPI.getAll();
   * const data = await productsAPI.getAll({ search: 'laptop' });
   */
  getAll: async (params = {}) => {
    try {
      // Build query string from params object
      // { search: 'laptop', category: 'electronics' } 
      // becomes: "?search=laptop&category=electronics"
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/products/${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching products from:', url);  // Debug log
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Products received:', data);  // Debug log
      
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get single product by ID
   * @param {number} id - Product ID
   * @returns {Promise} Product data
   * 
   * Example: const product = await productsAPI.getById(1);
   */
  getById: async (id) => {
    try {
      const url = `${API_BASE_URL}/products/${id}/`;
      console.log('Fetching product from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Product received:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Search products by keyword
   * @param {string} searchTerm - Search keyword
   * @returns {Promise} Product data
   */
  search: async (searchTerm) => {
    return productsAPI.getAll({ search: searchTerm });
  },

  /**
   * Filter products by category
   * @param {string} category - Category name
   * @returns {Promise} Product data
   */
  filterByCategory: async (category) => {
    return productsAPI.getAll({ category: category });
  },
};

// ============================================
// CATEGORIES API
// ============================================
export const categoriesAPI = {
  /**
   * Get all categories
   * @returns {Promise} Categories array
   */
  getAll: async () => {
    try {
      const url = `${API_BASE_URL}/categories/`;
      console.log('Fetching categories from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Categories received:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

// ============================================
// CART API
// ============================================
export const cartAPI = {
  getCurrent: async () => {
    try {
      const url = `${API_BASE_URL}/cart/current/`;
      const response = await fetch(url, {
        headers: getHeaders(true), // Include auth
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },
};

// ============================================
// ORDERS API
// ============================================
export const ordersAPI = {
  createFromCart: async (orderData) => {
    try {
      const url = `${API_BASE_URL}/orders/create_from_cart/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(true), // Include auth
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
};

// ============================================
// CONTACT/INQUIRY API
// ============================================
export const inquiryAPI = {
  /**
   * Submit contact form
   * @param {Object} inquiryData - Form data (name, email, message)
   * @returns {Promise} Response data
   */
  create: async (inquiryData) => {
    try {
      const url = `${API_BASE_URL}/inquiries/`;
      console.log('Submitting inquiry to:', url);
      console.log('Data:', inquiryData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(inquiryData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Inquiry submitted:', data);
      
      return data;
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      throw error;
    }
  },
};