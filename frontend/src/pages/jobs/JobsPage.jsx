import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Briefcase, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { searchJobs, getSuggestions } from '../../api/search'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge, { statusColor } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { formatDistanceToNow } from 'date-fns'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']
const TYPE_LABELS = { FULL_TIME: 'Full Time', PART_TIME: 'Part Time', CONTRACT: 'Contract', INTERNSHIP: 'Internship' }

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filters, setFilters] = useState({ keyword: '', location: '', type: '', company: '', expMin: '', expMax: '' })
  const [applied, setApplied] = useState(filters)

  const fetchJobs = useCallback(async (f, p) => {
    setLoading(true)
    try {
      const params = { page: p, size: 10 }
      if (f.keyword) params.keyword = f.keyword
      if (f.location) params.location = f.location
      if (f.type) params.type = f.type
      if (f.company) params.company = f.company
      if (f.expMin) params.expMin = Number(f.expMin)
      if (f.expMax) params.expMax = Number(f.expMax)
      const data = await searchJobs(params)
      setJobs(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch { setJobs([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchJobs(applied, page) }, [applied, page, fetchJobs])

  const handleSearch = (e) => { e.preventDefault(); setPage(0); setApplied(filters); setShowSuggestions(false) }

  const handleKeywordChange = async (val) => {
    setFilters((f) => ({ ...f, keyword: val }))
    if (val.length > 1) {
      const s = await getSuggestions(val).catch(() => [])
      setSuggestions(s); setShowSuggestions(true)
    } else { setShowSuggestions(false) }
  }

  const clearFilters = () => {
    const empty = { keyword: '', location: '', type: '', company: '', expMin: '', expMax: '' }
    setFilters(empty); setApplied(empty); setPage(0)
  }

  const hasFilters = Object.values(applied).some(Boolean)

  return (
    <div>
      <div className="search-bar">
        <form onSubmit={handleSearch} className="search-row">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input value={filters.keyword} onChange={(e) => handleKeywordChange(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Job title, keyword..." className="search-input" />
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-box">
                {suggestions.map((s) => (
                  <button key={s} type="button" className="suggestion-item"
                    onMouseDown={() => { setFilters((f) => ({ ...f, keyword: s })); setShowSuggestions(false) }}>{s}</button>
                ))}
              </div>
            )}
          </div>
          <div className="search-input-wrap" style={{ flex: '0 0 auto', minWidth: '10rem' }}>
            <MapPin size={16} className="search-icon" />
            <input value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
              placeholder="Location" className="search-input" />
          </div>
          <Button type="button" variant="ghost" size="md" onClick={() => setShowFilters((v) => !v)} style={{ border: '1px solid #d1d5db' }}>
            <Filter size={15} /> Filters {hasFilters && <span style={{ width: '0.5rem', height: '0.5rem', background: '#2563eb', borderRadius: '50%', display: 'inline-block' }} />}
          </Button>
          <Button type="submit">Search</Button>
          {hasFilters && <Button type="button" variant="ghost" onClick={clearFilters} style={{ color: '#dc2626' }}><X size={15} /> Clear</Button>}
        </form>

        {showFilters && (
          <div className="filters-grid">
            <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))} className="form-select">
              <option value="">All Types</option>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
            <input value={filters.company} onChange={(e) => setFilters((f) => ({ ...f, company: e.target.value }))} placeholder="Company" className="form-input" />
            <input type="number" value={filters.expMin} onChange={(e) => setFilters((f) => ({ ...f, expMin: e.target.value }))} placeholder="Min exp (yrs)" className="form-input" />
            <input type="number" value={filters.expMax} onChange={(e) => setFilters((f) => ({ ...f, expMax: e.target.value }))} placeholder="Max exp (yrs)" className="form-input" />
          </div>
        )}
      </div>

      <div className="results-header">
        <p className="text-muted">{loading ? 'Searching...' : `${totalElements} job${totalElements !== 1 ? 's' : ''} found`}</p>
      </div>

      {loading ? <PageSpinner /> : jobs.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>No jobs found</p>
          <p>Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /></Button>
          <span className="text-muted">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}><ChevronRight size={16} /></Button>
        </div>
      )}
    </div>
  )
}

function JobCard({ job }) {
  const TYPE_LABELS = { FULL_TIME: 'Full Time', PART_TIME: 'Part Time', CONTRACT: 'Contract', INTERNSHIP: 'Internship' }
  return (
    <div className="job-card">
      <div className="job-card-inner">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <Link to={`/jobs/${job.id}`} className="job-title">{job.title}</Link>
            <Badge color={statusColor(job.status)}>{job.status}</Badge>
          </div>
          <p className="job-company">{job.company}</p>
          <div className="job-meta">
            <span className="job-meta-item"><MapPin size={12} />{job.location}</span>
            <span className="job-meta-item"><Briefcase size={12} />{TYPE_LABELS[job.jobType] || job.jobType}</span>
            {job.salaryRange && <span>💰 {job.salaryRange}</span>}
            {(job.experienceMin != null || job.experienceMax != null) && <span>🎯 {job.experienceMin ?? 0}–{job.experienceMax ?? '∞'} yrs</span>}
            {job.deadline && <span>📅 {job.deadline}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
          <span className="text-xs" style={{ color: '#9ca3af' }}>
            {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : ''}
          </span>
          <Link to={`/jobs/${job.id}`} className="link-blue">View →</Link>
        </div>
      </div>
    </div>
  )
}
