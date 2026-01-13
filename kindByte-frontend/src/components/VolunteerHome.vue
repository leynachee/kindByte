<template>
    <div class="page-container">
      <section class="welcome-section">
        <div class="greeting">
          <h1>Volunteer Portal 🌟</h1>
          <p class="impact-badge">
            <span class="badge-icon">⏱️</span>
            You've contributed <strong>48 hours</strong> this year!
          </p>
        </div>
        <div class="volunteer-level">
          <div class="level-badge">⭐</div>
          <span class="level-text">Experienced</span>
        </div>
      </section>
  
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <span class="stat-value">12</span>
            <span class="stat-label">Shifts Completed</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <span class="stat-value">3</span>
            <span class="stat-label">Upcoming Shifts</span>
          </div>
        </div>
      </div>
  
      <div class="section">
        <div class="section-header">
          <h3>Your Next Shift</h3>
          <button class="text-btn">View All →</button>
        </div>
        
        <div class="shift-card highlight">
          <div class="shift-date">
            <div class="day">FRI</div>
            <div class="date">24</div>
            <div class="month">JAN</div>
          </div>
          
          <div class="shift-content">
            <div class="shift-header">
              <h4 class="shift-title">Zumba Assistant</h4>
              <span class="shift-badge confirmed">Confirmed</span>
            </div>
            
            <div class="shift-details">
              <div class="detail-row">
                <span class="icon">📍</span>
                <span>MTC Central</span>
              </div>
              <div class="detail-row">
                <span class="icon">🕐</span>
                <span>10:00 AM - 12:00 PM</span>
              </div>
              <div class="detail-row">
                <span class="icon">👥</span>
                <span>3 volunteers needed</span>
              </div>
            </div>
  
            <div class="shift-actions">
              <button class="action-btn primary">View Details</button>
              <button class="action-btn secondary">Contact Staff</button>
            </div>
          </div>
        </div>
      </div>
  
      <div class="section">
        <div class="section-header">
          <h3>Available Opportunities</h3>
          <router-link to="/volunteer-browse" class="text-btn">Browse All →</router-link>
        </div>
  
        <div class="opportunity-list">
          <div class="opportunity-card">
            <div class="opportunity-header">
              <div class="opportunity-date">
                <span class="date-day">SAT 25</span>
                <span class="date-time">2:00 PM</span>
              </div>
              <span class="opportunity-tag urgent">Needs Volunteers</span>
            </div>
            
            <h4 class="opportunity-title">Art & Craft Workshop</h4>
            <p class="opportunity-location">📍 MTC Tampines • 2 hours</p>
            
            <div class="opportunity-footer">
              <span class="spots-left">2 spots left</span>
              <button class="register-btn">Register</button>
            </div>
          </div>
  
          <div class="opportunity-card">
            <div class="opportunity-header">
              <div class="opportunity-date">
                <span class="date-day">SUN 26</span>
                <span class="date-time">9:00 AM</span>
              </div>
              <span class="opportunity-tag experienced">⭐ Experienced Only</span>
            </div>
            
            <h4 class="opportunity-title">Community Outing Guide</h4>
            <p class="opportunity-location">📍 Botanic Gardens • 4 hours</p>
            
            <div class="opportunity-footer">
              <span class="spots-left">1 spot left</span>
              <button class="register-btn">Register</button>
            </div>
          </div>
  
          <div class="opportunity-card">
            <div class="opportunity-header">
              <div class="opportunity-date">
                <span class="date-day">MON 27</span>
                <span class="date-time">3:30 PM</span>
              </div>
            </div>
            
            <h4 class="opportunity-title">Baking Session Helper</h4>
            <p class="opportunity-location">📍 MTC Central • 3 hours</p>
            
            <div class="opportunity-footer">
              <span class="spots-left">4 spots left</span>
              <button class="register-btn">Register</button>
            </div>
          </div>
        </div>
      </div>
  
      <router-link to="/my-shifts" class="cta-button">
        <span class="cta-icon">📋</span>
        Manage My Shifts
        <span class="cta-arrow">→</span>
      </router-link>
    </div>
  </template>
  
  <style scoped>
  .page-container {
    padding: 24px 20px;
    max-width: 600px;
    margin: 0 auto;
    background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%);
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
  
  .impact-badge {
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
  
  .impact-badge strong {
    color: #c026d3;
    font-weight: 700;
  }
  
  .volunteer-level {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  
  .level-badge {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
  
  .level-text {
    font-size: 12px;
    font-weight: 600;
    color: #78716c;
  }
  
  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    border: 1px solid #f3e8ff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
  
  .stat-icon {
    font-size: 32px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%);
    border-radius: 12px;
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #c026d3;
    line-height: 1;
  }
  
  .stat-label {
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
  }
  
  /* Section */
  .section {
    margin-bottom: 28px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .section-header h3 {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }
  
  .text-btn {
    background: none;
    border: none;
    color: #c026d3;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    text-decoration: none;
    transition: color 0.2s;
  }
  
  .text-btn:hover {
    color: #a21caf;
  }
  
  /* Shift Card - Next Shift */
  .shift-card {
    background: white;
    border-radius: 20px;
    padding: 20px;
    border: 1px solid #f3e8ff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    display: flex;
    gap: 18px;
    transition: all 0.2s;
  }
  
  .shift-card.highlight {
    border: 2px solid #c026d3;
    background: linear-gradient(135deg, #ffffff 0%, #fdf4ff 100%);
  }
  
  .shift-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
  
  .shift-date {
    background: linear-gradient(135deg, #c026d3 0%, #a21caf 100%);
    color: white;
    border-radius: 16px;
    padding: 16px 14px;
    text-align: center;
    min-width: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    box-shadow: 0 4px 12px rgba(192, 38, 211, 0.3);
  }
  
  .shift-date .day {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    opacity: 0.9;
  }
  
  .shift-date .date {
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
  }
  
  .shift-date .month {
    font-size: 11px;
    font-weight: 600;
    opacity: 0.8;
  }
  
  .shift-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .shift-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }
  
  .shift-title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    line-height: 1.3;
  }
  
  .shift-badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    white-space: nowrap;
  }
  
  .shift-badge.confirmed {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }
  
  .shift-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .detail-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #64748b;
  }
  
  .detail-row .icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }
  
  .shift-actions {
    display: flex;
    gap: 10px;
    margin-top: 4px;
  }
  
  .action-btn {
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  
  .action-btn.primary {
    background: #c026d3;
    color: white;
    flex: 1;
  }
  
  .action-btn.primary:hover {
    background: #a21caf;
    transform: translateY(-1px);
  }
  
  .action-btn.secondary {
    background: #f8fafc;
    color: #64748b;
    border: 1px solid #e2e8f0;
  }
  
  .action-btn.secondary:hover {
    background: #f1f5f9;
    color: #475569;
  }
  
  /* Opportunity Cards */
  .opportunity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .opportunity-card {
    background: white;
    border-radius: 16px;
    padding: 18px;
    border: 1px solid #f3e8ff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s;
  }
  
  .opportunity-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: #e9d5ff;
  }
  
  .opportunity-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  
  .opportunity-date {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .date-day {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
  }
  
  .date-time {
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
  }
  
  .opportunity-tag {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  
  .opportunity-tag.urgent {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }
  
  .opportunity-tag.experienced {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }
  
  .opportunity-title {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 8px 0;
    line-height: 1.3;
  }
  
  .opportunity-location {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 12px 0;
  }
  
  .opportunity-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
  }
  
  .spots-left {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
  }
  
  .register-btn {
    background: linear-gradient(135deg, #c026d3 0%, #a21caf 100%);
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(192, 38, 211, 0.2);
  }
  
  .register-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(192, 38, 211, 0.3);
  }
  
  /* CTA Button */
  .cta-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: linear-gradient(135deg, #c026d3 0%, #9333ea 100%);
    color: white;
    text-align: center;
    padding: 18px 24px;
    border-radius: 16px;
    text-decoration: none;
    font-weight: 700;
    font-size: 16px;
    box-shadow: 0 4px 16px rgba(192, 38, 211, 0.3);
    transition: all 0.3s;
    margin-top: 24px;
  }
  
  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(192, 38, 211, 0.4);
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
  
  /* Responsive */
  @media (max-width: 400px) {
    .page-container {
      padding: 20px 16px;
    }
    
    .greeting h1 {
      font-size: 24px;
    }
    
    .shift-card {
      flex-direction: column;
      gap: 16px;
    }
    
    .shift-date {
      flex-direction: row;
      justify-content: center;
      padding: 12px 20px;
      min-width: unset;
    }
    
    .shift-date .day,
    .shift-date .date,
    .shift-date .month {
      display: inline;
      font-size: 16px;
    }
    
    .shift-date .date {
      font-size: 20px;
      margin: 0 6px;
    }
  }
  </style>