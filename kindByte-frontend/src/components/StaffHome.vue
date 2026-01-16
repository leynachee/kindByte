<template>
  <div class="page-container">
    <section class="welcome-section">
      <div class="greeting">
        <h1>Admin Console 🛡️</h1>
        <p class="staff-badge">
          <span class="badge-icon">👤</span>
          <strong>Staff Admin</strong> • MTC Central
        </p>
      </div>

    </section>

    <div class="alert-banner urgent">
      <div class="alert-content">
        <span class="alert-icon">🔔</span>
        <div class="alert-text">
          <strong>5 New Registrations</strong>
          <span>Pending approval</span>
        </div>
      </div>
      <button class="alert-action">Review →</button>
    </div>

    <div class="section">
      <h3 class="section-title">Overview</h3>
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3 class="stat-value">142</h3>
            <p class="stat-label">Beneficiaries</p>
            <span class="stat-change positive">+3 this week</span>
          </div>
        </div>

        <div class="stat-card secondary">
          <div class="stat-icon">🌟</div>
          <div class="stat-content">
            <h3 class="stat-value">28</h3>
            <p class="stat-label">Volunteers</p>
            <span class="stat-change positive">+2 this week</span>
          </div>
        </div>

        <div class="stat-card accent">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <h3 class="stat-value">12</h3>
            <p class="stat-label">Events This Week</p>
            <span class="stat-change neutral">3 pending</span>
          </div>
        </div>

        
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Admin Tools</h3>
      <div class="tools-grid">
        
        <!-- ✅ NEW: Create Event Button -->
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
            <p>Manage & edit events</p>
          </div>
          <span class="tool-arrow">→</span>
        </router-link>

        <router-link to="/user-management" class="tool-card">
          <div class="tool-icon">👥</div>
          <div class="tool-content">
            <h4>User Management</h4>
            <p>View all participants</p>
          </div>
          <span class="tool-arrow">→</span>
        </router-link>

        <router-link to="/attendance-report" class="tool-card">
          <div class="tool-icon">👥</div>
          <div class="tool-content">
            <h4>Attendance Report</h4>
            <p>Export to Excel</p>
          </div>
          <span class="tool-arrow">→</span>
        </router-link>
  
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Recent Activity</h3>
      <div class="activity-log">
        <div class="activity-item">
          <div class="activity-icon new">📝</div>
          <div class="activity-content">
            <p class="activity-text"><strong>Sarah Tan</strong> registered for Zumba Session</p>
            <span class="activity-time">5 minutes ago</span>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-icon update">✏️</div>
          <div class="activity-content">
            <p class="activity-text"><strong>John Lee (Staff)</strong> updated Art Workshop details</p>
            <span class="activity-time">23 minutes ago</span>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-icon cancel">❌</div>
          <div class="activity-content">
            <p class="activity-text"><strong>Mary Wong</strong> cancelled Swimming Session</p>
            <span class="activity-time">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Navigate to edit event page
const goToEditEvent = (eventId) => {
  router.push(`/editevent/${eventId}`)
}

const downloadReport = () => {
  console.log('Downloading attendance report...')
}

const exportToSheets = () => {
  console.log('Exporting to Google Sheets...')
}

const handleEmergency = () => {
  if (confirm('Are you sure you want to activate the emergency protocol?')) {
    console.log('Emergency protocol activated')
  }
}

const cancelAllEvents = () => {
  if (confirm('Are you sure you want to cancel all events today?')) {
    console.log('Cancelling all events...')
  }
}
</script>

<style scoped>
.page-container {
  padding: 24px 20px 100px;
  max-width: 800px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
}

/* Welcome Section */
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
  line-height: 1.2;
}

.staff-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.badge-icon {
  font-size: 16px;
}

.staff-badge strong {
  color: #1e293b;
  font-weight: 700;
}

.admin-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.badge-icon-large {
  font-size: 22px;
}

/* Alert Banner */
.alert-banner {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fca5a5;
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

.alert-icon {
  font-size: 22px;
}

.alert-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alert-text strong {
  font-size: 14px;
  color: #991b1b;
  font-weight: 700;
}

.alert-text span {
  font-size: 12px;
  color: #b91c1c;
}

.alert-action {
  background: #dc2626;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.alert-action:hover {
  background: #b91c1c;
}

/* Section */
.section {
  margin-bottom: 28px;
}

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
  margin: 0 0 14px 0;
}

.section-header .section-title {
  margin: 0;
}

.text-btn {
  color: #6366f1;
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
  border: 2px solid;
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.stat-card.warning {
  border-color: #fed7aa;
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
}

.stat-icon {
  font-size: 28px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin: 0;
}

.stat-change {
  font-size: 11px;
  font-weight: 600;
}

.stat-change.positive {
  color: #059669;
}

.stat-change.neutral {
  color: #64748b;
}

/* Event List */
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
  padding: 10px 12px;
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
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meta {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 6px 0;
}

.event-status {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
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

.status-badge.volunteers {
  background: #ddd6fe;
  color: #7c3aed;
}

.status-badge.alert {
  background: #fee2e2;
  color: #dc2626;
}

.event-action {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.event-action:hover {
  background: #e2e8f0;
}

/* Tools Grid - Alignment Fix */
.tools-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: stretch; /* Ensures all cards in a row are same height */
}

.tool-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
  position: relative;
  box-sizing: border-box; /* Crucial for alignment with different border widths */
  height: 100%; /* Fill the grid cell */
}

/* Create Event Card - Matching Height/Alignment */
.tool-card.create-event {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border: 2px solid #6366f1;
  /* Negative margin or padding adjustment not needed with border-box */
}

/* Tool icon size fix */
.tool-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 10px;
  flex-shrink: 0;
}

.tool-card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

/* ✅ Highlighted Create Event Card */


.tool-card.create-event:hover {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.tool-card.create-event .tool-icon {
  background: white;
}

.tool-content {
  flex: 1;
  min-width: 0;
}

.tool-content h4 {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px 0;
}

.tool-content p {
  font-size: 11px;
  color: #64748b;
  margin: 0;
}

.tool-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #dc2626;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 8px;
  min-width: 18px;
  text-align: center;
}

.tool-arrow {
  font-size: 16px;
  color: #94a3b8;
}

/* Emergency Section */
.emergency-section {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fca5a5;
  border-radius: 16px;
  padding: 20px;
}

.emergency-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.emergency-header .section-title {
  margin: 0;
  font-size: 16px;
}

.emergency-label {
  background: #dc2626;
  color: white;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.emergency-tools {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.emergency-btn {
  background: white;
  border: 2px solid #dc2626;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.emergency-btn:hover {
  background: #dc2626;
  color: white;
}

.emergency-btn.secondary {
  border-color: #f97316;
}

.emergency-btn.secondary:hover {
  background: #f97316;
  border-color: #f97316;
}

.emergency-icon {
  font-size: 24px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 10px;
  flex-shrink: 0;
}

.emergency-btn:hover .emergency-icon {
  background: rgba(255, 255, 255, 0.2);
}

.emergency-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.emergency-content strong {
  font-size: 14px;
  font-weight: 700;
}

.emergency-content span {
  font-size: 12px;
  opacity: 0.8;
}

/* Activity Log */
.activity-log {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  background: white;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.activity-icon.new {
  background: #dbeafe;
}

.activity-icon.update {
  background: #fef3c7;
}

.activity-icon.cancel {
  background: #fee2e2;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 13px;
  color: #475569;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.activity-text strong {
  color: #0f172a;
}

.activity-time {
  font-size: 11px;
  color: #94a3b8;
}
</style>