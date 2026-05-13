const colors = { blue: 'badge-blue', green: 'badge-green', yellow: 'badge-yellow', red: 'badge-red', gray: 'badge-gray', purple: 'badge-purple', orange: 'badge-orange' }

export default function Badge({ children, color = 'gray', className = '' }) {
  return <span className={`badge ${colors[color] || 'badge-gray'}${className ? ' ' + className : ''}`}>{children}</span>
}

export function statusColor(status) {
  const map = { APPLIED: 'blue', SHORTLISTED: 'purple', INTERVIEW_SCHEDULED: 'yellow', OFFERED: 'green', REJECTED: 'red', WITHDRAWN: 'gray', OPEN: 'green', CLOSED: 'red', DRAFT: 'yellow' }
  return map[status] || 'gray'
}
