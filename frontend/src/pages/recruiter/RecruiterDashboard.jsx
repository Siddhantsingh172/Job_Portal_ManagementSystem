import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Users, TrendingUp, Plus } from 'lucide-react'
import { getRecruiterJobs } from '../../api/jobs'
import { useAuthStore } from '../../store/authStore'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge, { statusColor } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

export default function RecruiterDashboard() {
  const { userId } = useAuthStore()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    getRecruiterJobs(userId)
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const open = jobs.filter((j) => j.status === 'OPEN').length
  const draft = jobs.filter((j) => j.status === 'DRAFT').length
  const closed = jobs.filter((j) => j.status === 'CLOSED').length

  if (loading) return <PageSpinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="page-title">Dashboard</h1>
        <Link to="/recruiter/jobs/new"><Button><Plus size={16} /> Post a Job</Button></Link>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Jobs', value: jobs.length, icon: Briefcase, bg: '#eff6ff', color: '#2563eb' },
          { label: 'Open', value: open, icon: TrendingUp, bg: '#f0fdf4', color: '#16a34a' },
          { label: 'Draft', value: draft, icon: Users, bg: '#fefce8', color: '#ca8a04' },
          { label: 'Closed', value: closed, icon: Briefcase, bg: '#f9fafb', color: '#6b7280' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><s.icon size={20} /></div>
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
          <h2 className="section-title">Recent Jobs</h2>
          <Link to="/recruiter/jobs" className="link-blue">View all →</Link>
        </div>
        {jobs.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={40} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
            <p>No jobs posted yet</p>
            <Link to="/recruiter/jobs/new" className="link-blue" style={{ marginTop: '0.25rem', display: 'inline-block' }}>Post your first job →</Link>
          </div>
        ) : (
          <div>
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
                <div>
                  <Link to={`/recruiter/jobs/${job.id}`} style={{ fontWeight: 500, color: '#1f2937', fontSize: '0.875rem' }}>{job.title}</Link>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>{job.location}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge color={statusColor(job.status)}>{job.status}</Badge>
                  <Link to={`/recruiter/jobs/${job.id}/applications`} className="link-blue" style={{ fontSize: '0.75rem' }}>Applications →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
