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
        <div v-if="event.organizer || event.category" class="additional-info">
          <div v-if="event.organizer" class="info-item">
            <strong>Organizer:</strong> {{ event.organizer }}
          </div>
          <div v-if="event.category" class="info-item">
            <strong>Category:</strong> {{ event.category }}
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
            Back to Events
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
          name: 'Web Development Workshop 2026',
          location: 'Innovation Hub, Singapore',
          date: '2026-02-15T14:00:00',
          maxCapacity: 50,
          currentCapacity: 42,
          imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          description: 'Join us for an intensive hands-on workshop covering modern web development practices. Learn about Vue.js, Firebase integration, responsive design, and deployment strategies. Perfect for developers looking to upgrade their skills and build real-world applications. Includes practical exercises, live coding sessions, and Q&A with industry experts.',
          organizer: 'Tech Community Singapore',
          category: 'Technology'
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
.view-event {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.loading-container,
.error-container {
  max-width: 600px;
  margin: 100px auto;
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.event-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.event-image-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
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
  background: #d63031;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.event-content {
  padding: 40px;
}

.event-name {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.2;
}

.event-meta {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  font-size: 16px;
}

.icon {
  font-size: 20px;
}

.vacancy-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.vacancy-section h3 {
  margin-bottom: 15px;
  color: #333;
}

.vacancy-bar {
  width: 100%;
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
}

.vacancy-fill {
  height: 100%;
  background: linear-gradient(90deg, #00b894, #00cec9);
  transition: width 0.3s ease;
}

.vacancy-fill.vacancy-critical {
  background: linear-gradient(90deg, #d63031, #ff7675);
}

.vacancy-text {
  color: #555;
  font-size: 16px;
}

.spots-left {
  color: #00b894;
  font-weight: 600;
}

.full-text {
  color: #d63031;
  font-weight: 600;
}

.clashes-section {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.clashes-section h3 {
  color: #856404;
  margin-bottom: 10px;
}

.clash-warning {
  color: #856404;
  margin-bottom: 15px;
}

.clash-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
}

.clash-name {
  font-weight: 600;
  color: #333;
}

.clash-time {
  color: #666;
}

.description-section {
  margin-bottom: 30px;
}

.description-section h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.5em;
}

.description-text {
  color: #555;
  line-height: 1.8;
  font-size: 16px;
}

.additional-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.info-item {
  margin-bottom: 10px;
  color: #555;
}

.info-item:last-child {
  margin-bottom: 0;
}

.action-section {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn-register {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-register:hover:not(.btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-register.btn-disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

@media (max-width: 768px) {
  .event-content {
    padding: 20px;
  }

  .event-name {
    font-size: 1.8em;
  }

  .event-meta {
    flex-direction: column;
    gap: 15px;
  }

  .action-section {
    flex-direction: column;
  }

  .event-image-container {
    height: 250px;
  }
}
</style>