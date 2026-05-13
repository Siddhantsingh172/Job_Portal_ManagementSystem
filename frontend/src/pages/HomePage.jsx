import { Link } from 'react-router-dom'
import { Briefcase, Search, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function HomePage() {
  const { isAuthenticated, role } = useAuthStore()
  return (
    <div>
      <section className="hero">
        <div className="hero-tag"><TrendingUp size={14} /> Thousands of jobs available</div>
        <h1 className="hero-title">Find Your Dream Job<br /><span>or Hire Top Talent</span></h1>
        <p className="hero-desc">Connect job seekers with recruiters. Search, apply, and manage your career — all in one place.</p>
        <div className="hero-actions">
          <Link to="/jobs" className="btn btn-primary btn-lg"><Search size={18} /> Browse Jobs</Link>
          {!isAuthenticated && <Link to="/register" className="btn btn-outline btn-lg">Get Started <ArrowRight size={18} /></Link>}
          {isAuthenticated && role === 'RECRUITER' && <Link to="/recruiter/jobs/new" className="btn btn-outline btn-lg">Post a Job <ArrowRight size={18} /></Link>}
        </div>
      </section>

      <div className="features-grid">
        {[
          { icon: Search, title: 'Smart Search', desc: 'Filter by title, location, type, experience, and company.', bg: '#eff6ff', color: '#2563eb' },
          { icon: Briefcase, title: 'Easy Apply', desc: 'Upload your resume once and apply to multiple jobs.', bg: '#f0fdf4', color: '#16a34a' },
          { icon: Users, title: 'Track Applications', desc: 'Real-time status updates and full history.', bg: '#f5f3ff', color: '#7c3aed' },
        ].map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon" style={{ background: f.bg, color: f.color }}><f.icon size={22} /></div>
            <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>{f.title}</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {!isAuthenticated && (
        <div className="cta-section">
          <h2 className="cta-title">Ready to get started?</h2>
          <p className="cta-desc">Join thousands of job seekers and recruiters on JobPortal.</p>
          <div className="cta-actions">
            <Link to="/register" className="cta-btn-white">I'm looking for a job</Link>
            <Link to="/register" className="cta-btn-border">I'm hiring</Link>
          </div>
        </div>
      )}
    </div>
  )
}
