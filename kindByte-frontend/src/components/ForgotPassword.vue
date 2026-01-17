<template>
  <div class="auth-page">
    <div v-if="successMessage" class="toast-notification">
      {{ successMessage }}
    </div>

    <div class="logo-container">
      <img src="@/assets/minds-logo.png" alt="Minds Logo" />
    </div>

    <div class="form-container">
      <h2 class="title">Forgot Password?</h2>
      <p>Enter your email address and we'll send you a link to reset your password.</p>

      <form @submit.prevent="handleForgotPassword">
        <div class="input-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" v-model="email" placeholder="example@minds.org.sg" required />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <button type="submit" class="btn">Send Reset Link</button>

        <div class="switch-text">
          Remember your password?
          <RouterLink :to="{ name: 'Login' }">Log in</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const successMessage = ref('') // New ref for the message
const errors = reactive({ email: '' })

function handleForgotPassword() {
  errors.email = ''

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errors.email = 'Please enter a valid email'
    return
  }

  // 1. Set the success message
  successMessage.value = 'Reset link sent! Redirecting...'

  // 2. Wait 2 seconds so the user can see the message, then redirect
  setTimeout(() => {
    successMessage.value = ''
    router.push({ name: 'Login' })
  }, 2000)
}

// can use the code below if the email is an actual email:
// async function handleForgotPassword() {
//   errors.email = ''
//   successMessage.value = ''

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//   if (!emailRegex.test(email.value)) {
//     errors.email = 'Please enter a valid email'
//     return
//   }

//   try {
//     await sendPasswordResetEmail(auth, email.value)

//     successMessage.value = 'Reset link sent! Check your email.'
//     setTimeout(() => {
//       router.push({ name: 'Login' })
//     }, 2000)

//   } catch (error) {
//     if (error.code === 'auth/user-not-found') {
//       errors.email = 'No account found with this email.'
//     } else if (error.code === 'auth/invalid-email') {
//       errors.email = 'Invalid email address.'
//     } else {
//       errors.email = 'Failed to send reset link. Please try again.'
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
  padding: 36px 32px;
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

.form-container>p {
  text-align: center;
  color: #64748b;
  margin-bottom: 28px;
  font-size: 14px;
  line-height: 1.5;
}

.input-group {
  margin-bottom: 20px;
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

.toast-notification {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  /* Green success color */
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 100;
  width: 90%;
  text-align: center;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translate(-50%, -20px);
    opacity: 0;
  }

  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}
</style>