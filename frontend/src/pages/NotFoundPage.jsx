import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '1rem' }}>
      <p style={{ fontSize: '6rem', fontWeight: 700, color: '#dbeafe', lineHeight: 1 }}>404</p>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Page not found</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary btn-md">Go Home</Link>
    </div>
  )
}
