<template>
  <div class="register-event">
    <div class="container">
      <div v-if="loading" class="loading-state">
        <p>Loading registration form...</p>
      </div>

      <div v-else>
        <div class="header">
          <h1>Register for {{ eventData.name}}</h1>
          <p class="subtitle">Please provide the information below to secure your spot</p>
        </div>

        <form @submit.prevent="submitRegistration" class="registration-form">
          <div v-if="eventData.questions && eventData.questions.length > 0" class="form-section"> 
            <div v-for="(question, index) in eventData.questions" :key="index" class="dynamic-question">
              <label :class="{ 'required': question.required }">
                {{ index + 1 }}. {{ question.description }}
              </label>

              <input 
                v-if="question.type === 'text'"
                v-model="answers[question.id]"
                type="text"
                :required="question.isCompulsory"
                placeholder="Your answer..."
              />

              <textarea 
                v-else-if="question.type === 'textarea'"
                v-model="answers[question.id]"
                :required="question.isCompulsory"
                rows="3"
                placeholder="Type your response here..."
              ></textarea>

              <div v-else-if="question.type === 'mcq'" class="options-group">
                <label v-for="opt in question.options" :key="opt" class="radio-option">
                  <input 
                    type="radio" 
                    :name="'q' + index" 
                    :value="opt" 
                    v-model="answers[question.id]"
                    :required="question.isCompulsory"
                  />
                  <span>{{ opt }}</span>
                </label>
              </div>

              <div v-else-if="question.type === 'checkbox'" class="options-group">
                <label v-for="opt in question.options" :key="opt" class="checkbox-option">
                  <input 
                    type="checkbox" 
                    :value="opt" 
                    v-model="answers[question.id]"
                    :required="question.isCompulsory"
                  />
                  <span>{{ opt }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="$router.go(-1)" class="btn-secondary">Back</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Registering...' : 'Confirm Registration' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '@/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';

export default {
  name: 'RegisterEvent',
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    const loading = ref(true);
    const submitting = ref(false);
    const eventData = ref({});
    const answers = ref({});

    onMounted(async () => {
      try {
        loading.value = true;
        const eventId = route.params.id;

        // 1. Get the Event Document to get the questionID array
        const eventSnap = await getDoc(doc(db, "events", eventId));
        
        if (eventSnap.exists()) {
          const eventInfo = eventSnap.data();
          const questionIds = eventInfo.questionID || [];

          // 2. Fetch all questions based on IDs
          // We use Promise.all to fetch them simultaneously for speed
          const questionPromises = questionIds.map(id => getDoc(doc(db, "questions", id)));
          const questionSnaps = await Promise.all(questionPromises);

          const fetchedQuestions = questionSnaps
            .filter(snap => snap.exists())
            .map(snap => ({
              id: snap.id,
              ...snap.data()
            }));

          // 3. Store in eventData
          eventData.value = {
            name: eventInfo.title,
            questions: fetchedQuestions
          };

          // 4. Initialize reactive answers object
          fetchedQuestions.forEach((q) => {
            // Use question ID as key for cleaner data handling
            answers.value[q.id] = q.type === 'checkbox' ? [] : '';
          });

        } else {
          console.error("Event not found");
        }
      } catch (err) {
        console.error("Error loading registration form:", err);
      } finally {
        loading.value = false;
      }
    });

    const submitRegistration = async () => {
      // 1. Basic validation: check if compulsory questions are answered
      const missingRequired = eventData.value.questions.find(q => 
        q.isCompulsory && (!answers.value[q.id] || answers.value[q.id].length === 0)
      );

      if (missingRequired) {
        alert(`Please answer: ${missingRequired.description}`);
        return;
      }

      submitting.value = true;

      try {
        // 2. Prepare the payload
        const registrationData = {
          eventId: route.params.id,
          userId: "GZ0aQwdtAK8D1algU17A", // change this ltr
          responses: answers.value
        };

        // 3. Save to the "registrations" collection
        await addDoc(collection(db, "registrations"), registrationData);

        alert("Registration Successful!");
        router.push('/events'); // Redirect back to events list
      } catch (err) {
        console.error("Error saving registration:", err);
        alert("Failed to save registration. Please try again. Error:" + err);
      } finally {
        submitting.value = false;
      }
    };

    return { eventData, loading, submitting, answers, submitRegistration };
  }
};
</script>

<style scoped>
/* Reset and Container */
* {
  box-sizing: border-box; /* Crucial: ensures padding doesn't break width */
  font-family: 'Inter', system-ui, sans-serif;
}

.register-event {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.container {
  max-width: 700px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

/* Header */
.header {
  background: #f8f9fa;
  padding: 30px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.header h1 { margin: 0; color: #333; font-size: 1.8rem; }
.subtitle { color: #666; margin-top: 10px; }

/* Form Elements */
.registration-form { padding: 30px; }
.dynamic-question { margin-bottom: 25px; }

label {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
  color: #444;
}

.required::after { content: " *"; color: #dc3545; }

/* Fixed width inputs */
input[type="text"], 
select, 
textarea {
  width: 100%; /* Now stays inside because of border-box */
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #667eea;
}

/* Options Groups */
.options-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fcfcfc;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.radio-option, .checkbox-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: normal; /* Labels inside options shouldn't be bold */
  margin-bottom: 0;
}

/* Buttons Row */
.form-actions {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-top: 40px;
}

.btn-primary {
  flex: 2; /* Takes up more space */
  padding: 15px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover { background: #5a6fd6; }
.btn-primary:disabled { background: #a5b4fc; cursor: not-allowed; }

.btn-secondary {
  flex: 1; /* Takes up less space */
  padding: 15px;
  background: #f1f3f5;
  color: #495057;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover { background: #e9ecef; }

.loading-state {
  padding: 50px;
  text-align: center;
  color: #666;
}
</style>