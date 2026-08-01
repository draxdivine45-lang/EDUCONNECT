import apiClient from './client';

export function registerRequest(payload) {
  return apiClient.post('/auth/register', payload).then((res) => res.data.data);
}

export function loginRequest(payload) {
  return apiClient.post('/auth/login', payload).then((res) => res.data.data);
}

export function changePasswordRequest(payload) {
  return apiClient.post('/auth/change-password', payload).then((res) => res.data);
}
