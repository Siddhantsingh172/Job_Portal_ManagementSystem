import api from '../lib/axios'

export const getUser = (id) =>
  api.get(`/api/users/${id}`).then((r) => r.data.data)

export const updateUser = (id, data) =>
  api.put(`/api/users/${id}`, data).then((r) => r.data.data)

export const changePassword = (id, data) =>
  api.patch(`/api/users/${id}/password`, data).then((r) => r.data)

export const getProfile = (id) =>
  api.get(`/api/users/${id}/profile`).then((r) => r.data.data)

export const updateProfile = (id, data) =>
  api.put(`/api/users/${id}/profile`, data).then((r) => r.data.data)
