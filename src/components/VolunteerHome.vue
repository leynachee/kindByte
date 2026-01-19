<template>
  <div class="page-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <template v-else>
      <section class="welcome-section">
        <div class="greeting">
          <h1>Hello, {{ userName }}! 🌟</h1>
          <p class="impact-badge">
            <span class="badge-icon">⏱️</span>
            You've contributed <strong>{{ totalHours }} hours</strong> this year!
          </p>
        </div>
        <div class="volunteer-level">
          <div class="level-badge">{{ getLevelIcon(totalShifts) }}</div>
          <span class="level-text">{{ getVolunteerLevel(totalShifts) }}</span>
        </div>
      </section>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <span class="stat-value">{{ pastShifts.length }}</span>
            <span class="stat-label">Shifts Completed</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <span class="stat-value">{{ upcomingShifts.length }}</span>
            <span class="stat-label">Upcoming Shifts</span>
          </div>
        </div>
      </div>

      <!-- Next Shift Section -->
      <div class="section" v-if="nextShift">
        <div class="section-header">
          <h3>Your Next Shift</h3>
          <router-link to="/my-shifts" class="text-btn">View All →</router-link>
        </div>
        
        <div class="shift-card highlight">
          <div class="shift-date">
            <div class="day">{{ formatDay(nextShift.startTime) }}</div>
            <div class="date">{{ formatDateNum(nextShift.startTime) }}</div>
            <div class="month">{{ formatMonth(nextShift.startTime) }}</div>
          </div>
          
          <div class="shift-content">
            <div class="shift-header">
              <h4 class="shift-title">{{ nextShift.title }}</h4>
              <span class="shift-badge confirmed">Confirmed</span>
            </div>
            
            <div class="shift-details">
              <div class="detail-row">
                <span class="icon">📍</span>
                <span>{{ nextShift.location }}</span>
              </div>
              <div class="detail-row">
                <span class="icon">🕐</span>
                <span>{{ formatTime(nextShift.startTime) }} - {{ formatTime(nextShift.endTime) }}</span>
              </div>
              <div class="detail-row">
                <span class="icon">👥</span>
                <span>{{ getVolunteersNeeded(nextShift) }} volunteers needed</span>
              </div>
            </div>

            <div class="shift-actions">
              <button class="action-btn primary" @click="viewShiftDetails(nextShift)">View Details</button>
              <button class="action-btn secondary" @click="contactStaff">Contact Staff</button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Upcoming Shifts -->
      <div v-else class="no-shifts-card">
        <div class="no-shifts-icon">📅</div>
        <h3>No upcoming shifts</h3>
        <p>Browse available opportunities below</p>
      </div>

      <!-- Available Opportunities -->
      <div class="section">
        <div class="section-header">
          <h3>Available Opportunities</h3>
          <router-link to="/activitycalendar" class="text-btn">Browse All →</router-link>
        </div>

        <div v-if="availableOpportunities.length > 0" class="opportunity-list">
          <div 
            v-for="event in availableOpportunities" 
            :key="event.id"
            class="opportunity-card"
          >
            <div class="opportunity-header">
              <div class="opportunity-date">
                <span class="date-day">{{ formatShortDate(event.startTime) }}</span>
                <span class="date-time">{{ formatTime(event.startTime) }}</span>
              </div>
              <span v-if="getSpotsLeft(event) <= 2" class="opportunity-tag urgent">Needs Volunteers</span>
            </div>
            
            <h4 class="opportunity-title">{{ event.title }}</h4>
            <p class="opportunity-location">📍 {{ event.location }} • {{ getDuration(event) }}</p>
            
            <div class="opportunity-footer">
              <span class="spots-left">{{ getSpotsLeft(event) }} spots left</span>
              <button class="register-btn" @click="registerForShift(event)">Register</button>
            </div>
          </div>
        </div>

        <div v-else class="no-opportunities">
          <p>No available opportunities at the moment</p>
        </div>
      </div>

      <router-link to="/my-shifts" class="cta-button">
        <span class="cta-icon">📋</span>
        Manage My Shifts
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
const currentUserId = ref(null);
const allEvents = ref([]);
const userShifts = ref([]);

// Fetch data on mount
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId.value = user.uid;
      await fetchUserData(user.uid);
      await fetchEvents(user.uid);
    }
    loading.value = false;
  });
});

const fetchUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      userName.value = userDoc.data().name || 'Volunteer';
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    userName.value = 'Volunteer';
  }
};

const fetchEvents = async (userId) => {
  try {
    const eventsRef = collection(db, 'events');
    const querySnapshot = await getDocs(eventsRef);
    
    const events = [];
    const shifts = [];

    querySnapshot.docs.forEach(eventDoc => {
      const eventData = eventDoc.data();
      const event = {
        id: eventDoc.id,
        ...eventData,
        startTime: eventData.startTime?.toDate?.() || new Date(eventData.startTime),
        endTime: eventData.endTime?.toDate?.() || new Date(eventData.endTime)
      };

      events.push(event);

      // Check if user is registered for this event
      if (eventData.attendees && eventData.attendees.includes(userId)) {
        shifts.push(event);
      }
    });

    allEvents.value = events;
    userShifts.value = shifts;
    
    console.log('All events:', events);
    console.log('User shifts:', shifts);
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// Computed
const upcomingShifts = computed(() => {
  const now = new Date();
  return userShifts.value
    .filter(s => s.startTime >= now)
    .sort((a, b) => a.startTime - b.startTime);
});

const pastShifts = computed(() => {
  const now = new Date();
  return userShifts.value
    .filter(s => s.startTime < now)
    .sort((a, b) => b.startTime - a.startTime);
});

const nextShift = computed(() => {
  return upcomingShifts.value.length > 0 ? upcomingShifts.value[0] : null;
});

const availableOpportunities = computed(() => {
  const now = new Date();
  return allEvents.value
    .filter(e => {
      const isUpcoming = e.startTime >= now;
      const isNotRegistered = !e.attendees?.includes(currentUserId.value);
      const hasSpots = getSpotsLeft(e) > 0;
      return isUpcoming && isNotRegistered && hasSpots;
    })
    .sort((a, b) => a.startTime - b.startTime)
    .slice(0, 5); // Show max 5 opportunities
});

const totalShifts = computed(() => pastShifts.value.length);

const totalHours = computed(() => {
  let hours = 0;
  pastShifts.value.forEach(shift => {
    if (shift.startTime && shift.endTime) {
      const diff = (shift.endTime - shift.startTime) / (1000 * 60 * 60);
      hours += diff;
    }
  });
  return Math.round(hours);
});

// Methods
const getVolunteerLevel = (shifts) => {
  if (shifts >= 20) return 'Expert';
  if (shifts >= 10) return 'Experienced';
  if (shifts >= 5) return 'Regular';
  return 'Newcomer';
};

const getLevelIcon = (shifts) => {
  if (shifts >= 20) return '💎';
  if (shifts >= 10) return '⭐';
  if (shifts >= 5) return '🌟';
  return '🌱';
};

const getSpotsLeft = (event) => {
  const attendeesCount = event.attendees?.length || 0;
  return Math.max(0, (event.maxCount || 10) - attendeesCount);
};

const getVolunteersNeeded = (event) => {
  return getSpotsLeft(event);
};

const getDuration = (event) => {
  if (!event.startTime || !event.endTime) return '';
  const hours = Math.round((event.endTime - event.startTime) / (1000 * 60 * 60));
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
};

// Date formatters
const formatDay = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
};

const formatDateNum = (date) => {
  if (!date) return '';
  return date.getDate();
};

const formatMonth = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
};

const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const formatShortDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    day: 'numeric'
  }).toUpperCase();
};

// Actions
const viewShiftDetails = (shift) => {
  router.push({ name: 'ViewEvent', params: { id: shift.id } });
};

const contactStaff = () => {
  // Could open email or messaging
  window.location.href = 'mailto:staff@minds.org.sg';
};

const registerForShift = (event) => {
  router.push({ name: 'RegisterEvent', params: { id: event.id } });
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 12px;
}

.greeting h1 {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
  line-height: 1.2;
}

.impact-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 13px;
  margin: 0;
}

.badge-icon {
  font-size: 14px;
}

.impact-badge strong {
  color: #6366f1;
  font-weight: 700;
}

.volunteer-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.level-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.level-text {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  font-size: 28px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border-radius: 10px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #6366f1;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

/* Section */
.section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.text-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
}

/* Shift Card */
.shift-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 14px;
}

.shift-card.highlight {
  border: 2px solid #6366f1;
  background: linear-gradient(135deg, #ffffff 0%, #eef2ff 100%);
}

.shift-date {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 12px;
  padding: 12px 10px;
  text-align: center;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.shift-date .day {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.shift-date .date {
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
}

.shift-date .month {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.8;
}

.shift-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.shift-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.shift-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
}

.shift-badge {
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.shift-badge.confirmed {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.shift-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.detail-row .icon {
  font-size: 14px;
  width: 18px;
  text-align: center;
}

.shift-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.action-btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  flex: 1;
}

.action-btn.secondary {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

/* No Shifts Card */
.no-shifts-card {
  background: white;
  padding: 30px 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.no-shifts-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.no-shifts-card h3 {
  font-size: 16px;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.no-shifts-card p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* Opportunity Cards */
.opportunity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.opportunity-card {
  background: white;
  border-radius: 14px;
  padding: 14px;
  border: 1px solid #e2e8f0;
}

.opportunity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.opportunity-date {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-day {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.date-time {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.opportunity-tag {
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.opportunity-tag.urgent {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.opportunity-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
  line-height: 1.2;
}

.opportunity-location {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 10px 0;
}

.opportunity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.spots-left {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.register-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.no-opportunities {
  text-align: center;
  padding: 30px 20px;
  color: #64748b;
  font-size: 13px;
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
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
  margin-top: 4px;
}

.cta-icon {
  font-size: 18px;
}

.cta-arrow {
  font-size: 16px;
}

/* Responsive */
@media (max-width: 380px) {
  .page-container {
    padding: 16px 12px;
  }
  
  .greeting h1 {
    font-size: 20px;
  }
  
  .shift-card {
    flex-direction: column;
    gap: 12px;
  }
  
  .shift-date {
    flex-direction: row;
    justify-content: center;
    padding: 10px 16px;
    min-width: unset;
    gap: 8px;
  }
  
  .shift-date .day,
  .shift-date .date,
  .shift-date .month {
    font-size: 14px;
  }
  
  .shift-date .date {
    font-size: 18px;
  }
}
</style>