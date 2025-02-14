// src/services/api.js
import axios from 'axios';
import { backend_url } from '../baseUrl';

// Helper to read a specific cookie by name.
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const api = axios.create({
  baseURL: backend_url, // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensures cookies are sent in cross-site requests
});

// Request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    const token = getCookie('jwt') || localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally and store token if available
api.interceptors.response.use(
  (response) => {
    console.log("API response", response);
    // Check if a token is returned in response data and store it.
    if (response.data && response.data.data?.token) {
      localStorage.setItem("jwt", response.data.data.token);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access - consider logging out the user or redirecting to login.');
      // Optionally, remove the token and/or dispatch a logout action here.
    }
    return Promise.reject(error);
  }
);

export default api;
