import type { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import router from '@/router'
import { clearAuth, getAccessToken, refreshAccessToken } from '@/utils/auth'

interface CustomRequestConfig extends AxiosRequestConfig {
  _retry?: boolean
  url?: string
  headers?: Record<string, string>
}

let logoutCallback: (() => void) | null = null

export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback
}

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const publicRoutes = ['/auth/login', '/users/register', '/auth/refresh']

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const isPublicRoute = publicRoutes.some(route => config.url?.endsWith(route))
  if (isPublicRoute) {
    return config
  }
  try {
    const token = await getAccessToken()
    if (token) {
      config.headers.Authorization = token
    }
  } catch (error) {
    console.warn('Failed to get access token:', error)
    clearAuth()
  }
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

const processQueue = (token: string | null, error: Error | null = null) => {
  for (const callback of refreshQueue) {
    if (error) {
      clearAuth()
      if (logoutCallback) {
        logoutCallback()
      }
      router.push('/login')
    } else if (token) {
      callback(token)
    }
  }
  refreshQueue = []
}

api.interceptors.response.use(
  (response: any) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomRequestConfig
    if (!originalRequest || !error.response) {
      throw error
    }

    const is401Error = error.response.status === 401
    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh')
    const isPublicRoute = publicRoutes.some(route => originalRequest.url?.endsWith(route))

    if (is401Error && !isRefreshRequest && !isPublicRoute && !originalRequest._retry) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        try {
          const newToken = await refreshAccessToken()
          isRefreshing = false
          processQueue(newToken)

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return api(originalRequest)
        } catch (refreshError) {
          isRefreshing = false
          processQueue(null, refreshError as Error)
          throw refreshError
        }
      }

      return new Promise(resolve => {
        refreshQueue.push((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          resolve(api(originalRequest))
        })
      })
    }

    throw error
  },
)

export default api
