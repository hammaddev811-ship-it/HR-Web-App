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
  XCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

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

  const { user, logout } = useAuth()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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

  const handleCheckIn = async () => {
    setIsCheckingIn(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId: user?.employeeId || '',
        employeeName: user?.name || '',
        type: 'checkin',
        timestamp: new Date().toISOString(),
        location: currentLocation ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}` : 'Unknown',
        status: 'normal'
      }

      setAttendanceRecords(prev => [newRecord, ...prev])

      // Show success message
      alert('Check-in successful!')
    } catch (error) {
      alert('Check-in failed. Please try again.')
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    setIsCheckingOut(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId: user?.employeeId || '',
        employeeName: user?.name || '',
        type: 'checkout',
        timestamp: new Date().toISOString(),
        location: currentLocation ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}` : 'Unknown',
        status: 'normal'
      }

      setAttendanceRecords(prev => [newRecord, ...prev])

      // Show success message
      alert('Check-out successful!')
    } catch (error) {
      alert('Check-out failed. Please try again.')
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Focus</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(currentTime)}</span>
                </div>
                <div className="text-xs">{formatDate(currentTime)}</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.department}</p>
                </div>
                <button
                  onClick={logout}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Employee Info Card */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600">ID: {user?.employeeId}</p>
                <p className="text-gray-600">{user?.department}</p>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{user?.location}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleCheckIn}
                disabled={isCheckingIn}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isCheckingIn ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{isCheckingIn ? 'Checking In...' : 'Check In'}</span>
              </button>

              <button
                onClick={handleCheckOut}
                disabled={isCheckingOut}
                className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>{isCheckingOut ? 'Checking Out...' : 'Check Out'}</span>
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Check-ins:</span>
                <span className="font-semibold text-green-600">
                  {attendanceRecords.filter(r => r.type === 'checkin').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Check-outs:</span>
                <span className="font-semibold text-purple-600">
                  {attendanceRecords.filter(r => r.type === 'checkout').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-blue-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No activity recorded yet</p>
              <p className="text-sm">Check in or out to see your activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(record.type)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {record.type === 'checkin' ? 'Checked In' : 'Checked Out'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(record.status)}
                    <span className="text-sm text-gray-500">{record.location}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
