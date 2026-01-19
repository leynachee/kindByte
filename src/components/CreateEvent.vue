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
            <label class="form-label required">Title</label>
            <input v-model="eventData.name" type="text" class="form-input" placeholder="e.g., Art Workshop 2026" />
            <span v-if="isAttempted && !eventData.name" class="error-text">Title is required</span>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.description }">
            <label class="form-label required">Description</label>
            <textarea v-model="eventData.description" class="form-input form-textarea" placeholder="Tell attendees what this event is about..." rows="3"></textarea>
            <span v-if="isAttempted && !eventData.description" class="error-text">Description is required</span>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.startTime }">
            <label class="form-label required">Start Date & Time</label>
            <input v-model="eventData.startTime" type="datetime-local" class="form-input" />
            <span v-if="isAttempted && !eventData.startTime" class="error-text">Start date & time is required</span>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.endTime }">
            <label class="form-label required">End Date & Time</label>
            <input v-model="eventData.endTime" type="datetime-local" class="form-input" />
            <span v-if="isAttempted && !eventData.endTime" class="error-text">End date & time is required</span>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.maxCapacity }">
              <label class="form-label required">Capacity</label>
              <input v-model.number="eventData.maxCapacity" type="number" class="form-input" min="1" placeholder="50" />
              <span v-if="isAttempted && !eventData.maxCapacity" class="error-text">Capacity is required</span>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.location }">
            <label class="form-label required">Location</label>
            <input v-model="eventData.location" type="text" class="form-input" placeholder="e.g., MTC Central" />
            <span v-if="isAttempted && !eventData.location" class="error-text">Location is required</span>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && !eventData.category }">
            <label class="form-label required">Category</label>
            <select v-model="eventData.category" class="form-input form-select">
              <option value="" disabled>Select Category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <span v-if="isAttempted && !eventData.category" class="error-text">Category is required</span>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && eventData.paymentNeeded === null }">
            <label class="form-label required">Payment Needed</label>
            <select v-model="eventData.paymentNeeded" class="form-input form-select">
              <option :value="null" disabled>Select Option</option>
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
            <span v-if="isAttempted && eventData.paymentNeeded === null" class="error-text">Please select an option</span>
          </div>

          <div class="form-group" :class="{ 'has-error': isAttempted && eventData.wheelchairAccessible === null }">
            <label class="form-label required">Wheelchair Accessible</label>
            <select v-model="eventData.wheelchairAccessible" class="form-input form-select">
              <option :value="null" disabled>Select Option</option>
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
            <span v-if="isAttempted && eventData.wheelchairAccessible === null" class="error-text">Please select an option</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">❓ Registration Questions</h3>
        <div v-if="questions.length === 0" class="empty-state">
          <p>No custom questions yet.</p>
        </div>

        <div v-else class="questions-list">
          <div v-for="(question, index) in questions" :key="index" class="question-card">
            <div class="question-header">
              <span class="question-number">Q{{ index + 1 }}</span>
              <button type="button" @click="deleteQuestion(index)" class="btn-delete">Remove</button>
            </div>
            <div class="form-group">
              <input v-model="question.description" type="text" class="form-input" placeholder="Enter your question..." />
            </div>
            <div class="form-row">
              <select v-model="question.type" @change="updateQuestionType(index)" class="form-input form-select">
                  <option value="text">Short Text</option>
                  <option value="textarea">Long Text</option>
                  <option value="mcq">Single Choice</option>
                  <option value="checkbox">Multiple Choice</option>
                  <option value="dropdown">Dropdown</option>
              </select>
              <label class="checkbox-label"><input v-model="question.isCompulsory" type="checkbox" /> Required</label>
            </div>

            <div v-if="['mcq', 'checkbox', 'dropdown'].includes(question.type)" class="options-container">
              <label class="form-label">Options</label>
              <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-row">
                <span class="option-number">{{ optIndex + 1 }}.</span>
                <input 
                  v-model="question.options[optIndex]" 
                  type="text" 
                  class="form-input"
                  :placeholder="'Option ' + (optIndex + 1)" 
                />
                <button 
                  type="button" 
                  @click="removeOption(index, optIndex)" 
                  v-if="question.options.length > 2" 
                  class="btn-remove-option"
                >
                  ✕
                </button>
              </div>
              <button type="button" @click="addOption(index)" class="btn-add-option">
                + Add Option
              </button>
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

    <!-- Preview Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showPreview" class="modal-overlay" @click.self="showPreview = false">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Event Preview</h2>
              <button type="button" @click="showPreview = false" class="btn-close">✕</button>
            </div>
            <div class="modal-body">
              <!-- Event Card Preview -->
              <div class="preview-card">
                <div class="preview-category-badge">{{ eventData.category || 'Category' }}</div>
                <h3 class="preview-title">{{ eventData.name || 'Event Title' }}</h3>
                
                <div class="preview-info-row">
                  <span class="preview-icon">📅</span>
                  <span>{{ formatPreviewDate(eventData.startTime) }}</span>
                </div>
                
                <div class="preview-info-row">
                  <span class="preview-icon">🕐</span>
                  <span>{{ formatPreviewTime(eventData.startTime) }} - {{ formatPreviewTime(eventData.endTime) }}</span>
                </div>
                
                <div class="preview-info-row">
                  <span class="preview-icon">📍</span>
                  <span>{{ eventData.location || 'Location' }}</span>
                </div>
                
                <div class="preview-info-row">
                  <span class="preview-icon">👥</span>
                  <span>{{ eventData.maxCapacity || 0 }} spots available</span>
                </div>

                <div class="preview-tags">
                  <span v-if="eventData.wheelchairAccessible" class="preview-tag accessible">
                    ♿ Wheelchair Accessible
                  </span>
                  <span v-if="eventData.paymentNeeded" class="preview-tag payment">
                    💳 Payment Required
                  </span>
                  <span v-if="eventData.paymentNeeded === false" class="preview-tag free">
                    🆓 Free Event
                  </span>
                </div>
              </div>

              <!-- Description Section -->
              <div class="preview-section">
                <h4>📝 Description</h4>
                <p class="preview-description-text">{{ eventData.description || 'No description provided.' }}</p>
              </div>

              <!-- Questions Section -->
              <div v-if="questions.length > 0" class="preview-section">
                <h4>❓ Registration Questions ({{ questions.length }})</h4>
                <div class="preview-questions-list">
                  <div v-for="(question, index) in questions" :key="index" class="preview-question-item">
                    <div class="preview-question-header">
                      <span class="preview-question-number">Q{{ index + 1 }}</span>
                      <span v-if="question.isCompulsory" class="required-badge">Required</span>
                    </div>
                    <p class="preview-question-text">{{ question.description || 'Question text...' }}</p>
                    <span class="preview-question-type">{{ getQuestionTypeLabel(question.type) }}</span>
                    
                    <!-- Show options for choice questions -->
                    <div v-if="['mcq', 'checkbox', 'dropdown'].includes(question.type) && question.options.length > 0" class="preview-options">
                      <div v-for="(option, optIdx) in question.options" :key="optIdx" class="preview-option">
                        <span v-if="question.type === 'mcq'" class="option-indicator radio"></span>
                        <span v-else-if="question.type === 'checkbox'" class="option-indicator checkbox"></span>
                        <span v-else class="option-indicator dropdown-item">{{ optIdx + 1 }}.</span>
                        {{ option }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Questions Message -->
              <div v-else class="preview-section">
                <h4>❓ Registration Questions</h4>
                <p class="preview-no-questions">No custom questions added.</p>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" @click="showPreview = false" class="btn-modal-secondary">Close</button>
              <button type="button" @click="showPreview = false; handleSubmit()" class="btn-modal-primary" :disabled="submitting">
                {{ submitting ? 'Saving...' : '✓ Create Event' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
// Firebase Imports
import { db } from '@/firebase';
import { doc, collection, writeBatch, Timestamp } from 'firebase/firestore';

const router = useRouter();
const isAttempted = ref(false);
const submitting = ref(false);
const showPreview = ref(false);
const errorMessage = ref('');

const categories = ['Outings', 'MTC Office', 'Swimming Complex', 'Nature Walks', 'Gym and Dance', 'Reading'];

const eventData = reactive({
  name: '',
  description: '',
  startTime: '',
  endTime: '',
  location: '',
  maxCapacity: null,
  category: '',
  wheelchairAccessible: null,
  paymentNeeded: null
});

const questions = ref([]);

const isFormValid = computed(() => {
  return (
    eventData.name && 
    eventData.description && 
    eventData.startTime &&
    eventData.endTime && 
    eventData.location && 
    eventData.maxCapacity && 
    eventData.category &&
    eventData.wheelchairAccessible !== null &&
    eventData.paymentNeeded !== null &&
    questions.value.every(q => q.description.trim() !== '')
  );
});

// Format date for preview
const formatPreviewDate = (dateString) => {
  if (!dateString) return 'Date not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-SG', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

// Format time for preview
const formatPreviewTime = (dateString) => {
  if (!dateString) return '--:--';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-SG', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

// Get readable question type label
const getQuestionTypeLabel = (type) => {
  const labels = {
    text: '📝 Short Text',
    textarea: '📄 Long Text',
    mcq: '⭕ Single Choice',
    checkbox: '☑️ Multiple Choice',
    dropdown: '📋 Dropdown'
  };
  return labels[type] || type;
};

const addQuestion = () => {
  questions.value.push({
    description: '',
    type: 'text',
    isCompulsory: false,
    options: []
  });
};

const deleteQuestion = (index) => questions.value.splice(index, 1);
const addOption = (index) => questions.value[index].options.push(`Option ${questions.value[index].options.length + 1}`);
const removeOption = (qIdx, oIdx) => questions.value[qIdx].options.splice(oIdx, 1);
const updateQuestionType = (index) => {
  const q = questions.value[index];
  if (['mcq', 'checkbox', 'dropdown'].includes(q.type) && q.options.length < 2) {
    q.options = ['Option 1', 'Option 2'];
  }
};

const previewEvent = () => {
  showPreview.value = true;
};

const handleSubmit = async () => {
  isAttempted.value = true;
  errorMessage.value = '';
  
  if (!isFormValid.value) {
    // Build a more specific error message
    const missingFields = [];
    if (!eventData.name) missingFields.push('Title');
    if (!eventData.description) missingFields.push('Description');
    if (!eventData.startTime) missingFields.push('Start Date & Time');
    if (!eventData.endTime) missingFields.push('End Date & Time');
    if (!eventData.maxCapacity) missingFields.push('Capacity');
    if (!eventData.location) missingFields.push('Location');
    if (!eventData.category) missingFields.push('Category');
    if (eventData.paymentNeeded === null) missingFields.push('Payment Needed');
    if (eventData.wheelchairAccessible === null) missingFields.push('Wheelchair Accessible');
    
    const emptyQuestions = questions.value.filter(q => !q.description.trim());
    if (emptyQuestions.length > 0) {
      missingFields.push(`${emptyQuestions.length} question(s) without text`);
    }
    
    errorMessage.value = `Please fill in: ${missingFields.join(', ')}`;
    showPreview.value = false;
    return;
  }

  submitting.value = true;
  const batch = writeBatch(db);

  try {
    // 1. Create Question Documents and get their IDs
    const questionIDs = [];
    questions.value.forEach(q => {
      const qRef = doc(collection(db, "questions")); // Generate random ID
      questionIDs.push(qRef.id);
      batch.set(qRef, {
        description: q.description,
        type: q.type,
        isCompulsory: q.isCompulsory,
        options: q.options
      });
    });

    // 2. Create Event Document
    const eventRef = doc(collection(db, "events"));
    batch.set(eventRef, {
      title: eventData.name,
      description: eventData.description,
      location: eventData.location,
      maxCount: eventData.maxCapacity,
      type: eventData.category,
      startTime: Timestamp.fromDate(new Date(eventData.startTime)),
      endTime: Timestamp.fromDate(new Date(eventData.endTime)),
      wheelchairAccessible: eventData.wheelchairAccessible,
      paymentNeeded: eventData.paymentNeeded,
      questionID: questionIDs,
    });

    await batch.commit();
    showPreview.value = false;
    router.push({ name: 'StaffHome' }); 
    
  } catch (err) {
    console.error("Error adding event: ", err);
    errorMessage.value = "Failed to save event.";
  } finally {
    submitting.value = false;
  }
};

const goBack = () => { if (confirm('Discard changes?')) router.go(-1); };
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
  padding: 16px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 420px;
  border-radius: 20px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 18px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  background: #f8fafc;
}

.btn-modal-secondary {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
  transition: all 0.2s;
}

.btn-modal-secondary:hover {
  background: #f1f5f9;
}

.btn-modal-primary {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  transition: all 0.2s;
}

.btn-modal-primary:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-modal-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Preview Card */
.preview-card {
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
}

.preview-category-badge {
  display: inline-block;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.preview-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.preview-info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #475569;
}

.preview-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #cbd5e1;
}

.preview-tag {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.preview-tag.accessible {
  background: #dcfce7;
  color: #166534;
}

.preview-tag.payment {
  background: #fef3c7;
  color: #92400e;
}

.preview-tag.free {
  background: #dbeafe;
  color: #1e40af;
}

/* Preview Sections */
.preview-section {
  margin-bottom: 20px;
}

.preview-section:last-child {
  margin-bottom: 0;
}

.preview-section h4 {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 10px 0;
}

.preview-description-text {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  background: white;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.preview-no-questions {
  font-size: 14px;
  color: #94a3b8;
  font-style: italic;
  margin: 0;
}

/* Preview Questions List */
.preview-questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-question-item {
  background: white;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #e2e8f0;
}

.preview-question-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.preview-question-number {
  font-size: 11px;
  font-weight: 700;
  color: #6366f1;
  background: #eef2ff;
  padding: 3px 8px;
  border-radius: 4px;
}

.required-badge {
  background: #fef2f2;
  color: #dc2626;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}

.preview-question-text {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.preview-question-type {
  font-size: 12px;
  color: #64748b;
}

/* Preview Options */
.preview-options {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
}

.preview-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 13px;
  color: #475569;
}

.option-indicator {
  flex-shrink: 0;
}

.option-indicator.radio {
  width: 16px;
  height: 16px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
}

.option-indicator.checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
}

.option-indicator.dropdown-item {
  color: #94a3b8;
  font-weight: 600;
  font-size: 12px;
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