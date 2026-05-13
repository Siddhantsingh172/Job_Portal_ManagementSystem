import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Clock, ChevronDown, ChevronUp, FileText, CheckCircle, XCircle, Calendar, Award, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getApplicationsByCandidate, withdrawApplication, getApplicationHistory } from '../../api/applications'
import { useAuthStore } from '../../store/authStore'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge, { statusColor } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { formatDistanceToNow, format } from 'date-fns'

// Pipeline steps in order
const PIPELINE = [
  { key: 'APPLIED',              label: 'Applied',              icon: FileText,     color: '#2563eb', bg: '#eff6ff' },
  { key: 'SHORTLISTED',          label: 'CV Shortlisted',       icon: CheckCircle,  color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'INTERVIEW_SCHEDULED',  label: 'Interview Scheduled',  icon: Calendar,     color: '#d97706', bg: '#fffbeb' },
  { key: 'OFFERED',              label: 'Selected / Offered',   icon: Award,        color: '#16a34a', bg: '#f0fdf4' },
  { key: 'REJECTED',             label: 'Rejected',             icon: XCircle,      color: '#dc2626', bg: '#fef2f2' },
  { key: 'WITHDRAWN',            label: 'Withdrawn',            icon: AlertCircle,  color: '#6b7280', bg: '#f9fafb' },
]

const STATUS_LABELS = {
  APPLIED: 'Applied',
  SHORTLISTED: 'CV Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  OFFERED: 'Selected / Offered',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

const ACTIVE_PIPELINE = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED']

function PipelineTracker({ status }) {
  const isRejected = status === 'REJECTED'
  const isWithdrawn = status === 'WITHDRAWN'
  const steps = ACTIVE_PIPELINE

  if (isRejected || isWithdrawn) {
    const info = PIPELINE.find((p) => p.key === status)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: info.bg, borderRadius: '0.5rem', marginTop: '0.75rem' }}>
        <info.icon size={16} style={{ color: info.color, flexShrink: 0 }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: info.color }}>{info.label}</span>
      </div>
    )
  }

  const currentIdx = steps.indexOf(status)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
      {steps.map((step, idx) => {
        const info = PIPELINE.find((p) => p.key === step)
        const done = idx < currentIdx
        const active = idx === currentIdx
        const upcoming = idx > currentIdx
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', minWidth: '5rem' }}>
              <div style={{
                width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? info.color : done ? '#16a34a' : '#e5e7eb',
                color: active || done ? '#fff' : '#9ca3af',
                border: active ? `3px solid ${info.color}` : 'none',
                boxShadow: active ? `0 0 0 3px ${info.bg}` : 'none',
                transition: 'all 0.2s',
              }}>
                {done ? <CheckCircle size={14} /> : <info.icon size={14} />}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: active ? 600 : 400, color: active ? info.color : done ? '#16a34a' : '#9ca3af', textAlign: 'center', lineHeight: 1.2 }}>
                {info.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: done ? '#16a34a' : '#e5e7eb', margin: '0 0.25rem', marginBottom: '1.25rem', minWidth: '1rem' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function MyApplicationsPage() {
  const { userId } = useAuthStore()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [history, setHistory] = useState({})
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    getApplicationsByCandidate(userId).then(setApps).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }, [userId])

  const toggleHistory = async (appId) => {
    if (expanded === appId) { setExpanded(null); return }
    setExpanded(appId)
    if (!history[appId]) {
      const h = await getApplicationHistory(appId).catch(() => [])
      setHistory((prev) => ({ ...prev, [appId]: h }))
    }
  }

  const handleWithdraw = async (appId) => {
    if (!confirm('Withdraw this application?')) return
    try {
      const updated = await withdrawApplication(appId)
      setApps((prev) => prev.map((a) => (a.id === appId ? updated : a)))
      toast.success('Application withdrawn')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const filtered = filter === 'ALL' ? apps : apps.filter((a) => a.status === filter)

  // Count by status
  const counts = PIPELINE.reduce((acc, p) => { acc[p.key] = apps.filter((a) => a.status === p.key).length; return acc }, {})

  if (loading) return <PageSpinner />

  return (
    <div>
      <h1 className="page-title mb-6">My Applications</h1>

      {/* Summary cards */}
      {apps.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {PIPELINE.map((p) => (
            <button key={p.key} onClick={() => setFilter(filter === p.key ? 'ALL' : p.key)}
              style={{ background: filter === p.key ? p.bg : '#fff', border: `1.5px solid ${filter === p.key ? p.color : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '0.75rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: p.color }}>{counts[p.key] || 0}</p>
              <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.125rem', lineHeight: 1.3 }}>{p.label}</p>
            </button>
          ))}
        </div>
      )}

      {apps.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>No applications yet</p>
          <Link to="/jobs" className="link-blue" style={{ marginTop: '0.5rem', display: 'inline-block' }}>Browse jobs →</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No applications with status <strong>{STATUS_LABELS[filter]}</strong></p>
          <button onClick={() => setFilter('ALL')} className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>Show all</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((app) => {
            const pipelineInfo = PIPELINE.find((p) => p.key === app.status)
            return (
              <div key={app.id} className="app-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <Link to={`/jobs/${app.jobId}`} style={{ fontWeight: 600, color: '#111827', fontSize: '1rem' }}>
                        {app.jobTitle || `Job #${app.jobId}`}
                      </Link>
                      <Badge color={statusColor(app.status)}>{STATUS_LABELS[app.status] || app.status}</Badge>
                    </div>
                    <p className="text-xs" style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> Applied {app.appliedAt ? formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true }) : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                    {(app.status === 'APPLIED' || app.status === 'SHORTLISTED') && (
                      <Button variant="danger" size="sm" onClick={() => handleWithdraw(app.id)}>Withdraw</Button>
                    )}
                    <button onClick={() => toggleHistory(app.id)} className="link-blue"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                      Timeline {expanded === app.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {/* Pipeline tracker */}
                <PipelineTracker status={app.status} />

                {/* Status-specific messages */}
                {app.status === 'INTERVIEW_SCHEDULED' && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#92400e' }}>
                    🎉 Congratulations! Your interview has been scheduled. Check your notifications for details.
                  </div>
                )}
                {app.status === 'OFFERED' && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#14532d' }}>
                    🏆 You've been selected! The recruiter has made you an offer.
                  </div>
                )}
                {app.status === 'REJECTED' && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#7f1d1d' }}>
                    Unfortunately, your application was not selected this time. Keep applying!
                  </div>
                )}

                {/* Cover letter preview */}
                {app.coverLetter && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#4b5563', borderLeft: '3px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Cover Letter</p>
                    <p className="line-clamp-2">{app.coverLetter}</p>
                  </div>
                )}

                {/* Timeline */}
                {expanded === app.id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Full Timeline</p>
                    {(history[app.id] || []).length === 0
                      ? <p className="text-sm" style={{ color: '#9ca3af' }}>No history yet</p>
                      : (history[app.id] || []).map((h) => {
                          const toInfo = PIPELINE.find((p) => p.key === h.newStatus)
                          return (
                            <div key={h.id} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: toInfo?.bg || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {toInfo && <toInfo.icon size={14} style={{ color: toInfo.color }} />}
                                </div>
                                <div style={{ width: '2px', flex: 1, background: '#e5e7eb', margin: '0.25rem 0' }} />
                              </div>
                              <div style={{ paddingBottom: '0.5rem' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: toInfo?.color || '#374151' }}>
                                  {STATUS_LABELS[h.newStatus] || h.newStatus}
                                </p>
                                {h.notes && <p style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '0.125rem', fontStyle: 'italic' }}>"{h.notes}"</p>}
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.125rem' }}>
                                  {h.changedAt ? format(new Date(h.changedAt), 'MMM d, yyyy · h:mm a') : ''}
                                </p>
                              </div>
                            </div>
                          )
                        })
                    }
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
