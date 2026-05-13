import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Edit, Users, Lock, Unlock, MapPin, Briefcase, DollarSign, Clock, Calendar, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getJobById, closeJob, reopenJob } from '../../api/jobs'
import { getApplicationsByJob } from '../../api/applications'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge, { statusColor } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const TYPE_LABELS = { FULL_TIME: 'Full Time', PART_TIME: 'Part Time', CONTRACT: 'Contract', INTERNSHIP: 'Internship' }

const STATUS_COUNTS = {
  APPLIED: { label: 'Applied', color: '#2563eb', bg: '#eff6ff' },
  SHORTLISTED: { label: 'Shortlisted', color: '#7c3aed', bg: '#f5f3ff' },
  INTERVIEW_SCHEDULED: { label: 'Interview', color: '#d97706', bg: '#fffbeb' },
  OFFERED: { label: 'Offered', color: '#16a34a', bg: '#f0fdf4' },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2' },
  WITHDRAWN: { label: 'Withdrawn', color: '#6b7280', bg: '#f9fafb' },
}

export default function RecruiterJobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      getJobById(id),
      getApplicationsByJob(id).catch(() => []),
    ]).then(([j, a]) => {
      setJob(j)
      setApps(Array.isArray(a) ? a : [])
    }).catch(() => toast.error('Failed to load job'))
      .finally(() => setLoading(false))
  }, [id])

  const handleClose = async () => {
    setActionLoading(true)
    try { const u = await closeJob(id); setJob(u); toast.success('Job closed') }
    catch { toast.error('Failed') } finally { setActionLoading(false) }
  }

  const handleReopen = async () => {
    setActionLoading(true)
    try { const u = await reopenJob(id); setJob(u); toast.success('Job reopened') }
    catch { toast.error('Failed') } finally { setActionLoading(false) }
  }

  if (loading) return <PageSpinner />
  if (!job) return <div className="empty-state">Job not found</div>

  // Count apps by status
  const counts = Object.keys(STATUS_COUNTS).reduce((acc, s) => {
    acc[s] = apps.filter((a) => a.status === s).length
    return acc
  }, {})

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
      <button className="back-btn" onClick={() => navigate('/recruiter/jobs')}>
        <ArrowLeft size={16} /> Back to My Jobs
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className="page-title">{job.title}</h1>
            <Badge color={statusColor(job.status)}>{job.status}</Badge>
          </div>
          <p style={{ color: '#4b5563', fontWeight: 500, marginTop: '0.25rem' }}>{job.company}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to={`/recruiter/jobs/${id}/edit`}>
            <Button variant="outline" size="sm"><Edit size={14} /> Edit</Button>
          </Link>
          <Link to={`/recruiter/jobs/${id}/applications`}>
            <Button size="sm"><Users size={14} /> View Applications ({apps.length})</Button>
          </Link>
          {job.status === 'OPEN' && (
            <Button variant="secondary" size="sm" loading={actionLoading} onClick={handleClose}>
              <Lock size={14} /> Close Job
            </Button>
          )}
          {job.status === 'CLOSED' && (
            <Button variant="success" size="sm" loading={actionLoading} onClick={handleReopen}>
              <Unlock size={14} /> Reopen Job
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Application pipeline summary */}
          <Card className="p-5">
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Application Pipeline</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {Object.entries(STATUS_COUNTS).map(([key, info]) => (
                <Link key={key} to={`/recruiter/jobs/${id}/applications`}
                  style={{ textDecoration: 'none', background: info.bg, borderRadius: '0.5rem', padding: '0.75rem', display: 'block', transition: 'opacity 0.15s' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: info.color }}>{counts[key] || 0}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.125rem' }}>{info.label}</p>
                </Link>
              ))}
            </div>
            {apps.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                <Link to={`/recruiter/jobs/${id}/applications`} className="link-blue" style={{ fontWeight: 500 }}>
                  Manage all {apps.length} application{apps.length !== 1 ? 's' : ''} →
                </Link>
              </div>
            )}
          </Card>

          {/* Job details */}
          <Card className="p-6">
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Job Details</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: '#4b5563', marginBottom: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><MapPin size={15} style={{ color: '#9ca3af' }} />{job.location}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Briefcase size={15} style={{ color: '#9ca3af' }} />{TYPE_LABELS[job.jobType]}</span>
              {job.salaryRange && <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><DollarSign size={15} style={{ color: '#9ca3af' }} />{job.salaryRange}</span>}
              {(job.experienceMin != null || job.experienceMax != null) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Clock size={15} style={{ color: '#9ca3af' }} />{job.experienceMin ?? 0}–{job.experienceMax ?? '∞'} yrs</span>
              )}
              {job.deadline && <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar size={15} style={{ color: '#9ca3af' }} />Deadline: {job.deadline}</span>}
            </div>

            {job.skills?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {job.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
              </div>
            )}

            <h3 className="job-section-title">Description</h3>
            <p className="job-body-text">{job.description}</p>

            {job.requirements && (
              <>
                <h3 className="job-section-title" style={{ marginTop: '1.25rem' }}>Requirements</h3>
                <p className="job-body-text">{job.requirements}</p>
              </>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card className="p-5">
            <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to={`/recruiter/jobs/${id}/applications`}>
                <Button fullWidth variant="primary" size="md"><Users size={15} /> Manage Applications</Button>
              </Link>
              <Link to={`/recruiter/jobs/${id}/edit`}>
                <Button fullWidth variant="outline" size="md"><Edit size={15} /> Edit Job</Button>
              </Link>
              {job.status === 'OPEN' && (
                <Button fullWidth variant="ghost" size="md" loading={actionLoading} onClick={handleClose}
                  style={{ border: '1px solid #e2e8f0' }}>
                  <Lock size={15} /> Close Job
                </Button>
              )}
              {job.status === 'CLOSED' && (
                <Button fullWidth variant="ghost" size="md" loading={actionLoading} onClick={handleReopen}
                  style={{ border: '1px solid #e2e8f0', color: '#16a34a' }}>
                  <Unlock size={15} /> Reopen Job
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>Overview</h3>
            <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <dt style={{ color: '#6b7280' }}>Status</dt>
                <dd><Badge color={statusColor(job.status)}>{job.status}</Badge></dd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <dt style={{ color: '#6b7280' }}>Type</dt>
                <dd style={{ fontWeight: 500 }}>{TYPE_LABELS[job.jobType]}</dd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <dt style={{ color: '#6b7280' }}>Applications</dt>
                <dd style={{ fontWeight: 700, color: '#2563eb' }}>{apps.length}</dd>
              </div>
              {job.deadline && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <dt style={{ color: '#6b7280' }}>Deadline</dt>
                  <dd style={{ fontWeight: 500 }}>{job.deadline}</dd>
                </div>
              )}
              {job.salaryRange && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <dt style={{ color: '#6b7280' }}>Salary</dt>
                  <dd style={{ fontWeight: 500 }}>{job.salaryRange}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  )
}
