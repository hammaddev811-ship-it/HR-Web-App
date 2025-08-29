// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://focus-hrm.vercel.app',
  ENDPOINTS: {
    EMPLOYEE_LOGIN: '/api/employee/login',
    EMPLOYEE_LOGOUT: '/api/employee/logout',
    EMPLOYEE_PROFILE: '/api/employee/profile',
    EMPLOYEE_CHECK_IN: '/api/attendance/checkin',
    EMPLOYEE_CHECK_OUT: '/api/attendance/checkout',
    EMPLOYEE_AUTO_CHECKOUT: '/api/attendance/auto-checkout',
    EMPLOYEE_ATTENDANCE_HISTORY: '/api/visits',
    EMPLOYEE_DASHBOARD: '/api/employee/dashboard'
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3
}

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to get endpoint URL
export const getApiEndpoint = (key: keyof typeof API_CONFIG.ENDPOINTS): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS[key])
}
