<template>
  <div class="page-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading your plans...</p>
    </div>

    <template v-else>
      <header class="page-header">
        <div class="header-content">
          <h1>My Plans</h1>
          <p>Manage your registered activities</p>
        </div>
        <div class="quota-info">
          <span class="quota-label">Weekly Limit</span>
          <strong class="quota-value">{{ weeklyCount }}/4</strong>
        </div>
      </header>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'upcoming' }]"
          @click="activeTab = 'upcoming'"
        >
          Upcoming
          <span class="tab-count">{{ upcomingPlans.length }}</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'past' }]"
          @click="activeTab = 'past'"
        >
          Past
          <span class="tab-count">{{ pastPlans.length }}</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'cancelled' }]"
          @click="activeTab = 'cancelled'"
        >
          Cancelled
          <span class="tab-count">{{ cancelledPlans.length }}</span>
        </button>
      </div>

      <!-- Upcoming Plans -->
      <div v-if="activeTab === 'upcoming'" class="plans-section">
        <div v-if="upcomingPlans.length === 0" class="empty-state">
          <div class="empty-icon">📅</div>
          <h3>No upcoming plans</h3>
          <p>Browse activities and register for events</p>
          <router-link to="/activitycalendar" class="browse-btn">
            Browse Activities
          </router-link>
        </div>

        <div v-else class="plans-list">
          <div 
            v-for="plan in upcomingPlans" 
            :key="plan.id"
            class="plan-card"
            :class="plan.status"
          >
            <!-- Status Badge -->
            <div class="card-header">
              <span :class="['status-badge', plan.status]">
                {{ getStatusIcon(plan.status) }} {{ plan.status.toUpperCase() }}
              </span>
              <span class="days-until">{{ getDaysUntil(plan.startTime) }}</span>
            </div>

            <!-- Plan Info -->
            <div class="plan-content">
              <div class="plan-icon" :style="{ background: getEventColor(plan.type) }">
                {{ getEventIcon(plan.type) }}
              </div>
              <div class="plan-details">
                <span class="plan-type" :style="{ color: getEventColor(plan.type) }">{{ plan.type }}</span>
                <h3 class="plan-title">{{ plan.title }}</h3>
                <div class="plan-meta">
                  <div class="meta-item">
                    <span class="meta-icon">📅</span>
                    <span>{{ formatDate(plan.startTime) }} • {{ formatTime(plan.startTime) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">📍</span>
                    <span>{{ plan.location }}</span>
                  </div>
                </div>

                <!-- Additional Info -->
                <div class="plan-tags">
                  <span v-if="plan.wheelchairAccessible" class="tag accessible">♿ Accessible</span>
                  <span v-if="plan.paymentNeeded" class="tag paid">💰 Payment required</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="plan-actions">
              <button class="action-btn view" @click="viewDetails(plan)">
                <span class="btn-icon">👁️</span>
                View Details
              </button>
              <button class="action-btn calendar" @click="addToCalendar(plan)">
                <span class="btn-icon">📅</span>
                Add to Calendar
              </button>
              <button class="action-btn contact" @click="contactStaff(plan)">
                <span class="btn-icon">💬</span>
                Contact Staff
              </button>
              <button class="action-btn cancel" @click="cancelPlan(plan)">
                <span class="btn-icon">❌</span>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Past Plans -->
      <div v-if="activeTab === 'past'" class="plans-section">
        <div v-if="pastPlans.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No past activities</h3>
          <p>Your completed activities will appear here</p>
        </div>

        <div v-else class="plans-list">
          <div 
            v-for="plan in pastPlans" 
            :key="plan.id"
            class="plan-card past"
          >
            <div class="card-header">
              <span :class="['status-badge', plan.attended ? 'attended' : 'missed']">
                {{ plan.attended ? '✅ ATTENDED' : '❌ MISSED' }}
              </span>
              <span class="date-text">{{ formatDate(plan.startTime) }}</span>
            </div>

            <div class="plan-content compact">
              <div class="plan-icon" :style="{ background: getEventColor(plan.type) }">
                {{ getEventIcon(plan.type) }}
              </div>
              <div class="plan-details">
                <span class="plan-type" :style="{ color: getEventColor(plan.type) }">{{ plan.type }}</span>
                <h3 class="plan-title">{{ plan.title }}</h3>
                <p class="plan-location">📍 {{ plan.location }}</p>
              </div>
            </div>

            <div v-if="plan.attended" class="feedback-section">
              <button class="feedback-btn" @click="giveFeedback(plan)">
                ⭐ Rate this activity
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancelled Plans -->
      <div v-if="activeTab === 'cancelled'" class="plans-section">
        <div v-if="cancelledPlans.length === 0" class="empty-state">
          <div class="empty-icon">🚫</div>
          <h3>No cancelled activities</h3>
          <p>You haven't cancelled any activities</p>
        </div>

        <div v-else class="plans-list">
          <div 
            v-for="plan in cancelledPlans" 
            :key="plan.id"
            class="plan-card cancelled"
          >
            <div class="card-header">
              <span class="status-badge cancelled">🚫 CANCELLED</span>
              <span class="date-text">{{ formatDate(plan.startTime) }}</span>
            </div>

            <div class="plan-content compact">
              <div class="plan-icon" :style="{ background: getEventColor(plan.type), opacity: 0.5 }">
                {{ getEventIcon(plan.type) }}
              </div>
              <div class="plan-details">
                <span class="plan-type" :style="{ color: getEventColor(plan.type) }">{{ plan.type }}</span>
                <h3 class="plan-title">{{ plan.title }}</h3>
                <p class="cancellation-reason">Reason: {{ plan.cancellationReason || 'Not specified' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { collection, doc, getDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase';

const router = useRouter();
const activeTab = ref('upcoming');
const loading = ref(true);
const plans = ref([]);
const currentUserId = ref(null);

// Event type colors and icons
const eventStyles = {
  'Gym & Dance': { color: '#db2777', icon: '💃' },
  'Nature': { color: '#10b981', icon: '🌳' },
  'Outing': { color: '#f59e0b', icon: '🏛️' },
  'Arts & Crafts': { color: '#8b5cf6', icon: '🎨' },
  'default': { color: '#6366f1', icon: '📅' }
};

const getEventColor = (type) => {
  return eventStyles[type]?.color || eventStyles.default.color;
};

const getEventIcon = (type) => {
  return eventStyles[type]?.icon || eventStyles.default.icon;
};

// Fetch user's registered events from Firebase
const fetchUserPlans = async (userId) => {
  try {
    loading.value = true;
    console.log('Fetching plans for user:', userId);

    // Get all events where user is in attendees array
    const eventsRef = collection(db, 'events');
    const querySnapshot = await getDocs(eventsRef);
    
    const userPlans = [];

    for (const eventDoc of querySnapshot.docs) {
      const eventData = eventDoc.data();
      
      // Check if user is in attendees
      if (eventData.attendees && eventData.attendees.includes(userId)) {
        // Get user's registration status from user's subcollection
        let status = 'confirmed';
        let attended = false;
        
        try {
          const userEventRef = doc(db, 'users', userId, eventDoc.id, 'status');
          const userEventDoc = await getDoc(userEventRef);
          if (userEventDoc.exists()) {
            status = userEventDoc.data().status || 'confirmed';
            attended = userEventDoc.data().attended || false;
          }
        } catch (e) {
          console.log('No user status found for event:', eventDoc.id);
        }

        userPlans.push({
          id: eventDoc.id,
          ...eventData,
          startTime: eventData.startTime?.toDate?.() || new Date(eventData.startTime),
          endTime: eventData.endTime?.toDate?.() || new Date(eventData.endTime),
          status,
          attended
        });
      }
    }

    plans.value = userPlans;
    console.log('User plans:', userPlans);
  } catch (error) {
    console.error('Error fetching user plans:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUserId.value = user.uid;
      fetchUserPlans(user.uid);
    } else {
      loading.value = false;
      plans.value = [];
    }
  });
});

// Computed
const upcomingPlans = computed(() => {
  const now = new Date();
  return plans.value
    .filter(p => p.startTime >= now && p.status !== 'cancelled')
    .sort((a, b) => a.startTime - b.startTime);
});

const pastPlans = computed(() => {
  const now = new Date();
  return plans.value
    .filter(p => p.startTime < now && p.status !== 'cancelled')
    .sort((a, b) => b.startTime - a.startTime);
});

const cancelledPlans = computed(() => {
  return plans.value
    .filter(p => p.status === 'cancelled')
    .sort((a, b) => b.startTime - a.startTime);
});

const weeklyCount = computed(() => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return upcomingPlans.value.filter(p => 
    p.startTime >= startOfWeek && p.startTime < endOfWeek
  ).length;
});

// Methods
const getStatusIcon = (status) => {
  const icons = {
    confirmed: '✅',
    pending: '⏳',
    waitlist: '⏰'
  };
  return icons[status] || '✅';
};

const getDaysUntil = (date) => {
  if (!date) return '';
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  return `In ${Math.ceil(diffDays / 7)} weeks`;
};

const formatDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const viewDetails = (plan) => {
  router.push({ name: 'ViewEvent', params: { id: plan.id } });
};

const addToCalendar = (plan) => {
  // Create calendar event URL (Google Calendar)
  const startDate = plan.startTime.toISOString().replace(/-|:|\.\d+/g, '');
  const endDate = plan.endTime.toISOString().replace(/-|:|\.\d+/g, '');
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(plan.title)}&dates=${startDate}/${endDate}&location=${encodeURIComponent(plan.location)}&details=${encodeURIComponent(plan.description || '')}`;
  window.open(url, '_blank');
};

const contactStaff = (plan) => {
  alert('Opening staff contact form...');
};

const cancelPlan = async (plan) => {
  if (confirm(`Are you sure you want to cancel "${plan.title}"?`)) {
    try {
      // Update user's event status
      const userEventRef = doc(db, 'users', currentUserId.value, plan.id, 'status');
      await updateDoc(userEventRef, {
        status: 'cancelled',
        cancellationReason: 'Cancelled by user'
      });

      // Remove user from event attendees
      const eventRef = doc(db, 'events', plan.id);
      const eventDoc = await getDoc(eventRef);
      if (eventDoc.exists()) {
        const attendees = eventDoc.data().attendees || [];
        const updatedAttendees = attendees.filter(id => id !== currentUserId.value);
        await updateDoc(eventRef, { attendees: updatedAttendees });
      }

      // Update local state
      plan.status = 'cancelled';
      plan.cancellationReason = 'Cancelled by user';
      
      alert('Registration cancelled successfully');
    } catch (error) {
      console.error('Error cancelling plan:', error);
      alert('Failed to cancel registration. Please try again.');
    }
  }
};

const giveFeedback = (plan) => {
  alert('Opening feedback form...');
};
</script>

<style scoped>
.page-container {
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100%;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #64748b;
  font-size: 14px;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.header-content h1 {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.header-content p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.quota-info {
  background: white;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  text-align: center;
  min-width: 80px;
}

.quota-label {
  display: block;
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 4px;
}

.quota-value {
  display: block;
  font-size: 20px;
  color: #10b981;
  font-weight: 800;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 6px;
  background: white;
  padding: 4px;
  border-radius: 10px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  padding: 10px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tab-btn.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.tab-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
}

.tab-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

/* Plans Section */
.plans-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.plans-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Plan Card */
.plan-card {
  background: white;
  border-radius: 14px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.plan-card.confirmed {
  border-color: #10b981;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}

.plan-card.pending {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
}

.plan-card.past {
  border-color: #e2e8f0;
  opacity: 0.9;
}

.plan-card.cancelled {
  border-color: #fca5a5;
  background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
  opacity: 0.85;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-badge.confirmed {
  background: #d1fae5;
  color: #059669;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.attended {
  background: #d1fae5;
  color: #059669;
}

.status-badge.missed {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.days-until {
  font-size: 11px;
  font-weight: 700;
  color: #6366f1;
  background: #eef2ff;
  padding: 4px 8px;
  border-radius: 6px;
}

.date-text {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

/* Plan Content */
.plan-content {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.plan-content.compact {
  margin-bottom: 10px;
}

.plan-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.plan-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.plan-type {
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
}

.plan-location {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.plan-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.meta-icon {
  font-size: 14px;
}

/* Tags */
.plan-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.tag {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
}

.tag.accessible {
  background: #dbeafe;
  color: #1e40af;
}

.tag.paid {
  background: #fef3c7;
  color: #b45309;
}

/* Plan Actions */
.plan-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.action-btn {
  padding: 10px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
}

.action-btn.view {
  background: #f8fafc;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

.action-btn.calendar {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.action-btn.contact {
  background: #f8fafc;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

.action-btn.cancel {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.btn-icon {
  font-size: 14px;
}

/* Feedback Section */
.feedback-section {
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.feedback-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
}

.cancellation-reason {
  font-size: 12px;
  color: #dc2626;
  font-style: italic;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state h3 {
  font-size: 18px;
  color: #1e293b;
  margin: 0 0 6px 0;
}

.empty-state p {
  color: #64748b;
  margin: 0 0 20px 0;
  font-size: 13px;
}

.browse-btn {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 380px) {
  .page-container {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
  }
  
  .quota-info {
    width: 100%;
  }
  
  .plan-actions {
    grid-template-columns: 1fr;
  }
}
</style>