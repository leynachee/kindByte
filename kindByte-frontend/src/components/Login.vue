<template>
    <div class="auth-page">
        <div class="logo-container">
            <img src="/logo.png" alt="Minds Logo" />
        </div>

        <div class="form-container">
            <h2 class="title">Welcome Back</h2>
            <p>Log in to your account</p>

            <form @submit.prevent="handleLogin">
                <div class="input-group">
                    <label for="name">Full Name</label>
                    <input type="name" id="name" v-model="name" placeholder="Enter a valid User ID" required />
                    <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                </div>

                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" v-model="password" placeholder="Enter your password"
                        required />
                    <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                </div>

                <div class="forgot-password">
                    <a>
                        <RouterLink to="/forgotpassword">Forgot password?</RouterLink>
                    </a>
                </div>

                <!-- <div class="checkbox-group">
                    <input type="checkbox" id="rememberMe" v-model="rememberMe" />
                    <label for="rememberMe">Remember me</label>
                </div> -->

                <button type="submit" class="btn">Log in</button>

                <div class="switch-text">
                    Don’t have an account?
                    <a>
                        <RouterLink to="/signup">Sign up</RouterLink>
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

const name = ref('')
const password = ref('')
// const rememberMe = ref(false)
const errors = reactive({ email: '', password: '' })

// function validateEmail(email) {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     return re.test(email)
// }

// async function handleLogin() {
//     // reset errors
//     errors.name = ''
//     errors.password = ''

//     // client-side validation
//     if (!validatename(name.value)) {
//         errors.name = 'Please enter a valid name'
//     }
//     if (password.value.trim() === '') {
//         errors.password = 'Password is required'
//     }

//     if (!errors.name && !errors.password) {
//         try {
//             const loginBody = {
//                 name: name.value,
//                 password: password.value,
//             }

//             const response = await axios.post('http://localhost:8000/api/auth/login', loginBody, {
//                 headers: { 'Content-Type': 'application/json' },
//             })

//             if (response.status === 200) {
//                 const { token, user } = response.data

//                 if (!user || !token) {
//                     throw new Error('Invalid server response: missing user or token')
//                 }

//                 // Save token + user info
//                 sessionStorage.setItem('authToken', token)
//                 sessionStorage.setItem('user_id', user.id)
//                 sessionStorage.setItem('fridgeId', user.fridge_id)
//                 sessionStorage.setItem('profile_pic', user.profile_pic || '../public/profile-icon.png')

//                 // redirect after a short delay
//                 setTimeout(() => router.push('/userhome'), 1000)
//             }
//         } catch (err) {
//             console.error('❌ Login failed:', err)

//             // Axios error handling
//             if (err.response) {
//                 const status = err.response.status
//                 const msg = err.response.data?.message || ''

//                 if (status === 404) {
//                     errors.name = 'No account found with this name'
//                 } else if (status === 401) {
//                     errors.password = 'Incorrect password'
//                 } else if (status === 400) {
//                     errors.name = msg || 'Invalid request'
//                 } else if (status >= 500) {
//                     errors.name = 'Server error, please try again later'
//                 } else {
//                     errors.password = 'Login failed, please check your credentials'
//                 }
//             } else {
//                 // No response from server
//                 errors.name = 'Unable to connect to server. Please try again later.'
//             }
//         }
//     }
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
 
</style>