<template>
    <div class="page-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading calendar...</p>
      </div>
  
      <template v-else>
        <section class="welcome-section">
          <div class="greeting">
            <h1>Schedule Manager 📅</h1>
            <p class="staff-badge">
              <span class="badge-icon">👤</span>
              <strong>{{ userName }}</strong> • Staff
            </p>
          </div>
        </section>
  
        <!-- Quick Stats -->
        <div class="quick-stats">
          <div class="stat-item">
            <span class="stat-num">{{ todayEvents.length }}</span>
            <span class="stat-label">Today</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ thisWeekEvents.length }}</span>
            <span class="stat-label">This Week</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ lowVolunteerEvents.length }}</span>
            <span class="stat-label">Need Volunteers</span>
          </div>
        </div>
  
        <div class="section">
          <div class="calendar-card">
            <div class="calendar-header">
              <button @click="previousMonth" class="nav-btn">←</button>
              <h2 class="month-title">{{ currentMonthYear }}</h2>
              <button @click="nextMonth" class="nav-btn">→</button>
            </div>
            
            <div class="calendar-grid">
              <div class="day-header" v-for="day in dayHeaders" :key="day">{{ day }}</div>
              <div 
                v-for="date in calendarDates" 
                :key="date.key"
                :class="['calendar-date', {
                  'other-month': !date.isCurrentMonth,
                  'selected': isSelectedDate(date),
                  'today': isToday(date),
                  'has-activities': hasActivities(date),
                  'has-alerts': hasAlerts(date)
                }]"
                @click="selectDate(date)"
              >
                <span class="date-number">{{ date.day }}</span>
                <div v-if="hasActivities(date)" class="activity-indicators">
                  <span class="activity-dot" :class="{ alert: hasAlerts(date) }"></span>
                  <span v-if="getEventCount(date) > 1" class="event-count">{{ getEventCount(date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="section">
          <div class="section-header">
            <h3 class="section-title">{{ selectedDateDisplay }}</h3>
            <span class="count-badge">{{ filteredActivities.length }} Event{{ filteredActivities.length !== 1 ? 's' : '' }}</span>
          </div>
  
          <div v-if="filteredActivities.length === 0" class="empty-state">
            <div class="empty-icon">🏖️</div>
            <p>No activities scheduled for this date.</p>
            <router-link to="/createevent" class="action-btn-small">Create Event +</router-link>
          </div>
  
          <div v-else class="event-list">
            <div 
              v-for="activity in filteredActivities" 
              :key="activity.id"
              class="event-card"
              :class="{ 'alert-border': !checkVolunteerRatio(activity) }"
            >
              <div class="event-date-badge">
                <span class="date-day">{{ getDayName(activity.startTime) }}</span>
                <span class="date-num">{{ activity.startTime.getDate() }}</span>
              </div>
  
              <div class="event-content">
                <div class="event-header">
                  <h4 class="event-title">{{ activity.title }}</h4>
                  <span v-if="!checkVolunteerRatio(activity)" class="alert-tag">⚠️ Low Volunteers</span>
                </div>
                <p class="event-meta">{{ formatTime(activity.startTime) }} - {{ formatTime(activity.endTime) }} • {{ activity.location }}</p>
                
                <div class="event-status">
                  <span class="status-badge participants">
                    👥 {{ getAttendeeCount(activity) }}/{{ activity.maxCount }} Participants
                  </span>
                  <span 
                    :class="['status-badge', checkVolunteerRatio(activity) ? 'volunteers-ok' : 'volunteers-alert']"
                  >
                    🤝 {{ getVolunteerCount(activity) }} Vol{{ getVolunteerCount(activity) !== 1 ? 's' : '' }} (1:{{ calculateRatio(activity) }})
                  </span>
                </div>
  
                <div class="staff-details">
                  <div class="detail-row">
                    <span :class="activity.wheelchairAccessible ? 'detail-ok' : 'detail-warn'">
                      ♿ {{ activity.wheelchairAccessible ? 'Accessible' : 'Not Accessible' }}
                    </span>
                    <span>💰 {{ activity.paymentNeeded ? 'Paid' : 'Free' }}</span>
                  </div>
                  <div class="action-buttons">
                    <button class="btn-small" @click="viewEventDetails(activity)">View</button>
                    <button class="btn-small primary" @click="editEvent(activity)">Edit</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Alerts Section -->
        <div v-if="lowVolunteerEvents.length > 0" class="section">
          <div class="section-header">
            <h3 class="section-title">⚠️ Needs Attention</h3>
          </div>
          <div class="alert-list">
            <div 
              v-for="event in lowVolunteerEvents.slice(0, 3)" 
              :key="event.id"
              class="alert-card"
            >
              <div class="alert-info">
                <strong>{{ event.title }}</strong>
                <span>{{ formatShortDate(event.startTime) }} • Only {{ getVolunteerCount(event) }} volunteer{{ getVolunteerCount(event) !== 1 ? 's' : '' }}</span>
              </div>
              <button class="btn-small alert" @click="editEvent(event)">Add Volunteers</button>
            </div>
          </div>
        </div>
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
  const currentDate = ref(new Date());
  const selectedDate = ref(new Date());
  const events = ref([]);
  
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Fetch data on mount
  onMounted(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserData(user.uid);
        await fetchEvents();
      }
      loading.value = false;
    });
  });
  
  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        userName.value = userDoc.data().name || 'Staff';
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      userName.value = 'Staff';
    }
  };
  
  const fetchEvents = async () => {
    try {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      
      events.value = eventsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate?.() || new Date(data.startTime),
          endTime: data.endTime?.toDate?.() || new Date(data.endTime)
        };
      });
  
      console.log('Fetched events:', events.value);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  
  // Computed
  const currentMonthYear = computed(() => {
    return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });
  
  const selectedDateDisplay = computed(() => {
    return selectedDate.value.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    });
  });
  
  const calendarDates = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      dates.push({
        date: new Date(current),
        day: current.getDate(),
        isCurrentMonth: current.getMonth() === month,
        key: current.toISOString()
      });
      current.setDate(current.getDate() + 1);
    }
    return dates;
  });
  
  const filteredActivities = computed(() => {
    return events.value
      .filter(event => isSameDay(event.startTime, selectedDate.value))
      .sort((a, b) => a.startTime - b.startTime);
  });
  
  const todayEvents = computed(() => {
    const today = new Date();
    return events.value.filter(event => isSameDay(event.startTime, today));
  });
  
  const thisWeekEvents = computed(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
  
    return events.value.filter(event => 
      event.startTime >= startOfWeek && event.startTime < endOfWeek
    );
  });
  
  const lowVolunteerEvents = computed(() => {
    const now = new Date();
    return events.value
      .filter(event => {
        if (event.startTime < now) return false;
        return !checkVolunteerRatio(event);
      })
      .sort((a, b) => a.startTime - b.startTime);
  });
  
  // Methods
  const getAttendeeCount = (event) => {
    return event.attendees?.length || 0;
  };
  
  const getVolunteerCount = (event) => {
    return event.volunteers?.length || 0;
  };
  
  const calculateRatio = (activity) => {
    const volunteers = getVolunteerCount(activity);
    const participants = getAttendeeCount(activity);
    if (!volunteers) return '∞';
    if (!participants) return '0';
    return Math.ceil(participants / volunteers);
  };
  
  const checkVolunteerRatio = (activity) => {
    const volunteers = getVolunteerCount(activity);
    const participants = getAttendeeCount(activity);
    if (!participants) return true;
    if (!volunteers) return false;
    return (participants / volunteers) <= 5;
  };
  
  const previousMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1);
  };
  
  const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
  };
  
  const selectDate = (date) => {
    selectedDate.value = date.date;
  };
  
  const isSelectedDate = (date) => {
    return isSameDay(date.date, selectedDate.value);
  };
  
  const isToday = (date) => {
    return isSameDay(date.date, new Date());
  };
  
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };
  
  const hasActivities = (date) => {
    return events.value.some(event => isSameDay(event.startTime, date.date));
  };
  
  const hasAlerts = (date) => {
    return events.value.some(event => 
      isSameDay(event.startTime, date.date) && !checkVolunteerRatio(event)
    );
  };
  
  const getEventCount = (date) => {
    return events.value.filter(event => isSameDay(event.startTime, date.date)).length;
  };
  
  const getDayName = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
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
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const viewEventDetails = (event) => {
    router.push({ name: 'ViewEvent', params: { id: event.id } });
  };
  
  const editEvent = (event) => {
    router.push({ name: 'EditEvent', params: { id: event.id } });
  };
  </script>
  
  <style scoped>
  .page-container {
    padding: 16px;
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
  
  /* Header Section */
  .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  
  .greeting h1 {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px 0;
  }
  
  .staff-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #64748b;
    font-size: 12px;
    margin: 0;
  }
  
  .badge-icon {
    font-size: 12px;
  }
  
  .staff-badge strong {
    color: #1e293b;
    font-weight: 700;
  }
  
  /* Quick Stats */
  .quick-stats {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
  }
  
  .stat-item {
    flex: 1;
    background: white;
    border-radius: 12px;
    padding: 12px;
    text-align: center;
    border: 1px solid #e2e8f0;
  }
  
  .stat-num {
    display: block;
    font-size: 22px;
    font-weight: 800;
    color: #6366f1;
    line-height: 1;
  }
  
  .stat-label {
    display: block;
    font-size: 10px;
    color: #64748b;
    margin-top: 4px;
    font-weight: 600;
  }
  
  /* Calendar Card */
  .calendar-card {
    background: white;
    border-radius: 14px;
    padding: 14px;
    border: 1px solid #e2e8f0;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .month-title {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }
  
  .nav-btn {
    background: #f1f5f9;
    border: none;
    border-radius: 8px;
    width: 32px;
    height: 32px;
    cursor: pointer;
    color: #475569;
    font-weight: bold;
    font-size: 14px;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }
  
  .day-header {
    text-align: center;
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
    padding-bottom: 6px;
    text-transform: uppercase;
  }
  
  .calendar-date {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    color: #1e293b;
    position: relative;
    transition: all 0.2s;
    font-weight: 600;
  }
  
  .calendar-date:hover {
    background: #f8fafc;
  }
  
  .calendar-date.other-month {
    color: #cbd5e1;
    font-weight: 400;
  }
  
  .calendar-date.today {
    border: 2px solid #6366f1;
    color: #6366f1;
    font-weight: 700;
  }
  
  .calendar-date.selected {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
  }
  
  .calendar-date.has-alerts:not(.selected) {
    background: #fef2f2;
  }
  
  .activity-indicators {
    display: flex;
    align-items: center;
    gap: 2px;
    position: absolute;
    bottom: 4px;
  }
  
  .activity-dot {
    width: 5px;
    height: 5px;
    background: #6366f1;
    border-radius: 50%;
  }
  
  .activity-dot.alert {
    background: #dc2626;
  }
  
  .calendar-date.selected .activity-dot {
    background: #fff;
  }
  
  .event-count {
    font-size: 8px;
    font-weight: 700;
    color: #64748b;
  }
  
  .calendar-date.selected .event-count {
    color: rgba(255, 255, 255, 0.8);
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
  
  .section-title {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }
  
  .count-badge {
    font-size: 11px;
    background: #e2e8f0;
    padding: 4px 10px;
    border-radius: 10px;
    color: #475569;
    font-weight: 600;
  }
  
  /* Event Cards */
  .event-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .event-card {
    background: white;
    border-radius: 14px;
    padding: 14px;
    border: 1px solid #e2e8f0;
    display: flex;
    gap: 12px;
  }
  
  .event-card.alert-border {
    border-color: #fca5a5;
    background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
  }
  
  .event-date-badge {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border-radius: 10px;
    padding: 10px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 46px;
    height: fit-content;
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
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  
  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }
  
  .event-title {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    line-height: 1.2;
  }
  
  .alert-tag {
    background: #fee2e2;
    color: #dc2626;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 6px;
    white-space: nowrap;
  }
  
  .event-meta {
    font-size: 11px;
    color: #64748b;
    margin: 0;
  }
  
  .event-status {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
  }
  
  .status-badge {
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
  }
  
  .status-badge.participants {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .status-badge.volunteers-ok {
    background: #d1fae5;
    color: #047857;
  }
  
  .status-badge.volunteers-alert {
    background: #fee2e2;
    color: #b91c1c;
  }
  
  /* Staff Details */
  .staff-details {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .detail-row {
    display: flex;
    gap: 10px;
    font-size: 10px;
    color: #64748b;
  }
  
  .detail-ok {
    color: #059669;
  }
  
  .detail-warn {
    color: #d97706;
  }
  
  .action-buttons {
    display: flex;
    gap: 6px;
  }
  
  .btn-small {
    background: #f1f5f9;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
  }
  
  .btn-small.primary {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
  }
  
  .btn-small.alert {
    background: #dc2626;
    color: white;
  }
  
  /* Alert List */
  .alert-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .alert-card {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  
  .alert-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }
  
  .alert-info strong {
    font-size: 13px;
    color: #991b1b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .alert-info span {
    font-size: 11px;
    color: #b91c1c;
  }
  
  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    background: white;
    border-radius: 14px;
    border: 2px dashed #e2e8f0;
  }
  
  .empty-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  .empty-state p {
    margin: 0 0 16px 0;
    color: #94a3b8;
    font-size: 13px;
  }
  
  .action-btn-small {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    color: white;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
  }
  </style>