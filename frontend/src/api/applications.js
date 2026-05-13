import api from '../lib/axios'

export const applyForJob = (data) =>
  api.post('/api/applications', data).then((r) => r.data.data)

export const getApplicationById = (id) =>
  api.get(`/api/applications/${id}`).then((r) => r.data.data)

export const getApplicationsByJob = (jobId) =>
  api.get(`/api/applications/job/${jobId}`).then((r) => r.data.data)

export const getApplicationsByCandidate = (candidateId) =>
  api.get(`/api/applications/candidate/${candidateId}`).then((r) => r.data.data)

export const updateApplicationStatus = (id, data) =>
  api.put(`/api/applications/${id}/status`, data).then((r) => r.data.data)

export const withdrawApplication = (id) =>
  api.put(`/api/applications/${id}/withdraw`).then((r) => r.data.data)

export const getApplicationHistory = (id) =>
  api.get(`/api/applications/${id}/history`).then((r) => r.data.data)
