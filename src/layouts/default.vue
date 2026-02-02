<template>
  <v-app>
    <!-- Header -->
    <v-app-bar elevation="1">
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <v-spacer />

      <template v-if="authStore.isAuthenticated">
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon>mdi-account-circle</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="handleLogout">
              <template #prepend>
                <v-icon>mdi-logout</v-icon>
              </template>
              <v-list-item-title>{{ t('layout.logout') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-else>
        <v-btn to="/login" variant="text">Login</v-btn>
      </template>
    </v-app-bar>

    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      permanent
      :rail="rail"
      @click="rail = false"
    >
      <v-list-item
        v-if="authStore.isAuthenticated"
        :title="authStore.user?.email || t('layout.user')"
      >
        <template #append>
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            @click.stop="rail = !rail"
          />
        </template>
      </v-list-item>

      <v-divider />

      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-home"
          :title="t('layout.home')"
          to="/home"
          value="home"
        />
        <v-list-item
          v-if="authStore.isAuthenticated"
          prepend-icon="mdi-video"
          :title="t('layout.videos')"
          to="/pandavideo"
          value="videos"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
    <AppFooter />
  </v-app>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const authStore = useAuthStore()
  const { t } = useI18n()

  const drawer = ref(true)
  const rail = ref(false)

  const handleLogout = async () => {
    await authStore.logout()
    router.push('/login')
  }
</script>

<style scoped>
.v-navigation-drawer {
  transition: width 0.2s ease-in-out;
}
</style>
