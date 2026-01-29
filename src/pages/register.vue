<template>
  <div class="register-page">
    <div class="register-wrapper">
      <v-card class="register-card elevation-12" :loading="authStore.loading">
        <template #loader="{ isActive }">
          <v-progress-linear
            :active="isActive"
            color="primary"
            height="4"
            indeterminate
          />
        </template>

        <v-card-title class="text-h5 text-center font-weight-bold pt-6 pb-2">
          {{ t('register.title') }}
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form ref="form" @submit.prevent="handleRegister">
            <v-text-field
              v-model="name"
              class="mb-2"
              :label="t('register.name')"
              prepend-inner-icon="mdi-account-outline"
              :rules="nameRules"
              variant="outlined"
            />

            <v-text-field
              v-model="email"
              class="mb-2"
              :label="t('register.email')"
              prepend-inner-icon="mdi-email-outline"
              :rules="emailRules"
              type="email"
              variant="outlined"
            />

            <v-text-field
              v-model="password"
              :append-inner-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
              class="mb-2"
              :label="t('register.password')"
              prepend-inner-icon="mdi-lock-outline"
              :rules="passwordRules"
              :type="passwordVisible ? 'text' : 'password'"
              variant="outlined"
              @click:append-inner="passwordVisible = !passwordVisible"
            />

            <v-text-field
              v-model="confirmPassword"
              :append-inner-icon="confirmPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
              class="mb-2"
              :label="t('register.confirmPassword')"
              prepend-inner-icon="mdi-lock-check-outline"
              :rules="confirmPasswordRules"
              :type="confirmPasswordVisible ? 'text' : 'password'"
              variant="outlined"
              @click:append-inner="confirmPasswordVisible = !confirmPasswordVisible"
            />

            <v-btn
              block
              class="mt-4 font-weight-bold"
              color="primary"
              :loading="authStore.loading"
              size="large"
              type="submit"
            >
              {{ t('register.submit') }}
            </v-btn>
          </v-form>

          <div v-if="errorMessage" class="error-message mt-4 text-center text-red">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="success-message mt-4 text-center text-green">
            {{ successMessage }}
          </div>

          <div class="text-center mt-4">
            <router-link class="text-decoration-none text-primary" to="/login">
              {{ t('register.alreadyHaveAccount') }}
            </router-link>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const authStore = useAuthStore()
  const { t } = useI18n()

  const form = ref<any>(null)
  const name = ref('')
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const passwordVisible = ref(false)
  const confirmPasswordVisible = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const nameRules = [
    (v: string) => !!v || t('register.nameRequired'),
  ]

  const emailRules = [
    (v: string) => !!v || t('register.emailRequired'),
    (v: string) => /.+@.+\..+/.test(v) || t('register.emailValid'),
  ]

  const passwordRules = [
    (v: string) => !!v || t('register.passwordRequired'),
    (v: string) => (v && v.length >= 6) || t('register.passwordLength'),
  ]

  const confirmPasswordRules = computed(() => [
    (v: string) => !!v || t('register.passwordRequired'),
    (v: string) => v === password.value || t('register.passwordMatch'),
  ])

  const handleRegister = async () => {
    errorMessage.value = ''
    successMessage.value = ''

    const { valid } = await form.value.validate()
    if (!valid) {
      errorMessage.value = t('login.checkForm')
      return
    }

    try {
      await authStore.register({
        name: name.value,
        email: email.value,
        password: password.value,
      })

      successMessage.value = t('register.success')

      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error: any) {
      console.error('Registration failed:', error)
      if (error.response?.status === 409) {
        errorMessage.value = t('register.conflict')
      } else if (error.response?.status === 400) {
        errorMessage.value = t('login.checkForm')
      } else {
        errorMessage.value = t('login.invalidCredentials') // Fallback
      }
    }
  }
</script>

<style scoped>
.register-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.register-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 100%;
  max-width: 400px;
}

.register-card {
  border-radius: 16px;
  width: 100%;
}

.register-wrapper {
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
