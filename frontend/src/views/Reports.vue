<template>
  <div>
    <h2>Reports</h2>
    <div>
      <h3>Top Players</h3>
      <table>
        <tr><th>Player</th><th>Correct Answers</th></tr>
        <tr v-for="p in topPlayers" :key="p.id">
          <td>{{ p.name }}</td>
          <td>{{ p.correct_answers }}</td>
        </tr>
      </table>
    </div>
    <div>
      <h3>Question Stats</h3>
      <table>
        <tr><th>Question</th><th>Total Responses</th><th>Correct</th></tr>
        <tr v-for="q in questionStats" :key="q.id">
          <td>{{ q.text }}</td>
          <td>{{ q.total_responses }}</td>
          <td>{{ q.correct_responses }}</td>
        </tr>
      </table>
    </div>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const topPlayers = ref([])
const questionStats = ref([])
const error = ref('')

const load = async () => {
  error.value = ''
  try {
    const [playersRes, questionsRes] = await Promise.all([
      api.get('/report/top-players', { withCredentials: true }),
      api.get('/report/questions', { withCredentials: true })
    ])
    topPlayers.value = playersRes.data
    questionStats.value = questionsRes.data
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to load reports'
  }
}

onMounted(load)
</script>
