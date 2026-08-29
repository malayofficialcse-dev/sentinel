import axios from 'axios';

// Base Axios instance configured for real backend API endpoints
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sentinel_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Graceful error handling without exposing stack traces
    const message = error.response?.data?.message || 'A network error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// Helper function to simulate API delay in mock mode
export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
