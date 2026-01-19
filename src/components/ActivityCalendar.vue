<template>
  <div class="page-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading activities...</p>
    </div>

    <template v-else>
      <header class="page-header">
        <h1>Activities Calendar</h1>
        <p>Browse and register for upcoming events</p>
      </header>

      <!-- View Toggle -->
      <div class="view-toggle">
        <button 
          :class="['toggle-btn', { active: viewMode === 'calendar' }]"
          @click="viewMode = 'calendar'"
        >
          📅 Calendar
        </button>
        <button 
          :class="['toggle-btn', { active: viewMode === 'list' }]"
          @click="viewMode = 'list'"
        >
          📋 List
        </button>
      </div>

      <!-- Calendar View -->
      <div v-if="viewMode === 'calendar'" class="calendar-section">
        <div class="calendar-header">
          <button class="nav-btn" @click="previousMonth">←</button>
          <h2 class="month-title">{{ currentMonthYear }}</h2>
          <button class="nav-btn" @click="nextMonth">→</button>
        </div>

        <div class="calendar-grid">
          <div class="day-header" v-for="day in weekdays" :key="day">{{ day }}</div>
          
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            :class="['calendar-day', {
              'other-month': !day.isCurrentMonth,
              'today': day.isToday,
              'has-events': day.events.length > 0,
              'selected': selectedDate && isSameDay(day.date, selectedDate)
            }]"
            @click="selectDate(day)"
          >
            <span class="day-number">{{ day.dayOfMonth }}</span>
            <div v-if="day.events.length > 0" class="event-dots">
              <span 
                v-for="(event, idx) in day.events.slice(0, 3)" 
                :key="idx"
                class="event-dot"
                :style="{ background: getEventColor(event.type) }"
              ></span>
            </div>
          </div>
        </div>

        <!-- Selected Day Events -->
        <div v-if="selectedDate" class="selected-day-section">
          <h3 class="selected-day-title">
            {{ formatSelectedDate }}
          </h3>
          <div v-if="selectedDayEvents.length > 0" class="selected-day-events">
            <div 
              v-for="event in selectedDayEvents" 
              :key="event.id"
              class="event-card compact"
              :style="{ borderLeftColor: getEventColor(event.type) }"
            >
              <div class="event-time">
                {{ formatTime(event.startTime) }}
              </div>
              <div class="event-content">
                <span class="event-type" :style="{ color: getEventColor(event.type) }">{{ event.type }}</span>
                <h4 class="event-title">{{ event.title }}</h4>
                <p class="event-location">📍 {{ event.location }}</p>
              </div>
              <button class="join-btn" @click="joinActivity(event)">
                Join
              </button>
            </div>
          </div>
          <div v-else class="no-events">
            <p>No activities scheduled for this day</p>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-if="viewMode === 'list'" class="list-section">
        <div class="filter-tabs">
          <button 
            v-for="filter in filters" 
            :key="filter.value"
            :class="['filter-tab', { active: selectedFilter === filter.value }]"
            @click="selectedFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>

        <div class="activity-list">
          <div 
            v-for="event in filteredActivities" 
            :key="event.id" 
            class="event-card"
            :style="{ borderLeftColor: getEventColor(event.type) }"
          >
            <div class="event-badge" :style="{ background: getEventColor(event.type) }">
              {{ getEventIcon(event.type) }}
            </div>
            <div class="event-details">
              <span class="event-type" :style="{ color: getEventColor(event.type) }">{{ event.type }}</span>
              <h3 class="event-title">{{ event.title }}</h3>
              <div class="event-meta">
                <span>📅 {{ formatDate(event.startTime) }} • {{ formatTime(event.startTime) }}</span>
                <span>📍 {{ event.location }}</span>
              </div>
              <div class="event-tags">
                <span v-if="event.wheelchairAccessible" class="tag accessible">♿ Accessible</span>
                <span v-if="event.paymentNeeded" class="tag paid">💰 Paid</span>
                <span class="tag spots">{{ getSpotsLeft(event) }} spots left</span>
              </div>
            </div>
            <button class="join-btn" @click="joinActivity(event)">
              Join
            </button>
          </div>
        </div>

        <div v-if="filteredActivities.length === 0" class="no-events">
          <p>No activities found</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';

// State
const router = useRouter();
const viewMode = ref('calendar');
const selectedFilter = ref('all');
const currentDate = ref(new Date());
const selectedDate = ref(null);
const loading = ref(true);
const activities = ref([]);

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Gym & Dance', value: 'gym & dance' },
  { label: 'Nature', value: 'nature' },
  { label: 'Outing', value: 'outing' },
  { label: 'Arts & Crafts', value: 'arts & crafts' },
];

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

// Fetch events from Firebase
const fetchEvents = async () => {
  try {
    loading.value = true;
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('startTime', 'asc'));
    const querySnapshot = await getDocs(q);
    
    activities.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to JS Date
      startTime: doc.data().startTime?.toDate?.() || new Date(doc.data().startTime),
      endTime: doc.data().endTime?.toDate?.() || new Date(doc.data().endTime)
    }));
    
    console.log('Fetched events:', activities.value);
  } catch (error) {
    console.error('Error fetching events:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchEvents();
});

// Format helpers
const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const formatDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const getSpotsLeft = (event) => {
  const attendeesCount = event.attendees?.length || 0;
  return Math.max(0, (event.maxCount || 0) - attendeesCount);
};

// Computed
const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  
  const firstDayOfWeek = firstDay.getDay();
  const lastDate = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();
  
  const days = [];
  
  // Previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevLastDate - i);
    days.push({
      date,
      dayOfMonth: prevLastDate - i,
      isCurrentMonth: false,
      isToday: false,
      events: []
    });
  }
  
  // Current month days
  for (let i = 1; i <= lastDate; i++) {
    const date = new Date(year, month, i);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const dayEvents = activities.value.filter(event => {
      if (!event.startTime) return false;
      return event.startTime.toDateString() === date.toDateString();
    });
    
    days.push({
      date,
      dayOfMonth: i,
      isCurrentMonth: true,
      isToday,
      events: dayEvents
    });
  }
  
  // Next month days to complete the grid
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      dayOfMonth: i,
      isCurrentMonth: false,
      isToday: false,
      events: []
    });
  }
  
  return days;
});

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return '';
  return selectedDate.value.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
});

const selectedDayEvents = computed(() => {
  if (!selectedDate.value) return [];
  return activities.value.filter(event => {
    if (!event.startTime) return false;
    return event.startTime.toDateString() === selectedDate.value.toDateString();
  });
});

const filteredActivities = computed(() => {
  if (selectedFilter.value === 'all') {
    return activities.value;
  }
  return activities.value.filter(event => 
    event.type?.toLowerCase().includes(selectedFilter.value.toLowerCase())
  );
});

// Methods
const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};

const selectDate = (day) => {
  if (day.isCurrentMonth) {
    selectedDate.value = day.date;
  }
};

const isSameDay = (date1, date2) => {
  return date1.toDateString() === date2.toDateString();
};

const joinActivity = (event) => {
  router.push({ name: 'ViewEvent', params: { id: event.id } });
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
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.page-header p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* View Toggle */
.view-toggle {
  display: flex;
  gap: 8px;
  background: white;
  padding: 4px;
  border-radius: 10px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
}

.toggle-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

/* Calendar Section */
.calendar-section {
  background: white;
  border-radius: 12px;
  padding: 12px;
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
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Calendar Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.day-header {
  text-align: center;
  font-weight: 700;
  font-size: 10px;
  color: #64748b;
  padding: 6px 0;
  text-transform: uppercase;
}

.calendar-day {
  aspect-ratio: 1;
  border-radius: 8px;
  border: 1.5px solid #f1f5f9;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  padding: 2px;
}

.calendar-day:hover {
  border-color: #cbd5e1;
  background: white;
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  border-color: #6366f1;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
}

.calendar-day.has-events {
  background: white;
  border-color: #c7d2fe;
}

.calendar-day.selected {
  border-color: #6366f1;
  background: #6366f1;
}

.calendar-day.selected .day-number {
  color: white;
  font-weight: 800;
}

.day-number {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.event-dots {
  display: flex;
  gap: 2px;
  position: absolute;
  bottom: 3px;
}

.event-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

/* Selected Day Section */
.selected-day-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.selected-day-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 10px 0;
}

.selected-day-events {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.no-events {
  text-align: center;
  padding: 20px;
  color: #64748b;
  font-size: 13px;
}

.no-events p {
  margin: 0;
}

/* List Section */
.list-section {
  padding-bottom: 20px;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.filter-tab.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Event Card */
.event-card {
  background: white;
  border-left: 4px solid;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-left-width: 4px;
}

.event-card.compact {
  padding: 10px;
}

.event-badge {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.event-time {
  min-width: 60px;
  text-align: center;
  font-weight: 700;
  color: #1e293b;
  font-size: 12px;
}

.event-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-type {
  font-weight: 800;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
}

.event-location {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #64748b;
}

.event-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.tag {
  padding: 2px 6px;
  border-radius: 4px;
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

.tag.spots {
  background: #f1f5f9;
  color: #64748b;
}

.join-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Responsive for smaller screens */
@media (max-width: 380px) {
  .page-container {
    padding: 12px;
  }

  .calendar-section {
    padding: 10px;
  }

  .calendar-grid {
    gap: 2px;
  }

  .day-number {
    font-size: 11px;
  }

  .event-card {
    flex-wrap: wrap;
  }

  .join-btn {
    width: 100%;
    margin-top: 8px;
  }
}
</style>