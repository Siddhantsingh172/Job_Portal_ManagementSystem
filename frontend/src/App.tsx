import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'

import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import JobsPage from './pages/jobs/JobsPage'
import JobDetailPage from './pages/jobs/JobDetailPage'
import MyApplicationsPage from './pages/jobs/MyApplicationsPage'

import ProfilePage from './pages/profile/ProfilePage'

import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import RecruiterJobsPage from './pages/recruiter/RecruiterJobsPage'
import JobFormPage from './pages/recruiter/JobFormPage'
import JobApplicationsPage from './pages/recruiter/JobApplicationsPage'
import RecruiterJobDetailPage from './pages/recruiter/RecruiterJobDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontSize: '0.875rem', borderRadius: '10px' },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Layout-wrapped routes */}
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />

        <Route
          path="/jobs"
          element={
            <Layout>
              <JobsPage />
            </Layout>
          }
        />

        <Route
          path="/jobs/:id"
          element={
            <Layout>
              <JobDetailPage />
            </Layout>
          }
        />

        {/* Job Seeker */}
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute roles={['JOB_SEEKER', 'ADMIN']}>
              <Layout>
                <MyApplicationsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Recruiter */}
        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute roles={['RECRUITER', 'ADMIN']}>
              <Layout>
                <RecruiterDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs"
          element={
            <ProtectedRoute roles={['RECRUITER', 'ADMIN']}>
              <Layout>
                <RecruiterJobsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs/:id"
          element={
            <ProtectedRoute roles={['RECRUITER', 'ADMIN']}>
              <Layout>
                <RecruiterJobDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs/new"
          element={
            <ProtectedRoute roles={['RECRUITER', 'ADMIN']}>
              <Layout>
                <JobFormPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs/:id/edit"
          element={
            <ProtectedRoute roles={['RECRUITER', 'ADMIN']}>
              <Layout>
                <JobFormPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs/:id/applications"
          element={
            <ProtectedRoute roles={['RECRUITER', 'ADMIN']}>
              <Layout>
                <JobApplicationsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/404" element={<Layout><NotFoundPage /></Layout>} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
