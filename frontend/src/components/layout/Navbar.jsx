import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Briefcase, ChevronDown, LogOut, User, Menu, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { getNotifications, markAllRead } from '../../api/notifications'
import { formatDistanceToNow } from 'date-fns'

export default function Navbar() {
  const { isAuthenticated, userId, role, email, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated && userId) {
      getNotifications(userId).then(setNotifications).catch(() => {})
    }
  }, [isAuthenticated, userId])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifications.filter((n) => !n.read).length

  const handleLogout = () => { clearAuth(); navigate('/login') }

  const handleMarkAll = async () => {
    await markAllRead(userId)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const navLinks = isAuthenticated
    ? role === 'RECRUITER'
      ? [{ to: '/recruiter/dashboard', label: 'Dashboard' }, { to: '/recruiter/jobs', label: 'My Jobs' }, { to: '/jobs', label: 'Browse Jobs' }]
      : role === 'ADMIN'
      ? [{ to: '/jobs', label: 'Jobs' }]
      : [{ to: '/jobs', label: 'Browse Jobs' }, { to: '/my-applications', label: 'My Applications' }]
    : [{ to: '/jobs', label: 'Browse Jobs' }]

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo"><Briefcase size={22} /> JobPortal</Link>

        <div className="navbar-links">
          {navLinks.map((l) => <Link key={l.to} to={l.to} className="navbar-link">{l.label}</Link>)}
        </div>

        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen((v) => !v)} style={{ position: 'relative', padding: '0.5rem', borderRadius: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}>
                  <Bell size={20} />
                  {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
                </button>
                {notifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Notifications</span>
                      {unread > 0 && <button onClick={handleMarkAll} className="link-blue" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>}
                    </div>
                    <div style={{ maxHeight: '18rem', overflowY: 'auto' }}>
                      {notifications.length === 0
                        ? <p style={{ textAlign: 'center', padding: '1.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>No notifications</p>
                        : notifications.slice(0, 10).map((n) => (
                          <div key={n.id} className={`notif-item${!n.read ? ' unread' : ''}`}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1f2937' }}>{n.subject}</p>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.125rem' }} className="line-clamp-2">{n.body}</p>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                              {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                            </p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                  <div className="navbar-avatar">{email?.[0]?.toUpperCase()}</div>
                  <span style={{ maxWidth: '8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
                  <ChevronDown size={14} />
                </button>
                {menuOpen && (
                  <div className="dropdown-menu">
                    <Link to={`/profile/${userId}`} onClick={() => setMenuOpen(false)} className="dropdown-item"><User size={15} /> Profile</Link>
                    <button onClick={handleLogout} className="dropdown-item danger"><LogOut size={15} /> Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="navbar-link" style={{ padding: '0.5rem 0.75rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-md">Sign Up</Link>
            </div>
          )}

          <button className="btn btn-ghost btn-sm" style={{ display: 'none' }} onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{ borderTop: '1px solid #e2e8f0', background: '#fff', padding: '0.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navLinks.map((l) => <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="navbar-link" style={{ padding: '0.5rem 0' }}>{l.label}</Link>)}
        </div>
      )}
    </nav>
  )
}
