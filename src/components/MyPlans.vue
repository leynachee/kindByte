<template>
  <div class="page-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your plans...</p>
    </div>

    <template v-else>
      <header class="page-header">
        <div class="header-content">
          <h1>My Plans</h1>
          <p>Manage your registered activities</p>
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
          <router-link to="/calendar" class="browse-btn">
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

                <!-- Role Badge -->
                <div class="plan-tags">
                  <span class="tag role" :class="plan.userRole">
                    {{ plan.userRole === 'volunteer' ? '🤝 Volunteer' : '👤 Participant' }}
                  </span>
                  <span v-if="plan.wheelchairAccessible" class="tag accessible">♿ Accessible</span>
                  <span v-if="plan.paymentNeeded" class="tag paid">💰 Payment required</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="plan-actions">
              <button class="action-btn calendar" @click="addToCalendar(plan)">
                <span class="btn-icon">📅</span>
                Add to Calendar
              </button>
              <button class="action-btn cancel" @click="openCancelModal(plan)">
                <span class="btn-icon">❌</span>
                Cancel Registration
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
              <span class="status-badge attended">
                ✅ COMPLETED
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
                <span class="tag role" :class="plan.userRole">
                  {{ plan.userRole === 'volunteer' ? '🤝 Volunteer' : '👤 Participant' }}
                </span>
              </div>
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
                <p class="cancellation-reason">Cancelled on {{ formatDate(plan.cancelledAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Cancel Confirmation Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCancelModal" class="modal-overlay" @click.self="closeCancelModal">
          <div class="modal-content">
            <div class="modal-icon">🚫</div>
            <h3>Cancel Registration?</h3>
            <p>Are you sure you want to cancel your registration for:</p>
            <div class="modal-event-info">
              <strong>{{ selectedPlan?.title }}</strong>
              <span>{{ formatDate(selectedPlan?.startTime) }}</span>
            </div>
            <p class="modal-warning">This action cannot be undone.</p>
            <div class="modal-actions">
              <button class="modal-btn secondary" @click="closeCancelModal" :disabled="cancelling">
                Keep Registration
              </button>
              <button class="modal-btn danger" @click="confirmCancelPlan" :disabled="cancelling">
                {{ cancelling ? 'Cancelling...' : 'Yes, Cancel' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast', toast.type]">
        <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { collection, doc, getDoc, getDocs, updateDoc, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase';

const router = useRouter();
const activeTab = ref('upcoming');
const loading = ref(true);
const plans = ref([]);
const cancelledPlansData = ref([]);
const currentUserId = ref(null);
const showCancelModal = ref(false);
const selectedPlan = ref(null);
const cancelling = ref(false);

// Toast notification
const toast = ref({
  show: false,
  message: '',
  type: 'success'
});

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// Event type colors and icons - matching your categories
const eventStyles = {
  'Outings': { color: '#f59e0b', icon: '🏛️' },
  'MTC Office': { color: '#6366f1', icon: '🏢' },
  'Swimming Complex': { color: '#0ea5e9', icon: '🏊' },
  'Nature Walks': { color: '#10b981', icon: '🌳' },
  'Gym and Dance': { color: '#db2777', icon: '💃' },
  'Reading': { color: '#8b5cf6', icon: '📚' },
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

    // Get all events
    const eventsRef = collection(db, 'events');
    const querySnapshot = await getDocs(eventsRef);
    
    const userPlans = [];

    for (const eventDoc of querySnapshot.docs) {
      const eventData = eventDoc.data();
      
      // Check if user is in participantsID array
      const isParticipant = eventData.participantsID?.includes(userId);
      
      // Check if user is in volunteersID array
      const isVolunteer = eventData.volunteersID?.includes(userId);
      
      // Also check attendees array for backward compatibility
      const isAttendee = eventData.attendees?.includes(userId);

      if (isParticipant || isVolunteer || isAttendee) {
        userPlans.push({
          id: eventDoc.id,
          title: eventData.title || eventData.name || 'Untitled Event',
          description: eventData.description || '',
          location: eventData.location || 'TBA',
          type: eventData.type || 'General',
          maxCount: eventData.maxCount || 0,
          startTime: eventData.startTime?.toDate?.() || null,
          endTime: eventData.endTime?.toDate?.() || null,
          wheelchairAccessible: eventData.wheelchairAccessible || false,
          paymentNeeded: eventData.paymentNeeded || false,
          userRole: isVolunteer ? 'volunteer' : 'participant',
          status: 'confirmed'
        });
      }
    }

    // Also fetch cancelled registrations from user's subcollection (if exists)
    try {
      const userCancelledRef = collection(db, 'users', userId, 'cancelledEvents');
      const cancelledSnapshot = await getDocs(userCancelledRef);
      
      cancelledPlansData.value = cancelledSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        cancelledAt: doc.data().cancelledAt?.toDate?.() || new Date()
      }));
    } catch (e) {
      console.log('No cancelled events collection found');
      cancelledPlansData.value = [];
    }

    plans.value = userPlans;
    console.log('User plans found:', userPlans.length);
    console.log('Plans:', userPlans);
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
    .filter(p => p.startTime && p.startTime >= now)
    .sort((a, b) => a.startTime - b.startTime);
});

const pastPlans = computed(() => {
  const now = new Date();
  return plans.value
    .filter(p => p.startTime && p.startTime < now)
    .sort((a, b) => b.startTime - a.startTime);
});

const cancelledPlans = computed(() => {
  return cancelledPlansData.value.sort((a, b) => b.cancelledAt - a.cancelledAt);
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
  if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  return `In ${Math.ceil(diffDays / 30)} months`;
};

const formatDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-SG', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('en-SG', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const viewDetails = (plan) => {
  router.push(`/event/${plan.id}`);
};

const addToCalendar = (plan) => {
  if (!plan.startTime || !plan.endTime) {
    alert('Event dates not available');
    return;
  }
  
  // Create calendar event URL (Google Calendar)
  const startDate = plan.startTime.toISOString().replace(/-|:|\.\d+/g, '');
  const endDate = plan.endTime.toISOString().replace(/-|:|\.\d+/g, '');
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(plan.title)}&dates=${startDate}/${endDate}&location=${encodeURIComponent(plan.location)}&details=${encodeURIComponent(plan.description || '')}`;
  window.open(url, '_blank');
};

const openCancelModal = (plan) => {
  selectedPlan.value = plan;
  showCancelModal.value = true;
};

const closeCancelModal = () => {
  showCancelModal.value = false;
  selectedPlan.value = null;
};

const confirmCancelPlan = async () => {
  if (!selectedPlan.value) return;
  
  cancelling.value = true;
  const plan = selectedPlan.value;

  try {
    const eventRef = doc(db, 'events', plan.id);
    
    // Remove user from the appropriate array based on their role
    if (plan.userRole === 'volunteer') {
      await updateDoc(eventRef, {
        volunteersID: arrayRemove(currentUserId.value)
      });
    } else {
      await updateDoc(eventRef, {
        participantsID: arrayRemove(currentUserId.value)
      });
    }

    // Also remove from attendees if present
    await updateDoc(eventRef, {
      attendees: arrayRemove(currentUserId.value)
    });

    // Remove from local state
    plans.value = plans.value.filter(p => p.id !== plan.id);
    
    // Add to cancelled list for display
    cancelledPlansData.value.push({
      ...plan,
      cancelledAt: new Date()
    });
    
    closeCancelModal();
    showToast('Registration cancelled successfully', 'success');
  } catch (error) {
    console.error('Error cancelling registration:', error);
    showToast('Failed to cancel registration. Please try again.', 'error');
  } finally {
    cancelling.value = false;
  }
};
</script>

<style scoped>
.page-container {
  padding: 16px;
  padding-bottom: 100px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #64748b;
  font-size: 14px;
  gap: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  margin-top: 6px;
}

.tag {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
}

.tag.role {
  background: #f1f5f9;
  color: #475569;
}

.tag.role.volunteer {
  background: #ddd6fe;
  color: #7c3aed;
}

.tag.role.participant {
  background: #dbeafe;
  color: #2563eb;
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
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  padding: 10px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
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

.action-btn.cancel {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.btn-icon {
  font-size: 14px;
}

.cancellation-reason {
  font-size: 12px;
  color: #dc2626;
  font-style: italic;
  margin: 4px 0 0 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 28px 24px;
  width: 100%;
  max-width: 340px;
  text-align: center;
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.modal-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.modal-content p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px 0;
}

.modal-event-info {
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
}

.modal-event-info strong {
  display: block;
  font-size: 15px;
  color: #0f172a;
  margin-bottom: 4px;
}

.modal-event-info span {
  font-size: 12px;
  color: #64748b;
}

.modal-warning {
  font-size: 12px;
  color: #dc2626;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.modal-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.modal-btn.secondary {
  background: #f1f5f9;
  color: #475569;
}

.modal-btn.secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.modal-btn.danger {
  background: #dc2626;
  color: white;
}

.modal-btn.danger:hover:not(:disabled) {
  background: #b91c1c;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.toast.success {
  background: #10b981;
  color: white;
}

.toast.error {
  background: #dc2626;
  color: white;
}

.toast-icon {
  font-size: 16px;
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

.toast-enter-active {
  animation: toastIn 0.3s ease;
}

.toast-leave-active {
  animation: toastOut 0.3s ease;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes toastOut {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
}
</style>