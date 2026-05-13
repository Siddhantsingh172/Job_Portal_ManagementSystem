import { forwardRef } from 'react'

const Select = forwardRef(function Select({ label, error, children, className = '', ...props }, ref) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select ref={ref} className={`form-select${className ? ' ' + className : ''}`} {...props}>{children}</select>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
})

export default Select
