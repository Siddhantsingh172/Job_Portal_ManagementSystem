import api from '../lib/axios'

export const uploadResume = (file, primary = false) => {
  const form = new FormData()
  form.append('file', file)
  return api
    .post(`/api/resumes?primary=${primary}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)
}

export const getResumesByUser = (userId) =>
  api.get(`/api/resumes/user/${userId}`).then((r) => r.data.data)

export const setPrimaryResume = (id) =>
  api.put(`/api/resumes/${id}/primary`).then((r) => r.data.data)

export const deleteResume = (id) =>
  api.delete(`/api/resumes/${id}`).then((r) => r.data)

export const downloadResume = async (id, fileName) => {
  const res = await api.get(`/api/resumes/${id}/file`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName || 'resume.pdf'
  a.click()
  window.URL.revokeObjectURL(url)
}
