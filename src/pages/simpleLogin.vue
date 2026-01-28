<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" lg="4" md="6" sm="8">
        <v-card class="elevation-12 pa-6">
          <v-card-title class="text-center text-h5 mb-4">
            Login
          </v-card-title>
          <v-form ref="form" @submit.prevent="handleSubmit">
            <v-text-field
              v-model="email"
              class="mb-4"
              label="Email"
              required
              :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
              type="email"
              variant="outlined"
            />
            <v-text-field
              v-model="password"
              class="mb-6"
              label="Password"
              required
              :rules="[v => !!v || 'Password is required']"
              type="password"
              variant="outlined"
            />
            <v-btn
              block
              color="primary"
              height="44"
              :loading="authStore.loading"
              type="submit"
            >
              Login
            </v-btn>
          </v-form>
          <v-alert
            v-if="error"
            class="mt-4"
            type="error"
            variant="tonal"
          >
            {{ error }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const form = ref()

  const email = ref('')
  const password = ref('')
  const error = ref('')

  async function handleSubmit () {
    error.value = ''

    const { valid } = await form.value.validate()
    if (!valid) return

    try {
      await authStore.login(email.value, password.value)
      const redirectPath = route.query.redirect as string || '/home'
      router.push(redirectPath)
    } catch (error_) {
      console.error('Login failed:', error_)
      error.value = 'Invalid email or password'
    }
  }
</script>
