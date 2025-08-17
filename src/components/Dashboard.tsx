'use client'

import React, { useState, useEffect } from 'react'
import {
  Clock,
  MapPin,
  User,
  LogIn,
  LogOut,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getApiEndpoint } from '../config/api'

interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  type: 'checkin' | 'checkout'
  timestamp: string
  location: string
  status: 'normal' | 'suspicious'
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [hasCheckedOutToday, setHasCheckedOutToday] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState<{
    type: 'checkin' | 'checkout'
    timestamp: string
    location: string
  } | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalData, setErrorModalData] = useState<{
    title: string
    message: string
    type: 'error' | 'warning' | 'info'
  } | null>(null)

  const { user, logout } = useAuth()

  const closeModal = () => {
    setShowModal(false)
    setModalData(null)
  }

  const closeErrorModal = () => {
    setShowErrorModal(false)
    setErrorModalData(null)
  }

  const displayErrorModal = (title: string, message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    setErrorModalData({ title, message, type })
    setShowErrorModal(true)
  }

  const handleModalOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }

  const refreshAttendanceStatus = () => {
    console.log('Manual refresh of attendance status')
    console.log('Current attendance records:', attendanceRecords)
    console.log('Current hasCheckedInToday:', hasCheckedInToday)
    console.log('Current hasCheckedOutToday:', hasCheckedOutToday)
    
    // Force re-evaluation with improved date logic
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.timestamp)
      recordDate.setHours(0, 0, 0, 0)
      return recordDate.getTime() === today.getTime()
    })
    
    const todayCheckIn = todayRecords.find(record => record.type === 'checkin')
    const todayCheckOut = todayRecords.find(record => record.type === 'checkout')
    
    console.log('Today\'s date on manual refresh:', today.toISOString())
    console.log('Today\'s records on manual refresh:', todayRecords)
    console.log('Today\'s check-in on manual refresh:', todayCheckIn)
    console.log('Today\'s check-out on manual refresh:', todayCheckOut)
    
    setHasCheckedInToday(!!todayCheckIn)
    setHasCheckedOutToday(!!todayCheckOut)
  }

  const testApiEndpoint = async () => {
    try {
      console.log('Testing API endpoint...')
      const endpoint = getApiEndpoint('EMPLOYEE_CHECK_IN')
      console.log('Testing endpoint:', endpoint)
      
      const response = await fetch(endpoint, {
        method: 'OPTIONS',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      console.log('API test response status:', response.status)
      console.log('API test response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        displayErrorModal('API Test Success', 'API endpoint is reachable!', 'info')
      } else {
        displayErrorModal('API Test Result', `API endpoint returned status: ${response.status}`, 'warning')
      }
    } catch (error) {
      console.error('API test error:', error)
      displayErrorModal('API Test Failed', 'API endpoint test failed. Check console for details.', 'error')
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date()
      setCurrentTime(newTime)
      
      // Check if it's a new day and reset attendance status
      const currentDate = newTime.toDateString()
      const lastRecordDate = attendanceRecords.length > 0 
        ? new Date(attendanceRecords[0].timestamp).toDateString()
        : null
      
      if (lastRecordDate && currentDate !== lastRecordDate) {
        // New day - reset today's status
        setHasCheckedInToday(false)
        setHasCheckedOutToday(false)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [attendanceRecords])

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  // Check today's attendance status
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.timestamp)
      recordDate.setHours(0, 0, 0, 0)
      return recordDate.getTime() === today.getTime()
    })
    
    const todayCheckIn = todayRecords.find(record => record.type === 'checkin')
    const todayCheckOut = todayRecords.find(record => record.type === 'checkout')
    
    console.log('Today\'s date:', today.toISOString())
    console.log('Today\'s records:', todayRecords)
    console.log('Today\'s check-in:', todayCheckIn)
    console.log('Today\'s check-out:', todayCheckOut)
    console.log('Setting hasCheckedInToday to:', !!todayCheckIn)
    console.log('Setting hasCheckedOutToday to:', !!todayCheckOut)
    
    setHasCheckedInToday(!!todayCheckIn)
    setHasCheckedOutToday(!!todayCheckOut)
  }, [attendanceRecords])

  // Load existing attendance records from API
  useEffect(() => {
    const loadAttendanceRecords = async () => {
      try {
        const token = localStorage.getItem('hr_token')
        if (!token) return

        const response = await fetch(getApiEndpoint('EMPLOYEE_ATTENDANCE_HISTORY'), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Attendance History API Response:', data)
          
          if (data.success && data.data) {
            // Transform API data to local format
            const apiRecords: AttendanceRecord[] = data.data.map((record: any) => ({
              id: record._id || record.id || Date.now().toString(),
              employeeId: record.employeeId || user?.employeeId || '',
              employeeName: record.employeeName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
              type: record.type || 'checkin',
              timestamp: record.timestamp || record.createdAt || new Date().toISOString(),
              location: record.location ? 
                `${record.location.latitude?.toFixed(6) || 0}, ${record.location.longitude?.toFixed(6) || 0}` : 
                'Unknown',
              status: record.status || 'normal'
            }))
            
            setAttendanceRecords(apiRecords)
          }
        } else {
          console.error('Failed to load attendance history:', response.status)
        }
      } catch (error) {
        console.error('Error loading attendance history:', error)
      }
    }

    loadAttendanceRecords()
  }, [user])

  // Auto-close modal after 5 seconds
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        closeModal()
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [showModal])

  const handleCheckIn = async () => {
    setIsCheckingIn(true)
    try {
      // Validate user data and token
      if (!user?.employeeId) {
        displayErrorModal('User Data Error', 'User data not available. Please login again.', 'warning')
        setIsCheckingIn(false)
        return
      }
      
      const token = localStorage.getItem('hr_token')
      if (!token) {
        displayErrorModal('Authentication Error', 'Authentication token not found. Please login again.', 'warning')
        setIsCheckingIn(false)
        return
      }
      
      console.log('User data:', user)
      console.log('Token available:', !!token)
      console.log('Current location:', currentLocation)

      // Calculate distance from assigned location (if available)
      let distance = 0
      if (currentLocation && user?.assignedLocation?.coordinates) {
        const assignedLat = user.assignedLocation.coordinates.lat
        const assignedLng = user.assignedLocation.coordinates.lng
        const currentLat = currentLocation.lat
        const currentLng = currentLocation.lng
        
        // Calculate distance using Haversine formula
        const R = 6371e3 // Earth's radius in meters
        const φ1 = assignedLat * Math.PI / 180
        const φ2 = currentLat * Math.PI / 180
        const Δφ = (currentLat - assignedLat) * Math.PI / 180
        const Δλ = (currentLng - assignedLng) * Math.PI / 180
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        
        distance = Math.round(R * c) // Distance in meters
      }

      // Call real employee check-in API
      const requestBody = {
        employeeId: user?.employeeId,
        timestamp: new Date().toISOString(),
        location: currentLocation ? {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          accuracy: 10 // Default accuracy
        } : null,
        distance: distance,
        status: distance <= 500 ? 'normal' : 'suspicious'
      }
      
      console.log('Sending check-in request:', requestBody)
      console.log('API endpoint:', getApiEndpoint('EMPLOYEE_CHECK_IN'))
      
      const response = await fetch(getApiEndpoint('EMPLOYEE_CHECK_IN'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hr_token')}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('Check-in API Response:', data)

        // Create local record for UI
        const newRecord: AttendanceRecord = {
          id: Date.now().toString(),
          employeeId: user?.employeeId || '',
          employeeName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          type: 'checkin',
          timestamp: new Date().toISOString(),
          location: currentLocation ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}` : 'Unknown',
          status: distance <= 500 ? 'normal' : 'suspicious'
        }

        console.log('Created new record:', newRecord)
        console.log('Current attendance records before update:', attendanceRecords)
        
        setAttendanceRecords(prev => {
          const updated = [newRecord, ...prev]
          console.log('Updated attendance records:', updated)
          return updated
        })

        // Show success modal
        setModalData({
          type: 'checkin',
          timestamp: newRecord.timestamp,
          location: newRecord.location
        })
        setShowModal(true)
      } else {
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch (parseError) {
          console.log('Could not parse error response as JSON, using status code')
        }
        
        console.error('Check-in API Error Status:', response.status)
        console.error('Check-in API Error Headers:', Object.fromEntries(response.headers.entries()))
        console.error('Check-in API Error Body:', errorData)
        
        let errorMessage = 'Check-in failed'
        if (response.status === 401) {
          errorMessage = 'Session expired. Please login again.'
        } else if (response.status === 400) {
          errorMessage = errorData.message || 'Invalid request data'
        } else if (response.status === 409) {
          errorMessage = 'Already checked in today'
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Please check your permissions.'
        } else if (response.status === 404) {
          errorMessage = 'Check-in service not found'
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        } else {
          errorMessage = `Check-in failed (${response.status})`
        }
        
        displayErrorModal('Check-in Failed', errorMessage, 'error')
      }
    } catch (error) {
      console.error('Check-in error:', error)
      displayErrorModal('Check-in Error', 'Check-in failed. Please check your connection and try again.', 'error')
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    setIsCheckingOut(true)
    try {
      // Since the current API doesn't have a separate checkout endpoint,
      // we'll create a local checkout record for now
      // TODO: Implement proper checkout API endpoint
      
      // Calculate distance from assigned location (if available)
      let distance = 0
      if (currentLocation && user?.assignedLocation?.coordinates) {
        const assignedLat = user.assignedLocation.coordinates.lat
        const assignedLng = user.assignedLocation.coordinates.lng
        const currentLat = currentLocation.lat
        const currentLng = currentLocation.lng
        
        // Calculate distance using Haversine formula
        const R = 6371e3 // Earth's radius in meters
        const φ1 = assignedLat * Math.PI / 180
        const φ2 = currentLat * Math.PI / 180
        const Δφ = (currentLat - assignedLat) * Math.PI / 180
        const Δλ = (currentLng - assignedLng) * Math.PI / 180
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        
        distance = Math.round(R * c) // Distance in meters
      }

      // For now, create a local checkout record
      // In the future, this should call a proper checkout API
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId: user?.employeeId || '',
        employeeName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        type: 'checkout',
        timestamp: new Date().toISOString(),
        location: currentLocation ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}` : 'Unknown',
        status: distance <= 500 ? 'normal' : 'suspicious'
      }

      setAttendanceRecords(prev => [newRecord, ...prev])

      // Show success modal
      setModalData({
        type: 'checkout',
        timestamp: newRecord.timestamp,
        location: newRecord.location
      })
      setShowModal(true)

      // TODO: When checkout API is implemented, replace the above with:
      /*
      const response = await fetch(getApiEndpoint('EMPLOYEE_CHECK_OUT'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hr_token')}`
        },
        body: JSON.stringify({
          employeeId: user?.employeeId,
          timestamp: new Date().toISOString(),
          location: currentLocation ? {
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
            accuracy: 10
          } : null,
          distance: distance,
          status: distance <= 500 ? 'normal' : 'suspicious'
        })
      })
      */

    } catch (error) {
      console.error('Check-out error:', error)
      displayErrorModal('Check-out Error', 'Check-out failed. Please try again.', 'error')
    } finally {
      setIsCheckingOut(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'suspicious':
        return <XCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'checkin'
      ? <LogIn className="w-4 h-4 text-blue-500" />
      : <LogOut className="w-4 h-4 text-purple-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0 space-y-4 sm:space-y-0">
            {/* Logo Section */}
            <div className="flex items-center w-full sm:w-auto">
              <div className="flex-shrink-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Focus</h1>
              </div>
            </div>
            
            {/* Right Section - Time, User Info, and Logout */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              {/* Time and Date */}
              <div className="text-sm text-gray-500 w-full sm:w-auto">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm sm:text-base">{formatTime(currentTime)}</span>
                </div>
                <div className="text-xs sm:text-sm">{formatDate(currentTime)}</div>
              </div>
              
              {/* User Info and Logout */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <div className="text-right w-full sm:w-auto">
                  <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.department?.departmentName}</p>
                </div>
                <button
                  onClick={logout}
                  className="btn-secondary flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Employee Info Card */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-gray-600">ID: {user?.employeeId}</p>
                <p className="text-sm text-gray-600">{user?.position}</p>
                <p className="text-sm text-gray-600">{user?.department?.departmentName}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 w-full sm:w-auto">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{user?.assignedLocation?.name}</span>
            </div>
          </div>
        </div>

        {/* Current Status Indicator */}
        <div className="card mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              hasCheckedInToday && !hasCheckedOutToday 
                ? 'bg-blue-100 text-blue-800' 
                : hasCheckedInToday && hasCheckedOutToday
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                hasCheckedInToday && !hasCheckedOutToday 
                  ? 'bg-blue-500' 
                  : hasCheckedInToday && hasCheckedOutToday
                  ? 'bg-green-500'
                  : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium">
                {hasCheckedInToday && !hasCheckedOutToday ? '🟦 At Work' :
                 hasCheckedInToday && hasCheckedOutToday ? '🟢 Day Complete' :
                 '⚪ Not Started'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {hasCheckedInToday && !hasCheckedOutToday ? 
                `Checked in at ${new Date(attendanceRecords.find(r => r.type === 'checkin')?.timestamp || '').toLocaleTimeString()}` :
               hasCheckedInToday && hasCheckedOutToday ?
                `Completed at ${new Date(attendanceRecords.find(r => r.type === 'checkout')?.timestamp || '').toLocaleTimeString()}` :
                'Ready to start your day'
              }
            </div>
          </div>
        </div>

        {/* Debug Section - Remove this after fixing the issue */}
        {/* <div className="card mb-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Debug Info</h3>
              <p className="text-xs text-yellow-600">
                Check-in: {hasCheckedInToday ? 'Yes' : 'No'} | 
                Check-out: {hasCheckedOutToday ? 'Yes' : 'No'} | 
                Records: {attendanceRecords.length}
              </p>
            </div>
            <button
              onClick={refreshAttendanceStatus}
              className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
            >
              Refresh Status
            </button>
            <button
              onClick={testApiEndpoint}
              className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 ml-2"
            >
              Test API Endpoint
            </button>
          </div>
        </div> */}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="card">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleCheckIn}
                disabled={isCheckingIn || hasCheckedInToday}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 py-3 sm:py-2"
              >
                {isCheckingIn ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span className="text-sm sm:text-base">
                  {isCheckingIn ? 'Checking In...' : 
                   hasCheckedInToday ? 'Already Checked In' : 'Check In'}
                </span>
              </button>

              <button
                onClick={handleCheckOut}
                disabled={isCheckingOut || !hasCheckedInToday || hasCheckedOutToday}
                className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 py-3 sm:py-2"
              >
                {isCheckingOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span className="text-sm sm:text-base">
                  {isCheckingOut ? 'Checking Out...' : 
                   !hasCheckedInToday ? 'Check In First' :
                   hasCheckedOutToday ? 'Already Checked Out' : 'Check Out'}
                </span>
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Check-in Status:</span>
                <span className={`font-semibold text-sm sm:text-base ${
                  hasCheckedInToday ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {hasCheckedInToday ? '✓ Checked In' : 'Not Checked In'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Check-out Status:</span>
                <span className={`font-semibold text-sm sm:text-base ${
                  hasCheckedOutToday ? 'text-purple-600' : 'text-gray-400'
                }`}>
                  {hasCheckedOutToday ? '✓ Checked Out' : 'Not Checked Out'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Status:</span>
                <span className={`font-semibold text-sm sm:text-base ${
                  hasCheckedInToday && !hasCheckedOutToday ? 'text-blue-600' :
                  hasCheckedInToday && hasCheckedOutToday ? 'text-green-600' :
                  'text-gray-400'
                }`}>
                  {hasCheckedInToday && !hasCheckedOutToday ? 'At Work' :
                   hasCheckedInToday && hasCheckedOutToday ? 'Completed' :
                   'Not Started'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Activity</h3>
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Calendar className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
              <p className="text-sm sm:text-base">No activity recorded yet</p>
              <p className="text-xs sm:text-sm">Check in or out to see your activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceRecords.map((record) => (
                <div key={record.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    {getTypeIcon(record.type)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {record.type === 'checkin' ? 'Checked In' : 'Checked Out'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    {getStatusIcon(record.status)}
                    <span className="text-xs sm:text-sm text-gray-500 truncate">{record.location}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Success Modal */}
      {showModal && modalData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleModalOverlayClick}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-4 ${
              modalData.type === 'checkin' ? 'bg-green-500' : 'bg-purple-500'
            } text-white text-center`}>
              <div className="w-16 h-16 mx-auto mb-2 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {modalData.type === 'checkin' ? (
                  <LogIn className="w-8 h-8 text-white" />
                ) : (
                  <LogOut className="w-8 h-8 text-white" />
                )}
              </div>
              <h3 className="text-xl font-bold">
                {modalData.type === 'checkin' ? 'Check-in Successful!' : 'Check-out Successful!'}
              </h3>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(modalData.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(modalData.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {modalData.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Employee</p>
                    <p className="font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={closeModal}
                className={`w-full mt-6 py-3 px-4 rounded-xl font-medium text-white transition-colors ${
                  modalData.type === 'checkin' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && errorModalData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && closeErrorModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-4 ${
              errorModalData.type === 'error' ? 'bg-red-500' :
              errorModalData.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            } text-white text-center`}>
              <div className="w-16 h-16 mx-auto mb-2 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {errorModalData.type === 'error' ? (
                  <XCircle className="w-8 h-8 text-white" />
                ) : errorModalData.type === 'warning' ? (
                  <AlertCircle className="w-8 h-8 text-white" />
                ) : (
                  <Info className="w-8 h-8 text-white" />
                )}
              </div>
              <h3 className="text-xl font-bold">
                {errorModalData.title}
              </h3>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="text-center mb-6">
                <p className="text-gray-700 text-base leading-relaxed">
                  {errorModalData.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={closeErrorModal}
                  className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-colors ${
                    errorModalData.type === 'error' ? 'bg-red-500 hover:bg-red-600' :
                    errorModalData.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
                    'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  Got it
                </button>
                
                {errorModalData.type === 'warning' && (
                  <button
                    onClick={() => {
                      closeErrorModal()
                      // You can add additional actions here like redirecting to login
                    }}
                    className="w-full py-3 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Go to Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
