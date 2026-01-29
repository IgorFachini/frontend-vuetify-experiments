<template>
  <div class="login-page">
    <div class="login-wrapper">
      <!-- Mascot sits on top of the card -->
      <LoginMascot
        :is-hiding="isPasswordFocused"
        :look-x="lookX"
        :look-y="lookY"
        :mood="mascotMood"
      />

      <v-card class="login-card elevation-12" :loading="authStore.loading">
        <template #loader="{ isActive }">
          <v-progress-linear
            :active="isActive"
            color="primary"
            height="4"
            indeterminate
          />
        </template>

        <v-card-title class="text-h5 text-center font-weight-bold pt-6 pb-2">
          {{ t('login.welcomeBack') }}
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form ref="form" @submit.prevent="handleLogin">
            <v-text-field
              ref="emailInputRef"
              v-model="email"
              class="mb-2"
              :label="t('login.email')"
              prepend-inner-icon="mdi-email-outline"
              :rules="[v => !!v || t('login.emailRequired'), v => /.+@.+\..+/.test(v) || t('login.emailValid')]"
              type="email"
              variant="outlined"
              @blur="isEmailFocused = false"
              @focus="isEmailFocused = true"
            />

            <v-text-field
              v-model="password"
              :append-inner-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
              :label="t('login.password')"
              prepend-inner-icon="mdi-lock-outline"
              :rules="[v => !!v || t('login.passwordRequired')]"
              :type="passwordVisible ? 'text' : 'password'"
              variant="outlined"
              @blur="isPasswordFocused = false"
              @click:append-inner="passwordVisible = !passwordVisible"
              @focus="isPasswordFocused = true"
            />

            <v-btn
              block
              class="mt-4 font-weight-bold"
              color="primary"
              :loading="authStore.loading"
              size="large"
              type="submit"
            >
              {{ t('login.loginButton') }}
            </v-btn>
          </v-form>

          <div v-if="errorMessage" class="error-message mt-4 text-center text-red">
            {{ errorMessage }}
          </div>

          <div class="text-center mt-4">
            <router-link class="text-decoration-none text-primary" to="/register">
              {{ t('login.createAccount') }}
            </router-link>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import LoginMascot from '@/components/LoginMascot.vue'
  import { useAuthStore } from '@/stores/auth'

  // Router & Store
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const { t } = useI18n()

  // Refs
  const form = ref<any>(null)
  const email = ref('')
  const password = ref('')
  // We use authStore.loading for loading state
  const errorMessage = ref('')
  const isSuccess = ref(false)
  const passwordVisible = ref(false)

  // Focus states
  const isEmailFocused = ref(false)
  const isPasswordFocused = ref(false)

  // Mascot tracking
  const lookX = ref(0.5) // 0 to 1 (0.5 is center)
  const lookY = ref(0.5)
  const emailInputRef = ref<any>(null)

  // Derived Mood
  const mascotMood = computed(() => {
    if (authStore.loading) return 'anxious' // Tension during login check
    if (isSuccess.value) return 'happy'
    if (errorMessage.value) return 'sad'
    if (isPasswordFocused.value) return 'neutral' // Covering eyes
    if (email.value.length > 0 && isEmailFocused.value) return 'excited' // Typing email -> Excited
    if (isEmailFocused.value) return 'neutral' // Just looking
    return 'neutral'
  })

  // Global Mouse Tracking
  const updateLookDirection = (event: MouseEvent) => {
    // If covering eyes, don't update look direction (optional optimization)
    if (isPasswordFocused.value) return

    // Simple global tracking: map screen position to 0..1
    // This makes the eyes follow the mouse wherever it is on the viewport
    lookX.value = event.clientX / window.innerWidth
    lookY.value = event.clientY / window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('mousemove', updateLookDirection)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', updateLookDirection)
  })

  // Reset look (optional, maybe not needed if we track globally, but good for cleanup)
  watch(isPasswordFocused, focused => {
    if (focused) {
      // When focusing password, maybe center eyes so they are ready when hands lift?
      // Or just let them track.
    }
  })

  // Login Logic
  const handleLogin = async () => {
    errorMessage.value = ''
    isSuccess.value = false

    const { valid } = await form.value.validate()
    if (!valid) {
      // Optional: Add a 'confused' mood if validation fails? For now 'neutral' or existing state
      errorMessage.value = t('login.checkForm')
      return
    }

    try {
      await authStore.login(email.value, password.value)

      // Login Success
      isSuccess.value = true

      // Delay redirect slightly to show the happy animation
      setTimeout(() => {
        const redirectPath = (route.query.redirect as string) || '/home'
        router.push(redirectPath)
      }, 1000)
    } catch (error: any) {
      console.error('Login failed:', error)
      errorMessage.value = t('login.invalidCredentials')
    }
  }
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px; /* Add padding for small screens */
}

.login-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Ensure mascot overlaps card properly */
  position: relative;
  width: 100%;
  max-width: 400px; /* Constrain width but allow shrinking */
}

.login-card {
  border-radius: 16px;
  overflow: visible; /* Allow things to pop out if needed, though mascot is separate */
  width: 100%; /* Take full width of wrapper */
}

/* Add a subtle entrance animation */
.login-wrapper {
  animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
