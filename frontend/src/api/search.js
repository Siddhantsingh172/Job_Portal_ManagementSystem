import api from '../lib/axios'

export const searchJobs = (params) =>
  api.get('/api/search/jobs', { params }).then((r) => r.data.data)

export const getSuggestions = (q) =>
  api.get('/api/search/suggestions', { params: { q } }).then((r) => r.data.data)
