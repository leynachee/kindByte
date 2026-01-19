<template>
  <div class="page-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading dashboard...</p>
    </div>

    <template v-else>
      <section class="welcome-section">
        <div class="greeting">
          <h1>Hello, {{ userName }}! 🛡️</h1>
          <p class="staff-badge">
            <span class="badge-icon">👤</span>
            <strong>Staff Admin</strong>
          </p>
        </div>
      </section>

      <!-- Alert Banner - Pending Registrations -->
      <div v-if="pendingCount > 0" class="alert-banner urgent">
        <div class="alert-content">
          <span class="alert-icon">🔔</span>
          <div class="alert-text">
            <strong>{{ pendingCount }} New Registration{{ pendingCount > 1 ? 's' : '' }}</strong>
            <span>Pending approval</span>
          </div>
        </div>
        <button class="alert-action" @click="goToUserManagement">Review →</button>
      </div>

      <div class="section">
        <h3 class="section-title">Overview</h3>
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3 class="stat-value">{{ stats.beneficiaries }}</h3>
              <p class="stat-label">Beneficiaries</p>
            </div>
          </div>

          <div class="stat-card secondary">
            <div class="stat-icon">🌟</div>
            <div class="stat-content">
              <h3 class="stat-value">{{ stats.volunteers }}</h3>
              <p class="stat-label">Volunteers</p>
            </div>
          </div>

          <div class="stat-card accent">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <h3 class="stat-value">{{ stats.eventsThisWeek }}</h3>
              <p class="stat-label">Events This Week</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Events Section -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Upcoming Events</h3>
          <router-link to="/manage-events" class="text-btn">View All →</router-link>
        </div>

        <div v-if="upcomingEvents.length > 0" class="event-list">
          <div 
            v-for="event in upcomingEvents.slice(0, 3)" 
            :key="event.id"
            class="event-card"
          >
            <div class="event-date">
              <span class="date-day">{{ formatDay(event.startTime) }}</span>
              <span class="date-num">{{ formatDateNum(event.startTime) }}</span>
            </div>
            <div class="event-content">
              <h4 class="event-title">{{ event.title }}</h4>
              <p class="event-meta">{{ formatTime(event.startTime) }} • {{ event.location }}</p>
              <div class="event-status">
                <span class="status-badge" :class="getCapacityClass(event)">
                  {{ getAttendeeCount(event) }}/{{ event.maxCount }} registered
                </span>
                <span v-if="getVolunteerCount(event) > 0" class="status-badge volunteers">
                  {{ getVolunteerCount(event) }} volunteer{{ getVolunteerCount(event) > 1 ? 's' : '' }}
                </span>
              </div>
            </div>
            <button class="event-action" @click="goToEditEvent(event.id)">Manage</button>
          </div>
        </div>

        <div v-else class="no-events">
          <p>No upcoming events</p>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Admin Tools</h3>
        <div class="tools-grid">
          <router-link to="/createevent" class="tool-card create-event">
            <div class="tool-icon">➕</div>
            <div class="tool-content">
              <h4>Create Event</h4>
              <p>Add new activity</p>
            </div>
            <span class="tool-arrow">→</span>
          </router-link>

          <router-link to="/manage-events" class="tool-card">
            <div class="tool-icon">📅</div>
            <div class="tool-content">
              <h4>Manage Events</h4>
              <p>{{ stats.totalEvents }} total events</p>
            </div>
            <span class="tool-arrow">→</span>
          </router-link>

          <router-link to="/user-management" class="tool-card">
            <div class="tool-icon">👥</div>
            <div class="tool-content">
              <h4>User Management</h4>
              <p>{{ stats.totalUsers }} users</p>
            </div>
            <span class="tool-arrow">→</span>
          </router-link>

          <router-link to="/attendance-report" class="tool-card">
            <div class="tool-icon">📊</div>
            <div class="tool-content">
              <h4>Attendance Report</h4>
              <p>Export to Excel</p>
            </div>
            <span class="tool-arrow">→</span>
          </router-link>
        </div>
      </div>

      <!-- Recent Registrations -->
      <div class="section">
        <h3 class="section-title">Recent Registrations</h3>
        <div v-if="recentRegistrations.length > 0" class="activity-log">
          <div 
            v-for="reg in recentRegistrations" 
            :key="reg.odDocs"
            class="activity-item"
          >
            <div class="activity-icon" :class="getRoleClass(reg.userRole)">
              {{ getRoleIcon(reg.userRole) }}
            </div>
            <div class="activity-content">
              <p class="activity-text">
                <strong>{{ reg.userName }}</strong> registered for <strong>{{ reg.eventTitle }}</strong>
              </p>
              <span class="activity-time">{{ formatRole(reg.userRole) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="no-activity">
          <p>No recent registrations</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase';

const router = useRouter();
const loading = ref(true);
const userName = ref('');
const currentUserId = ref(null);

const users = ref([]);
const events = ref([]);
const recentRegistrations = ref([]);

const stats = ref({
  beneficiaries: 0,
  volunteers: 0,
  caregivers: 0,
  eventsThisWeek: 0,
  totalEvents: 0,
  totalUsers: 0
});

const pendingCount = ref(0);

// Fetch data on mount
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId.value = user.uid;
      await fetchUserData(user.uid);
      await fetchAllData();
    }
    loading.value = false;
  });
});

const fetchUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      userName.value = userDoc.data().name || 'Admin';
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    userName.value = 'Admin';
  }
};

const fetchAllData = async () => {
  try {
    // Fetch all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allUsers = [];
    let beneficiaryCount = 0;
    let volunteerCount = 0;
    let caregiverCount = 0;

    usersSnapshot.docs.forEach(doc => {
      const userData = { id: doc.id, ...doc.data() };
      allUsers.push(userData);

      switch (userData.role) {
        case 'beneficiary':
          beneficiaryCount++;
          break;
        case 'volunteer':
          volunteerCount++;
          break;
        case 'caregiver':
          caregiverCount++;
          break;
      }
    });

    users.value = allUsers;
    stats.value.beneficiaries = beneficiaryCount;
    stats.value.volunteers = volunteerCount;
    stats.value.caregivers = caregiverCount;
    stats.value.totalUsers = allUsers.length;

    // Fetch all events
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    const allEvents = [];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    let eventsThisWeekCount = 0;

    eventsSnapshot.docs.forEach(doc => {
      const eventData = doc.data();
      const event = {
        id: doc.id,
        ...eventData,
        startTime: eventData.startTime?.toDate?.() || new Date(eventData.startTime),
        endTime: eventData.endTime?.toDate?.() || new Date(eventData.endTime)
      };
      allEvents.push(event);

      // Count events this week
      if (event.startTime >= startOfWeek && event.startTime < endOfWeek) {
        eventsThisWeekCount++;
      }
    });

    events.value = allEvents;
    stats.value.eventsThisWeek = eventsThisWeekCount;
    stats.value.totalEvents = allEvents.length;

    // Get recent registrations (from events with attendees/volunteers)
    await fetchRecentRegistrations(allEvents, allUsers);

  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const fetchRecentRegistrations = async (allEvents, allUsers) => {
  try {
    const registrations = [];

    // Create a map of users for quick lookup
    const userMap = {};
    allUsers.forEach(user => {
      userMap[user.id] = user;
    });

    // Go through recent events and get registrations
    const recentEvents = allEvents
      .filter(e => e.startTime >= new Date())
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 10);

    for (const event of recentEvents) {
      // Check attendees (beneficiaries/caregivers)
      if (event.attendees && event.attendees.length > 0) {
        event.attendees.forEach(userId => {
          const user = userMap[userId];
          if (user) {
            registrations.push({
              odDocs: `${event.id}-${userId}`,
              eventId: event.id,
              eventTitle: event.title,
              userId: userId,
              userName: user.name || 'Unknown',
              userRole: user.role || 'beneficiary'
            });
          }
        });
      }

      // Check volunteers
      if (event.volunteers && event.volunteers.length > 0) {
        event.volunteers.forEach(userId => {
          const user = userMap[userId];
          if (user) {
            registrations.push({
              odDocs: `${event.id}-${userId}-vol`,
              eventId: event.id,
              eventTitle: event.title,
              userId: userId,
              userName: user.name || 'Unknown',
              userRole: 'volunteer'
            });
          }
        });
      }
    }

    // Take most recent 5
    recentRegistrations.value = registrations.slice(0, 5);

  } catch (error) {
    console.error('Error fetching recent registrations:', error);
  }
};

// Computed
const upcomingEvents = computed(() => {
  const now = new Date();
  return events.value
    .filter(e => e.startTime >= now)
    .sort((a, b) => a.startTime - b.startTime);
});

// Methods
const getAttendeeCount = (event) => {
  return event.attendees?.length || 0;
};

const getVolunteerCount = (event) => {
  return event.volunteers?.length || 0;
};

const getCapacityClass = (event) => {
  const count = getAttendeeCount(event);
  const max = event.maxCount || 10;
  const percentage = (count / max) * 100;

  if (percentage >= 100) return 'full';
  if (percentage >= 75) return 'warning';
  return 'available';
};

const formatDay = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
};

const formatDateNum = (date) => {
  if (!date) return '';
  return date.getDate();
};

const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const getRoleIcon = (role) => {
  const icons = {
    beneficiary: '🌟',
    caregiver: '💜',
    volunteer: '🤝',
    staff: '👔'
  };
  return icons[role] || '👤';
};

const getRoleClass = (role) => {
  const classes = {
    beneficiary: 'new',
    caregiver: 'update',
    volunteer: 'volunteer'
  };
  return classes[role] || 'new';
};

const formatRole = (role) => {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// Navigation
const goToEditEvent = (eventId) => {
  router.push(`/editevent/${eventId}`);
};

const goToUserManagement = () => {
  router.push('/user-management');
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
}

.greeting h1 {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
  line-height: 1.2;
}

.staff-badge {
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

.staff-badge strong {
  color: #1e293b;
  font-weight: 700;
}

/* Alert Banner */
.alert-banner {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fca5a5;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.alert-icon {
  font-size: 20px;
}

.alert-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alert-text strong {
  font-size: 13px;
  color: #991b1b;
  font-weight: 700;
}

.alert-text span {
  font-size: 11px;
  color: #b91c1c;
}

.alert-action {
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

/* Section */
.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.section-header .section-title {
  margin: 0;
}

.text-btn {
  color: #6366f1;
  font-weight: 600;
  font-size: 12px;
  text-decoration: none;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 14px 12px;
  border: 2px solid;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card.primary {
  border-color: #bfdbfe;
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
}

.stat-card.secondary {
  border-color: #ddd6fe;
  background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
}

.stat-card.accent {
  border-color: #d1fae5;
  background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%);
}

.stat-icon {
  font-size: 24px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
  margin: 0;
}

/* Event List */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  align-items: center;
}

.event-date {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
}

.date-day {
  font-size: 9px;
  font-weight: 700;
  opacity: 0.9;
}

.date-num {
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meta {
  font-size: 11px;
  color: #64748b;
  margin: 0 0 6px 0;
}

.event-status {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 700;
}

.status-badge.full {
  background: #d1fae5;
  color: #059669;
}

.status-badge.warning {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.available {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.volunteers {
  background: #f3e8ff;
  color: #7c3aed;
}

.event-action {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}

.no-events {
  text-align: center;
  padding: 30px 20px;
  background: white;
  border-radius: 12px;
  color: #64748b;
  font-size: 13px;
  border: 1px solid #e2e8f0;
}

/* Tools Grid */
.tools-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.tool-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.tool-card.create-event {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border: 2px solid #6366f1;
}

.tool-icon {
  font-size: 18px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 8px;
  flex-shrink: 0;
}

.tool-card.create-event .tool-icon {
  background: white;
}

.tool-content {
  flex: 1;
  min-width: 0;
}

.tool-content h4 {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px 0;
}

.tool-content p {
  font-size: 10px;
  color: #64748b;
  margin: 0;
}

.tool-arrow {
  font-size: 14px;
  color: #94a3b8;
}

/* Activity Log */
.activity-log {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  background: white;
  border-radius: 10px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.activity-icon.new {
  background: #fef3c7;
}

.activity-icon.update {
  background: #f3e8ff;
}

.activity-icon.volunteer {
  background: #dbeafe;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 12px;
  color: #475569;
  margin: 0 0 2px 0;
  line-height: 1.4;
}

.activity-text strong {
  color: #0f172a;
}

.activity-time {
  font-size: 10px;
  color: #94a3b8;
}

.no-activity {
  text-align: center;
  padding: 30px 20px;
  background: white;
  border-radius: 12px;
  color: #64748b;
  font-size: 13px;
  border: 1px solid #e2e8f0;
}
</style>