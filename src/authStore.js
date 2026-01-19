// src/authStore.js
import { reactive } from 'vue'

export const authStore = reactive({
  user: null,
  login(userData) {
    this.user = userData
  },
  logout() {
    this.user = null
  }
})