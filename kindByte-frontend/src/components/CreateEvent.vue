<template>
  <div class="create-event">
    <div class="container">
      <div class="header">
        <h1>Create New Event</h1>
        <p class="subtitle">Fill in the details to launch your next experience</p>
      </div>

      <form @submit.prevent="handleSubmit" class="event-form" novalidate>
        
        <div class="form-section">
          <h2 class="section-title">📋 Event Details</h2>
          
          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.name }">
            <label class="required">Event Name</label>
            <input 
              v-model="eventData.name" 
              type="text" 
              placeholder="e.g., Web Development Workshop 2026" 
            />
            <span v-if="isAttempted && !eventData.name" class="error-text">Event name is required</span>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.description }">
            <label class="required">Description</label>
            <span class="hint">Provide a clear overview of the event's goals.</span>
            <textarea 
              v-model="eventData.description" 
              placeholder="Tell attendees what this event is about..." 
              rows="4"
            ></textarea>
            <span v-if="isAttempted && !eventData.description" class="error-text">Description is required</span>
          </div>

          <div class="form-row">
            <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.date }">
              <label class="required">Date & Time</label>
              <input v-model="eventData.date" type="datetime-local" />
              <span v-if="isAttempted && !eventData.date" class="error-text">Please select a date</span>
            </div>
            <div class="form-group" :class="{ 'has-error': isAttempted && (!eventData.duration || eventData.duration <= 0) }">
              <label class="required">Duration (hours)</label>
              <input v-model.number="eventData.duration" type="number" min="0.5" step="0.5" />
            </div>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.location }">
            <label class="required">Location</label>
            <input v-model="eventData.location" type="text" placeholder="e.g., Innovation Hub, Singapore" />
            <span v-if="isAttempted && !eventData.location" class="error-text">Location is required</span>
          </div>

          <div class="form-row">
            <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.maxCapacity }">
              <label class="required">Max Capacity</label>
              <input v-model.number="eventData.maxCapacity" type="number" min="1" placeholder="50" />
            </div>
            <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.category }">
              <label class="required">Category</label>
              <select v-model="eventData.category">
                <option value="" disabled>Select category</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Event Image URL</label>
            <input v-model="eventData.imageUrl" type="url" placeholder="https://example.com/image.jpg" />
            <small class="hint">Leave empty for a default placeholder</small>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <h2 class="section-title">❓ Registration Questions</h2>
            <p class="section-description">Gather specific information from your attendees</p>
          </div>

          <div v-if="questions.length === 0" class="empty-questions">
            <p>No custom questions yet. Add questions to collect data during registration.</p>
          </div>

          <div v-else class="questions-list">
            <div 
              v-for="(question, index) in questions" 
              :key="question.id" 
              class="question-card"
              :class="{ 'has-error': isAttempted && !question.text }"
            >
              <div class="question-header">
                <span class="question-number">Question {{ index + 1 }}</span>
                <button type="button" @click="deleteQuestion(index)" class="btn-delete-small">Remove</button>
              </div>

              <div class="question-body">
                <div class="form-group">
                  <input v-model="question.text" type="text" placeholder="Enter your question text..." />
                  <span v-if="isAttempted && !question.text" class="error-text">Question text is required</span>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Response Type</label>
                    <select v-model="question.type" @change="updateQuestionType(index)">
                      <option value="text">Short Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="mcq">Single Choice (Radio)</option>
                      <option value="checkbox">Multiple Choice</option>
                      <option value="dropdown">Dropdown</option>
                    </select>
                  </div>
                  <div class="form-group flex-center">
                    <label class="checkbox-label">
                      <input v-model="question.required" type="checkbox" /> Required Question
                    </label>
                  </div>
                </div>

                <div v-if="['mcq', 'checkbox', 'dropdown'].includes(question.type)" class="options-container">
                  <label>Options</label>
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-row">
                    <span class="option-marker">{{ optIndex + 1 }}</span>
                    <input v-model="question.options[optIndex]" type="text" :placeholder="'Option ' + (optIndex + 1)" />
                    <button type="button" @click="removeOption(index, optIndex)" v-if="question.options.length > 2" class="btn-text-danger">✕</button>
                  </div>
                  <button type="button" @click="addOption(index)" class="btn-add-option">+ Add Option</button>
                </div>
              </div>
            </div>
          </div>

          <button type="button" @click="addQuestion" class="btn-secondary full-width">+ Add Registration Question</button>
        </div>

        <div v-if="isAttempted && !isFormValid" class="validation-summary">
          ⚠️ Some required fields are missing. Please review the highlighted sections above.
        </div>

        <div class="form-actions">
          <button type="button" @click="goBack" class="btn-text">Cancel</button>
          <div class="main-actions">
            <button type="button" @click="previewEvent" class="btn-preview">Preview</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Creating...' : 'Create Event' }}
            </button>
          </div>
        </div>
      </form>

      <transition name="fade">
        <div v-if="showPreview" class="modal-overlay" @click="closePreview">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h2>Preview</h2>
              <button @click="closePreview" class="btn-close">✕</button>
            </div>
            <div class="preview-scroll">
              <div class="preview-content">
                <div class="preview-img-box" v-if="eventData.imageUrl">
                  <img :src="eventData.imageUrl" alt="Event Banner" />
                </div>
                <h1 class="preview-title">{{ eventData.name || 'Untitled Event' }}</h1>
                <div class="preview-badges">
                  <span class="badge">📍 {{ eventData.location || 'No location set' }}</span>
                  <span class="badge">📅 {{ formatPreviewDate(eventData.date) }}</span>
                  <span class="badge">📂 {{ eventData.category || 'Uncategorized' }}</span>
                </div>
                <div class="preview-description">
                  <h3>About</h3>
                  <p>{{ eventData.description || 'No description provided.' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'CreateEvent',
  setup() {
    const router = useRouter();
    
    // State
    const isAttempted = ref(false);
    const submitting = ref(false);
    const showPreview = ref(false);
    const categories = ['Technology', 'Business', 'Arts', 'Education', 'Sports', 'Social', 'Other'];

    const eventData = reactive({
      name: '',
      description: '',
      date: '',
      duration: 2,
      location: '',
      maxCapacity: null,
      category: '',
      imageUrl: ''
    });

    const questions = ref([]);
    let questionIdCounter = 0;

    // Validation
    const isFormValid = computed(() => {
      const basicInfoValid = eventData.name && 
                             eventData.description && 
                             eventData.date && 
                             eventData.location && 
                             eventData.maxCapacity && 
                             eventData.category;
      
      const questionsValid = questions.value.every(q => q.text.trim() !== '');
      
      return basicInfoValid && questionsValid;
    });

    // Methods
    const addQuestion = () => {
      questions.value.push({
        id: ++questionIdCounter,
        text: '',
        type: 'text',
        required: false,
        options: []
      });
    };

    const deleteQuestion = (index) => {
      questions.value.splice(index, 1);
    };

    const updateQuestionType = (index) => {
      const q = questions.value[index];
      if (['mcq', 'checkbox', 'dropdown'].includes(q.type)) {
        if (!q.options || q.options.length < 2) {
          q.options = ['Option 1', 'Option 2'];
        }
      } else {
        q.options = [];
      }
    };

    const addOption = (idx) => {
      questions.value[idx].options.push(`Option ${questions.value[idx].options.length + 1}`);
    };

    const removeOption = (qIdx, oIdx) => {
      questions.value[qIdx].options.splice(oIdx, 1);
    };

    const formatPreviewDate = (str) => {
      if (!str) return 'Date TBD';
      return new Date(str).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    };

    const previewEvent = () => {
      if (!eventData.name) {
        isAttempted.value = true;
        alert('Please fill in the event name to see a preview.');
        return;
      }
      showPreview.value = true;
    };

    const closePreview = () => { showPreview.value = false; };

    const goBack = () => {
      if (confirm('Are you sure you want to discard changes?')) router.go(-1);
    };

    const handleSubmit = async () => {
      isAttempted.value = true;

      if (!isFormValid.value) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      submitting.value = true;
      try {
        // Simulate API/Firebase Call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Event Created:', { ...eventData, questions: questions.value });
        alert('Event created successfully!');
        router.push('/events');
      } catch (err) {
        alert('Error creating event.');
      } finally {
        submitting.value = false;
      }
    };

    return {
      eventData, questions, submitting, showPreview, isAttempted, isFormValid,
      categories, addQuestion, deleteQuestion, updateQuestionType, 
      addOption, removeOption, formatPreviewDate, previewEvent, 
      closePreview, handleSubmit, goBack
    };
  }
};
</script>

<style scoped>
/* Base Reset */
* { box-sizing: border-box; }

.create-event {
  min-height: 100vh;
  background: #f4f7f9;
  padding: 40px 20px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.container {
  max-width: 850px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  overflow: hidden;
}

/* Header */
.header {
  background: #ffffff;
  padding: 40px 40px 20px 40px;
  border-bottom: 1px solid #edf2f7;
}

.header h1 { margin: 0; color: #1a202c; font-size: 2rem; font-weight: 800; }
.subtitle { color: #718096; margin-top: 8px; font-size: 1rem; }

/* Form Layout */
.event-form { padding: 40px; }
.form-section { margin-bottom: 40px; }
.section-title { 
  font-size: 1.25rem; 
  color: #2d3748; 
  margin-bottom: 24px; 
  padding-bottom: 8px;
  border-bottom: 2px solid #667eea;
  display: inline-block;
}

.form-group { margin-bottom: 20px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: #4a5568; }
.required::after { content: ' *'; color: #e53e3e; }

/* Inputs */
input, select, textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #fff;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

textarea { resize: vertical; }
.hint { font-size: 0.8rem; color: #a0aec0; margin-bottom: 8px; display: block; }

/* Validation Styles */
.has-error input, .has-error select, .has-error textarea {
  border-color: #fc8181;
  background-color: #fff5f5;
}

.has-error label { color: #c53030; }

.error-text {
  color: #e53e3e;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 4px;
  display: block;
}

.validation-summary {
  background: #fff5f5;
  color: #c53030;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #feb2b2;
  margin-bottom: 24px;
  font-weight: 600;
  text-align: center;
}

/* Question Cards */
.question-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  transition: transform 0.2s;
}

.question-card.has-error { border-color: #feb2b2; }

.question-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 16px; 
}

.question-number { font-weight: 700; color: #667eea; font-size: 0.9rem; text-transform: uppercase; }

.options-container { 
  background: white; 
  padding: 20px; 
  border-radius: 8px; 
  margin-top: 16px; 
  border: 1px dashed #cbd5e0;
}

.option-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.option-marker { color: #a0aec0; font-size: 0.8rem; width: 20px; }

/* Buttons */
.form-actions { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding-top: 30px;
  border-top: 1px solid #edf2f7;
}

.main-actions { display: flex; gap: 16px; }

.btn-primary { 
  background: #667eea; 
  color: white; 
  border: none; 
  padding: 14px 28px; 
  border-radius: 8px; 
  font-weight: 700; 
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) { background: #5a67d8; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-preview { 
  background: #fff; 
  color: #667eea; 
  border: 1px solid #667eea; 
  padding: 13px 28px; 
  border-radius: 8px; 
  font-weight: 600; 
  cursor: pointer;
}

.btn-secondary { 
  background: #f7fafc; 
  color: #4a5568; 
  border: 1px solid #e2e8f0; 
  padding: 14px; 
  border-radius: 8px; 
  cursor: pointer;
  font-weight: 600;
}

.btn-text { background: none; border: none; color: #718096; cursor: pointer; font-weight: 500; }
.btn-text:hover { color: #2d3748; }

.btn-add-option { 
  background: none; 
  border: 1px dashed #667eea; 
  color: #667eea; 
  width: 100%; 
  padding: 8px; 
  border-radius: 6px; 
  margin-top: 8px;
  cursor: pointer;
}

.btn-delete-small { background: none; border: none; color: #fc8181; cursor: pointer; font-size: 0.8rem; }
.btn-text-danger { background: none; border: none; color: #fc8181; cursor: pointer; font-size: 1.2rem; }

.full-width { width: 100%; }
.flex-center { display: flex; align-items: center; }

/* Modal Styles */
.modal-overlay { 
  position: fixed; 
  inset: 0; 
  background: rgba(26, 32, 44, 0.8); 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 1000; 
  backdrop-filter: blur(4px); 
}

.modal-content { 
  background: white; 
  width: 90%; 
  max-width: 700px; 
  border-radius: 20px; 
  max-height: 85vh; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden;
}

.modal-header { 
  padding: 20px 30px; 
  border-bottom: 1px solid #edf2f7; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.preview-scroll { overflow-y: auto; padding: 40px; }
.preview-img-box { width: 100%; height: 250px; overflow: hidden; border-radius: 12px; margin-bottom: 24px; }
.preview-img-box img { width: 100%; height: 100%; object-fit: cover; }
.preview-title { font-size: 2.25rem; color: #1a202c; margin-bottom: 16px; }
.preview-badges { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
.badge { background: #edf2f7; color: #4a5568; padding: 8px 16px; border-radius: 30px; font-size: 0.85rem; font-weight: 500; }
.preview-description h3 { margin-bottom: 12px; color: #2d3748; }
.preview-description p { line-height: 1.6; color: #4a5568; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column-reverse; gap: 16px; }
  .main-actions { width: 100%; flex-direction: column; }
  .btn-preview, .btn-primary { width: 100%; }
}
</style>