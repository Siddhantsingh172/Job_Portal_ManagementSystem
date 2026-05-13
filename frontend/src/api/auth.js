import api from '../lib/axios'

export const register = (data) =>
  api.post('/api/users/register', data).then((r) => r.data.data)

export const login = (data) =>
  api.post('/api/users/login', data).then((r) => r.data.data)

export const refreshToken = (accessToken) =>
  api.post('/api/users/refresh-token', { accessToken }).then((r) => r.data.data)
