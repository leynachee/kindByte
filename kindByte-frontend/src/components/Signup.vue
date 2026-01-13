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
          <label for="role">I am signing up as a...</label>
          <select id="role" v-model="role" class="role-select">
            <option value="beneficiary">Beneficiary</option>
            <option value="volunteer">Volunteer</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <div class="input-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" v-model="name" placeholder="Enter your full name" required />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <div class="input-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="Enter a valid email address" required />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" placeholder="Create a password" required />
          
          <div class="requirements">
            <p :class="{ met: requirements.length }">● At least 8 characters</p>
            <p :class="{ met: requirements.capital }">● At least one capital letter</p>
            <p :class="{ met: requirements.special }">● At least one special character (!@#$)</p>
          </div>
        </div>

        <div class="input-group">
          <label for="confirmPassword">Retype Password</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="Repeat your password" required />
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <button type="submit" class="btn" :disabled="!isFormValid">Sign up</button>

        <div class="switch-text">
          Already have an account?
          <RouterLink :to="{ name: 'Login' }">Log in</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { reactive, ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { authStore } from '@/authStore'
  // 1. Import Firebase tools
  import { auth, db } from '@/firebase'
  import { createUserWithEmailAndPassword } from 'firebase/auth'
  import { doc, setDoc } from 'firebase/firestore'
  
  const router = useRouter()
  
  const name = ref('')
  const email = ref('')
  const role = ref('beneficiary')
  const password = ref('')
  const confirmPassword = ref('')
  const isSubmitting = ref(false) // State to prevent double-clicks
  const errors = reactive({ name: '', email: '', confirmPassword: '', firebase: '' })
  
  const requirements = computed(() => {
    return {
      length: password.value.length >= 8,
      capital: /[A-Z]/.test(password.value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password.value)
    }
  })
  
  const isFormValid = computed(() => {
    return (
      requirements.value.length &&
      requirements.value.capital &&
      requirements.value.special &&
      password.value === confirmPassword.value &&
      name.value.trim() !== '' &&
      !isSubmitting.value
    )
  })

async function handleSignup() {
  // Reset previous errors
  errors.name = '';
  errors.email = '';
  errors.confirmPassword = '';
  
  try {
    // 1. Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email.value, 
      password.value
    );
    const user = userCredential.user;

    // 2. CAPTURE & SAVE ROLE: Create a document in the 'users' collection
    // We use the unique UID from Authentication as the document ID
    await setDoc(doc(db, "users", user.uid), {
      fullName: name.value,
      email: email.value,
      role: role.value, // This captures 'beneficiary', 'volunteer', or 'staff'
      createdAt: new Date()
    });

    // 3. Update local store and redirect
    authStore.login({
      name: name.value,
      email: email.value,
      role: role.value,
      uid: user.uid
    });

    // Redirect to the appropriate dashboard
    const target = role.value === 'staff' ? 'StaffHome' : 
                   role.value === 'volunteer' ? 'VolunteerHome' : 'UserHome';
    router.push({ name: target });

  } catch (error) {
    console.error("Signup error:", error.code);
    if (error.code === 'auth/email-already-in-use') {
      errors.email = 'This email is already in use.';
    } else {
      errors.email = 'Failed to create account. Please try again.';
    }
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

.role-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  font-size: 14px;
  margin-bottom: 4px;
  outline: none;
}

.requirements {
  margin-top: 8px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
}

.requirements p {
  font-size: 11px;
  color: #94a3b8;
  margin: 2px 0;
  transition: color 0.3s;
}

.requirements p.met {
  color: #10b981;
  font-weight: 700;
}

.btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
</style>