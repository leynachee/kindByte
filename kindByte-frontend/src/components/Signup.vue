<template>
  <div class="auth-page">
    <div class="logo-container">
      <img src="@/assets/minds-logo.png" alt="Minds Logo" />
    </div>

    <div class="form-container">
      <h2 class="title">Create an account</h2>
      <p>Sign up to get started</p>

      <form @submit.prevent="handleSignup">
        <div class="input-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" v-model="name" placeholder="Enter your full name" required />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <div class="input-group">
          <label for="userID">User ID</label>
          <input type="text" id="userID" v-model="userID" placeholder="Enter your User ID" required />
          <span v-if="errors.userID" class="error-message">{{ errors.userID }}</span>
        </div>

        <div class="input-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Enter a valid email address"
            required
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Create a password"
            required
            @input="checkPasswordStrength"
          />
          <div v-if="password" class="password-strength" :class="passwordStrength"></div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <button type="submit" class="btn">Sign up</button>

        <div class="switch-text">
          Already have an account?
          <RouterLink to="/login">Log in</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const userID = ref('')
const name = ref('')
const email = ref('')
const password = ref('')
const passwordStrength = ref('')
const errors = reactive({ name: '', userID: '', email: '', password: '' })

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function getPasswordStrength(password) {
  if (password.length < 6) return 'strength-weak'
  if (password.length < 10) return 'strength-medium'
  return 'strength-strong'
}

function checkPasswordStrength() {
  passwordStrength.value = getPasswordStrength(password.value)
}

function handleSignup() {
  // Reset errors
  errors.name = ''
  errors.userID = ''
  errors.email = ''
  errors.password = ''

  // Validation
  if (name.value.trim() === '') errors.name = 'Name is required'
  if (userID.value.trim() === '') errors.userID = 'User ID is required'
  if (!validateEmail(email.value)) errors.email = 'Please enter a valid email'
  if (password.value.length < 6) errors.password = 'Password must be at least 6 characters'

  if (!errors.name && !errors.userID && !errors.email && !errors.password) {
    // For now, just redirect to login
    alert('Account created successfully!')
    router.push('/login')
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.auth-page {
  min-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.logo-container {
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo-container img {
  width: 70px;
  height: auto;
  object-fit: contain;
}

.form-container {
  background: white;
  border-radius: 24px;
  padding: 32px 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 380px;
}

.title {
  font-size: 24px;
  color: #00A5E3;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 700;
}

.form-container > p {
  text-align: center;
  color: #64748b;
  margin-bottom: 24px;
  font-size: 14px;
}

.input-group {
  margin-bottom: 18px;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  color: #1e293b;
  font-weight: 600;
  font-size: 13px;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;
  outline: none;
  color: #1e293b;
}

.input-group input:focus {
  border-color: #00A5E3;
  box-shadow: 0 0 0 3px rgba(0, 165, 227, 0.1);
}

.input-group input::placeholder {
  color: #94a3b8;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.password-strength {
  height: 4px;
  border-radius: 2px;
  margin-top: 8px;
  transition: all 0.3s;
}

.strength-weak {
  background: #ef4444;
  width: 33%;
}

.strength-medium {
  background: #f59e0b;
  width: 66%;
}

.strength-strong {
  background: #10b981;
  width: 100%;
}

.btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #00A5E3 0%, #0088bb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(0, 165, 227, 0.3);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 165, 227, 0.4);
}

.btn:active {
  transform: translateY(0);
}

.switch-text {
  text-align: center;
  margin-top: 20px;
  color: #64748b;
  font-size: 13px;
}

.switch-text a {
  color: #00A5E3;
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
}

.switch-text a:hover {
  text-decoration: underline;
}
</style>