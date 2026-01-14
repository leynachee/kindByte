<template>
  <div class="page-container">
    <section class="welcome-section">
      <div class="greeting">
        <h1>Schedule Manager</h1>
        <p class="staff-badge">
          <span class="badge-icon">👤</span>
          <strong>Staff Admin</strong> • MTC Central
        </p>
      </div>
      <div class="admin-badge">
        <div class="badge-icon-large">📅</div>
      </div>
    </section>

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
              'has-activities': hasActivities(date)
            }]"
            @click="selectDate(date)"
          >
            <span class="date-number">{{ date.day }}</span>
            <span v-if="hasActivities(date)" class="activity-dot"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3 class="section-title">Activities for {{ selectedDateDisplay }}</h3>
        <span class="count-badge">{{ filteredActivities.length }} Events</span>
      </div>

      <div v-if="filteredActivities.length === 0" class="empty-state">
        <div class="empty-icon">🏖️</div>
        <p>No activities scheduled for this date.</p>
        <button class="action-btn-small">Create Event +</button>
      </div>

      <div v-else class="event-list">
        <div 
          v-for="activity in filteredActivities" 
          :key="activity.id"
          class="event-card"
        >
          <div class="event-date">
            <span class="date-day">{{ getDayName(activity.date) }}</span>
            <span class="date-num">{{ activity.date.getDate() }}</span>
          </div>

          <div class="event-content">
            <h4 class="event-title">{{ activity.name }}</h4>
            <p class="event-meta">{{ activity.time }} • {{ activity.venue }}</p>
            
            <div class="event-status">
              <span class="status-badge full">
                {{ activity.participantsCount }} Participants
              </span>
              <span 
                :class="['status-badge', checkVolunteerRatio(activity) ? 'volunteers' : 'alert']"
              >
                {{ activity.volunteersCount }} Vols (Ratio 1:{{ calculateRatio(activity) }})
              </span>
            </div>

            <div class="staff-details">
               <div class="detail-row">
                 <span>♿ {{ activity.wheelchairAccessible ? 'Accessible' : 'Not Accessible' }}</span>
                 <span>💰 {{ activity.caregiverPayment ? 'Paid' : 'Free' }}</span>
               </div>
               <a :href="activity.sheetUrl" target="_blank" class="sheet-link">View Sheet ↗</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StaffHomeView',
  data() {
    return {
      currentDate: new Date(),
      selectedDate: new Date(),
      dayHeaders: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      
      // Sample Data
      activities: [
        {
          id: 1,
          name: 'Morning Yoga Class',
          date: new Date(2026, 0, 14), 
          time: '09:00 AM',
          venue: 'Room A',
          participantsCount: 15,
          volunteersCount: 3,
          wheelchairAccessible: true,
          caregiverPayment: false,
          sheetUrl: '#'
        },
        {
          id: 2,
          name: 'Art Workshop',
          date: new Date(2026, 0, 14),
          time: '02:00 PM',
          venue: 'Arts Studio',
          participantsCount: 12,
          volunteersCount: 2,
          wheelchairAccessible: true,
          caregiverPayment: true,
          sheetUrl: '#'
        },
        {
          id: 3,
          name: 'Music Therapy',
          date: new Date(2026, 0, 15),
          time: '10:00 AM',
          venue: 'Music Room',
          participantsCount: 8,
          volunteersCount: 2,
          wheelchairAccessible: true,
          caregiverPayment: false,
          sheetUrl: '#'
        },
        {
          id: 4,
          name: 'Cooking Class',
          date: new Date(2026, 0, 16),
          time: '03:00 PM',
          venue: 'Kitchen',
          participantsCount: 10,
          volunteersCount: 1, // Intentional low count for "alert" style
          wheelchairAccessible: false,
          caregiverPayment: true,
          sheetUrl: '#'
        }
      ]
    };
  },
  computed: {
    currentMonthYear() {
      return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    },
    selectedDateDisplay() {
      return this.selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },
    calendarDates() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const dates = [];
      const currentDate = new Date(startDate);
      
      for (let i = 0; i < 42; i++) { // 6 weeks
        dates.push({
          date: new Date(currentDate),
          day: currentDate.getDate(),
          isCurrentMonth: currentDate.getMonth() === month,
          key: currentDate.toISOString()
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    },
    filteredActivities() {
      return this.activities.filter(activity => 
        this.isSameDay(activity.date, this.selectedDate)
      );
    }
  },
  methods: {
    getDayName(date) {
      return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    },
    calculateRatio(activity) {
      if (!activity.volunteersCount) return '∞';
      return Math.ceil(activity.participantsCount / activity.volunteersCount);
    },
    checkVolunteerRatio(activity) {
      // Rule: 1 volunteer per 5 participants
      if (!activity.volunteersCount) return false;
      return (activity.participantsCount / activity.volunteersCount) <= 5;
    },
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    },
    selectDate(date) {
      this.selectedDate = date.date;
    },
    isSelectedDate(date) {
      return this.isSameDay(date.date, this.selectedDate);
    },
    isToday(date) {
      return this.isSameDay(date.date, new Date());
    },
    isSameDay(date1, date2) {
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear();
    },
    hasActivities(date) {
      return this.activities.some(activity => this.isSameDay(activity.date, date.date));
    }
  }
};
</script>

<style scoped>
/* Core Page Style from StaffHome */
.page-container {
  padding: 24px 20px;
  /* max-width: 430px; Remove if you want full desktop width, keep for mobile preview */
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* Header Section */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.greeting h1 {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.staff-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.admin-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
}

.badge-icon-large { font-size: 22px; }

/* Calendar Card Styling */
.calendar-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
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
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: #475569;
  font-weight: bold;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.day-header {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  padding-bottom: 8px;
}

.calendar-date {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #1e293b;
  position: relative;
  transition: all 0.2s;
}

.calendar-date:hover { background: #f8fafc; }
.calendar-date.other-month { color: #cbd5e1; }

.calendar-date.today {
  border: 1px solid #0369a1;
  color: #0369a1;
  font-weight: 700;
}

.calendar-date.selected {
  background: #0f172a;
  color: white;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.3);
}

.activity-dot {
  width: 4px;
  height: 4px;
  background: #dc2626;
  border-radius: 50%;
  margin-top: 2px;
}

.calendar-date.selected .activity-dot { background: #fff; }

/* Activities Section */
.section { margin-bottom: 32px; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.count-badge {
  font-size: 12px;
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 12px;
  color: #475569;
  font-weight: 600;
}

/* Event Cards (Matching StaffHome) */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  display: flex;
  gap: 16px;
  transition: all 0.2s;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.06);
}

.event-date {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  height: fit-content;
}

.date-day { font-size: 10px; font-weight: 700; opacity: 0.8; }
.date-num { font-size: 22px; font-weight: 800; line-height: 1; }

.event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.event-meta {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.event-status {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.status-badge.full { background: #dbeafe; color: #1e40af; }
.status-badge.volunteers { background: #d1fae5; color: #047857; }
.status-badge.alert { background: #fee2e2; color: #b91c1c; }

/* Staff Specific Details */
.staff-details {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.detail-row {
  display: flex;
  gap: 10px;
  color: #64748b;
}

.sheet-link {
  color: #0369a1;
  text-decoration: none;
  font-weight: 600;
}

.sheet-link:hover { text-decoration: underline; }

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
}

.empty-icon { font-size: 32px; margin-bottom: 8px; }
.empty-state p { margin: 0 0 16px 0; color: #94a3b8; font-size: 14px; }

.action-btn-small {
  background: #f1f5f9;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  color: #475569;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}
</style>