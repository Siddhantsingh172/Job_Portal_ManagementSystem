import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Lock, Unlock, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRecruiterJobs, closeJob, reopenJob, deleteJob } from '../../api/jobs'
import { useAuthStore } from '../../store/authStore'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge, { statusColor } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

export default function RecruiterJobsPage() {
  const { userId } = useAuthStore()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)

  const load = () => {
    if (!userId) return
    setLoading(true)
    getRecruiterJobs(userId)
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [userId])

  const handleClose = async (id) => {
    setActionId(id)
    try { const u = await closeJob(id); setJobs((p) => p.map((j) => j.id === id ? u : j)); toast.success('Job closed') }
    catch { toast.error('Failed') } finally { setActionId(null) }
  }

  const handleReopen = async (id) => {
    setActionId(id)
    try { const u = await reopenJob(id); setJobs((p) => p.map((j) => j.id === id ? u : j)); toast.success('Job reopened') }
    catch { toast.error('Failed') } finally { setActionId(null) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this draft job?')) return
    setActionId(id)
    try { await deleteJob(id); setJobs((p) => p.filter((j) => j.id !== id)); toast.success('Job deleted') }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') } finally { setActionId(null) }
  }

  if (loading) return <PageSpinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="page-title">My Jobs</h1>
        <Link to="/recruiter/jobs/new"><Button><Plus size={16} /> Post Job</Button></Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card empty-state" style={{ padding: '4rem 1rem' }}>
          <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>No jobs yet</p>
          <Link to="/recruiter/jobs/new" className="link-blue" style={{ marginTop: '0.5rem', display: 'inline-block' }}>Post your first job →</Link>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td><Link to={`/recruiter/jobs/${job.id}`} style={{ fontWeight: 500, color: '#1f2937' }}>{job.title}</Link></td>
                    <td style={{ color: '#6b7280' }}>{job.location}</td>
                    <td style={{ color: '#6b7280' }}>{job.jobType?.replace('_', ' ')}</td>
                    <td><Badge color={statusColor(job.status)}>{job.status}</Badge></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Link to={`/recruiter/jobs/${job.id}/applications`} title="Manage Applications">
                          <Button variant="primary" size="sm"><Users size={14} /> Applications</Button>
                        </Link>
                        <Link to={`/recruiter/jobs/${job.id}/edit`} title="Edit">
                          <Button variant="ghost" size="sm"><Edit size={14} /></Button>
                        </Link>
                        {job.status === 'OPEN' && <Button variant="ghost" size="sm" loading={actionId === job.id} onClick={() => handleClose(job.id)} title="Close Job"><Lock size={14} /></Button>}
                        {job.status === 'CLOSED' && <Button variant="ghost" size="sm" loading={actionId === job.id} onClick={() => handleReopen(job.id)} title="Reopen Job"><Unlock size={14} /></Button>}
                        {job.status === 'DRAFT' && <Button variant="ghost" size="sm" loading={actionId === job.id} onClick={() => handleDelete(job.id)} style={{ color: '#dc2626' }} title="Delete Draft"><Trash2 size={14} /></Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
