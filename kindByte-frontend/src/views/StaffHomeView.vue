<template>
  <div class="staff-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>Staff Dashboard</h1>
      <p class="date-display">{{ currentDateDisplay }}</p>
    </div>

    <!-- Calendar Section -->
    <div class="calendar-section">
      <div class="calendar-header">
        <button @click="previousMonth" class="nav-btn">&lt;</button>
        <h2>{{ currentMonthYear }}</h2>
        <button @click="nextMonth" class="nav-btn">&gt;</button>
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
          <span v-if="hasActivities(date)" class="activity-indicator">{{ getActivityCount(date) }}</span>
        </div>
      </div>
    </div>

    <!-- Activities Section -->
    <div class="activities-section">
      <h2>Activities for {{ selectedDateDisplay }}</h2>
      
      <div v-if="filteredActivities.length === 0" class="no-activities">
        <p>No activities scheduled for this date.</p>
      </div>

      <div v-else class="activities-container">
        <div 
          v-for="activity in filteredActivities" 
          :key="activity.id"
          class="activity-card"
        >
          <div class="activity-header">
            <h3>{{ activity.name }}</h3>
            <span class="activity-time">{{ activity.time }}</span>
          </div>

          <div class="activity-details">
            <div class="detail-row">
              <span class="detail-label">Venue:</span>
              <span class="detail-value">{{ activity.venue }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Participants:</span>
              <span class="detail-value">{{ activity.participantsCount }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Volunteers:</span>
              <span class="detail-value">{{ activity.volunteersCount }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Volunteer Ratio:</span>
              <span class="detail-value" :class="{ 'ratio-warning': !checkVolunteerRatio(activity) }">
                1:{{ calculateRatio(activity) }}
                <span v-if="!checkVolunteerRatio(activity)" class="warning-badge">⚠ INSUFFICIENT</span>
                <span v-else class="success-badge">✓ GOOD</span>
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Accessibility:</span>
              <span class="detail-value">{{ activity.wheelchairAccessible ? 'Yes' : 'No' }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Caregiver Payment:</span>
              <span class="detail-value">{{ activity.caregiverPayment ? 'Required' : 'Not Required' }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Staff POC: Alice Tan</span>
              <span class="detail-value">{{ activity.staffPOC }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Contact Number: +65 9123 6767</span>
              <span class="detail-value">{{ activity.contactNumber }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Notes:</span>
              <span class="detail-value">{{ activity.notes || 'None' }}</span>
            </div>
          </div>

          <div class="activity-actions">
            <a 
              :href="activity.sheetUrl" 
              target="_blank" 
              rel="noopener noreferrer"
              class="sheet-button"
            >
              View Participant Details
            </a>
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
      
      // Sample activities data - replace with your actual data source
      activities: [
        {
          id: 1,
          name: 'Morning Yoga Class',
          date: new Date(2026, 0, 14), // Jan 14, 2026
          time: '9:00 AM - 10:00 AM',
          venue: 'Community Center Room A',
          participantsCount: 15,
          volunteersCount: 3,
          wheelchairAccessible: true,
          caregiverPayment: false,
          notes: 'Bring yoga mats',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/your-sheet-id-1'
        },
        {
          id: 2,
          name: 'Art Workshop',
          date: new Date(2026, 0, 14),
          time: '2:00 PM - 4:00 PM',
          venue: 'Arts Studio',
          participantsCount: 12,
          volunteersCount: 2,
          wheelchairAccessible: true,
          caregiverPayment: true,
          notes: 'Materials provided',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/your-sheet-id-2'
        },
        {
          id: 3,
          name: 'Music Therapy',
          date: new Date(2026, 0, 15),
          time: '10:00 AM - 11:30 AM',
          venue: 'Music Room',
          participantsCount: 8,
          volunteersCount: 2,
          wheelchairAccessible: true,
          caregiverPayment: false,
          notes: '',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/your-sheet-id-3'
        },
        {
          id: 4,
          name: 'Cooking Class',
          date: new Date(2026, 0, 16),
          time: '3:00 PM - 5:00 PM',
          venue: 'Kitchen Facility',
          participantsCount: 10,
          volunteersCount: 4,
          wheelchairAccessible: false,
          caregiverPayment: true,
          notes: 'Limited to 10 participants',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/your-sheet-id-4'
        }
      ]
    };
  },
  computed: {
    currentMonthYear() {
      return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    },
    currentDateDisplay() {
      return new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    },
    selectedDateDisplay() {
      return this.selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    },
    calendarDates() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const dates = [];
      const currentDate = new Date(startDate);
      
      for (let i = 0; i < 42; i++) {
        dates.push({
          date: new Date(currentDate),
          day: currentDate.getDate(),
          month: currentDate.getMonth(),
          year: currentDate.getFullYear(),
          isCurrentMonth: currentDate.getMonth() === month,
          key: currentDate.toISOString()
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return dates;
    },
    filteredActivities() {
      return this.activities.filter(activity => {
        return this.isSameDay(activity.date, this.selectedDate);
      });
    }
  },
  methods: {
    calculateRatio(activity) {
      // participants per volunteer
      if (!activity.volunteersCount) return '∞'
      return Math.ceil(activity.participantsCount / activity.volunteersCount)
    },
    checkVolunteerRatio(activity) {
      // Example rule: at least 1 volunteer per 5 participants
      if (!activity.volunteersCount) return false
      return (activity.participantsCount / activity.volunteersCount) <= 5
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
    },
    getActivityCount(date) {
      return this.activities.filter(activity => this.isSameDay(activity.date, date.date)).length;
    }
    
  }
};
</script>

<style scoped>
.staff-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 30px;
}

.dashboard-header h1 {
  color: #2c3e50;
  margin-bottom: 5px;
}

.date-display {
  color: #7f8c8d;
  font-size: 14px;
}

.calendar-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header h2 {
  color: #2c3e50;
  margin: 0;
}

.nav-btn {
  background: #84d65a;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 18px;
  color: white;
  transition: background 0.3s;
}

.nav-btn:hover {
  background: #6fb844;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-header {
  text-align: center;
  font-weight: bold;
  color: #2c3e50;
  padding: 10px;
  font-size: 14px;
}

.calendar-date {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.calendar-date:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

.calendar-date.other-month {
  color: #bdc3c7;
}

.calendar-date.selected {
  background: #84d65a;
  color: white;
  border-color: #84d65a;
}

.calendar-date.today {
  border: 2px solid #84d65a;
  font-weight: bold;
}

.calendar-date.has-activities .date-number {
  font-weight: bold;
}

.date-number {
  font-size: 16px;
}

.activity-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

.activities-section {
  margin-top: 30px;
}

.activities-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.no-activities {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  color: #7f8c8d;
}

.activities-container {
  display: grid;
  gap: 20px;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

.activities-container::-webkit-scrollbar {
  width: 8px;
}

.activities-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.activities-container::-webkit-scrollbar-thumb {
  background: #84d65a;
  border-radius: 4px;
}

.activity-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #84d65a;
}

.activity-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 22px;
}

.activity-time {
  color: #84d65a;
  font-weight: bold;
  font-size: 14px;
}

.activity-details {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
}

.detail-label {
  font-weight: bold;
  color: #2c3e50;
  min-width: 180px;
  font-size: 14px;
}

.detail-value {
  color: #555;
  flex: 1;
  font-size: 14px;
}

.activity-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ecf0f1;
}

.sheet-button {
  background: #84d65a;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sheet-button:hover {
  background: #6fb844;
}

@media (max-width: 768px) {
  .staff-dashboard {
    padding: 10px;
  }
  
  .calendar-section {
    padding: 15px;
  }
  
  .calendar-grid {
    gap: 4px;
  }
  
  .date-number {
    font-size: 14px;
  }
  
  .activity-card {
    padding: 16px;
  }
  
  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .detail-label {
    min-width: 150px;
  }
}
</style>