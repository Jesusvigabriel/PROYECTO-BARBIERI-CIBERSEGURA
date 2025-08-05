<template>
  <div>
    <h3>Upload Template</h3>
    <form @submit.prevent="submitTemplate">
      <input v-model="name" placeholder="Template name" />
      <textarea v-model="json" placeholder="Questions JSON"></textarea>
      <button type="submit">Submit</button>
    </form>
    <p v-if="message">{{ message }}</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'

const name = ref('')
const json = ref('')
const message = ref('')
const error = ref('')

const submitTemplate = async () => {
  message.value = ''
  error.value = ''
  try {
    const payload = { name: name.value, questions: JSON.parse(json.value) }
    await api.post('/templates', payload, { withCredentials: true })
    message.value = 'Template saved'
    name.value = ''
    json.value = ''
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save template'
  }
}
</script>
