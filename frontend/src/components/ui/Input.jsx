import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input ref={ref} className={`form-input${error ? ' error' : ''}${className ? ' ' + className : ''}`} {...props} />
      {error && <p className="form-error">{error}</p>}
    </div>
  )
})

export default Input
