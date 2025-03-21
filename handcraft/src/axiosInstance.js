import axios from 'axios';
import { getAuthToken } from './utils/auth';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:7777/',
});

// Add a request interceptor to include the auth token in all requests
axiosInstance.interceptors.request.use(
  config => {
    // Debug token retrieval
    const sessionToken = sessionStorage.getItem('token');
    const localToken = localStorage.getItem('token');
    
    console.log('Axios interceptor - Session token:', sessionToken ? 'Present' : 'Not found');
    console.log('Axios interceptor - Local storage token:', localToken ? 'Present' : 'Not found');
    
    // Use the getAuthToken utility function to get the token
    const token = getAuthToken();
    
    if (token) {
      // Make sure token is properly formatted with 'Bearer ' prefix
      config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log('Axios interceptor - Authorization header set');
    } else {
      console.log('Axios interceptor - No token found, request will proceed without authorization');
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error.response.data);
      // You could redirect to login page here
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;