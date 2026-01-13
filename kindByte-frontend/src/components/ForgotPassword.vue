<template>
    <div class="auth-page">
      <div class="logo-container">
        <img src="@/assets/minds-logo.png" alt="Minds Logo" />
      </div>
  
      <div class="form-container">
        <h2 class="title">Forgot Password?</h2>
        <p>Enter your User ID and email to receive a password reset link.</p>
  
        <form @submit.prevent="handleForgotPassword">
          <div class="input-group">
            <label for="userID">User ID</label>
            <input type="text" id="userID" v-model="userID" placeholder="Enter your User ID" required />
            <span v-if="errors.userID" class="error-message">{{ errors.userID }}</span>
          </div>
  
          <div class="input-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>
  
          <button type="submit" class="btn">Send Reset Link</button>
  
          <div class="switch-text">
            Remember your password?
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
  const email = ref('')
  const errors = reactive({ userID: '', email: '' })
  
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
  
  function handleForgotPassword() {
    // Reset errors
    errors.userID = ''
    errors.email = ''
  
    // Validation
    if (userID.value.trim() === '') {
      errors.userID = 'User ID is required'
      return
    }
    if (!validateEmail(email.value)) {
      errors.email = 'Please enter a valid email'
      return
    }
  
    // For now, just show success message
    alert('Password reset link has been sent to your email!')
    router.push('/login')
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
  
  .form-container > p {
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
  </style>