<template>
  <div class="auth-page">
    <div class="logo-container">
      <img src="/logo.png" alt="Minds Logo" />
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
          <label for="name">User ID</label>
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
          <div class="password-strength" :class="passwordStrength"></div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <!-- <div class="checkbox-group">
          <input type="checkbox" id="agreeTerms" v-model="agreeTerms" />
          <label for="agreeTerms">I agree to the Terms & Conditions</label>
        </div> -->

        <button type="submit" class="btn">Sign up</button>

        <div class="switch-text">
          Already have an account?
          <a>
              <RouterLink to="/login">Log in</RouterLink>
          </a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
// import axios from 'axios'

const router = useRouter()

const userID = ref('')
const name = ref('')
const email = ref('')
const password = ref('')
const agreeTerms = ref(false)
const passwordStrength = ref('')
const errors = reactive({ name: '', email: '', password: '' })

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

// const handleSignup = async () => {
//   errors.userID = ''
//   errors.name = ''
//   errors.email = ''
//   errors.password = ''

//   if (name.value.trim() === '') errors.name = 'Name is required'
//   if (!validateEmail(email.value)) errors.email = 'Please enter a valid email'
//   if (password.value.length < 6) errors.password = 'Password must be at least 6 characters'
//   if (!agreeTerms.value) {
//     alert('Please agree to the Terms & Conditions')
//     return
//   }

//   if (!errors.name && !errors.email && !errors.password) {
//     const signupBody = {
//       name: name.value,
//       email: email.value,
//       password: password.value,
//     }

//     const response = await axios.post('http://localhost:8000/api/auth/signup', signupBody, {
//       headers: { 'Content-Type': 'application/json' },
//     })

//     if (response.status === 201) {
//       setTimeout(() => router.push('/login'), 1000)
//     }
//   }
// }
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: black;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #cccccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  overflow-x: hidden;
}

.auth-page {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background:
    linear-gradient(rgba(255, 255, 255, 0.678), rgba(255, 255, 255, 0.654)),
    url('../../public/signup.png') center/cover no-repeat;
  background-size: 50px auto; /* Adjust percentage as needed */
  background-position: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.form-container h2,
.form-container p {
  text-align: center;
}

.title {
  font-family: 'Bricolage Grotesque', sans-serif;
  color: #00A5E3;
}

/* Decorative food images */
.decoration {
  position: fixed;
  z-index: 1;
}

/* .decoration.top-right {
    top: 20px;
    right: 20px;
    width: 200px;
    height: 200px;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="80" r="20" fill="%23ffd93d"/><path d="M80 100 Q100 80 120 100" stroke="%23228b22" stroke-width="3" fill="none"/><ellipse cx="100" cy="140" rx="15" ry="20" fill="%23ff6b6b"/></svg>') no-repeat;
}

.decoration.bottom-left {
    bottom: 20px;
    left: 20px;
    width: 200px;
    height: 200px;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="50" cy="50" r="15" fill="%23ff6b6b"/><circle cx="80" cy="45" r="15" fill="%23ff6b6b"/><circle cx="65" cy="70" r="15" fill="%23ff6b6b"/><path d="M100 100 L120 80 L140 100" stroke="%23228b22" stroke-width="3" fill="none"/></svg>') no-repeat;
}

.decoration.bottom-right {
    bottom: 20px;
    right: 20px;
    width: 180px;
    height: 180px;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><ellipse cx="90" cy="60" rx="25" ry="30" fill="%23ff69b4"/><path d="M70 100 Q90 80 110 100 Q90 120 70 100" fill="%23ffd93d"/><rect x="85" y="120" width="10" height="40" fill="%23228b22"/></svg>') no-repeat;
} */

.logo-container {
  width: 180px;
  height: 180px;
  background: #F9FAFB;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 2;
  position: relative;
  overflow: hidden;
}

.logo-container img {
  width: 120px;
  height: auto;
  object-fit: cover;
}

.form-container {
  background: white;
  border-radius: 30px;
  padding: 50px 60px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  position: relative;
  z-index: 2;
}

.form-wrapper {
  position: relative;
  overflow: hidden;
}

.form-section {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.form-section.hidden {
  display: none;
}

.form-section h2 {
  font-size: 28px;
  text-align: center;
  margin-bottom: 10px;
  color: #333;
}

.form-section p {
  text-align: center;
  color: #666;
  margin-bottom: 35px;
  font-size: 15px;
}

.input-group {
  margin-bottom: 25px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 15px;
}

.input-group input {
  width: 100%;
  padding: 15px 20px;
  border: none;
  background: #e8e8e8;
  border-radius: 25px;
  font-size: 15px;
  transition: all 0.3s;
  outline: none;
}

.input-group input:focus {
  background: #ddd;
  box-shadow: 0 0 0 3px rgba(68, 112, 77, 0.1);
}

.input-group input::placeholder {
  color: #999;
}

.error-message {
  color: #ff4757;
  font-size: 12px;
  margin-top: 5px;
  display: none;
}

.password-strength {
  height: 4px;
  border-radius: 2px;
  margin-top: 8px;
  transition: all 0.3s;
}

.strength-weak {
  background: #ff4757;
  width: 33%;
}

.strength-medium {
  background: #ffa502;
  width: 66%;
}

.strength-strong {
  background: #26de81;
  width: 100%;
}

.btn {
  width: 100%;
  padding: 15px;
  background: #00A5E3;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.btn:hover {
  background: #007BB0;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(68, 112, 77, 0.3);
}

.btn:active {
  transform: translateY(0);
}

.switch-text {
  text-align: center;
  margin-top: 25px;
  color: #666;
  font-size: 14px;
}

.switch-text a {
  color: #00A5E3;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.switch-text a:hover {
  text-decoration: underline;
}

/* .checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.checkbox-group input {
  margin-right: 10px;
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.checkbox-group label {
  font-size: 14px;
  color: #666;
  cursor: pointer;
} */

.forgot-password {
  text-align: right;
  margin-top: -15px;
  margin-bottom: 20px;
}

.forgot-password a {
  color: #44704d;
  font-size: 13px;
  text-decoration: none;
}

.forgot-password a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .form-container {
    padding: 40px 30px;
  }

  .logo-container {
    width: 150px;
    height: 150px;
  }

  .decoration {
    display: none;
  }
}
</style>