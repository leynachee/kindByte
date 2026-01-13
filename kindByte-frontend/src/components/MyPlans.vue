<template>
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1>My Plans</h1>
          <p>Manage your registered activities</p>
        </div>
        <div class="quota-info">
          <span class="quota-label">Weekly Limit</span>
          <strong class="quota-value">1/4</strong>
        </div>
      </header>
  
      <!-- Tabs -->
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'upcoming' }]"
          @click="activeTab = 'upcoming'"
        >
          Upcoming
          <span class="tab-count">{{ upcomingPlans.length }}</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'past' }]"
          @click="activeTab = 'past'"
        >
          Past
          <span class="tab-count">{{ pastPlans.length }}</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'cancelled' }]"
          @click="activeTab = 'cancelled'"
        >
          Cancelled
          <span class="tab-count">{{ cancelledPlans.length }}</span>
        </button>
      </div>
  
      <!-- Upcoming Plans -->
      <div v-if="activeTab === 'upcoming'" class="plans-section">
        <div v-if="upcomingPlans.length === 0" class="empty-state">
          <div class="empty-icon">📅</div>
          <h3>No upcoming plans</h3>
          <p>Browse activities and register for events</p>
          <router-link to="/calendar" class="browse-btn">
            Browse Activities
          </router-link>
        </div>
  
        <div v-else class="plans-list">
          <div 
            v-for="plan in upcomingPlans" 
            :key="plan.id"
            class="plan-card"
            :class="plan.status"
          >
            <!-- Status Badge -->
            <div class="card-header">
              <span :class="['status-badge', plan.status]">
                {{ getStatusIcon(plan.status) }} {{ plan.status.toUpperCase() }}
              </span>
              <span class="days-until">{{ getDaysUntil(plan.date) }}</span>
            </div>
  
            <!-- Plan Info -->
            <div class="plan-content">
              <div class="plan-icon" :style="{ background: plan.color }">
                {{ plan.icon }}
              </div>
              <div class="plan-details">
                <span class="plan-type" :style="{ color: plan.color }">{{ plan.type }}</span>
                <h3 class="plan-title">{{ plan.title }}</h3>
                <div class="plan-meta">
                  <div class="meta-item">
                    <span class="meta-icon">📅</span>
                    <span>{{ formatDate(plan.date) }} • {{ plan.time }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">📍</span>
                    <span>{{ plan.location }}</span>
                  </div>
                  <div v-if="plan.meetingPoint" class="meta-item meeting">
                    <span class="meta-icon">🚩</span>
                    <span><strong>Meet at:</strong> {{ plan.meetingPoint }}</span>
                  </div>
                </div>
  
                <!-- Additional Info -->
                <div class="plan-tags">
                  <span v-if="plan.wheelchairAccessible" class="tag accessible">♿ Accessible</span>
                  <span v-if="plan.requiresPayment" class="tag paid">
                    💰 ${{ plan.paymentAmount }} payment required
                  </span>
                  <span v-if="plan.whatToBring" class="tag info">
                    🎒 Bring: {{ plan.whatToBring }}
                  </span>
                </div>
  
                <!-- Reminder Status -->
                <div v-if="plan.reminderSet" class="reminder-info">
                  🔔 Reminder set for {{ plan.reminderTime }}
                </div>
              </div>
            </div>
  
            <!-- Actions -->
            <div class="plan-actions">
              <button class="action-btn view" @click="viewDetails(plan)">
                <span class="btn-icon">👁️</span>
                View Details
              </button>
              <button class="action-btn calendar" @click="addToCalendar(plan)">
                <span class="btn-icon">📅</span>
                Add to Calendar
              </button>
              <button class="action-btn contact" @click="contactStaff(plan)">
                <span class="btn-icon">💬</span>
                Contact Staff
              </button>
              <button class="action-btn cancel" @click="cancelPlan(plan)">
                <span class="btn-icon">❌</span>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Past Plans -->
      <div v-if="activeTab === 'past'" class="plans-section">
        <div v-if="pastPlans.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No past activities</h3>
          <p>Your completed activities will appear here</p>
        </div>
  
        <div v-else class="plans-list">
          <div 
            v-for="plan in pastPlans" 
            :key="plan.id"
            class="plan-card past"
          >
            <div class="card-header">
              <span :class="['status-badge', plan.attended ? 'attended' : 'missed']">
                {{ plan.attended ? '✅ ATTENDED' : '❌ MISSED' }}
              </span>
              <span class="date-text">{{ formatDate(plan.date) }}</span>
            </div>
  
            <div class="plan-content compact">
              <div class="plan-icon" :style="{ background: plan.color }">
                {{ plan.icon }}
              </div>
              <div class="plan-details">
                <span class="plan-type" :style="{ color: plan.color }">{{ plan.type }}</span>
                <h3 class="plan-title">{{ plan.title }}</h3>
                <p class="plan-location">📍 {{ plan.location }}</p>
              </div>
            </div>
  
            <div v-if="plan.attended" class="feedback-section">
              <button class="feedback-btn" @click="giveFeedback(plan)">
                ⭐ Rate this activity
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Cancelled Plans -->
      <div v-if="activeTab === 'cancelled'" class="plans-section">
        <div v-if="cancelledPlans.length === 0" class="empty-state">
          <div class="empty-icon">🚫</div>
          <h3>No cancelled activities</h3>
          <p>You haven't cancelled any activities</p>
        </div>
  
        <div v-else class="plans-list">
          <div 
            v-for="plan in cancelledPlans" 
            :key="plan.id"
            class="plan-card cancelled"
          >
            <div class="card-header">
              <span class="status-badge cancelled">🚫 CANCELLED</span>
              <span class="date-text">{{ formatDate(plan.date) }}</span>
            </div>
  
            <div class="plan-content compact">
              <div class="plan-icon" :style="{ background: plan.color, opacity: 0.5 }">
                {{ plan.icon }}
              </div>
              <div class="plan-details">
                <span class="plan-type" :style="{ color: plan.color }">{{ plan.type }}</span>
                <h3 class="plan-title">{{ plan.title }}</h3>
                <p class="cancellation-reason">Reason: {{ plan.cancellationReason }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const activeTab = ref('upcoming');
  
  // Mock data - replace with API calls
  const plans = ref([
    {
      id: 1,
      title: 'Gardens by the Bay',
      type: 'Outing',
      color: '#f59e0b',
      icon: '🌺',
      date: '2026-01-14',
      time: '09:45 AM',
      location: 'Flower Dome Entrance',
      meetingPoint: 'MRT Exit A, 9:30 AM',
      status: 'confirmed',
      wheelchairAccessible: true,
      requiresPayment: true,
      paymentAmount: 15,
      whatToBring: 'Water bottle, hat',
      reminderSet: true,
      reminderTime: '1 day before'
    },
    {
      id: 2,
      title: 'Bowling @ Yishun',
      type: 'Gym & Dance',
      color: '#db2777',
      icon: '🎳',
      date: '2026-01-23',
      time: '11:00 AM',
      location: 'Yishun Bowl',
      meetingPoint: 'Yishun MRT Exit B',
      status: 'confirmed',
      wheelchairAccessible: true,
      requiresPayment: true,
      paymentAmount: 20,
      whatToBring: 'Sports shoes',
      reminderSet: true,
      reminderTime: '2 hours before'
    },
    {
      id: 3,
      title: 'Nature Walk',
      type: 'Nature',
      color: '#10b981',
      icon: '🌳',
      date: '2026-01-24',
      time: '09:30 AM',
      location: 'MacRitchie Reservoir',
      meetingPoint: 'MacRitchie Entrance',
      status: 'pending',
      wheelchairAccessible: true,
      requiresPayment: false,
      whatToBring: 'Comfortable shoes, water',
      reminderSet: false
    },
    {
      id: 4,
      title: 'Zumba Class',
      type: 'Gym & Dance',
      color: '#db2777',
      icon: '💃',
      date: '2025-12-20',
      time: '02:00 PM',
      location: 'MTC Central',
      status: 'completed',
      attended: true,
      wheelchairAccessible: false,
      requiresPayment: false
    },
    {
      id: 5,
      title: 'Museum Visit',
      type: 'Outing',
      color: '#f59e0b',
      icon: '🏛️',
      date: '2025-12-15',
      time: '10:00 AM',
      location: 'National Museum',
      status: 'completed',
      attended: false,
      wheelchairAccessible: true,
      requiresPayment: true,
      paymentAmount: 12
    },
    {
      id: 6,
      title: 'Cooking Workshop',
      type: 'Arts & Crafts',
      color: '#8b5cf6',
      icon: '👨‍🍳',
      date: '2026-01-18',
      time: '03:00 PM',
      location: 'MTC Kitchen',
      status: 'cancelled',
      cancellationReason: 'Personal conflict',
      wheelchairAccessible: true,
      requiresPayment: false
    }
  ]);
  
  // Computed
  const upcomingPlans = computed(() => {
    const now = new Date();
    return plans.value.filter(p => 
      new Date(p.date) >= now && p.status !== 'cancelled' && p.status !== 'completed'
    ).sort((a, b) => new Date(a.date) - new Date(b.date));
  });
  
  const pastPlans = computed(() => {
    return plans.value.filter(p => p.status === 'completed')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  });
  
  const cancelledPlans = computed(() => {
    return plans.value.filter(p => p.status === 'cancelled')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  });
  
  // Methods
  const getStatusIcon = (status) => {
    const icons = {
      confirmed: '✅',
      pending: '⏳',
      waitlist: '⏰'
    };
    return icons[status] || '✅';
  };
  
  const getDaysUntil = (dateStr) => {
    const now = new Date();
    const eventDate = new Date(dateStr);
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return `In ${Math.ceil(diffDays / 7)} weeks`;
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const viewDetails = (plan) => {
    console.log('View details:', plan);
    // Navigate to event detail page
  };
  
  const addToCalendar = (plan) => {
    console.log('Add to calendar:', plan);
    // Add to device calendar logic
    alert('Event added to your calendar!');
  };
  
  const contactStaff = (plan) => {
    console.log('Contact staff:', plan);
    // Open contact modal or navigate to messaging
    alert('Opening staff contact form...');
  };
  
  const cancelPlan = (plan) => {
    if (confirm(`Are you sure you want to cancel "${plan.title}"?`)) {
      console.log('Cancel plan:', plan);
      // API call to cancel registration
      plan.status = 'cancelled';
      plan.cancellationReason = 'Cancelled by user';
    }
  };
  
  const giveFeedback = (plan) => {
    console.log('Give feedback:', plan);
    // Open feedback modal
    alert('Opening feedback form...');
  };
  </script>
  
  <style scoped>
  .page-container {
    padding: 24px 20px;
    max-width: 900px;
    margin: 0 auto;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    min-height: 100vh;
  }
  
  /* Header */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 20px;
  }
  
  .header-content h1 {
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 8px 0;
  }
  
  .header-content p {
    font-size: 15px;
    color: #64748b;
    margin: 0;
  }
  
  .quota-info {
    background: white;
    padding: 16px 20px;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    text-align: center;
    min-width: 100px;
  }
  
  .quota-label {
    display: block;
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
    margin-bottom: 6px;
  }
  
  .quota-value {
    display: block;
    font-size: 24px;
    color: #10b981;
    font-weight: 800;
  }
  
  /* Tabs */
  .tabs {
    display: flex;
    gap: 8px;
    background: white;
    padding: 6px;
    border-radius: 12px;
    margin-bottom: 24px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
  
  .tab-btn {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #64748b;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .tab-btn.active {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  }
  
  .tab-count {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
  }
  
  .tab-btn.active .tab-count {
    background: rgba(255, 255, 255, 0.2);
  }
  
  /* Plans Section */
  .plans-section {
    animation: fadeIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .plans-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  /* Plan Card */
  .plan-card {
    background: white;
    border-radius: 20px;
    padding: 24px;
    border: 2px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s;
  }
  
  .plan-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
  
  .plan-card.confirmed {
    border-color: #10b981;
    background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  }
  
  .plan-card.pending {
    border-color: #f59e0b;
    background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
  }
  
  .plan-card.past {
    border-color: #e2e8f0;
    opacity: 0.9;
  }
  
  .plan-card.cancelled {
    border-color: #fca5a5;
    background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
    opacity: 0.85;
  }
  
  /* Card Header */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .status-badge {
    padding: 6px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.5px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  
  .status-badge.confirmed {
    background: #d1fae5;
    color: #059669;
  }
  
  .status-badge.pending {
    background: #fef3c7;
    color: #d97706;
  }
  
  .status-badge.waitlist {
    background: #e0e7ff;
    color: #4f46e5;
  }
  
  .status-badge.attended {
    background: #d1fae5;
    color: #059669;
  }
  
  .status-badge.missed {
    background: #fee2e2;
    color: #dc2626;
  }
  
  .status-badge.cancelled {
    background: #fee2e2;
    color: #dc2626;
  }
  
  .days-until {
    font-size: 13px;
    font-weight: 700;
    color: #6366f1;
    background: #eef2ff;
    padding: 6px 12px;
    border-radius: 8px;
  }
  
  .date-text {
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
  }
  
  /* Plan Content */
  .plan-content {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
  }
  
  .plan-content.compact {
    margin-bottom: 12px;
  }
  
  .plan-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .plan-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .plan-type {
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .plan-title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    line-height: 1.3;
  }
  
  .plan-location {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
  
  .plan-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #64748b;
  }
  
  .meta-item.meeting {
    background: #fef3c7;
    padding: 8px 12px;
    border-radius: 8px;
    color: #b45309;
    margin-top: 4px;
  }
  
  .meta-icon {
    font-size: 16px;
  }
  
  /* Tags */
  .plan-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  
  .tag {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
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
  
  .tag.info {
    background: #f1f5f9;
    color: #475569;
  }
  
  /* Reminder Info */
  .reminder-info {
    background: #eff6ff;
    color: #1e40af;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    margin-top: 4px;
  }
  
  /* Plan Actions */
  .plan-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .action-btn {
    padding: 12px 16px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
  }
  
  .action-btn.view {
    background: #f8fafc;
    color: #1e293b;
    border: 2px solid #e2e8f0;
  }
  
  .action-btn.view:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
  
  .action-btn.calendar {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  }
  
  .action-btn.calendar:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }
  
  .action-btn.contact {
    background: #f8fafc;
    color: #1e293b;
    border: 2px solid #e2e8f0;
  }
  
  .action-btn.contact:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
  
  .action-btn.cancel {
    background: #fee2e2;
    color: #dc2626;
    border: 2px solid #fca5a5;
  }
  
  .action-btn.cancel:hover {
    background: #fecaca;
    border-color: #f87171;
  }
  
  .btn-icon {
    font-size: 16px;
  }
  
  /* Feedback Section */
  .feedback-section {
    padding-top: 16px;
    border-top: 1px solid #f1f5f9;
  }
  
  .feedback-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .feedback-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
  
  .cancellation-reason {
    font-size: 14px;
    color: #dc2626;
    font-style: italic;
    margin: 0;
  }
  
  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 60px 20px;
  }
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }
  
  .empty-state h3 {
    font-size: 20px;
    color: #1e293b;
    margin: 0 0 8px 0;
  }
  
  .empty-state p {
    color: #64748b;
    margin: 0 0 24px 0;
  }
  
  .browse-btn {
    display: inline-block;
    padding: 14px 28px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    text-decoration: none;
    border-radius: 12px;
    font-weight: 700;
    font-size: 15px;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.2s;
  }
  
  .browse-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  }
  
  /* Responsive */
  @media (max-width: 600px) {
    .page-container {
      padding: 16px;
    }
    
    .page-header {
      flex-direction: column;
      gap: 12px;
    }
    
    .quota-info {
      width: 100%;
    }
    
    .plan-content {
      flex-direction: column;
    }
    
    .plan-actions {
      grid-template-columns: 1fr;
    }
  }
  </style>