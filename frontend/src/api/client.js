import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Centralized interceptor: attaches the JWT to every outgoing request so
// individual pages/components never need to touch the token directly.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('educonnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401, the stored token is no longer valid (expired/invalid) — clear it
// so the app falls back to a logged-out state instead of looping on stale auth.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('educonnect_token');
      localStorage.removeItem('educonnect_user');
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Something went wrong';
}

export default apiClient;
