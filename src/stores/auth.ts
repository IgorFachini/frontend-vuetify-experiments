import { defineStore } from 'pinia'
import router from '@/router'
import { AuthService } from '@/services/auth.service'
import { clearAuth } from '@/utils/auth'

interface AuthState {
  isAuthenticated: boolean
  user: {
    id: number
    email: string
  } | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
    loading: false,
  }),

  actions: {
    async login (email: string, password: string) {
      this.loading = true
      try {
        const response = await AuthService.login({ email, password })
        localStorage.setItem('app_token', response.access_token)
        localStorage.setItem('app_refresh_token', response.refresh_token)
        localStorage.setItem('app_token_expiry', (Date.now() + response.expires_in * 1000).toString())

        const userData = await AuthService.getCurrentUser()
        this.isAuthenticated = true
        this.user = userData

        return response
      } finally {
        this.loading = false
      }
    },

    async register (payload: { name: string, email: string, password: string }) {
      this.loading = true
      try {
        const response = await AuthService.signup(payload)

        // Auto-login logic
        localStorage.setItem('app_token', response.access_token)
        localStorage.setItem('app_refresh_token', response.refresh_token)
        localStorage.setItem('app_token_expiry', (Date.now() + response.expires_in * 1000).toString())

        this.isAuthenticated = true
        this.user = response.user || null

        return response
      } finally {
        this.loading = false
      }
    },

    async logout () {
      this.loading = true
      try {
        clearAuth()
        this.isAuthenticated = false
        this.user = null
        router.push('/login')
      } finally {
        this.loading = false
      }
    },

    async refreshSession () {
      if (!this.isAuthenticated) {
        return
      }

      this.loading = true
      try {
        const refresh_token = localStorage.getItem('app_refresh_token')
        if (!refresh_token) {
          throw new Error('No refresh token found')
        }
        const response = await AuthService.refresh(refresh_token)

        localStorage.setItem('app_token', response.access_token)
        localStorage.setItem('app_refresh_token', response.refresh_token)
        localStorage.setItem('app_token_expiry', (Date.now() + response.expires_in * 1000).toString())

        const userData = await AuthService.getCurrentUser()
        this.user = userData
      } catch (error) {
        await this.logout()
        throw error
      } finally {
        this.loading = false
      }
    },

    async initializeAuth () {
      const token = localStorage.getItem('app_token')
      if (!token) {
        return
      }

      try {
        const userData = await AuthService.getCurrentUser()
        this.isAuthenticated = true
        this.user = userData
      } catch {
        await this.logout()
      }
    },
  },
})
