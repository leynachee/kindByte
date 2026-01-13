<template>
    <div class="page-container">
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
                :style="{ background: event.color }"
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
              :style="{ borderLeftColor: event.color }"
            >
              <div class="event-time">
                {{ event.time }}
              </div>
              <div class="event-content">
                <span class="event-type" :style="{ color: event.color }">{{ event.type }}</span>
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
            v-for="act in filteredActivities" 
            :key="act.id" 
            class="event-card"
            :style="{ borderLeftColor: act.color }"
          >
            <div class="event-badge" :style="{ background: act.color }">
              {{ act.icon }}
            </div>
            <div class="event-details">
              <span class="event-type" :style="{ color: act.color }">{{ act.type }}</span>
              <h3 class="event-title">{{ act.title }}</h3>
              <div class="event-meta">
                <span>📅 {{ act.date }} • {{ act.time }}</span>
                <span>📍 {{ act.location }}</span>
              </div>
              <div class="event-tags">
                <span v-if="act.wheelchairAccessible" class="tag accessible">♿ Accessible</span>
                <span v-if="act.requiresPayment" class="tag paid">💰 Paid</span>
                <span class="tag spots">{{ act.spotsLeft }} spots left</span>
              </div>
            </div>
            <button class="join-btn" @click="joinActivity(act)">
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  // State
  const viewMode = ref('calendar');
  const selectedFilter = ref('all');
  const currentDate = ref(new Date());
  const selectedDate = ref(null);
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Gym & Dance', value: 'gym' },
    { label: 'Nature', value: 'nature' },
    { label: 'Outing', value: 'outing' },
    { label: 'Arts & Crafts', value: 'arts' },
  ];
  
  // Mock activities data - replace with API call
  const activities = ref([
    { 
      id: 1, 
      title: 'Bowling @ Yishun', 
      type: 'Gym & Dance', 
      color: '#db2777', 
      icon: '🎳',
      date: '2026-01-23', 
      time: '11:00 AM',
      location: 'Yishun Bowl',
      wheelchairAccessible: true,
      requiresPayment: true,
      spotsLeft: 5
    },
    { 
      id: 2, 
      title: 'Nature Walk', 
      type: 'Nature', 
      color: '#10b981', 
      icon: '🌳',
      date: '2026-01-24', 
      time: '09:30 AM',
      location: 'MacRitchie Reservoir',
      wheelchairAccessible: true,
      requiresPayment: false,
      spotsLeft: 8
    },
    { 
      id: 3, 
      title: 'Museum Visit', 
      type: 'Outing', 
      color: '#f59e0b', 
      icon: '🏛️',
      date: '2026-01-25', 
      time: '10:00 AM',
      location: 'National Museum',
      wheelchairAccessible: true,
      requiresPayment: true,
      spotsLeft: 3
    },
    { 
      id: 4, 
      title: 'Zumba Class', 
      type: 'Gym & Dance', 
      color: '#db2777', 
      icon: '💃',
      date: '2026-01-27', 
      time: '02:00 PM',
      location: 'MTC Central',
      wheelchairAccessible: false,
      requiresPayment: false,
      spotsLeft: 12
    },
    { 
      id: 5, 
      title: 'Art Workshop', 
      type: 'Arts & Crafts', 
      color: '#8b5cf6', 
      icon: '🎨',
      date: '2026-01-28', 
      time: '03:00 PM',
      location: 'MTC Tampines',
      wheelchairAccessible: true,
      requiresPayment: false,
      spotsLeft: 6
    },
    { 
      id: 6, 
      title: 'Gardens by the Bay', 
      type: 'Outing', 
      color: '#f59e0b', 
      icon: '🌺',
      date: '2026-01-30', 
      time: '09:45 AM',
      location: 'Flower Dome',
      wheelchairAccessible: true,
      requiresPayment: true,
      spotsLeft: 4
    },
  ]);
  
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
      
      const dayEvents = activities.value.filter(act => {
        const actDate = new Date(act.date);
        return actDate.toDateString() === date.toDateString();
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
    const remainingDays = 42 - days.length; // 6 rows * 7 days
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
    return activities.value.filter(act => {
      const actDate = new Date(act.date);
      return actDate.toDateString() === selectedDate.value.toDateString();
    });
  });
  
  const filteredActivities = computed(() => {
    if (selectedFilter.value === 'all') {
      return activities.value;
    }
    return activities.value.filter(act => 
      act.type.toLowerCase().includes(selectedFilter.value)
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
  
  const joinActivity = (activity) => {
    console.log('Joining activity:', activity);
    // Navigate to registration page or show modal
    // this.$router.push(`/register/${activity.id}`);
  };
  </script>
  
  <style scoped>
    .page-container {
      padding: 20px 16px;
      max-width: 100%;
      margin: 0 auto;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      min-height: 100vh;
      overflow-x: hidden;
    }
    
    /* Header */
    .page-header {
      margin-bottom: 20px;
    }
    
    .page-header h1 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 6px 0;
    }
    
    .page-header p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
    
    /* View Toggle */
    .view-toggle {
      display: flex;
      gap: 8px;
      background: white;
      padding: 5px;
      border-radius: 12px;
      margin-bottom: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    
    .toggle-btn {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
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
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
    }
    
    /* Calendar Section */
    .calendar-section {
      background: white;
      border-radius: 16px;
      padding: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      margin-bottom: 80px; /* Space for bottom nav */
    }
    
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .month-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    
    .nav-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: white;
      color: #64748b;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .nav-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #1e293b;
    }
    
    /* Calendar Grid */
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }
    
    .day-header {
      text-align: center;
      font-weight: 700;
      font-size: 11px;
      color: #64748b;
      padding: 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .calendar-day {
  aspect-ratio: 1;
  border-radius: 10px;
  border: 2px solid #f1f5f9;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Changed to center */
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  padding: 4px;
}
    
    .calendar-day:hover {
      border-color: #cbd5e1;
      background: white;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
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
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin: 0; /* Removed margin-bottom */
}

.event-dots {
  display: flex;
  gap: 2px;
  position: absolute; /* Changed to absolute positioning */
  bottom: 4px; /* Position at bottom */
}

.event-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}
    
    /* Selected Day Section */
    .selected-day-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #f1f5f9;
    }
    
    .selected-day-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 12px 0;
    }
    
    .selected-day-events {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .no-events {
      text-align: center;
      padding: 24px;
      color: #64748b;
      font-size: 14px;
    }
    
    .no-events p {
      margin: 0;
    }
    
    /* List Section */
    .list-section {
      margin-bottom: 80px; /* Space for bottom nav */
    }
    
    /* Filter Tabs */
    .filter-tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 16px;
      overflow-x: auto;
      padding-bottom: 4px;
      -webkit-overflow-scrolling: touch;
    }
    
    .filter-tabs::-webkit-scrollbar {
      display: none;
    }
    
    .filter-tab {
      padding: 8px 14px;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
      background: white;
      color: #64748b;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
    }
    
    .filter-tab:hover {
      border-color: #cbd5e1;
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
      gap: 12px;
    }
    
    /* Event Card */
    .event-card {
      background: white;
      border-left: 5px solid;
      border-radius: 14px;
      padding: 16px;
      display: flex;
      gap: 12px;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
      border-left-width: 5px;
      transition: all 0.2s;
    }
    
    .event-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    .event-card.compact {
      padding: 14px;
    }
    
    .event-badge {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
      opacity: 0.9;
    }
    
    .event-time {
      min-width: 70px;
      text-align: center;
      font-weight: 700;
      color: #1e293b;
      font-size: 14px;
    }
    
    .event-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 5px;
      min-width: 0;
    }
    
    .event-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    
    .event-type {
      font-weight: 900;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .event-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      line-height: 1.3;
    }
    
    .event-location {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }
    
    .event-meta {
      display: flex;
      flex-direction: column;
      gap: 3px;
      font-size: 13px;
      color: #64748b;
    }
    
    .event-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 4px;
    }
    
    .tag {
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
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
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
      white-space: nowrap;
      flex-shrink: 0;
    }
    
    .join-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    
    /* Responsive */
    @media (max-width: 400px) {
      .page-container {
        padding: 16px 12px;
      }
    
      .calendar-section {
        padding: 12px;
      }
    
      .calendar-grid {
        gap: 3px;
      }
    
      .day-header {
        font-size: 10px;
        padding: 6px 0;
      }
    
      .day-number {
        font-size: 12px;
      }
    
      .event-card {
        flex-wrap: wrap;
      }
    
      .join-btn {
        width: 100%;
      }
    }
    </style>