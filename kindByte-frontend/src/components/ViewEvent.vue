<template>
  <div class="view-event">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading event details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <h2>⚠️ Error</h2>
      <p>{{ error }}</p>
      <button @click="$router.go(-1)" class="btn-secondary">Go Back</button>
    </div>

    <!-- Event Content -->
    <div v-else-if="event" class="event-container">
      <!-- Event Image -->
      <div class="event-image-container">
        <img 
          :src="event.imageUrl || '/placeholder-event.jpg'" 
          :alt="event.name"
          class="event-image"
        />
        <div v-if="isFull" class="full-badge">FULL</div>
      </div>

      <!-- Event Details -->
      <div class="event-content">
        <h1 class="event-name">{{ event.name }}</h1>

        <!-- Location & Date -->
        <div class="event-meta">
          <div class="meta-item">
            <span class="icon">📍</span>
            <span>{{ event.location }}</span>
          </div>
          <div class="meta-item">
            <span class="icon">📅</span>
            <span>{{ formatDate(event.date) }}</span>
          </div>
          <div class="meta-item">
            <span class="icon">🕐</span>
            <span>{{ formatTime(event.date) }}</span>
          </div>
        </div>

        <!-- Vacancy Status -->
        <div class="vacancy-section">
          <h3>Availability</h3>
          <div class="vacancy-bar">
            <div 
              class="vacancy-fill" 
              :style="{ width: vacancyPercentage + '%' }"
              :class="{ 'vacancy-critical': vacancyPercentage > 80 }"
            ></div>
          </div>
          <p class="vacancy-text">
            <strong>{{ event.currentCapacity || 0 }}</strong> / {{ event.maxCapacity }} registered
            <span v-if="!isFull" class="spots-left">
              ({{ spotsLeft }} spots left)
            </span>
            <span v-else class="full-text">
              (Event is full)
            </span>
          </p>
        </div>

        <!-- Event Clashes -->
        <div v-if="clashes.length > 0" class="clashes-section">
          <h3>⚠️ Schedule Conflicts</h3>
          <p class="clash-warning">You are already registered for events at the same time:</p>
          <div v-for="clash in clashes" :key="clash.id" class="clash-item">
            <span class="clash-name">{{ clash.name }}</span>
            <span class="clash-time">{{ formatTime(clash.date) }}</span>
          </div>
        </div>

        <!-- Description -->
        <div class="description-section">
          <h3>About This Event</h3>
          <p class="description-text">{{ event.description }}</p>
        </div>

        <!-- Additional Info -->
        <div v-if="event.partner || event.category" class="additional-info">
          <div v-if="event.partner" class="info-item">
            <strong>Partner:</strong> {{ event.partner }}
          </div>
          <div v-if="event.remark" class="info-item">
            <strong>Remarks:</strong> {{ event.remark }}
          </div>
        </div>

        <!-- Register Button -->
        <div class="action-section">
          <button 
            @click="goToRegister" 
            class="btn-register"
            :disabled="isFull || isAlreadyRegistered"
            :class="{ 'btn-disabled': isFull || isAlreadyRegistered }"
          >
            <span v-if="isAlreadyRegistered">✓ Already Registered</span>
            <span v-else-if="isFull">Event Full</span>
            <span v-else>Register Now</span>
          </button>
          <button @click="$router.go(-1)" class="btn-secondary">
            Back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// Import your Firebase functions here
// import { getEventById, getUserEvents, checkIfRegistered } from '@/services/firebase';

export default {
  name: 'ViewEvent',
  setup() {
    const router = useRouter();
    const route = useRoute();

    // State
    const event = ref(null);
    const clashes = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const isAlreadyRegistered = ref(false);

    // Get event ID from route params
    const eventId = route.params.id;
    
    // Mock user ID - replace with actual auth user
    const currentUserId = 'user123';

    // Computed properties
    const isFull = computed(() => {
      if (!event.value) return false;
      return event.value.currentCapacity >= event.value.maxCapacity;
    });

    const spotsLeft = computed(() => {
      if (!event.value) return 0;
      return event.value.maxCapacity - (event.value.currentCapacity || 0);
    });

    const vacancyPercentage = computed(() => {
      if (!event.value) return 0;
      return ((event.value.currentCapacity || 0) / event.value.maxCapacity) * 100;
    });

    // Format date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Format time
    const formatTime = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Check for schedule clashes
    const checkClashes = async (eventDate) => {
      try {
        // Fetch user's registered events
        // const userEvents = await getUserEvents(currentUserId);
        
        // Mock data for demonstration
        const userEvents = [
          {
            id: 'event789',
            name: 'Tech Workshop',
            date: '2026-02-15T14:00:00'
          }
        ];

        const eventTime = new Date(eventDate);
        const eventEndTime = new Date(eventTime.getTime() + 2 * 60 * 60 * 1000); // Assume 2hr duration

        const conflicts = userEvents.filter(userEvent => {
          const userEventTime = new Date(userEvent.date);
          const userEventEnd = new Date(userEventTime.getTime() + 2 * 60 * 60 * 1000);

          // Check if times overlap
          return (eventTime < userEventEnd && eventEndTime > userEventTime);
        });

        clashes.value = conflicts;
      } catch (err) {
        console.error('Error checking clashes:', err);
      }
    };

    // Load event data
    const loadEvent = async () => {
      try {
        loading.value = true;
        
        // Replace this with actual Firebase call
        // const eventData = await getEventById(eventId);
        // isAlreadyRegistered.value = await checkIfRegistered(currentUserId, eventId);
        
        // Mock data for demonstration
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        
        event.value = {
          id: eventId,
          name: 'MYG Family Day 2026',
          location: 'MYG Punggol, Singapore',
          date: '2026-02-15T14:00:00',
          maxCapacity: 50,
          currentCapacity: 42,
          imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          description: 'Join us for an indoor zumba session with student volunteers.',
          partner: 'Singapore Management University (SMU)',
          remark: 'There may be loud noises.'
        };

        // Check for clashes
        await checkClashes(event.value.date);
        
        loading.value = false;
      } catch (err) {
        console.error('Error loading event:', err);
        error.value = 'Failed to load event details. Please try again.';
        loading.value = false;
      }
    };

    // Navigate to register page
    const goToRegister = () => {
      if (!isFull.value && !isAlreadyRegistered.value) {
        router.push({
          name: 'RegisterEvent',
          params: { id: eventId },
          query: { eventName: event.value.name }
        });
      }
    };

    // Load data on mount
    onMounted(() => {
      loadEvent();
    });

    return {
      event,
      clashes,
      loading,
      error,
      isAlreadyRegistered,
      isFull,
      spotsLeft,
      vacancyPercentage,
      formatDate,
      formatTime,
      goToRegister
    };
  }
};
</script>

<style scoped>
/* Main Container - Matching the soft gradient background of the calendar */
.view-event {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 24px 16px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Loading & Error States - Using the same card styling */
.loading-container,
.error-container {
  max-width: 500px;
  margin: 100px auto;
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #6366f1; /* Calendar Indigo */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Main Event Card */
.event-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
}

.event-image-container {
  position: relative;
  width: 100%;
  height: 350px;
  background: #f1f5f9;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.full-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #ef4444;
  color: white;
  padding: 6px 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.5px;
}

/* Content Area */
.event-content {
  padding: 32px;
}

.event-name {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a; /* Deep Slate */
  margin-bottom: 20px;
  line-height: 1.2;
}

/* Metadata - Using the same icon/text style as calendar cards */
.event-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b; /* Muted Slate */
  font-size: 14px;
  font-weight: 600;
}

.icon { font-size: 18px; }

/* Vacancy/Progress Bar - Using Indigo theme */
.vacancy-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid #f1f5f9;
}

.vacancy-section h3 {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.vacancy-bar {
  width: 100%;
  height: 10px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.vacancy-fill {
  height: 100%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.vacancy-fill.vacancy-critical {
  background: #ef4444;
}

.vacancy-text {
  color: #64748b;
  font-size: 13px;
  margin: 0;
}

.spots-left { color: #6366f1; font-weight: 700; }
.full-text { color: #ef4444; font-weight: 700; }

/* Conflict Warning - Softened to match UI */
.clashes-section {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
}

.clashes-section h3 { color: #92400e; font-size: 15px; margin-bottom: 8px; }
.clash-warning { color: #b45309; font-size: 13px; margin-bottom: 12px; }

.clash-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  background: white;
  border-radius: 10px;
  margin-bottom: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.clash-name { font-size: 13px; font-weight: 700; color: #1e293b; }
.clash-time { font-size: 12px; color: #64748b; }

/* Description */
.description-section h3 {
  font-size: 18px;
  color: #0f172a;
  margin-bottom: 12px;
}

.description-text {
  color: #475569;
  line-height: 1.6;
  font-size: 15px;
  margin: 0;
}

/* Footer Buttons - Using the Gradient from the Calendar Toggle */
.action-section {
  display: flex;
  gap: 12px;
  margin-top: 40px;
}

.btn-register {
  flex: 2;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-register:hover:not(.btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4);
}

.btn-register.btn-disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-secondary {
  flex: 1;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
}

/* Mobile Adjustments */
@media (max-width: 600px) {
  .event-content { padding: 24px; }
  .event-meta { flex-direction: column; gap: 12px; }
  .action-section { flex-direction: column; }
  .event-image-container { height: 250px; }
  .event-name { font-size: 24px; }
}
</style>