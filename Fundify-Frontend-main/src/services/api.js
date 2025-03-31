import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:5001';

// Create Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to format image URLs
export const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If the URL is already absolute (starts with http or https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative URL (starts with /uploads), prepend the API base URL
  if (imageUrl.startsWith('/uploads')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // For any other case, return the original URL
  return imageUrl;
};

export default api; 