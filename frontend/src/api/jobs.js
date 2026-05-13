import api from '../lib/axios'

export const getAllJobs = (page = 0, size = 10) =>
  api.get(`/api/jobs?page=${page}&size=${size}`).then((r) => r.data.data)

export const getJobById = (id) =>
  api.get(`/api/jobs/${id}`).then((r) => r.data.data)

export const getRecruiterJobs = (recruiterId) =>
  api.get(`/api/jobs/recruiter/${recruiterId}`).then((r) => r.data.data)

export const createJob = (data) =>
  api.post('/api/jobs', data).then((r) => r.data.data)

export const updateJob = (id, data) =>
  api.put(`/api/jobs/${id}`, data).then((r) => r.data.data)

export const closeJob = (id) =>
  api.put(`/api/jobs/${id}/close`).then((r) => r.data.data)

export const reopenJob = (id) =>
  api.put(`/api/jobs/${id}/reopen`).then((r) => r.data.data)

export const deleteJob = (id) =>
  api.delete(`/api/jobs/${id}`).then((r) => r.data)
