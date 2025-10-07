import { AuthService } from '@/services/auth.service'

export async function refreshAccessToken (): Promise<string> {
  try {
    const refresh_token = localStorage.getItem('app_refresh_token')
    if (!refresh_token) {
      throw new Error('No refresh token found')
    }

    const response = await AuthService.refresh(refresh_token)

    localStorage.setItem('app_token', response.access_token)
    localStorage.setItem('app_refresh_token', response.refresh_token)
    localStorage.setItem('app_token_expiry', (Date.now() + response.expires_in * 1000).toString())

    return response.access_token
  } catch (error) {
    localStorage.removeItem('app_token')
    localStorage.removeItem('app_refresh_token')
    localStorage.removeItem('app_token_expiry')
    throw error
  }
}

export function isTokenExpired (): boolean {
  const expiry = localStorage.getItem('app_token_expiry')
  if (!expiry) {
    return true
  }
  return Date.now() >= Number.parseInt(expiry)
}

export function getStoredToken (): string | null {
  return localStorage.getItem('app_token')
}

export async function getAccessToken (): Promise<string | null> {
  const token = getStoredToken()
  if (!token) {
    throw new Error('No token found')
  }
  return `Bearer ${token}`
}

export function isAuthenticated (): boolean {
  return !!localStorage.getItem('app_token')
}

export function clearAuth (): void {
  localStorage.removeItem('app_token')
  localStorage.removeItem('app_refresh_token')
  localStorage.removeItem('app_token_expiry')
}
