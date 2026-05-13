import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, ChevronDown, ChevronUp, Users, CheckCircle, XCircle, Calendar, Award, FileText, AlertCircle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { getApplicationsByJob, updateApplicationStatus, getApplicationHistory } from '../../api/applications'
import { downloadResume } from '../../api/resumes'
import { getJobById } from '../../api/jobs'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge, { statusColor } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { formatDistanceToNow, format } from 'date-fns'

const PIPELINE = [
  { key: 'APPLIED',             label: 'Applied',             icon: FileText,    color: '#2563eb', bg: '#eff6ff' },
  { key: 'SHORTLISTED',         label: 'CV Shortlisted',      icon: CheckCircle, color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', icon: Calendar,    color: '#d97706', bg: '#fffbeb' },
  { key: 'OFFERED',             label: 'Selected / Offered',  icon: Award,       color: '#16a34a', bg: '#f0fdf4' },
  { key: 'REJECTED',            label: 'Rejected',            icon: XCircle,     color: '#dc2626', bg: '#fef2f2' },
  { key: 'WITHDRAWN',           label: 'Withdrawn',           icon: AlertCircle, color: '#6b7280', bg: '#f9fafb' },
]

const STATUS_LABELS = {
  APPLIED: 'Applied', SHORTLISTED: 'CV Shortlisted', INTERVIEW_SCHEDULED: 'Interview Scheduled',
  OFFERED: 'Selected / Offered', REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn',
}

// Next allowed transitions per status
const NEXT_STATUSES = {
  APPLIED:             ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED:         ['INTERVIEW_SCHEDULED', 'REJECTED'],
  INTERVIEW_SCHEDULED: ['OFFERED', 'REJECTED'],
  OFFERED:             [],
  REJECTED:            [],
  WITHDRAWN:           [],
}

export default function JobApplicationsPage() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [history, setHistory] = useState({})
  const [statusModal, setStatusModal] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [updating, setUpdating] = useState(false)
  const [detailModal, setDetailModal] = useState(null)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [view, setView] = useState('list') // 'list' | 'pipeline'

  useEffect(() => {
    Promise.all([getJobById(id), getApplicationsByJob(id)])
      .then(([j, a]) => { setJob(j); setApps(a) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  const toggleHistory = async (appId) => {
    if (expanded === appId) { setExpanded(null); return }
    setExpanded(appId)
    if (!history[appId]) {
      const h = await getApplicationHistory(appId).catch(() => [])
      setHistory((prev) => ({ ...prev, [appId]: h }))
    }
  }

  const openStatusModal = (app, preselect = null) => {
    setStatusModal(app)
    setNewStatus(preselect || (NEXT_STATUSES[app.status]?.[0] || app.status))
    setNotes('')
  }

  const handleStatusUpdate = async () => {
    setUpdating(true)
    try {
      const updated = await updateApplicationStatus(statusModal.id, { status: newStatus, notes })
      setApps((prev) => prev.map((a) => (a.id === statusModal.id ? updated : a)))
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`)
      setStatusModal(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setUpdating(false) }
  }

  const quickAction = (app, status) => {
    setStatusModal(app)
    setNewStatus(status)
    setNotes('')
  }

  const counts = PIPELINE.reduce((acc, p) => { acc[p.key] = apps.filter((a) => a.status === p.key).length; return acc }, {})
  const filtered = activeFilter === 'ALL' ? apps : apps.filter((a) => a.status === activeFilter)

  if (loading) return <PageSpinner />

  return (
    <div>
      <Link to="/recruiter/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Jobs
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{job?.title}</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>{apps.length} total application{apps.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant={view === 'list' ? 'primary' : 'outline'} size="sm" onClick={() => setView('list')}>List</Button>
          <Button variant={view === 'pipeline' ? 'primary' : 'outline'} size="sm" onClick={() => setView('pipeline')}>Pipeline</Button>
        </div>
      </div>

      {/* Pipeline summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {PIPELINE.map((p) => (
          <button key={p.key} onClick={() => setActiveFilter(activeFilter === p.key ? 'ALL' : p.key)}
            style={{ background: activeFilter === p.key ? p.bg : '#fff', border: `1.5px solid ${activeFilter === p.key ? p.color : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '0.75rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
              <p.icon size={14} style={{ color: p.color }} />
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: p.color }}>{counts[p.key] || 0}</p>
            </div>
            <p style={{ fontSize: '0.65rem', color: '#6b7280', lineHeight: 1.3 }}>{p.label}</p>
          </button>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className="card empty-state" style={{ padding: '4rem 1rem' }}>
          <Users size={40} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
          <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>No applications yet</p>
        </div>
      ) : view === 'pipeline' ? (
        <PipelineView apps={apps} onAction={openStatusModal} onDownload={downloadResume} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              expanded={expanded === app.id}
              history={history[app.id]}
              onToggleHistory={() => toggleHistory(app.id)}
              onStatusAction={openStatusModal}
              onQuickAction={quickAction}
              onDownload={downloadResume}
              onViewDetail={() => setDetailModal(app)}
            />
          ))}
        </div>
      )}

      {/* Status update modal */}
      <Modal open={Boolean(statusModal)} onClose={() => setStatusModal(null)} title="Update Application Status" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Current status */}
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{ color: '#6b7280' }}>Current: </span>
            <strong>{STATUS_LABELS[statusModal?.status]}</strong>
          </div>

          {/* Status buttons */}
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Move to</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {PIPELINE.filter((p) => p.key !== statusModal?.status && p.key !== 'WITHDRAWN').map((p) => (
                <button key={p.key} onClick={() => setNewStatus(p.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: `1.5px solid ${newStatus === p.key ? p.color : '#e2e8f0'}`, background: newStatus === p.key ? p.bg : '#fff', color: newStatus === p.key ? p.color : '#374151', cursor: 'pointer', fontSize: '0.875rem', fontWeight: newStatus === p.key ? 600 : 400, transition: 'all 0.15s' }}>
                  <p.icon size={14} /> {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Feedback (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder={newStatus === 'INTERVIEW_SCHEDULED' ? 'e.g. Interview on Monday 10am via Zoom...' : newStatus === 'REJECTED' ? 'e.g. We went with a more experienced candidate...' : 'Add a note for the candidate...'}
              className="form-textarea" />
          </div>

          <div className="flex-end">
            <Button variant="ghost" onClick={() => setStatusModal(null)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} loading={updating} disabled={!newStatus || newStatus === statusModal?.status}>
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal open={Boolean(detailModal)} onClose={() => setDetailModal(null)} title={`Application #${detailModal?.id}`} size="lg">
        {detailModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Badge color={statusColor(detailModal.status)}>{STATUS_LABELS[detailModal.status]}</Badge>
              <span className="text-muted">Candidate #{detailModal.candidateId}</span>
            </div>
            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Applied</p>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{detailModal.appliedAt ? format(new Date(detailModal.appliedAt), 'MMM d, yyyy · h:mm a') : ''}</p>
            </div>
            {detailModal.coverLetter && (
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Cover Letter</p>
                <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{detailModal.coverLetter}</p>
              </div>
            )}
            <div className="flex-end">
              <Button variant="outline" size="sm" onClick={() => downloadResume(detailModal.resumeId, `resume-${detailModal.candidateId}.pdf`).catch(() => toast.error('Download failed'))}>
                <Download size={14} /> Download Resume
              </Button>
              <Button size="sm" onClick={() => { setDetailModal(null); openStatusModal(detailModal) }}>Update Status</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ── Application Card ──────────────────────────────────────────────────────────
function ApplicationCard({ app, expanded, history, onToggleHistory, onStatusAction, onQuickAction, onDownload, onViewDetail }) {
  const nextStatuses = NEXT_STATUSES[app.status] || []
  const pipelineInfo = PIPELINE.find((p) => p.key === app.status)
  const canAct = nextStatuses.length > 0

  return (
    <div className="app-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.9375rem' }}>Candidate #{app.candidateId}</span>
            <Badge color={statusColor(app.status)}>{STATUS_LABELS[app.status]}</Badge>
          </div>
          <p className="text-xs" style={{ color: '#9ca3af' }}>
            Applied {app.appliedAt ? formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true }) : ''}
          </p>
          {app.coverLetter && (
            <p className="text-sm line-clamp-2" style={{ color: '#4b5563', marginTop: '0.5rem' }}>{app.coverLetter}</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={onViewDetail} title="View details"><Eye size={14} /></Button>
            <Button variant="outline" size="sm" onClick={() => onDownload(app.resumeId, `resume-${app.candidateId}.pdf`).catch(() => toast.error('Download failed'))}>
              <Download size={14} /> CV
            </Button>
            {canAct && <Button size="sm" onClick={() => onStatusAction(app)}>Move →</Button>}
          </div>

          {/* Quick action buttons */}
          {nextStatuses.length > 0 && (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {nextStatuses.map((s) => {
                const info = PIPELINE.find((p) => p.key === s)
                return (
                  <button key={s} onClick={() => onQuickAction(app, s)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', borderRadius: '0.375rem', border: `1px solid ${info.color}`, background: info.bg, color: info.color, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}>
                    <info.icon size={12} /> {info.label}
                  </button>
                )
              })}
            </div>
          )}

          <button onClick={onToggleHistory} className="link-blue"
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
            Timeline {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Status indicator bar */}
      <div style={{ marginTop: '0.75rem', height: '4px', borderRadius: '2px', background: '#f1f5f9', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '2px', background: pipelineInfo?.color || '#e5e7eb',
          width: app.status === 'APPLIED' ? '20%' : app.status === 'SHORTLISTED' ? '40%' : app.status === 'INTERVIEW_SCHEDULED' ? '65%' : app.status === 'OFFERED' ? '100%' : app.status === 'REJECTED' ? '100%' : '100%',
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Timeline */}
      {expanded && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Timeline</p>
          {(history || []).length === 0
            ? <p className="text-sm" style={{ color: '#9ca3af' }}>No history yet</p>
            : (history || []).map((h) => {
                const toInfo = PIPELINE.find((p) => p.key === h.newStatus)
                return (
                  <div key={h.id} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: toInfo?.bg || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {toInfo && <toInfo.icon size={12} style={{ color: toInfo.color }} />}
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
}

// ── Pipeline (Kanban) View ────────────────────────────────────────────────────
function PipelineView({ apps, onAction, onDownload }) {
  const columns = PIPELINE.filter((p) => !['WITHDRAWN'].includes(p.key))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', overflowX: 'auto' }}>
      {columns.map((col) => {
        const colApps = apps.filter((a) => a.status === col.key)
        return (
          <div key={col.key} style={{ background: col.bg, borderRadius: '0.75rem', padding: '0.75rem', minHeight: '12rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <col.icon size={15} style={{ color: col.color }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: col.color }}>{col.label}</span>
              <span style={{ marginLeft: 'auto', background: col.color, color: '#fff', borderRadius: '9999px', padding: '0.125rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>{colApps.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {colApps.length === 0
                ? <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', padding: '1rem 0' }}>None</p>
                : colApps.map((app) => (
                  <div key={app.id} style={{ background: '#fff', borderRadius: '0.5rem', padding: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>Candidate #{app.candidateId}</p>
                    <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                      {app.appliedAt ? formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true }) : ''}
                    </p>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => onDownload(app.resumeId, `resume-${app.candidateId}.pdf`).catch(() => toast.error('Failed'))}
                        style={{ flex: 1, padding: '0.25rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: '#fff', cursor: 'pointer', fontSize: '0.7rem', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                        <Download size={11} /> CV
                      </button>
                      {NEXT_STATUSES[app.status]?.length > 0 && (
                        <button onClick={() => onAction(app)}
                          style={{ flex: 1, padding: '0.25rem', border: `1px solid ${col.color}`, borderRadius: '0.375rem', background: col.bg, cursor: 'pointer', fontSize: '0.7rem', color: col.color, fontWeight: 500 }}>
                          Move →
                        </button>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}
