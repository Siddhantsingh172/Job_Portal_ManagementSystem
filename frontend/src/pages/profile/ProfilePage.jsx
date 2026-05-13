import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { User, Upload, Trash2, Star, Download, ArrowLeft, Edit2, Save, X, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUser, updateUser, getProfile, updateProfile, changePassword } from '../../api/users'
import { getResumesByUser, uploadResume, setPrimaryResume, deleteResume, downloadResume } from '../../api/resumes'
import { useAuthStore } from '../../store/authStore'
import { PageSpinner } from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Modal from '../../components/ui/Modal'

export default function ProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userId, role } = useAuthStore()
  const isSelf = Number(id) === userId

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState(false)
  const [editProfile, setEditProfile] = useState(false)
  const [pwModal, setPwModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const userForm = useForm()
  const profileForm = useForm()
  const pwForm = useForm()

  useEffect(() => {
    Promise.all([
      getUser(Number(id)),
      getProfile(Number(id)).catch(() => null),
      isSelf ? getResumesByUser(Number(id)).catch(() => []) : Promise.resolve([]),
    ])
      .then(([u, p, r]) => {
        setUser(u)
        setProfile(p)
        setResumes(r)
        userForm.reset({ name: u.name, phone: u.phone || '' })
        if (p) profileForm.reset(p)
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [id])

  const saveUser = async (data) => {
    try {
      const updated = await updateUser(Number(id), data)
      setUser(updated)
      setEditUser(false)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    }
  }

  const saveProfile = async (data) => {
    try {
      const updated = await updateProfile(Number(id), {
        ...data,
        experienceYrs: data.experienceYrs ? Number(data.experienceYrs) : undefined,
      })
      setProfile(updated)
      setEditProfile(false)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    }
  }

  const savePw = async (data) => {
    if (data.newPassword !== data.confirm) {
      pwForm.setError('confirm', { message: 'Passwords do not match' })
      return
    }
    try {
      await changePassword(Number(id), { currentPassword: data.currentPassword, newPassword: data.newPassword })
      toast.success('Password changed')
      setPwModal(false)
      pwForm.reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('Only PDF files allowed'); return }
    setUploading(true)
    try {
      const r = await uploadResume(file, resumes.length === 0)
      setResumes((prev) => [...prev, r])
      toast.success('Resume uploaded')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSetPrimary = async (resumeId) => {
    try {
      const updated = await setPrimaryResume(resumeId)
      setResumes((prev) => prev.map((r) => ({ ...r, primaryResume: r.id === resumeId })))
      toast.success('Primary resume set')
    } catch { toast.error('Failed') }
  }

  const handleDeleteResume = async (resumeId) => {
    if (!confirm('Delete this resume?')) return
    try {
      await deleteResume(resumeId)
      setResumes((prev) => prev.filter((r) => r.id !== resumeId))
      toast.success('Resume deleted')
    } catch { toast.error('Failed to delete') }
  }

  const handleDownload = async (resume) => {
    try {
      await downloadResume(resume.id, resume.fileName)
    } catch { toast.error('Download failed') }
  }

  if (loading) return <PageSpinner />
  if (!user) return <div className="text-center py-16 text-gray-400">User not found</div>

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Basic Info */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
          {isSelf && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditUser((v) => !v)}>
                {editUser ? <X size={14} /> : <Edit2 size={14} />}
                {editUser ? 'Cancel' : 'Edit'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPwModal(true)}>
                <Lock size={14} /> Password
              </Button>
            </div>
          )}
        </div>

        {editUser ? (
          <form onSubmit={userForm.handleSubmit(saveUser)} className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100">
            <Input label="Full Name" error={userForm.formState.errors.name?.message}
              {...userForm.register('name', { required: 'Name is required' })} />
            <Input label="Phone" type="tel" {...userForm.register('phone')} />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditUser(false)}>Cancel</Button>
              <Button type="submit" size="sm"><Save size={14} /> Save</Button>
            </div>
          </form>
        ) : (
          user.phone && <p className="text-sm text-gray-600 mt-2">📞 {user.phone}</p>
        )}
      </Card>

      {/* Extended Profile */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Extended Profile</h2>
          {isSelf && (
            <Button variant="outline" size="sm" onClick={() => setEditProfile((v) => !v)}>
              {editProfile ? <X size={14} /> : <Edit2 size={14} />}
              {editProfile ? 'Cancel' : 'Edit'}
            </Button>
          )}
        </div>

        {editProfile ? (
          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="flex flex-col gap-3">
            <Textarea label="Bio" rows={3} {...profileForm.register('bio')} />
            <Input label="Skills (comma-separated)" placeholder="React, Node.js, Python" {...profileForm.register('skills')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Experience (years)" type="number" min={0} {...profileForm.register('experienceYrs')} />
              <Input label="Current Company" {...profileForm.register('currentCompany')} />
            </div>
            <Input label="Location" {...profileForm.register('location')} />
            <Input label="LinkedIn URL" type="url" {...profileForm.register('linkedinUrl')} />
            <Input label="GitHub URL" type="url" {...profileForm.register('githubUrl')} />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditProfile(false)}>Cancel</Button>
              <Button type="submit" size="sm"><Save size={14} /> Save</Button>
            </div>
          </form>
        ) : profile ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {profile.bio && <div className="sm:col-span-2"><dt className="text-gray-500 mb-1">Bio</dt><dd className="text-gray-800">{profile.bio}</dd></div>}
            {profile.skills && <div className="sm:col-span-2"><dt className="text-gray-500 mb-1">Skills</dt><dd className="flex flex-wrap gap-1">{profile.skills.split(',').map((s) => <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{s.trim()}</span>)}</dd></div>}
            {profile.experienceYrs != null && <div><dt className="text-gray-500">Experience</dt><dd className="font-medium">{profile.experienceYrs} yrs</dd></div>}
            {profile.currentCompany && <div><dt className="text-gray-500">Company</dt><dd className="font-medium">{profile.currentCompany}</dd></div>}
            {profile.location && <div><dt className="text-gray-500">Location</dt><dd className="font-medium">{profile.location}</dd></div>}
            {profile.linkedinUrl && <div><dt className="text-gray-500">LinkedIn</dt><dd><a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block">{profile.linkedinUrl}</a></dd></div>}
            {profile.githubUrl && <div><dt className="text-gray-500">GitHub</dt><dd><a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block">{profile.githubUrl}</a></dd></div>}
          </dl>
        ) : (
          <p className="text-sm text-gray-400">{isSelf ? 'No profile info yet. Click Edit to add details.' : 'No profile info available.'}</p>
        )}
      </Card>

      {/* Resumes — only for self */}
      {isSelf && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Resumes</h2>
            <div>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
              <Button size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
                <Upload size={14} /> Upload PDF
              </Button>
            </div>
          </div>

          {resumes.length === 0 ? (
            <p className="text-sm text-gray-400">No resumes uploaded yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {resumes.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-red-50 text-red-600 rounded flex items-center justify-center text-xs font-bold shrink-0">PDF</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.fileName}</p>
                      <p className="text-xs text-gray-400">{(r.fileSize / 1024).toFixed(1)} KB</p>
                    </div>
                    {r.primaryResume && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full shrink-0">Primary</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!r.primaryResume && (
                      <Button variant="ghost" size="sm" onClick={() => handleSetPrimary(r.id)} title="Set as primary">
                        <Star size={14} />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(r)} title="Download">
                      <Download size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteResume(r.id)} title="Delete" className="text-red-500 hover:bg-red-50">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Change Password Modal */}
      <Modal open={pwModal} onClose={() => setPwModal(false)} title="Change Password">
        <form onSubmit={pwForm.handleSubmit(savePw)} className="flex flex-col gap-4">
          <Input
            label="Current Password"
            type="password"
            error={pwForm.formState.errors.currentPassword?.message}
            {...pwForm.register('currentPassword', { required: 'Required' })}
          />
          <Input
            label="New Password"
            type="password"
            error={pwForm.formState.errors.newPassword?.message}
            {...pwForm.register('newPassword', {
              required: 'Required',
              minLength: { value: 8, message: 'Min 8 characters' },
              pattern: { value: /^(?=.*[A-Z])(?=.*\d).+$/, message: 'Must have uppercase and digit' },
            })}
          />
          <Input
            label="Confirm New Password"
            type="password"
            error={pwForm.formState.errors.confirm?.message}
            {...pwForm.register('confirm', { required: 'Required' })}
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setPwModal(false)}>Cancel</Button>
            <Button type="submit">Change Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
