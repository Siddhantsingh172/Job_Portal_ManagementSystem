export default function Button({ variant = 'primary', size = 'md', loading = false, fullWidth = false, children, className = '', disabled, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={`btn btn-${variant} btn-${size}${fullWidth ? ' btn-full' : ''}${className ? ' ' + className : ''}`}
      {...props}
    >
      {loading && <span className="spinner spinner-sm" />}
      {children}
    </button>
  )
}
