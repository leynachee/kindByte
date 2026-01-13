<template>
    <div class="page-container">
      <section class="welcome-section">
        <div class="greeting">
          <h1>Hello, Xuan Yu! 👋</h1>
          <p class="membership-badge">
            <span class="badge-icon">✨</span>
            Member of <strong>MTC Central</strong>
          </p>
        </div>
      </section>
  
      <div class="quota-card">
        <div class="quota-header">
          <div class="quota-info">
            <span class="quota-label">Weekly Booking Limit</span>
            <strong class="quota-value">1 Left</strong>
          </div>
          <div class="quota-icon">📊</div>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: '75%' }"></div>
        </div>
        <p class="quota-subtext">3 of 4 activities booked this week</p>
      </div>
  
      <div class="next-event-card">
        <div class="event-header">
          <small class="event-label">YOUR NEXT ACTIVITY</small>
          <span class="event-status">Confirmed</span>
        </div>
        
        <h2 class="event-title">Gardens by the Bay</h2>
        
        <div class="event-details">
          <div class="detail-item">
            <span class="icon">📅</span>
            <span>Tomorrow • 09:45 AM</span>
          </div>
          <div class="detail-item">
            <span class="icon">📍</span>
            <span>Flower Dome Entrance</span>
          </div>
        </div>
  
        <div class="event-tags">
          <span class="tag accessible">♿ Accessible</span>
          <span class="tag paid">💰 Paid</span>
        </div>
  
        <button class="view-details-btn">View Details →</button>
      </div>
  
      <router-link to="/calendar" class="cta-button">
        <span class="cta-icon">📅</span>
        Book an Activity
        <span class="cta-arrow">→</span>
      </router-link>
  
      <div class="quick-links">
        <router-link to="/my-plans" class="quick-link">
          <div class="link-icon">📋</div>
          <span>My Plans</span>
        </router-link>
        <router-link to="/profile" class="quick-link">
          <div class="link-icon">👤</div>
          <span>Profile</span>
        </router-link>
      </div>
    </div>
  </template>
  
  <style scoped>
  .page-container {
    padding: 24px 20px;
    max-width: 600px;
    margin: 0 auto;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
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
  
  .membership-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #64748b;
    font-size: 15px;
    margin: 0;
  }
  
  .badge-icon {
    font-size: 16px;
  }
  
  .membership-badge strong {
    color: #1e293b;
    font-weight: 600;
  }
  
  .avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 18px;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  }
  
  /* Quota Card */
  .quota-card {
    background: white;
    padding: 22px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid #e2e8f0;
    margin-bottom: 20px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .quota-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
  
  .quota-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
  }
  
  .quota-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .quota-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .quota-value {
    font-size: 26px;
    color: #10b981;
    font-weight: 700;
  }
  
  .quota-icon {
    font-size: 28px;
    opacity: 0.8;
  }
  
  .progress-track {
    height: 12px;
    background: #f1f5f9;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 10px;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
    border-radius: 8px;
    transition: width 0.6s ease;
  }
  
  .quota-subtext {
    font-size: 13px;
    color: #64748b;
    margin: 0;
  }
  
  /* Next Event Card */
  .next-event-card {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: white;
    padding: 28px;
    border-radius: 24px;
    margin-bottom: 20px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.3);
    position: relative;
    overflow: hidden;
  }
  
  .next-event-card::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }
  
  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .event-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #94a3b8;
    text-transform: uppercase;
  }
  
  .event-status {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  
  .event-title {
    font-size: 26px;
    font-weight: 700;
    margin: 0 0 20px 0;
    color: white;
    line-height: 1.3;
  }
  
  .event-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .detail-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    color: #cbd5e1;
  }
  
  .detail-item .icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
  }
  
  .event-tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  
  .tag {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  
  .tag.accessible {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }
  
  .tag.paid {
    background: rgba(251, 191, 36, 0.15);
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.3);
  }
  
  .view-details-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
    width: 100%;
  }
  
  .view-details-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(4px);
  }
  
  /* CTA Button */
  .cta-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    text-align: center;
    padding: 18px 24px;
    border-radius: 16px;
    text-decoration: none;
    font-weight: 700;
    font-size: 16px;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
    transition: all 0.3s;
    margin-bottom: 24px;
  }
  
  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4);
  }
  
  .cta-button:active {
    transform: translateY(0);
  }
  
  .cta-icon {
    font-size: 20px;
  }
  
  .cta-arrow {
    font-size: 18px;
    transition: transform 0.3s;
  }
  
  .cta-button:hover .cta-arrow {
    transform: translateX(4px);
  }
  
  /* Quick Links */
  .quick-links {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  
  .quick-link {
    background: white;
    padding: 20px;
    border-radius: 16px;
    text-decoration: none;
    color: #1e293b;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  }
  
  .quick-link:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }
  
  .link-icon {
    font-size: 32px;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .quick-link span {
    font-weight: 600;
    font-size: 14px;
  }
  
  /* Responsive */
  @media (max-width: 400px) {
    .page-container {
      padding: 20px 16px;
    }
    
    .greeting h1 {
      font-size: 24px;
    }
    
    .event-title {
      font-size: 22px;
    }
  }
  </style>