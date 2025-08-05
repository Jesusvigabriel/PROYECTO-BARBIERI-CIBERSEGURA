<template>
  <div>
    <h3>Players</h3>
    <ul>
      <li v-for="p in players" :key="p.id">{{ p.name }}</li>
    </ul>
    <button @click="loadPlayers">Refresh</button>
    <button @click="clearPlayers">Clear</button>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const players = ref([])
const error = ref('')

const loadPlayers = async () => {
  error.value = ''
  try {
    const res = await api.get('/players', { withCredentials: true })
    players.value = res.data
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to load players'
  }
}

const clearPlayers = async () => {
  error.value = ''
  try {
    await api.delete('/players', { withCredentials: true })
    players.value = []
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to clear players'
  }
}

onMounted(loadPlayers)
</script>
