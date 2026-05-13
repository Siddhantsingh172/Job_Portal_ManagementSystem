import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createJob, updateJob, getJobById } from '../../api/jobs'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { PageSpinner } from '../../components/ui/Spinner'

export default function JobFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { userId } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { status: 'OPEN', jobType: 'FULL_TIME' } })

  useEffect(() => {
    if (isEdit) {
      getJobById(id).then((job) => {
        reset({ title: job.title, company: job.company, location: job.location, salaryRange: job.salaryRange || '', description: job.description, requirements: job.requirements || '', jobType: job.jobType, status: job.status, experienceMin: job.experienceMin ?? '', experienceMax: job.experienceMax ?? '', deadline: job.deadline || '' })
        setSkills(job.skills || [])
      }).catch(() => toast.error('Failed to load job')).finally(() => setFetching(false))
    }
  }, [id, isEdit, reset])

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s])
    setSkillInput('')
  }

  const onSubmit = async (data) => {
    setLoading(true)
    const payload = { ...data, skills, recruiterId: userId, experienceMin: data.experienceMin ? Number(data.experienceMin) : undefined, experienceMax: data.experienceMax ? Number(data.experienceMax) : undefined, deadline: data.deadline || undefined }
    try {
      if (isEdit) { await updateJob(id, payload); toast.success('Job updated!') }
      else { await createJob(payload); toast.success('Job posted!') }
      navigate('/recruiter/jobs')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save job') }
    finally { setLoading(false) }
  }

  if (fetching) return <PageSpinner />

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="page-title mb-6">{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-grid-2">
            <Input label="Job Title *" placeholder="e.g. Senior React Developer" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
            <Input label="Company *" placeholder="e.g. Acme Corp" error={errors.company?.message} {...register('company', { required: 'Company is required' })} />
          </div>
          <div className="form-grid-2">
            <Input label="Location *" placeholder="e.g. New York, NY" error={errors.location?.message} {...register('location', { required: 'Location is required' })} />
            <Input label="Salary Range" placeholder="e.g. $80k–$100k" {...register('salaryRange')} />
          </div>
          <div className="form-grid-2">
            <Select label="Job Type *" error={errors.jobType?.message} {...register('jobType', { required: true })}>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </Select>
            <Select label="Status" {...register('status')}>
              <option value="OPEN">Open</option>
              <option value="DRAFT">Draft</option>
            </Select>
          </div>
          <div className="form-grid-3">
            <Input label="Min Experience (yrs)" type="number" min={0} {...register('experienceMin')} />
            <Input label="Max Experience (yrs)" type="number" min={0} {...register('experienceMax')} />
            <Input label="Application Deadline" type="date" {...register('deadline')} />
          </div>
          <Textarea label="Description *" placeholder="Describe the role..." error={errors.description?.message} rows={6}
            {...register('description', { required: 'Description is required', minLength: { value: 50, message: 'At least 50 characters' } })} />
          <Textarea label="Requirements" placeholder="List required qualifications..." rows={4} {...register('requirements')} />

          <div className="form-group">
            <label className="form-label">Skills</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                placeholder="Add a skill and press Enter" className="form-input" style={{ flex: 1 }} />
              <Button type="button" variant="outline" size="sm" onClick={addSkill}><Plus size={14} /> Add</Button>
            </div>
            {skills.length > 0 && (
              <div className="skills-wrap">
                {skills.map((s) => (
                  <span key={s} className="skill-chip">{s}
                    <button type="button" onClick={() => setSkills((p) => p.filter((x) => x !== s))}><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex-end" style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={loading}>{isEdit ? 'Update Job' : 'Post Job'}</Button>
          </div>
        </div>
      </form>
    </div>
  )
}
