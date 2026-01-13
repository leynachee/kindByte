<template>
  <div class="create-event">
    <div class="container">
      <div class="header">
        <h1>Edit Event</h1>
        <p class="subtitle">Modify the details of your existing experience</p>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Fetching event details...</p>
      </div>

      <form v-else @submit.prevent="handleUpdate" class="event-form" novalidate>
        
        <div class="form-section">
          <h2 class="section-title">📋 Event Details</h2>
          
          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.name }">
            <label class="required">Event Name</label>
            <input v-model="eventData.name" type="text" placeholder="e.g., Annual Gala 2026" />
            <span v-if="isAttempted && !eventData.name" class="error-text">Event name is required</span>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.description }">
            <label class="required">Description</label>
            <textarea v-model="eventData.description" rows="4" placeholder="Describe your event..."></textarea>
            <span v-if="isAttempted && !eventData.description" class="error-text">Description is required</span>
          </div>

          <div class="form-row">
            <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.date }">
              <label class="required">Date & Time</label>
              <input v-model="eventData.date" type="datetime-local" />
            </div>
            <div class="form-group" :class="{ 'has-error': isAttempted && (!eventData.duration || eventData.duration <= 0) }">
              <label class="required">Duration (hrs)</label>
              <input v-model.number="eventData.duration" type="number" step="0.5" />
            </div>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.location }">
            <label class="required">Location</label>
            <input v-model="eventData.location" type="text" placeholder="Venue or Link" />
            <span v-if="isAttempted && !eventData.location" class="error-text">Location is required</span>
          </div>

          <div class="form-row">
            <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.maxCapacity }">
              <label class="required">Max Capacity</label>
              <input v-model.number="eventData.maxCapacity" type="number" min="1" />
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
            <input v-model="eventData.imageUrl" type="url" placeholder="https://..." />
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <h2 class="section-title">❓ Registration Questions</h2>
          </div>

          <div v-if="questions.length === 0" class="empty-questions">
            <p>No custom questions yet.</p>
          </div>

          <div v-else class="questions-list">
            <div v-for="(question, index) in questions" :key="index" 
                 class="question-card" 
                 :class="{ 'has-error': isAttempted && !question.text }">
              <div class="question-header">
                <span class="question-number">Question {{ index + 1 }}</span>
                <button type="button" @click="deleteQuestion(index)" class="btn-delete-small">Remove</button>
              </div>

              <div class="question-body">
                <div class="form-group">
                  <input v-model="question.text" type="text" placeholder="Question text..." />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <select v-model="question.type" @change="updateQuestionType(index)">
                      <option value="text">Short Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="mcq">Single Choice</option>
                      <option value="checkbox">Multiple Choice</option>
                    </select>
                  </div>
                  <div class="form-group flex-center">
                    <label class="checkbox-label">
                      <input v-model="question.required" type="checkbox" /> Required
                    </label>
                  </div>
                </div>

                <div v-if="['mcq', 'checkbox'].includes(question.type)" class="options-container">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-row">
                    <input v-model="question.options[optIndex]" type="text" />
                    <button type="button" @click="removeOption(index, optIndex)" class="btn-text-danger">✕</button>
                  </div>
                  <button type="button" @click="addOption(index)" class="btn-add-option">+ Add Option</button>
                </div>
              </div>
            </div>
          </div>
          <button type="button" @click="addQuestion" class="btn-secondary full-width">+ Add Question</button>
        </div>

        <div v-if="isAttempted && !isFormValid" class="validation-summary">
          ⚠️ Please fill in all required fields highlighted in red.
        </div>

        <div class="form-actions">
          <button type="button" @click="goBack" class="btn-text">Cancel</button>
          <div class="main-actions">
            <button type="button" @click="showPreview = true" class="btn-preview">Preview Changes</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Update Event' }}
            </button>
          </div>
        </div>
      </form>

      <div v-if="showPreview" class="modal-overlay" @click="showPreview = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Preview: {{ eventData.name }}</h2>
            <button @click="showPreview = false" class="btn-close">✕</button>
          </div>
          <div class="preview-scroll">
            <div class="preview-content">
              <div class="preview-img-box" v-if="eventData.imageUrl">
                <img :src="eventData.imageUrl" alt="Event Banner" />
              </div>
              <div class="preview-badges">
                <span class="badge">📍 {{ eventData.location }}</span>
                <span class="badge">📅 {{ eventData.date }}</span>
                <span class="badge">📂 {{ eventData.category }}</span>
              </div>
              <p>{{ eventData.description }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'EditEvent',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const eventId = route.params.id;

    const loading = ref(true);
    const submitting = ref(false);
    const isAttempted = ref(false);
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

    onMounted(async () => {
      try {
        await new Promise(r => setTimeout(r, 800)); // Simulate fetch
        const mockFetchedData = {
          name: 'Global Tech Summit 2026',
          description: 'The premier event for tech enthusiasts...',
          date: '2026-06-15T09:00',
          duration: 5,
          location: 'Convention Center, SF',
          maxCapacity: 500,
          category: 'Technology',
          imageUrl: 'https://images.unsplash.com/photo-1540575861501-7ce0e220abb1?w=800'
        };
        Object.assign(eventData, mockFetchedData);
        questions.value = [
          { text: 'T-shirt size?', type: 'mcq', required: true, options: ['S', 'M', 'L', 'XL'] }
        ];
      } finally {
        loading.value = false;
      }
    });

    const isFormValid = computed(() => {
      const basicValid = eventData.name && eventData.description && eventData.date && eventData.location && eventData.category;
      const questionsValid = questions.value.every(q => q.text.trim() !== '');
      return basicValid && questionsValid;
    });

    const handleUpdate = async () => {
      isAttempted.value = true;
      if (!isFormValid.value) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      submitting.value = true;
      await new Promise(r => setTimeout(r, 1500)); // Simulate Update
      router.push('/events');
    };

    const addQuestion = () => questions.value.push({ text: '', type: 'text', required: false, options: [] });
    const deleteQuestion = (index) => questions.value.splice(index, 1);
    const updateQuestionType = (index) => {
      const q = questions.value[index];
      if (['mcq', 'checkbox'].includes(q.type)) q.options = q.options.length ? q.options : ['Option 1', 'Option 2'];
    };
    const addOption = (idx) => questions.value[idx].options.push(`Option ${questions.value[idx].options.length + 1}`);
    const removeOption = (qIdx, oIdx) => questions.value[qIdx].options.splice(oIdx, 1);
    const goBack = () => router.go(-1);

    return {
      eventData, questions, loading, submitting, isAttempted, showPreview, categories,
      isFormValid, handleUpdate, addQuestion, deleteQuestion, updateQuestionType,
      addOption, removeOption, goBack
    };
  }
};
</script>

<style scoped>
/* Base Styles */
.create-event {
  min-height: 100vh;
  background: #f4f7f9;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
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
  padding: 40px;
  border-bottom: 1px solid #edf2f7;
}

.header h1 { margin: 0; color: #1a202c; font-size: 2rem; font-weight: 800; }
.subtitle { color: #718096; margin-top: 8px; }

/* Loading State */
.loading-state {
  padding: 100px;
  text-align: center;
  color: #667eea;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #667eea;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

/* Form Elements */
.event-form { padding: 40px; }
.form-section { margin-bottom: 40px; }
.section-title { font-size: 1.25rem; color: #2d3748; margin-bottom: 24px; border-bottom: 2px solid #667eea; display: inline-block; padding-bottom: 5px; }

.form-group { margin-bottom: 20px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: #4a5568; }
.required::after { content: ' *'; color: #e53e3e; }

input, select, textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Error States */
.has-error input, .has-error select, .has-error textarea {
  border-color: #fc8181;
  background-color: #fff5f5;
}
.has-error label { color: #c53030; }
.error-text { color: #e53e3e; font-size: 0.8rem; margin-top: 4px; display: block; }

.validation-summary {
  background: #fff5f5;
  color: #c53030;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #feb2b2;
  margin-bottom: 24px;
  text-align: center;
}

/* Buttons */
.form-actions { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #edf2f7; padding-top: 30px; }
.main-actions { display: flex; gap: 16px; }

.btn-primary { background: #667eea; color: white; border: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-preview { background: white; color: #667eea; border: 1px solid #667eea; padding: 13px 28px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-text { background: none; border: none; color: #718096; cursor: pointer; }
.btn-secondary { background: #f7fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.full-width { width: 100%; }

/* Question Cards */
.question-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
.question-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.question-number { font-weight: 700; color: #667eea; font-size: 0.8rem; text-transform: uppercase; }
.btn-delete-small { background: none; border: none; color: #fc8181; cursor: pointer; font-size: 0.8rem; }
.options-container { background: white; padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px dashed #cbd5e0; }
.option-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; width: 90%; max-width: 600px; border-radius: 12px; max-height: 80vh; display: flex; flex-direction: column; }
.modal-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
.preview-scroll { overflow-y: auto; padding: 20px; }
.preview-img-box { width: 100%; height: 200px; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
.preview-img-box img { width: 100%; height: 100%; object-fit: cover; }
.badge { background: #edf2f7; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; margin-right: 8px; }
</style>