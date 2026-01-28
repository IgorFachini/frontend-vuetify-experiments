<template>
  <v-app>
    <!-- Header -->
    <v-app-bar elevation="1">
      <v-app-bar-nav-icon v-if="!isLoginPage" @click="drawer = !drawer" />

      <v-spacer />

      <v-menu v-if="!isLoginPage">
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
    </v-app-bar>

    <!-- Sidebar - Hide on login page -->
    <v-navigation-drawer
      v-if="!isLoginPage"
      v-model="drawer"
      permanent
      :rail="rail"
      @click="rail = false"
    >
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
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
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const { t } = useI18n()

  const drawer = ref(true)
  const rail = ref(false)

  const isLoginPage = computed(() => route.path === '/login')

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
