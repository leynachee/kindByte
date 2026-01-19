<template>
  <div class="register-event">
    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading registration form...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="registrationComplete" class="success-state">
        <div class="success-icon">✅</div>
        <h2>Registration Successful!</h2>
        <p>You're registered for {{ eventData.name }}</p>
        <p class="redirect-text">Redirecting to My Plans...</p>
      </div>

      <!-- Registration Form -->
      <div v-else>
        <div class="header">
          <button class="back-btn" @click="$router.go(-1)">← Back</button>
          <h1>Register for {{ eventData.name }}</h1>
          <p class="subtitle">Please provide the information below to secure your spot</p>
        </div>

        <form @submit.prevent="submitRegistration" class="registration-form">
          <!-- Dynamic Questions -->
          <div v-if="eventData.questions && eventData.questions.length > 0" class="form-section"> 
            <div v-for="(question, index) in eventData.questions" :key="index" class="dynamic-question">
              <label :class="{ 'required': question.isCompulsory }">
                {{ index + 1 }}. {{ question.description }}
              </label>

              <!-- Text Input -->
              <input 
                v-if="question.type === 'text'"
                v-model="answers[question.id]"
                type="text"
                :required="question.isCompulsory"
                placeholder="Your answer..."
              />

              <!-- Textarea -->
              <textarea 
                v-else-if="question.type === 'textarea'"
                v-model="answers[question.id]"
                :required="question.isCompulsory"
                rows="3"
                placeholder="Type your response here..."
              ></textarea>

              <!-- Multiple Choice (Radio) -->
              <div v-else-if="question.type === 'mcq'" class="options-group">
                <label v-for="opt in question.options" :key="opt" class="radio-option">
                  <input 
                    type="radio" 
                    :name="'q' + index" 
                    :value="opt" 
                    v-model="answers[question.id]"
                  />
                  <span>{{ opt }}</span>
                </label>
              </div>

              <!-- Checkbox -->
              <div v-else-if="question.type === 'checkbox'" class="options-group">
                <label v-for="opt in question.options" :key="opt" class="checkbox-option">
                  <input 
                    type="checkbox" 
                    :value="opt" 
                    v-model="answers[question.id]"
                  />
                  <span>{{ opt }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- No Questions -->
          <div v-else class="no-questions">
            <p>No additional information required. Click below to confirm your registration.</p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" @click="$router.go(-1)" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              <span v-if="submitting" class="btn-loading">
                <span class="spinner-small"></span>
                Registering...
              </span>
              <span v-else>Confirm Registration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db, auth } from '@/firebase';
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const registrationComplete = ref(false);
const errorMessage = ref('');
const eventData = ref({});
const answers = ref({});
const currentUserId = ref(null);

// Get current user
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId.value = user.uid;
      await loadEventData();
    } else {
      // Not logged in, redirect to login
      router.push('/login');
    }
  });
});

const loadEventData = async () => {
  try {
    loading.value = true;
    const eventId = route.params.id;

    // Get the Event Document
    const eventSnap = await getDoc(doc(db, "events", eventId));
    
    if (eventSnap.exists()) {
      const eventInfo = eventSnap.data();
      const questionIds = eventInfo.questionID || [];

      // Fetch all questions
      const questionPromises = questionIds.map(id => getDoc(doc(db, "questions", id)));
      const questionSnaps = await Promise.all(questionPromises);

      const fetchedQuestions = questionSnaps
        .filter(snap => snap.exists())
        .map(snap => ({
          id: snap.id,
          ...snap.data()
        }));

      // Store event data
      eventData.value = {
        id: eventId,
        name: eventInfo.title,
        questions: fetchedQuestions,
        ...eventInfo
      };

      // Initialize answers object
      fetchedQuestions.forEach((q) => {
        answers.value[q.id] = q.type === 'checkbox' ? [] : '';
      });

    } else {
      errorMessage.value = "Event not found";
    }
  } catch (err) {
    console.error("Error loading registration form:", err);
    errorMessage.value = "Failed to load event. Please try again.";
  } finally {
    loading.value = false;
  }
};

const submitRegistration = async () => {
  // Clear previous errors
  errorMessage.value = '';

  // Validate compulsory questions
  const missingRequired = eventData.value.questions?.find(q => 
    q.isCompulsory && (!answers.value[q.id] || answers.value[q.id].length === 0)
  );

  if (missingRequired) {
    errorMessage.value = `Please answer: ${missingRequired.description}`;
    return;
  }

  submitting.value = true;

  try {
    const eventId = route.params.id;
    const userId = currentUserId.value;

    const userDocSnap = await getDoc(doc(db, 'users', userId));
    const userRole = userDocSnap.exists() ? userDocSnap.data().role : 'participant';
    const targetField = (userRole === 'volunteer') ? 'volunteersID' : 'participantsID';

    // 1. Add user to event's attendees array
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      [targetField]: arrayUnion(userId)
    });

    // 2. Save user's responses to questions (if any)
    // Structure: users/{userId}/{eventId}/{questionId}/response
    for (const [questionId, response] of Object.entries(answers.value)) {
      if (response && (Array.isArray(response) ? response.length > 0 : response !== '')) {
        const responseRef = doc(db, 'users', userId, eventId, questionId);
        
        if (Array.isArray(response)) {
          // Checkbox - multiple options selected
          await setDoc(responseRef, {
            optionsSelected: response
          });
        } else {
          // Text or MCQ - single response
          await setDoc(responseRef, {
            response: response
          });
        }
      }
    }

    // 3. Save registration status
    const statusRef = doc(db, 'users', userId, eventId, 'status');
    await setDoc(statusRef, {
      status: 'confirmed',
      registeredAt: new Date()
    });

    // Show success state
    registrationComplete.value = true;

    // Redirect to My Plans after 2 seconds
    setTimeout(() => {
      router.push('/my-plans');
    }, 2000);

  } catch (err) {
    console.error("Error saving registration:", err);
    errorMessage.value = "Failed to complete registration. Please try again.";
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.register-event {
  min-height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 16px;
}

.container {
  max-width: 100%;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* Header */
.header {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.back-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;
}

.header h1 {
  margin: 0 0 8px 0;
  color: #0f172a;
  font-size: 20px;
  font-weight: 700;
}

.subtitle {
  color: #64748b;
  margin: 0;
  font-size: 13px;
}

/* Form */
.registration-form {
  padding: 20px;
}

.dynamic-question {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1e293b;
  font-size: 14px;
}

.required::after {
  content: " *";
  color: #dc2626;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s;
  font-family: inherit;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #6366f1;
}

/* Options Groups */
.options-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8fafc;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.radio-option,
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: normal;
  margin-bottom: 0;
  font-size: 14px;
  color: #475569;
}

.radio-option input,
.checkbox-option input {
  width: 18px;
  height: 18px;
  accent-color: #6366f1;
}

/* No Questions */
.no-questions {
  text-align: center;
  padding: 30px 20px;
  background: #f8fafc;
  border-radius: 10px;
  color: #64748b;
  font-size: 14px;
}

/* Error Message */
.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary {
  flex: 2;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:disabled {
  background: #c7d2fe;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  flex: 1;
  padding: 14px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Loading State */
.loading-state {
  padding: 60px 20px;
  text-align: center;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Success State */
.success-state {
  padding: 60px 20px;
  text-align: center;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-state h2 {
  color: #059669;
  margin: 0 0 8px 0;
  font-size: 22px;
}

.success-state p {
  color: #64748b;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.redirect-text {
  color: #94a3b8;
  font-size: 13px;
}
</style>