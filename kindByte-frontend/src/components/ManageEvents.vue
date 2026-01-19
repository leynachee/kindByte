<template>
  <div class="page-container">
    <section class="welcome-section">
      <div class="greeting">
        <button @click="$router.go(-1)" class="back-link">← Back to Dashboard</button>
        <h1>Manage Events 📅</h1>
        <p class="staff-badge">
          <span class="badge-icon">📋</span>
          <strong>Consolidated View</strong> • {{ events.length }} Activities
        </p>
      </div>
    </section>

    <div class="section">
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ totalAttendees }}</h3>
            <p class="stat-label">Total Registrations</p>
          </div>
        </div>
        <div class="stat-card accent">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ activeEventsCount }}</h3>
            <p class="stat-label">Active Events</p>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3 class="section-title">All Events</h3>
        <router-link to="/createevent" class="text-btn">+ Create New</router-link>
      </div>

      <div v-if="loading" class="loading-box">
        <p>Fetching database...</p>
      </div>

      <div v-else class="event-list">
        <div v-for="event in events" :key="event.id" class="event-card">
          <div class="event-date">
            <span class="date-day">{{ getDayName(event.startTime) }}</span>
            <span class="date-num">{{ getDayNum(event.startTime) }}</span>
          </div>

          <div class="event-content">
            <h4 class="event-title">{{ event.name }}</h4>
            <p class="event-meta">📍 {{ event.location }}</p>
            <div class="event-status">
              <span class="status-badge volunteers">{{ event.type }}</span>
              <span class="status-badge" :class="event.attendeeCount >= event.maxCapacity ? 'full' : 'warning'">
                👥 {{ event.attendeeCount || 0 }}/{{ event.maxCapacity }} Joined
              </span>
            </div>
          </div>

          <div class="action-group">
            <button class="event-action" @click="editEvent(event.id)">Edit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const router = useRouter();
const events = ref([]);
const loading = ref(true);

// Fetch Logic
onMounted(async () => {
  try {
    // Try ordering by startTime instead of createdAt (more reliable)
    const q = query(collection(db, 'events'), orderBy('startTime', 'desc'));
    const snap = await getDocs(q);

    events.value = snap.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        // Map all fields from Firebase
        title: data.title || data.name || 'Untitled Event',
        description: data.description || '',
        location: data.location || 'TBA',
        maxCount: data.maxCount || 0,
        type: data.type || '',
        startTime: data.startTime?.toDate?.() || null,
        endTime: data.endTime?.toDate?.() || null,
        participantsID: data.participantsID || [],
        volunteersID: data.volunteersID || [],
        attendees: data.attendees || [],
        wheelchairAccessible: data.wheelchairAccessible || false,
        paymentNeeded: data.paymentNeeded || false,
        questionID: data.questionID || []
      };
    });

    console.log('Fetched events:', events.value); // Debug log
  } catch (error) {
    console.error('Error fetching events:', error);
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    events.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } finally {
    loading.value = false;
  }
});

// Stats - Fixed to use correct fields
const totalAttendees = computed(() => {
  return events.value.reduce((sum, e) => {
    const participants = e.participantsID?.length || 0;
    const volunteers = e.volunteersID?.length || 0;
    const attendees = e.attendees?.length || 0;
    return sum + participants + volunteers + attendees;
  }, 0);
});

const activeEventsCount = computed(() => {
  const now = new Date();
  return events.value.filter(e => {
    if (!e.startTime) return true; // Count events without date as active
    return new Date(e.startTime) >= now;
  }).length;
});

// Helper to get total joined
const getTotalJoined = (event) => {
  const participants = event.participantsID?.length || 0;
  const volunteers = event.volunteersID?.length || 0;
  return participants + volunteers;
};

// Helper to get status class
const getStatusClass = (event) => {
  const total = getTotalJoined(event);
  const max = event.maxCount || 0;
  if (max === 0) return 'warning';
  if (total >= max) return 'full';
  if (total >= max * 0.8) return 'warning';
  return 'available';
};

// Helpers for Date Badge
const toJsDate = (d) => {
  if (!d) return null;

  // Firestore Timestamp (has .toDate())
  if (typeof d === 'object' && typeof d.toDate === 'function') {
    return d.toDate();
  }

  // Milliseconds / seconds
  if (typeof d === 'number') {
    return d < 1e12 ? new Date(d * 1000) : new Date(d); // seconds vs ms
  }

  // String
  if (typeof d === 'string') {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  return null;
};

const getDayName = (d) => {
  const dt = toJsDate(d);
  return dt ? dt.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() : '—';
};

const getDayNum = (d) => {
  const dt = toJsDate(d);
  return dt ? dt.getDate() : '—';
};

// const getDayName = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
// const getDayNum = (d) => new Date(d).getDate();

const editEvent = (id) => router.push(`/editevent/${id}`);
</script>

<style scoped>
/* Reusing your StaffHome variables and classes */
.page-container {
  padding: 24px 20px 100px;
  max-width: 800px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
}

.welcome-section {
  margin-bottom: 24px;
}

.back-link {
  background: none;
  border: none;
  color: #6366f1;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 8px;
}

.greeting h1 {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.staff-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  margin-top: 4px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
  border: 2px solid;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card.primary {
  border-color: #bfdbfe;
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
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
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin: 0;
}

/* Section Styling */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.text-btn {
  color: #6366f1;
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
}

/* Event Cards */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 14px;
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
  min-width: 54px;
}

.date-day {
  font-size: 10px;
  font-weight: 700;
  opacity: 0.9;
}

.date-num {
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meta {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 8px;
}

.event-status {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
}

.status-badge.available {
  background: #d1fae5;
  color: #059669;
}

.status-badge.warning {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.full {
  background: #fee2e2;
  color: #dc2626;
}

.breakdown {
  font-size: 10px;
  color: #94a3b8;
}

.event-action {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.event-action:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Loading State */
.loading-box {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 16px;
}

.create-btn {
  display: inline-block;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
}

.welcome-section {
  margin-bottom: 24px;
}

.back-link {
  background: none;
  border: none;
  color: #6366f1;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 8px;
}

.greeting h1 {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.staff-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  margin-top: 4px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
  border: 2px solid;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card.primary {
  border-color: #bfdbfe;
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
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
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin: 0;
}

/* Section Styling */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.text-btn {
  color: #6366f1;
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
}

/* Event Cards (StaffHome Format) */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 14px;
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
  min-width: 54px;
}

.date-day {
  font-size: 10px;
  font-weight: 700;
  opacity: 0.9;
}

.date-num {
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}

.event-meta {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 8px;
}

.event-status {
  display: flex;
  gap: 6px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
}

.status-badge.volunteers {
  background: #ddd6fe;
  color: #7c3aed;
}

.status-badge.full {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.warning {
  background: #d1fae5;
  color: #059669;
}

.event-action {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
}

.event-action:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.loading-box {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  font-weight: 600;
}
</style>