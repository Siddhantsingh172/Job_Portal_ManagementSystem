import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Briefcase, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const auth = await login(data)
      if (!auth?.accessToken) { toast.error('Login failed: no token received'); return }
      setAuth(auth)
      toast.success('Welcome back!')
      if (auth.role === 'RECRUITER') navigate('/recruiter/dashboard')
      else if (auth.role === 'ADMIN') navigate('/admin/dashboard')
      else navigate('/jobs')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><Briefcase size={24} color="#fff" /></div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account</p>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message}
            {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="pw-wrapper">
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                className={`form-input${errors.password ? ' error' : ''}`}
                {...register('password', { required: 'Password is required' })} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>
          <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: '0.5rem' }}>Sign In</Button>
        </form>
        <p className="auth-footer">Don't have an account? <Link to="/register" className="link-blue" style={{ fontWeight: 500 }}>Sign up</Link></p>
      </div>
    </div>
  )
}
