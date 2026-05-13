import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Briefcase, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { register as registerApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { role: 'JOB_SEEKER' } })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const auth = await registerApi(data)
      setAuth(auth)
      toast.success('Account created!')
      if (auth.role === 'RECRUITER') navigate('/recruiter/dashboard')
      else navigate('/jobs')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><Briefcase size={24} color="#fff" /></div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join JobPortal today</p>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <Input label="Full Name" placeholder="John Doe" error={errors.name?.message}
            {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
          <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message}
            {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="pw-wrapper">
              <input type={showPw ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 digit"
                className={`form-input${errors.password ? ' error' : ''}`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Min 8 characters' },
                  pattern: { value: /^(?=.*[A-Z])(?=.*\d).+$/, message: 'Must have uppercase and digit' },
                })} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>
          <Select label="I am a..." error={errors.role?.message} {...register('role', { required: true })}>
            <option value="JOB_SEEKER">Job Seeker</option>
            <option value="RECRUITER">Recruiter</option>
          </Select>
          <Input label="Phone (optional)" type="tel" placeholder="+1 234 567 8900" {...register('phone')} />
          <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: '0.5rem' }}>Create Account</Button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login" className="link-blue" style={{ fontWeight: 500 }}>Sign in</Link></p>
      </div>
    </div>
  )
}
