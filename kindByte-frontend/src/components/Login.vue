<template>
  <div class="auth-page">
    <div class="logo-container">
      <img src="@/assets/minds-logo.png" alt="Minds Logo" />
    </div>

    <div class="form-container">
      <h2 class="title">Welcome Back</h2>
      <p>Log in to your account</p>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="role">I am a...</label>
          <select id="role" v-model="role" class="role-select">
            <option value="beneficiary">Beneficiary</option>
            <option value="volunteer">Volunteer</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <div class="input-group">
          <label for="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="example@minds.org.sg" 
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
            placeholder="Enter your password" 
            required 
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="forgot-password">
          <RouterLink :to="{ name: 'ForgotPassword' }">Forgot password?</RouterLink>
        </div>

        <button type="submit" class="btn">Log in</button>

        <div class="switch-text">
          Don’t have an account?
          <RouterLink :to="{ name: 'Signup' }">Sign up</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '@/authStore' 

const router = useRouter()

const email = ref('')
const password = ref('')
const role = ref('beneficiary')
const errors = reactive({ email: '', password: '' })

// Simple Email Validation Helper
const isValidEmail = (val) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
}

async function handleLogin() {
  errors.email = ''
  errors.password = ''

  // 1. Validation
  if (!isValidEmail(email.value)) {
    errors.email = 'Please enter a valid email address'
    return
  }

  // 2. Update the Global Store 
  // We store the email here so other pages (like Profile) can show it
  authStore.login({
    email: email.value,
    role: role.value,
    displayName: email.value.split('@')[0] // Temporary name from email
  })

  // 3. Redirect based on role
  if (role.value === 'staff') {
    router.push({ name: 'StaffHome' })
  } else if (role.value === 'volunteer') {
    router.push({ name: 'VolunteerHome' })
  } else {
    router.push({ name: 'UserHome' })
  }
}
</script>

<style scoped>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: black;
    }
    
    .auth-page {
        min-height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 40px 20px;
        background: transparent; /* Remove the background image for now */
    }
    
    .logo-container {
        width: 100px;
        height: 100px;
        background: #F9FAFB;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 30px;
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
        padding: 40px 30px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 380px;
    }
    
    .title {
        font-family: 'Bricolage Grotesque', sans-serif;
        color: #00A5E3;
        font-size: 24px;
        margin-bottom: 8px;
    }
    
    .form-container p {
        text-align: center;
        color: #666;
        margin-bottom: 30px;
        font-size: 14px;
    }
    
    .input-group {
        margin-bottom: 20px;
    }
    
    .input-group label {
        display: block;
        margin-bottom: 8px;
        color: #333;
        font-weight: 500;
        font-size: 14px;
    }
    
    .input-group input {
        width: 100%;
        padding: 14px 18px;
        border: none;
        background: #f1f5f9;
        border-radius: 12px;
        font-size: 14px;
        transition: all 0.3s;
        outline: none;
    }
    
    .input-group input:focus {
        background: #e2e8f0;
        box-shadow: 0 0 0 3px rgba(0, 165, 227, 0.1);
    }
    
    .input-group input::placeholder {
        color: #94a3b8;
    }
    
    .error-message {
        color: #ff4757;
        font-size: 12px;
        margin-top: 5px;
        display: block;
    }
    
    .forgot-password {
        text-align: right;
        margin-top: -10px;
        margin-bottom: 20px;
    }
    
    .forgot-password a {
        color: #00A5E3;
        font-size: 13px;
        text-decoration: none;
    }
    
    .forgot-password a:hover {
        text-decoration: underline;
    }
    
    .btn {
        width: 100%;
        padding: 14px;
        background: #00A5E3;
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        margin-top: 10px;
    }
    
    .btn:hover {
        background: #007BB0;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 165, 227, 0.3);
    }
    
    .btn:active {
        transform: translateY(0);
    }
    
    .switch-text {
        text-align: center;
        margin-top: 20px;
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
    
    /* Remove all the decorative elements and body styles that conflict with App.vue */

    .role-select {
  width: 100%;
  padding: 14px 18px;
  border: none;
  background: #f1f5f9;
  border-radius: 12px;
  font-size: 14px;
  color: #333;
  outline: none;
  appearance: none; /* Removes default arrow */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 15px;
}

.role-select:focus {
  background-color: #e2e8f0;
}

/* Ensure links don't have default underline unless hovered */
a {
    text-decoration: none;
}

.switch-text {
    margin-top: 25px;
}
</style>
 
