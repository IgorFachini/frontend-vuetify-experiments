import type { AxiosResponse } from 'axios'
import api from '@/plugins/axios'

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
  user?: { id: number, email: string, name?: string }
}

export interface SignupPayload {
  email: string
  password: string
  name: string
}

export interface SignupResponse {
  access_token: string
  token_type: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
  user?: { id: number, email: string, name?: string }
}

export interface UserResponse {
  id: number
  email: string
}

export const AuthService = {
  async login (payload: LoginPayload): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', payload)
    return response.data
  },

  async signup (payload: SignupPayload): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post('/users/register', payload)
    return response.data
  },

  async refresh (refreshToken: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/refresh', { refreshToken })
    return response.data
  },

  async getCurrentUser (): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await api.get('/auth/me')
    return response.data
  },
}
