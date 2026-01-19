<template>
  <div class="page-container">
    <section class="welcome-section">
      <div class="greeting">
        <button @click="$router.push('/staffhome')" class="back-link">← Back to Dashboard</button>
        <h1>Attendance Report 📊</h1>
        <p class="staff-badge">
          <span class="badge-icon">📈</span>
          <strong>Data Export</strong> • MINDS Events
        </p>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="loading" class="loading-box">
      <div class="spinner"></div>
      <p>Loading report data...</p>
    </div>

    <template v-else>
      <!-- Stats Section -->
      <div class="section">
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <h3 class="stat-value">{{ events.length }}</h3>
              <p class="stat-label">Total Events</p>
            </div>
          </div>
          <div class="stat-card accent">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3 class="stat-value">{{ totalAttendees }}</h3>
              <p class="stat-label">Total Registrations</p>
            </div>
          </div>
          <div class="stat-card info">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3 class="stat-value">{{ totalParticipants }}</h3>
              <p class="stat-label">Participants</p>
            </div>
          </div>
          <div class="stat-card warning">
            <div class="stat-icon">🤝</div>
            <div class="stat-content">
              <h3 class="stat-value">{{ totalVolunteers }}</h3>
              <p class="stat-label">Volunteers</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Options -->
      <div class="alert-banner">
        <div class="alert-content">
          <span class="alert-icon">📄</span>
          <div class="alert-text">
            <strong>Excel Export Ready</strong>
            <span>Download full event registration data</span>
          </div>
        </div>
        <button @click="exportToExcel" class="alert-action" :disabled="events.length === 0">
          Export to Excel
        </button>
      </div>

      <!-- Filter Section -->
      <div class="section">
        <div class="filter-bar">
          <div class="filter-group">
            <label>Category</label>
            <select v-model="selectedCategory" class="filter-select">
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Status</label>
            <select v-model="selectedStatus" class="filter-select">
              <option value="">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Data Preview Section -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Data Preview</h3>
          <span class="record-count">{{ filteredEvents.length }} events</span>
        </div>
        
        <div v-if="filteredEvents.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>No events found</p>
        </div>

        <div v-else class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Category</th>
                <th>Joined</th>
                <th>Capacity</th>
                <th>Fill Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in filteredEvents" :key="event.id">
                <td class="event-name-cell">{{ event.title }}</td>
                <td>{{ formatDate(event.startTime) }}</td>
                <td>
                  <span class="category-badge" :class="getCategoryClass(event.type)">
                    {{ event.type || 'General' }}
                  </span>
                </td>
                <td class="count-cell">
                  <span class="joined-count">{{ getJoinedCount(event) }}</span>
                  <span class="breakdown-text">
                    ({{ event.participantsID?.length || 0 }}P + {{ event.volunteersID?.length || 0 }}V)
                  </span>
                </td>
                <td class="capacity-cell">{{ event.maxCount || 0 }}</td>
                <td>
                  <div class="fill-rate">
                    <div class="fill-bar">
                      <div 
                        class="fill-progress" 
                        :style="{ width: getFillRate(event) + '%' }"
                        :class="getFillRateClass(event)"
                      ></div>
                    </div>
                    <span class="fill-text">{{ getFillRate(event) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detailed Breakdown -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Category Breakdown</h3>
        </div>
        <div class="breakdown-grid">
          <div v-for="(count, category) in categoryBreakdown" :key="category" class="breakdown-card">
            <span class="breakdown-category">{{ category }}</span>
            <span class="breakdown-value">{{ count }} events</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

const events = ref([]);
const users = ref({});
const loading = ref(true);
const selectedCategory = ref('');
const selectedStatus = ref('');

const categories = ['Outings', 'MTC Office', 'Swimming Complex', 'Nature Walks', 'Gym and Dance', 'Reading'];

// Fetch events data
const fetchReportData = async () => {
  try {
    const q = query(collection(db, 'events'), orderBy('startTime', 'desc'));
    const snap = await getDocs(q);
    
    events.value = snap.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title || data.name || 'Untitled Event',
        description: data.description || '',
        location: data.location || 'TBA',
        type: data.type || 'General',
        maxCount: data.maxCount || 0,
        startTime: data.startTime?.toDate?.() || null,
        endTime: data.endTime?.toDate?.() || null,
        participantsID: data.participantsID || [],
        volunteersID: data.volunteersID || [],
        attendees: data.attendees || [],
        wheelchairAccessible: data.wheelchairAccessible || false,
        paymentNeeded: data.paymentNeeded || false
      };
    });

    // Fetch user details for all participants and volunteers
    const allUserIds = new Set();
    events.value.forEach(event => {
      event.participantsID.forEach(id => allUserIds.add(id));
      event.volunteersID.forEach(id => allUserIds.add(id));
    });

    // Batch fetch users
    for (const userId of allUserIds) {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          users.value[userId] = userDoc.data();
        }
      } catch (err) {
        console.error('Error fetching user:', userId, err);
      }
    }

    console.log('Fetched events:', events.value);
    console.log('Fetched users:', users.value);
  } catch (error) {
    console.error('Error fetching report data:', error);
  } finally {
    loading.value = false;
  }
};

// Computed values
const filteredEvents = computed(() => {
  let result = events.value;
  
  if (selectedCategory.value) {
    result = result.filter(e => e.type === selectedCategory.value);
  }
  
  if (selectedStatus.value) {
    const now = new Date();
    if (selectedStatus.value === 'upcoming') {
      result = result.filter(e => e.startTime && new Date(e.startTime) >= now);
    } else if (selectedStatus.value === 'past') {
      result = result.filter(e => e.startTime && new Date(e.startTime) < now);
    }
  }
  
  return result;
});

const totalAttendees = computed(() => {
  return events.value.reduce((sum, e) => {
    return sum + (e.participantsID?.length || 0) + (e.volunteersID?.length || 0);
  }, 0);
});

const totalParticipants = computed(() => {
  return events.value.reduce((sum, e) => sum + (e.participantsID?.length || 0), 0);
});

const totalVolunteers = computed(() => {
  return events.value.reduce((sum, e) => sum + (e.volunteersID?.length || 0), 0);
});

const categoryBreakdown = computed(() => {
  const breakdown = {};
  events.value.forEach(e => {
    const cat = e.type || 'General';
    breakdown[cat] = (breakdown[cat] || 0) + 1;
  });
  return breakdown;
});

// Helper functions
const getJoinedCount = (event) => {
  return (event.participantsID?.length || 0) + (event.volunteersID?.length || 0);
};

const getFillRate = (event) => {
  const joined = getJoinedCount(event);
  const max = event.maxCount || 1;
  return Math.round((joined / max) * 100);
};

const getFillRateClass = (event) => {
  const rate = getFillRate(event);
  if (rate >= 100) return 'full';
  if (rate >= 75) return 'high';
  if (rate >= 50) return 'medium';
  return 'low';
};

const getCategoryClass = (category) => {
  const classes = {
    'Outings': 'outings',
    'MTC Office': 'office',
    'Swimming Complex': 'swimming',
    'Nature Walks': 'nature',
    'Gym and Dance': 'gym',
    'Reading': 'reading'
  };
  return classes[category] || 'general';
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-SG', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-SG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Export to Excel with detailed data
const exportToExcel = () => {
  // Sheet 1: Event Summary
  const summaryData = filteredEvents.value.map(e => ({
    'Event Name': e.title,
    'Date': formatDate(e.startTime),
    'Start Time': e.startTime ? new Date(e.startTime).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    'End Time': e.endTime ? new Date(e.endTime).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    'Location': e.location,
    'Category': e.type,
    'Participants': e.participantsID?.length || 0,
    'Volunteers': e.volunteersID?.length || 0,
    'Total Joined': getJoinedCount(e),
    'Capacity': e.maxCount,
    'Fill Rate (%)': getFillRate(e),
    'Wheelchair Accessible': e.wheelchairAccessible ? 'Yes' : 'No',
    'Payment Required': e.paymentNeeded ? 'Yes' : 'No'
  }));

  // Sheet 2: Detailed Registrations
  const registrationData = [];
  filteredEvents.value.forEach(event => {
    // Add participants
    event.participantsID?.forEach(userId => {
      const user = users.value[userId];
      registrationData.push({
        'Event Name': event.title,
        'Event Date': formatDate(event.startTime),
        'User ID': userId,
        'User Name': user?.name || 'Unknown',
        'User Email': user?.email || 'Unknown',
        'Role': 'Participant',
        'Registration Type': user?.role || 'Unknown'
      });
    });
    
    // Add volunteers
    event.volunteersID?.forEach(userId => {
      const user = users.value[userId];
      registrationData.push({
        'Event Name': event.title,
        'Event Date': formatDate(event.startTime),
        'User ID': userId,
        'User Name': user?.name || 'Unknown',
        'User Email': user?.email || 'Unknown',
        'Role': 'Volunteer',
        'Registration Type': user?.role || 'Unknown'
      });
    });
  });

  // Create workbook with multiple sheets
  const workbook = XLSX.utils.book_new();
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Event Summary");
  
  if (registrationData.length > 0) {
    const registrationSheet = XLSX.utils.json_to_sheet(registrationData);
    XLSX.utils.book_append_sheet(workbook, registrationSheet, "Registrations");
  }

  // Download file
  const fileName = `MINDS_Attendance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

onMounted(fetchReportData);
</script>

<style scoped>
.page-container {
  padding: 24px 20px 100px;
  max-width: 800px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
}

.welcome-section { margin-bottom: 24px; }

.back-link { 
  background: none; 
  border: none; 
  color: #6366f1; 
  font-weight: 600; 
  cursor: pointer; 
  margin-bottom: 8px; 
  font-size: 13px;
  padding: 0;
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

/* Loading State */
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
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
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.record-count {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

/* Stats Grid */
.stats-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 12px; 
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

.stat-card.info { 
  border-color: #c7d2fe; 
  background: linear-gradient(135deg, #ffffff 0%, #eef2ff 100%); 
}

.stat-card.warning { 
  border-color: #fde68a; 
  background: linear-gradient(135deg, #ffffff 0%, #fefce8 100%); 
}

.stat-icon { font-size: 24px; }
.stat-value { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
.stat-label { font-size: 12px; color: #64748b; font-weight: 600; margin: 0; }

/* Alert Banner */
.alert-banner {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #86efac; 
  border-radius: 14px;
  padding: 16px; 
  margin-bottom: 24px;
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  gap: 12px;
}

.alert-content { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  flex: 1;
}

.alert-icon { font-size: 24px; }

.alert-text { 
  display: flex; 
  flex-direction: column; 
}

.alert-text strong { 
  font-size: 14px; 
  color: #166534; 
}

.alert-text span { 
  font-size: 12px; 
  color: #15803d; 
}

.alert-action {
  background: #10b981; 
  color: white; 
  border: none;
  padding: 10px 16px; 
  border-radius: 10px;
  font-weight: 700; 
  font-size: 13px; 
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.alert-action:hover:not(:disabled) {
  background: #059669;
}

.alert-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 12px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.filter-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  background: white;
}

.filter-select:focus {
  outline: none;
  border-color: #6366f1;
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
  margin: 0;
}

/* Table */
.table-container {
  background: white; 
  border-radius: 14px; 
  border: 1px solid #e2e8f0;
  overflow-x: auto;
}

.report-table { 
  width: 100%; 
  border-collapse: collapse; 
  text-align: left;
  min-width: 600px;
}

.report-table th {
  background: #f8fafc; 
  padding: 12px 14px;
  color: #64748b; 
  font-size: 10px; 
  font-weight: 700; 
  text-transform: uppercase;
  white-space: nowrap;
}

.report-table td { 
  padding: 12px 14px; 
  border-top: 1px solid #f1f5f9; 
  font-size: 13px; 
  color: #1e293b;
  vertical-align: middle;
}

.event-name-cell { 
  font-weight: 700;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.count-cell {
  white-space: nowrap;
}

.joined-count {
  font-weight: 700;
  color: #0f172a;
}

.breakdown-text {
  font-size: 10px;
  color: #94a3b8;
  margin-left: 4px;
}

/* Category Badges */
.category-badge {
  padding: 4px 8px; 
  border-radius: 8px; 
  font-size: 10px; 
  font-weight: 700;
  white-space: nowrap;
}

.category-badge.outings { background: #dbeafe; color: #1d4ed8; }
.category-badge.office { background: #f3e8ff; color: #7c3aed; }
.category-badge.swimming { background: #cffafe; color: #0891b2; }
.category-badge.nature { background: #dcfce7; color: #16a34a; }
.category-badge.gym { background: #fef3c7; color: #d97706; }
.category-badge.reading { background: #ffe4e6; color: #e11d48; }
.category-badge.general { background: #f1f5f9; color: #475569; }

/* Fill Rate */
.fill-rate {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fill-bar {
  width: 60px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.fill-progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.fill-progress.low { background: #94a3b8; }
.fill-progress.medium { background: #fbbf24; }
.fill-progress.high { background: #10b981; }
.fill-progress.full { background: #ef4444; }

.fill-text {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  min-width: 35px;
}

/* Breakdown Grid */
.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.breakdown-card {
  background: white;
  border-radius: 10px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.breakdown-category {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.breakdown-value {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}
</style>