<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Create Event</h1>
      <p class="subtitle">Fill in the details for the new event</p>
    </div>

    <form @submit.prevent="handleSubmit" class="form-content" novalidate>
      
      <div class="section">
        <h3 class="section-title">📋 Event Details</h3>
        <div class="info-card">
          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.name }">
            <label class="form-label required">Event Name</label>
            <input v-model="eventData.name" type="text" class="form-input" placeholder="e.g., Art Workshop 2026" />
            <span v-if="isAttempted && !eventData.name" class="error-text">Event name is required</span>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.description }">
            <label class="form-label required">Description</label>
            <textarea v-model="eventData.description" class="form-input form-textarea" placeholder="Tell attendees what this event is about..." rows="3"></textarea>
            <span v-if="isAttempted && !eventData.description" class="error-text">Description is required</span>
          </div>

          <div class="form-row">
            <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.date }">
              <label class="form-label required">Date & Time</label>
              <input v-model="eventData.date" type="datetime-local" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label required">Category</label>
              <select v-model="eventData.category" class="form-input form-select">
                <option value="" disabled>Select Category</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label required">Duration (hrs)</label>
              <input v-model.number="eventData.duration" type="number" class="form-input" min="0.5" step="0.5" />
            </div>
            <div class="form-group">
              <label class="form-label required">Capacity</label>
              <input v-model.number="eventData.maxCapacity" type="number" class="form-input" min="1" placeholder="50" />
            </div>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.location }">
            <label class="form-label required">Location</label>
            <input v-model="eventData.location" type="text" class="form-input" placeholder="e.g., MTC Central" />
          </div>

          <div class="form-group">
            <label class="form-label">Event Image URL</label>
            <input v-model="eventData.imageUrl" type="url" class="form-input" placeholder="https://example.com/image.jpg" />
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">❓ Registration Questions</h3>
        <div v-if="questions.length === 0" class="empty-state">
          <p>No custom questions yet.</p>
        </div>

        <div v-else class="questions-list">
          <div v-for="(question, index) in questions" :key="question.id" class="question-card">
            <div class="question-header">
              <span class="question-number">Q{{ index + 1 }}</span>
              <button type="button" @click="deleteQuestion(index)" class="btn-delete">Remove</button>
            </div>
            <div class="form-group">
              <input v-model="question.text" type="text" class="form-input" placeholder="Enter your question..." />
            </div>
            <div class="form-row">
              <select v-model="question.type" @change="updateQuestionType(index)" class="form-input form-select">
                <option value="text">Short Text</option>
                <option value="mcq">Single Choice</option>
                <option value="checkbox">Multiple Choice</option>
              </select>
              <label class="checkbox-label"><input v-model="question.required" type="checkbox" /> Required</label>
            </div>
          </div>
        </div>
        <button type="button" @click="addQuestion" class="btn-secondary">+ Add Question</button>
      </div>

      <div v-if="errorMessage" class="validation-summary">{{ errorMessage }}</div>
      
      <div class="action-section">
        <button type="button" @click="previewEvent" class="btn-preview">👁️ Preview</button>
        <button type="submit" class="btn-primary" :disabled="submitting">
          {{ submitting ? 'Saving...' : '✓ Create Event' }}
        </button>
      </div>
      <button type="button" @click="goBack" class="btn-cancel">Cancel</button>
    </form>

    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
// Firebase Imports
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const router = useRouter();
const isAttempted = ref(false);
const submitting = ref(false);
const showPreview = ref(false);
const errorMessage = ref('');

const categories = ['Arts & Crafts', 'Sports', 'Music', 'Education', 'Social', 'Wellness', 'Technology', 'Other'];

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

const isFormValid = computed(() => {
  return (
    eventData.name && 
    eventData.description && 
    eventData.date && 
    eventData.location && 
    eventData.maxCapacity && 
    eventData.category &&
    questions.value.every(q => q.text.trim() !== '')
  );
});

const addQuestion = () => {
  questions.value.push({
    id: ++questionIdCounter,
    text: '',
    type: 'text',
    required: false,
    options: []
  });
};

const deleteQuestion = (index) => questions.value.splice(index, 1);

const updateQuestionType = (index) => {
  const q = questions.value[index];
  if (['mcq', 'checkbox'].includes(q.type) && q.options.length < 2) {
    q.options = ['Option 1', 'Option 2'];
  }
};

const handleSubmit = async () => {
  isAttempted.value = true;
  errorMessage.value = '';

  if (!isFormValid.value) {
    errorMessage.value = "Please fill in all required fields.";
    return;
  }

  submitting.value = true;
  
  try {
    const eventPayload = {
      ...eventData,
      questions: questions.value.map(q => ({
        text: q.text,
        type: q.type,
        required: q.required,
        options: q.options || []
      })),
      createdAt: serverTimestamp(),
      attendeeCount: 0,
      status: 'active'
    };

    // Save to Firestore
    await addDoc(collection(db, "events"), eventPayload);
    
    // Redirect to Staff Calendar/Home
    router.push({ name: 'StaffHome' }); 
    
  } catch (err) {
    console.error("Error adding event: ", err);
    errorMessage.value = "Failed to save event. Check your connection.";
  } finally {
    submitting.value = false;
  }
};

const goBack = () => { if (confirm('Discard changes?')) router.go(-1); };
const previewEvent = () => { showPreview.value = true; };
const closePreview = () => { showPreview.value = false; };
const formatPreviewDate = (str) => {
  if (!str) return 'Date TBD';
  return new Date(str).toLocaleString();
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.page-container {
  background: #f8fafc;
  min-height: 100vh;
  padding-bottom: 100px;
  max-width: 100%;
  overflow-x: hidden;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 24px 20px 30px 20px;
  color: white;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

/* Form Content */
.form-content {
  padding: 20px 16px;
}

/* Section */
.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
}

/* Info Card */
.info-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Form Groups */
.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 6px;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  background: #fff;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.hint {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
  display: block;
}

/* Validation */
.has-error .form-input {
  border-color: #fca5a5;
  background-color: #fef2f2;
}

.has-error .form-label {
  color: #dc2626;
}

.error-text {
  color: #dc2626;
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
  display: block;
}

.validation-summary {
  background: #fef2f2;
  color: #dc2626;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid #fca5a5;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  border: 1px solid #e2e8f0;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* Question Cards */
.questions-list {
  margin-bottom: 12px;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 12px;
}

.question-card.has-error {
  border-color: #fca5a5;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-number {
  font-size: 13px;
  font-weight: 700;
  color: #6366f1;
  background: #eef2ff;
  padding: 4px 10px;
  border-radius: 6px;
}

.btn-delete {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.checkbox-group {
  display: flex;
  align-items: flex-end;
  padding-bottom: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #6366f1;
}

/* Options */
.options-container {
  background: #f8fafc;
  padding: 14px;
  border-radius: 10px;
  margin-top: 12px;
  border: 1px dashed #cbd5e1;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.option-number {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 600;
  width: 20px;
}

.option-row .form-input {
  flex: 1;
  padding: 10px 12px;
}

.btn-remove-option {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
}

.btn-add-option {
  width: 100%;
  background: none;
  border: 1px dashed #6366f1;
  color: #6366f1;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}

/* Buttons */
.btn-secondary {
  width: 100%;
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
  padding: 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.action-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.btn-preview {
  background: white;
  color: #6366f1;
  border: 2px solid #6366f1;
  padding: 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preview:hover {
  background: #eef2ff;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  width: 100%;
  background: none;
  border: none;
  color: #94a3b8;
  padding: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel:hover {
  color: #64748b;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.btn-close {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.preview-image {
  width: 100%;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.meta-item {
  background: #f1f5f9;
  color: #475569;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.preview-description h4,
.preview-questions h4 {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.preview-description p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

.preview-questions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.preview-questions ul {
  margin: 0;
  padding-left: 20px;
}

.preview-questions li {
  font-size: 13px;
  color: #475569;
  margin-bottom: 6px;
}

.required-badge {
  background: #fef2f2;
  color: #dc2626;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>