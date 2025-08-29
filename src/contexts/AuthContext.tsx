'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getApiEndpoint } from '../config/api'

interface User {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  position: string
  department: {
    _id: string
    departmentId: string
    departmentName: string
  }
  assignedLocation: {
    _id: string
    name: string
    description: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  status: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (employeeId: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  checkAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = () => {
    try {
      const savedUser = localStorage.getItem('hr_user')
      const savedToken = localStorage.getItem('hr_token')
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      localStorage.removeItem('hr_user')
      localStorage.removeItem('hr_token')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (employeeId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Real API call to your HRM system - Employee Login
      const response = await fetch(getApiEndpoint('EMPLOYEE_LOGIN'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          employeeId, 
          password 
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Login API Response:', data) // Debug log
        
        // Handle successful login response
        if (data.success && data.employee) {
          const userData: User = {
            id: data.employee._id || '1',
            employeeId: data.employee.employeeId || employeeId,
            firstName: data.employee.firstName || 'Employee',
            lastName: data.employee.lastName || 'Employee',
            email: data.employee.email || 'employee@example.com',
            position: data.employee.position || 'Staff',
            department: data.employee.department || { _id: '1', departmentId: '1', departmentName: 'General' },
            assignedLocation: data.employee.assignedLocation || { _id: '1', name: 'Office', description: 'Main office', coordinates: { lat: 0, lng: 0 } },
            status: data.employee.status || 'Active'
          }
          
          // Save to localStorage
          localStorage.setItem('hr_user', JSON.stringify(userData))
          localStorage.setItem('hr_token', data.token || 'api-token')
          
          console.log('User data set:', userData) // Debug log
          
          setUser(userData)
          setIsAuthenticated(true)
          return { success: true }
        } else {
          return { success: false, error: data.message || 'Login failed' }
        }
      } else {
        // Handle different HTTP error statuses
        if (response.status === 401) {
          return { success: false, error: 'Invalid Employee ID or password' }
        } else if (response.status === 404) {
          return { success: false, error: 'Login service not found' }
        } else if (response.status >= 500) {
          return { success: false, error: 'Server error. Please try again later.' }
        } else {
          return { success: false, error: `Login failed (${response.status})` }
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { success: false, error: 'Network error. Please check your connection.' }
      }
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('hr_token')
      
      // Check if user needs auto-checkout before logging out
      if (user?.employeeId && token) {
        try {
          // Check today's attendance status
          const attendanceResponse = await fetch(getApiEndpoint('EMPLOYEE_ATTENDANCE_HISTORY'), {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })

          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json()
            
            if (attendanceData.success && attendanceData.data) {
              // Check if employee has checked in today but not checked out
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              
              const todayRecords = attendanceData.data.filter((record: any) => {
                const recordDate = new Date(record.timestamp)
                recordDate.setHours(0, 0, 0, 0)
                return recordDate.getTime() === today.getTime()
              })
              
              const hasCheckedIn = todayRecords.some((record: any) => record.type === 'checkin')
              const hasCheckedOut = todayRecords.some((record: any) => record.type === 'checkout')
              
              // If checked in but not checked out, perform auto-checkout
              if (hasCheckedIn && !hasCheckedOut) {
                console.log('Employee needs auto-checkout before logout')
                
                const autoCheckoutResponse = await fetch(getApiEndpoint('EMPLOYEE_AUTO_CHECKOUT'), {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    employeeId: user.employeeId,
                    reason: 'Auto-checkout on logout',
                    timestamp: new Date().toISOString()
                  })
                })
                
                if (autoCheckoutResponse.ok) {
                  const autoCheckoutData = await autoCheckoutResponse.json()
                  console.log('Auto-checkout successful:', autoCheckoutData)
                } else {
                  console.warn('Auto-checkout failed, but continuing with logout')
                }
              }
            }
          }
        } catch (autoCheckoutError) {
          console.warn('Auto-checkout check failed, but continuing with logout:', autoCheckoutError)
        }
      }
      
      // Proceed with normal logout
      try {
        const response = await fetch(getApiEndpoint('EMPLOYEE_LOGOUT'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          console.log('Logout API call successful')
        } else {
          console.warn('Logout API call failed, but clearing local data')
        }
      } catch (logoutApiError) {
        console.warn('Logout API call failed, but clearing local data:', logoutApiError)
      }
      
      // Clear local storage regardless of API response
      localStorage.removeItem('hr_user')
      localStorage.removeItem('hr_token')
      setUser(null)
      setIsAuthenticated(false)
      
      console.log('Logout completed')
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local storage even if everything fails
      localStorage.removeItem('hr_user')
      localStorage.removeItem('hr_token')
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
