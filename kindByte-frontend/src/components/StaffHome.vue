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
        <div class="admin-badge">
          <div class="badge-icon-large">⚙️</div>
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
  
          <div class="stat-card warning">
            <div class="stat-icon">👨‍👩‍👧</div>
            <div class="stat-content">
              <h3 class="stat-value">67</h3>
              <p class="stat-label">Caregivers</p>
              <span class="stat-change positive">+1 this week</span>
            </div>
          </div>
        </div>
      </div>
  
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Upcoming Events</h3>
          <router-link to="/staff-events" class="text-btn">View All →</router-link>
        </div>
  
        <div class="event-list">
          <div class="event-card">
            <div class="event-date">
              <span class="date-day">FRI</span>
              <span class="date-num">24</span>
            </div>
            <div class="event-content">
              <h4 class="event-title">Zumba Session</h4>
              <p class="event-meta">10:00 AM • MTC Central</p>
              <div class="event-status">
                <span class="status-badge full">18/20 registered</span>
                <span class="status-badge volunteers">3 volunteers</span>
              </div>
            </div>
            <button class="event-action">Manage</button>
          </div>
  
          <div class="event-card">
            <div class="event-date">
              <span class="date-day">SAT</span>
              <span class="date-num">25</span>
            </div>
            <div class="event-content">
              <h4 class="event-title">Art Workshop</h4>
              <p class="event-meta">2:00 PM • MTC Tampines</p>
              <div class="event-status">
                <span class="status-badge warning">12/15 registered</span>
                <span class="status-badge alert">Needs volunteers</span>
              </div>
            </div>
            <button class="event-action">Manage</button>
          </div>
        </div>
      </div>
  
      <div class="section">
        <h3 class="section-title">Admin Tools</h3>
        <div class="tools-grid">
          <router-link to="/staff-calendar" class="tool-card">
            <div class="tool-icon">📅</div>
            <div class="tool-content">
              <h4>Manage Calendar</h4>
              <p>Create & edit events</p>
            </div>
            <span class="tool-arrow">→</span>
          </router-link>
  
          <router-link to="/staff-users" class="tool-card">
            <div class="tool-icon">👥</div>
            <div class="tool-content">
              <h4>User Management</h4>
              <p>View all participants</p>
            </div>
            <span class="tool-arrow">→</span>
          </router-link>
  
          <button class="tool-card" @click="downloadReport">
            <div class="tool-icon">📊</div>
            <div class="tool-content">
              <h4>Attendance Report</h4>
              <p>Export to Excel</p>
            </div>
            <span class="tool-arrow">→</span>
          </button>
  
          <button class="tool-card" @click="exportToSheets">
            <div class="tool-icon">📑</div>
            <div class="tool-content">
              <h4>Google Sheets Export</h4>
              <p>Sync registrations</p>
            </div>
            <span class="tool-arrow">→</span>
          </button>
  
          <router-link to="/staff-registrations" class="tool-card">
            <div class="tool-icon">✅</div>
            <div class="tool-content">
              <h4>Registrations</h4>
              <p>Review & approve</p>
            </div>
            <span class="tool-badge">5</span>
            <span class="tool-arrow">→</span>
          </router-link>
  
          <router-link to="/staff-payments" class="tool-card">
            <div class="tool-icon">💳</div>
            <div class="tool-content">
              <h4>Payment Tracking</h4>
              <p>Caregiver payments</p>
            </div>
            <span class="tool-arrow">→</span>
          </router-link>
        </div>
      </div>
  
      <div class="section emergency-section">
        <div class="emergency-header">
          <h3 class="section-title">⚠️ Emergency Actions</h3>
          <span class="emergency-label">Use with caution</span>
        </div>
        <div class="emergency-tools">
          <button class="emergency-btn" @click="handleEmergency">
            <span class="emergency-icon">🚨</span>
            <div class="emergency-content">
              <strong>Emergency Protocol</strong>
              <span>Notify all staff & caregivers</span>
            </div>
          </button>
          <button class="emergency-btn secondary" @click="cancelAllEvents">
            <span class="emergency-icon">❌</span>
            <div class="emergency-content">
              <strong>Cancel Day's Events</strong>
              <span>Send notifications to all</span>
            </div>
          </button>
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
  const downloadReport = () => {
    // Export attendance report logic
    console.log('Downloading attendance report...');
  };
  
  const exportToSheets = () => {
    // Google Sheets export logic
    console.log('Exporting to Google Sheets...');
  };
  
  const handleEmergency = () => {
    // Emergency protocol logic
    if (confirm('Are you sure you want to activate the emergency protocol?')) {
      console.log('Emergency protocol activated');
    }
  };
  
  const cancelAllEvents = () => {
    // Cancel all events logic
    if (confirm('Are you sure you want to cancel all events today?')) {
      console.log('Cancelling all events...');
    }
  };
  </script>
  
  <style scoped>
  .page-container {
    padding: 24px 20px;
    max-width: 800px;
    margin: 0 auto;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
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
    font-size: 28px;
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
    font-size: 15px;
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
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
  }
  
  .badge-icon-large {
    font-size: 24px;
  }
  
  /* Alert Banner */
  .alert-banner {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border: 2px solid #fca5a5;
    border-radius: 16px;
    padding: 18px 20px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1);
  }
  
  .alert-content {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
  }
  
  .alert-icon {
    font-size: 24px;
  }
  
  .alert-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .alert-text strong {
    font-size: 15px;
    color: #991b1b;
    font-weight: 700;
  }
  
  .alert-text span {
    font-size: 13px;
    color: #b91c1c;
  }
  
  .alert-action {
    background: #dc2626;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  
  .alert-action:hover {
    background: #b91c1c;
    transform: translateY(-1px);
  }
  
  /* Section */
  .section {
    margin-bottom: 32px;
  }
  
  .section-title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 16px 0;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .text-btn {
    color: #1e293b;
    font-weight: 600;
    font-size: 14px;
    text-decoration: none;
    transition: color 0.2s;
  }
  
  .text-btn:hover {
    color: #475569;
  }
  
  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin-bottom: 8px;
  }
  
  @media (min-width: 600px) {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    border: 2px solid;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
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
    font-size: 32px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .stat-value {
    font-size: 32px;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    line-height: 1;
  }
  
  .stat-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
    margin: 0;
  }
  
  .stat-change {
    font-size: 12px;
    font-weight: 600;
    margin-top: 4px;
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
    border-radius: 16px;
    padding: 18px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    display: flex;
    gap: 16px;
    align-items: center;
    transition: all 0.2s;
  }
  
  .event-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }
  
  .event-date {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: white;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
    box-shadow: 0 2px 8px rgba(30, 41, 59, 0.2);
  }
  
  .date-day {
    font-size: 11px;
    font-weight: 700;
    opacity: 0.8;
  }
  
  .date-num {
    font-size: 24px;
    font-weight: 800;
    line-height: 1;
  }
  
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
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  
  .status-badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
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
    background: #f8fafc;
    color: #1e293b;
    border: 1px solid #e2e8f0;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  
  .event-action:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
  
  /* Tools Grid */
  .tools-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  @media (min-width: 600px) {
    .tools-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .tool-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    color: inherit;
    position: relative;
  }
  
  .tool-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: #1e293b;
  }
  
  .tool-icon {
    font-size: 32px;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 12px;
    flex-shrink: 0;
  }
  
  .tool-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .tool-content h4 {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }
  
  .tool-content p {
    font-size: 13px;
    color: #64748b;
    margin: 0;
  }
  
  .tool-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: #dc2626;
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 10px;
    min-width: 20px;
    text-align: center;
  }
  
  .tool-arrow {
    font-size: 20px;
    color: #94a3b8;
    transition: transform 0.2s;
  }
  
  .tool-card:hover .tool-arrow {
    transform: translateX(4px);
    color: #1e293b;
  }
  
  /* Emergency Section */
  .emergency-section {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border: 2px solid #fca5a5;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
  }
  
  .emergency-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .emergency-label {
    background: #dc2626;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
  }
  
  .emergency-tools {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .emergency-btn {
    background: white;
    border: 2px solid #dc2626;
    border-radius: 14px;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    text-align: left;
  }
  
  .emergency-btn:hover {
    background: #dc2626;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }
  
  .emergency-btn.secondary {
    border-color: #f97316;
  }
  
  .emergency-btn.secondary:hover {
    background: #f97316;
    border-color: #f97316;
  }
  
  .emergency-icon {
    font-size: 28px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(220, 38, 38, 0.1);
    border-radius: 12px;
    flex-shrink: 0;
  }
  
  .emergency-btn:hover .emergency-icon {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .emergency-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .emergency-content strong {
    font-size: 16px;
    font-weight: 700;
  }
  
  .emergency-content span {
    font-size: 13px;
    opacity: 0.8;
  }
  
  /* Activity Log */
  .activity-log {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .activity-item {
    background: white;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #e2e8f0;
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  
  .activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
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
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .activity-text {
    font-size: 14px;
    color: #1e293b;
    margin: 0;
  }
  
  .activity-text strong {
    font-weight: 700;
  }
  
  .activity-time {
    font-size: 12px;
    color: #94a3b8;
  }
  
  /* Responsive */
  @media (max-width: 400px) {
    .page-container {
      padding: 20px 16px;
    }
    
    .greeting h1 {
      font-size: 24px;
    }
    
    .alert-banner {
      flex-direction: column;
      align-items: stretch;
    }
    
    .event-card {
      flex-wrap: wrap;
    }
  }
  </style>