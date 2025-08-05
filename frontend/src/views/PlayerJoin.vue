<template>
  <div>
    <h2>Join Game</h2>
    <form @submit.prevent="join">
      <input v-model="name" placeholder="Your name" />
      <button type="submit">Join</button>
    </form>
    <p v-if="message">{{ message }}</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'

const name = ref('')
const message = ref('')
const error = ref('')

const join = async () => {
  message.value = ''
  error.value = ''
  try {
    const res = await api.post('/player', { name: name.value })
    message.value = `Player ${res.data.name} joined with id ${res.data.id}`
    name.value = ''
  } catch (e) {
    error.value = e.response?.data?.error || 'Join failed'
  }
}
</script>
