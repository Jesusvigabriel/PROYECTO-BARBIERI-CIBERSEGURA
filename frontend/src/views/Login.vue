<template>
  <div>
    <h2>Admin Login</h2>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const login = async () => {
  error.value = ''
  try {
    await api.post('/login', { username: username.value, password: password.value }, { withCredentials: true })
    router.push('/admin')
  } catch (e) {
    error.value = e.response?.data?.error || 'Login failed'
  }
}
</script>
