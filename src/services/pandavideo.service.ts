import type { AxiosResponse } from 'axios'
import api from '@/plugins/axios'

export interface Video {
  id: string
  title: string
  description?: string
  thumbnail?: string
  folder?: string
  createdAt?: string
  userId?: string
  url?: string
}

export interface VideoUpdatePayload {
  title?: string
  description?: string
}

export interface VideoUploadPayload {
  title: string
  description?: string
  file: File
}

export const PandaVideoService = {
  async listVideos (): Promise<Video[]> {
    const response: AxiosResponse<Video[]> = await api.get('/videos')
    return response.data
  },

  async getVideo (id: string): Promise<Video> {
    const response: AxiosResponse<Video> = await api.get(`/videos/${id}`)
    return response.data
  },

  async updateVideo (id: string, payload: VideoUpdatePayload): Promise<Video> {
    const response: AxiosResponse<Video> = await api.put(`/videos/${id}`, payload)
    return response.data
  },

  async uploadVideo (file: File, title: string, description?: string): Promise<Video> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    if (description) {
      formData.append('description', description)
    }

    const response: AxiosResponse<Video> = await api.post('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteVideo (id: string): Promise<void> {
    await api.delete(`/videos/${id}`)
  },
}
