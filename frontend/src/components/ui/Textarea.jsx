import { forwardRef } from 'react'

const Textarea = forwardRef(function Textarea({ label, error, className = '', ...props }, ref) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <textarea ref={ref} rows={4} className={`form-textarea${className ? ' ' + className : ''}`} {...props} />
      {error && <p className="form-error">{error}</p>}
    </div>
  )
})

export default Textarea
