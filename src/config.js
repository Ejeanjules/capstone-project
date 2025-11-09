// API configuration
// In production (Render), use relative URLs so requests go to the same domain
// In development, Vite proxy handles /api/* → http://localhost:8000/api/*
export const API_BASE_URL = '/api';

// Helper function to build full API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
