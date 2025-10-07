/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'
import { useAuthStore } from '@/stores/auth'
import router from '../router'
import pinia from '../stores'
import { setLogoutCallback } from './axios'

// Plugins
import vuetify from './vuetify'

export function registerPlugins (app: App) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)

  // Configure auth callback after plugins are initialized
  const authStore = useAuthStore()
  setLogoutCallback(() => {
    authStore.logout()
  })
}
