import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, Calendar, DollarSign, Clock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getJobById } from '../../api/jobs'
import { applyForJob } from '../../api/applications'
import { getResumesByUser } from '../../api/resumes'
import { useAuthStore } from '../../store/authStore'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge, { statusColor } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { formatDistanceToNow, format } from 'date-fns'

const TYPE_LABELS = { FULL_TIME: 'Full Time', PART_TIME: 'Part Time', CONTRACT: 'Contract', INTERNSHIP: 'Internship' }

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, userId, role } = useAuthStore()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applyOpen, setApplyOpen] = useState(false)
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    getJobById(id).then(setJob).catch(() => toast.error('Job not found')).finally(() => setLoading(false))
  }, [id])

  const openApply = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    const list = await getResumesByUser(userId).catch(() => [])
    setResumes(list)
    const primary = list.find((r) => r.primaryResume)
    setSelectedResume(primary?.id || list[0]?.id || '')
    setApplyOpen(true)
  }

  const handleApply = async () => {
    if (!selectedResume) { toast.error('Please select a resume'); return }
    setApplying(true)
    try {
      await applyForJob({ jobId: Number(id), resumeId: Number(selectedResume), coverLetter })
      toast.success('Application submitted!')
      setApplyOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply')
    } finally { setApplying(false) }
  }

  if (loading) return <PageSpinner />
  if (!job) return <div className="empty-state">Job not found</div>

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="job-detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card className="p-6">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{job.title}</h1>
                <p style={{ fontSize: '1.125rem', color: '#4b5563', fontWeight: 500, marginTop: '0.25rem' }}>{job.company}</p>
              </div>
              <Badge color={statusColor(job.status)}>{job.status}</Badge>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: '#4b5563', marginBottom: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><MapPin size={15} style={{ color: '#9ca3af' }} />{job.location}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Briefcase size={15} style={{ color: '#9ca3af' }} />{TYPE_LABELS[job.jobType]}</span>
              {job.salaryRange && <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><DollarSign size={15} style={{ color: '#9ca3af' }} />{job.salaryRange}</span>}
              {(job.experienceMin != null || job.experienceMax != null) && <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Clock size={15} style={{ color: '#9ca3af' }} />{job.experienceMin ?? 0}–{job.experienceMax ?? '∞'} yrs</span>}
              {job.deadline && <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar size={15} style={{ color: '#9ca3af' }} />Deadline: {job.deadline}</span>}
            </div>

            {job.skills?.length > 0 && <div className="job-skills">{job.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}</div>}

            <h2 className="job-section-title">Description</h2>
            <p className="job-body-text">{job.description}</p>

            {job.requirements && <>
              <h2 className="job-section-title" style={{ marginTop: '1.5rem' }}>Requirements</h2>
              <p className="job-body-text">{job.requirements}</p>
            </>}
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card className="p-5">
            <p className="text-xs" style={{ color: '#9ca3af', marginBottom: '1rem' }}>
              Posted {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : ''}
            </p>
            {job.status === 'OPEN' && role === 'JOB_SEEKER' && (
              <Button fullWidth onClick={openApply} size="lg"><CheckCircle size={16} /> Apply Now</Button>
            )}
            {!isAuthenticated && job.status === 'OPEN' && (
              <Button fullWidth onClick={() => navigate('/login')} size="lg">Login to Apply</Button>
            )}
            {job.status !== 'OPEN' && (
              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af', fontWeight: 500 }}>No longer accepting applications</p>
            )}
          </Card>

          <Card className="p-5 job-overview">
            <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>Job Overview</h3>
            <dl>
              <div><dt>Type</dt><dd>{TYPE_LABELS[job.jobType]}</dd></div>
              {job.salaryRange && <div><dt>Salary</dt><dd>{job.salaryRange}</dd></div>}
              {job.deadline && <div><dt>Deadline</dt><dd>{format(new Date(job.deadline), 'MMM d, yyyy')}</dd></div>}
              <div><dt>Experience</dt><dd>{job.experienceMin ?? 0}–{job.experienceMax ?? '∞'} yrs</dd></div>
            </dl>
          </Card>
        </div>
      </div>

      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="Apply for this Job">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Select Resume</label>
            {resumes.length === 0
              ? <div style={{ fontSize: '0.875rem', color: '#6b7280', background: '#fefce8', border: '1px solid #fde68a', borderRadius: '0.5rem', padding: '0.75rem' }}>
                  No resumes found. <a href={`/profile/${userId}`} className="link-blue">Upload one first</a>
                </div>
              : <select value={selectedResume} onChange={(e) => setSelectedResume(e.target.value)} className="form-select">
                  {resumes.map((r) => <option key={r.id} value={r.id}>{r.fileName}{r.primaryResume ? ' (Primary)' : ''}</option>)}
                </select>
            }
          </div>
          <div className="form-group">
            <label className="form-label">Cover Letter (optional)</label>
            <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={5}
              placeholder="Tell the recruiter why you're a great fit..." className="form-textarea" />
          </div>
          <div className="flex-end">
            <Button variant="ghost" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button onClick={handleApply} loading={applying} disabled={resumes.length === 0}>Submit Application</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
