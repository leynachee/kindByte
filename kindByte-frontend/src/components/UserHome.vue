<template>
  <div class="page-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <template v-else>
      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="greeting">
          <h1>Hello, {{ userName }}! 👋</h1>
          <p class="membership-badge">
            <span class="badge-icon">✨</span>
            Welcome back
          </p>
        </div>
      </section>

      <!-- Weekly Quota Card -->
      <div class="quota-card">
        <div class="quota-header">
          <div class="quota-info">
            <span class="quota-label">Weekly Booking Limit</span>
            <strong class="quota-value">{{ 4 - weeklyCount }} Left</strong>
          </div>
          <div class="quota-icon">📊</div>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: (weeklyCount / 4) * 100 + '%' }"></div>
        </div>
        <p class="quota-subtext">{{ weeklyCount }} of 4 activities booked this week</p>
      </div>

      <!-- Next Event Card -->
      <div v-if="nextEvent" class="next-event-card">
        <div class="event-header">
          <small class="event-label">YOUR NEXT ACTIVITY</small>
          <span class="event-status">Confirmed</span>
        </div>
        
        <h2 class="event-title">{{ nextEvent.title }}</h2>
        
        <div class="event-details">
          <div class="detail-item">
            <span class="icon">📅</span>
            <span>{{ formatEventDate(nextEvent.startTime) }} • {{ formatTime(nextEvent.startTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="icon">📍</span>
            <span>{{ nextEvent.location }}</span>
          </div>
        </div>

        <div class="event-tags">
          <span v-if="nextEvent.wheelchairAccessible" class="tag accessible">♿ Accessible</span>
          <span v-if="nextEvent.paymentNeeded" class="tag paid">💰 Paid</span>
        </div>

        <button class="view-details-btn" @click="viewEventDetails(nextEvent)">
          View Details →
        </button>
      </div>

      <!-- No Upcoming Events -->
      <div v-else class="no-events-card">
        <div class="no-events-icon">📅</div>
        <h3>No upcoming activities</h3>
        <p>Browse and register for activities</p>
      </div>

      <!-- CTA Button -->
      <router-link to="/activitycalendar" class="cta-button">
        <span class="cta-icon">📅</span>
        Book an Activity
        <span class="cta-arrow">→</span>
      </router-link>

      
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase';

const router = useRouter();
const loading = ref(true);
const userName = ref('');
const userEvents = ref([]);
const currentUserId = ref(null);

// Fetch user data and their registered events
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId.value = user.uid;
      await fetchUserData(user.uid);
      await fetchUserEvents(user.uid);
    }
    loading.value = false;
  });
});

const fetchUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      userName.value = userDoc.data().name || 'User';
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    userName.value = 'User';
  }
};

const fetchUserEvents = async (userId) => {
  try {
    const eventsRef = collection(db, 'events');
    const querySnapshot = await getDocs(eventsRef);
    
    const events = [];
    const now = new Date();

    for (const eventDoc of querySnapshot.docs) {
      const eventData = eventDoc.data();
      
      // Check if user is in attendees
      if (eventData.attendees && eventData.attendees.includes(userId)) {
        const startTime = eventData.startTime?.toDate?.() || new Date(eventData.startTime);
        
        // Only include future events
        if (startTime >= now) {
          events.push({
            id: eventDoc.id,
            ...eventData,
            startTime,
            endTime: eventData.endTime?.toDate?.() || new Date(eventData.endTime)
          });
        }
      }
    }

    // Sort by start time
    userEvents.value = events.sort((a, b) => a.startTime - b.startTime);
    console.log('User events:', userEvents.value);
  } catch (error) {
    console.error('Error fetching user events:', error);
  }
};

// Computed
const nextEvent = computed(() => {
  return userEvents.value.length > 0 ? userEvents.value[0] : null;
});

const weeklyCount = computed(() => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return userEvents.value.filter(e => 
    e.startTime >= startOfWeek && e.startTime < endOfWeek
  ).length;
});

// Methods
const formatEventDate = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === now.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  }
};

const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const viewEventDetails = (event) => {
  router.push({ name: 'ViewEvent', params: { id: event.id } });
};
</script>

<style scoped>
.page-container {
  padding: 20px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100%;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: #64748b;
  font-size: 14px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Welcome Section */
.welcome-section {
  margin-bottom: 20px;
}

.greeting h1 {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
  line-height: 1.2;
}

.membership-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.badge-icon {
  font-size: 14px;
}

/* Quota Card */
.quota-card {
  background: white;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.quota-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.quota-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quota-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quota-value {
  font-size: 22px;
  color: #10b981;
  font-weight: 700;
}

.quota-icon {
  font-size: 24px;
  opacity: 0.8;
}

.progress-track {
  height: 10px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 6px;
  transition: width 0.6s ease;
}

.quota-subtext {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

/* Next Event Card */
.next-event-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  padding: 20px;
  border-radius: 20px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.next-event-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.event-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #94a3b8;
  text-transform: uppercase;
}

.event-status {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.event-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 14px 0;
  color: white;
  line-height: 1.3;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #cbd5e1;
}

.detail-item .icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.event-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.tag {
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag.accessible {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.tag.paid {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.view-details-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.view-details-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* No Events Card */
.no-events-card {
  background: white;
  padding: 30px 20px;
  border-radius: 20px;
  margin-bottom: 16px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.no-events-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.no-events-card h3 {
  font-size: 16px;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.no-events-card p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* CTA Button */
.cta-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  text-align: center;
  padding: 16px 20px;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 20px;
}

.cta-icon {
  font-size: 18px;
}

.cta-arrow {
  font-size: 16px;
}

/* Quick Links */
.quick-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.quick-link {
  background: white;
  padding: 16px;
  border-radius: 14px;
  text-decoration: none;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 1px solid #e2e8f0;
}

.link-icon {
  font-size: 28px;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-link span {
  font-weight: 600;
  font-size: 13px;
}
</style>