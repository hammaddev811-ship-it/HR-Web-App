'use client'

import { useAuth } from '../contexts/AuthContext'
import LoginForm from '../components/LoginForm'
import Dashboard from '../components/Dashboard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function HRDashboard() {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading Focus HR App..." />
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />
  }

  // Show dashboard if authenticated
  return <Dashboard />
}
