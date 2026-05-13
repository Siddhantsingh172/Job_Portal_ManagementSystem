import api from '../lib/axios'

export const getNotifications = (userId) =>
  api.get(`/api/notifications/user/${userId}`).then((r) => r.data.data)

export const markRead = (id) =>
  api.put(`/api/notifications/${id}/read`).then((r) => r.data.data)

export const markAllRead = (userId) =>
  api.put(`/api/notifications/user/${userId}/read-all`).then((r) => r.data)

export const deleteNotification = (id) =>
  api.delete(`/api/notifications/${id}`).then((r) => r.data)
