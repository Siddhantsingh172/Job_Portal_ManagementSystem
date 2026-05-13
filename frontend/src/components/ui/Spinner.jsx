export default function Spinner({ size = 'md' }) {
  return <div className={`spinner spinner-${size}`} />
}

export function PageSpinner() {
  return <div className="page-spinner"><Spinner size="lg" /></div>
}
