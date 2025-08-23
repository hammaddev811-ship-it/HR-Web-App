// Utility functions for location management and Google Maps URL parsing

export interface ParsedLocation {
  name: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  coordinates?: {
    lat: number
    lng: number
  }
}

/**
 * Extract coordinates from Google Maps URL
 * Supports multiple Google Maps URL formats
 */
export function extractCoordinatesFromGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  try {
    // Remove any whitespace and trim
    const cleanUrl = url.trim()
    
    // Pattern 1: @lat,lng,zoom (most common)
    const pattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/i
    const match1 = cleanUrl.match(pattern1)
    if (match1) {
      const lat = parseFloat(match1[1])
      const lng = parseFloat(match1[2])
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng }
      }
    }
    
    // Pattern 2: ?q=lat,lng
    const pattern2 = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/i
    const match2 = cleanUrl.match(pattern2)
    if (match2) {
      const lat = parseFloat(match2[1])
      const lng = parseFloat(match2[2])
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng }
      }
    }
    
    // Pattern 3: /place/.../@lat,lng
    const pattern3 = /\/place\/[^@]+@(-?\d+\.\d+),(-?\d+\.\d+)/i
    const match3 = cleanUrl.match(pattern3)
    if (match3) {
      const lat = parseFloat(match3[1])
      const lng = parseFloat(match3[2])
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng }
      }
    }
    
    // Pattern 4: /@lat,lng,zoom/place/...
    const pattern4 = /\/@(-?\d+\.\d+),(-?\d+\.\d+)/i
    const match4 = cleanUrl.match(pattern4)
    if (match4) {
      const lat = parseFloat(match4[1])
      const lng = parseFloat(match4[2])
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error extracting coordinates from URL:', error)
    return null
  }
}

/**
 * Validate if coordinates are within reasonable bounds
 */
function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/**
 * Extract location name from Google Maps URL
 */
export function extractLocationNameFromUrl(url: string): string | null {
  try {
    // Pattern 1: /place/Location+Name
    const pattern1 = /\/place\/([^/@]+)/i
    const match1 = url.match(pattern1)
    if (match1) {
      return decodeURIComponent(match1[1].replace(/\+/g, ' '))
    }
    
    // Pattern 2: ?q=Location+Name
    const pattern2 = /[?&]q=([^&]+)/i
    const match2 = url.match(pattern2)
    if (match2) {
      return decodeURIComponent(match2[1].replace(/\+/g, ' '))
    }
    
    return null
  } catch (error) {
    console.error('Error extracting location name from URL:', error)
    return null
  }
}

/**
 * Parse Google Maps URL and extract location information
 */
export function parseGoogleMapsUrl(url: string): ParsedLocation | null {
  try {
    const coordinates = extractCoordinatesFromGoogleMapsUrl(url)
    if (!coordinates) {
      return null
    }
    
    const locationName = extractLocationNameFromUrl(url)
    
    return {
      name: locationName || 'Unknown Location',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      coordinates
    }
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error)
    return null
  }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

export function formatLocationDisplay(location: { name: string; city?: string; country?: string }): string {
  const parts = [location.name]
  
  if (location.city && location.country) {
    parts.push(`${location.city}, ${location.country}`)
  } else if (location.city) {
    parts.push(location.city)
  } else if (location.country) {
    parts.push(location.country)
  }
  
  return parts.length > 1 ? parts.join(' - ') : parts[0]
}

/**
 * Calculate distance between two coordinates using simple distance formula
 * Better for small distances (under 1km) and more accurate for local calculations
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  console.log('🔍 Distance calculation debug:')
  console.log('  Point 1:', { lat: lat1, lng: lng1 })
  console.log('  Point 2:', { lat: lat2, lng: lng2 })
  console.log('  Data types:', { 
    lat1: typeof lat1, lng1: typeof lng1, 
    lat2: typeof lat2, lng2: typeof lng2 
  })
  
  // Ensure coordinates are numbers
  lat1 = Number(lat1)
  lng1 = Number(lng1)
  lat2 = Number(lat2)
  lng2 = Number(lng2)
  
  // Simple distance calculation using coordinate differences
  // For small distances, we can approximate the Earth as flat
  const latDiff = lat2 - lat1
  const lngDiff = lng2 - lng1
  
  // Convert to meters (approximate)
  // 1 degree ≈ 111,000 meters
  const latMeters = latDiff * 111000
  const lngMeters = lngDiff * 111000
  
  // Calculate distance using Pythagorean theorem
  const distance = Math.sqrt(latMeters * latMeters + lngMeters * lngMeters)
  
  console.log('  Raw differences:', { latDiff, lngDiff })
  console.log('  In meters:', { latMeters, lngMeters })
  console.log('  Calculated distance:', distance, 'meters')
  console.log('  Rounded distance:', Math.round(distance), 'meters')
  
  return Math.round(distance)
}

/**
 * Check if a Google Maps URL is valid
 */
export function isValidGoogleMapsUrl(url: string): boolean {
  const googleMapsPatterns = [
    /^https?:\/\/(www\.)?google\.com\/maps/i,
    /^https?:\/\/(www\.)?maps\.google\.com/i,
    /^https?:\/\/goo\.gl\/maps/i,
    /^https?:\/\/maps\.app\.goo\.gl/i
  ]
  
  return googleMapsPatterns.some(pattern => pattern.test(url))
}

/**
 * Generate a Google Maps URL from coordinates
 */
export function generateGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`
}

/**
 * Test function to verify distance calculation
 * Use this to test with known coordinates
 */
export function testDistanceCalculation() {
  console.log('🧪 Testing distance calculation...')
  
  // Test case 1: Same location (should be 0m)
  const test1 = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060)
  console.log('Test 1 - Same location:', test1, 'meters (should be 0)')
  
  // Test case 2: Small distance (should be ~450m)
  const test2 = calculateDistance(40.7128, -74.0060, 40.7168, -74.0060)
  console.log('Test 2 - Small distance:', test2, 'meters (should be ~450)')
  
  // Test case 3: Different coordinates
  const test3 = calculateDistance(40.7128, -74.0060, 40.7128, -74.0100)
  console.log('Test 3 - Different longitude:', test3, 'meters')
}
