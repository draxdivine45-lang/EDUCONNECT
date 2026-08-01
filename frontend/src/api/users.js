import apiClient from './client';

export function getMe() {
  return apiClient.get('/users/me').then((res) => res.data.data);
}

export function updateMe(payload) {
  return apiClient.put('/users/me', payload).then((res) => res.data.data);
}
