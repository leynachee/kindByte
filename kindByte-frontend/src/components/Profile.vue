<template>
    <div class="page-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-top">
          <button class="back-btn" @click="$router.go(-1)">←</button>
          <button class="edit-btn" @click="isEditing = !isEditing">
            {{ isEditing ? 'Done' : 'Edit' }}
          </button>
        </div>
  
        <div class="profile-avatar">
          <div class="avatar" :style="{ background: user.avatarColor }">
            {{ user.initials }}
          </div>
          <button v-if="isEditing" class="change-photo-btn">
            📷 Change Photo
          </button>
        </div>
  
        <h2 class="profile-name">{{ user.name }}</h2>
        <div class="membership-badge" :class="user.membership">
          {{ getMembershipIcon(user.membership) }} {{ user.membership }} Member
        </div>
        <p class="member-since">Member since {{ user.joinedYear }}</p>
      </div>
  
      <!-- Stats Section -->
      <div class="stats-section">
        <div class="stat-box">
          <div class="stat-icon">🎉</div>
          <div class="stat-content">
            <strong>{{ user.activitiesAttended }}</strong>
            <span>Activities</span>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <strong>{{ user.points }}</strong>
            <span>Points</span>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <strong>{{ user.badges }}</strong>
            <span>Badges</span>
          </div>
        </div>
      </div>
  
      <!-- Personal Information -->
      <div class="section">
        <h3 class="section-title">Personal Information</h3>
        <div class="info-card">
          <div class="info-item">
            <span class="info-label">Full Name</span>
            <div class="info-value">
              <input 
                v-if="isEditing" 
                v-model="user.name" 
                class="edit-input"
                type="text"
              />
              <span v-else>{{ user.name }}</span>
            </div>
          </div>
  
          <div class="info-item">
            <span class="info-label">Email</span>
            <div class="info-value">
              <input 
                v-if="isEditing" 
                v-model="user.email" 
                class="edit-input"
                type="email"
              />
              <span v-else>{{ user.email }}</span>
            </div>
          </div>
  
          <div class="info-item">
            <span class="info-label">Contact Number</span>
            <div class="info-value">
              <input 
                v-if="isEditing" 
                v-model="user.contactNo" 
                class="edit-input"
                type="tel"
              />
              <span v-else>{{ user.contactNo }}</span>
            </div>
          </div>
  
          <div class="info-item">
            <span class="info-label">Date of Birth</span>
            <div class="info-value">
              <input 
                v-if="isEditing" 
                v-model="user.dateOfBirth" 
                class="edit-input"
                type="date"
              />
              <span v-else>{{ formatDate(user.dateOfBirth) }}</span>
            </div>
          </div>
  
          <div class="info-item">
            <span class="info-label">Center</span>
            <div class="info-value">
              <select v-if="isEditing" v-model="user.center" class="edit-select">
                <option value="MTC Central">MTC Central</option>
                <option value="MTC Tampines">MTC Tampines</option>
                <option value="MTC Yishun">MTC Yishun</option>
              </select>
              <span v-else>{{ user.center }}</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Emergency Contact -->
      <div class="section">
        <h3 class="section-title">Emergency Contact</h3>
        <div class="info-card">
          <div class="info-item">
            <span class="info-label">Caregiver Name</span>
            <div class="info-value">
              <input 
                v-if="isEditing" 
                v-model="user.caregiverName" 
                class="edit-input"
                type="text"
              />
              <span v-else>{{ user.caregiverName }}</span>
            </div>
          </div>
  
          <div class="info-item">
            <span class="info-label">Caregiver Contact</span>
            <div class="info-value">
              <input 
                v-if="isEditing" 
                v-model="user.caregiverContact" 
                class="edit-input"
                type="tel"
              />
              <span v-else>{{ user.caregiverContact }}</span>
            </div>
          </div>
  
          <div class="info-item">
            <span class="info-label">Relationship</span>
            <div class="info-value">
              <select v-if="isEditing" v-model="user.caregiverRelationship" class="edit-select">
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
              <span v-else>{{ user.caregiverRelationship }}</span>
            </div>
          </div>
  
          <button class="contact-btn" @click="contactCaregiver">
            <span>📞</span>
            Contact Caregiver
          </button>
        </div>
      </div>
  
      <!-- Accessibility & Preferences -->
      <div class="section">
        <h3 class="section-title">Accessibility & Preferences</h3>
        <div class="info-card">
          <div class="toggle-item">
            <div class="toggle-label">
              <span class="toggle-icon">♿</span>
              <div>
                <strong>Wheelchair Accessible</strong>
                <p>Only show wheelchair accessible activities</p>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="user.wheelchairRequired" :disabled="!isEditing" />
              <span class="toggle-slider"></span>
            </label>
          </div>
  
          <div class="toggle-item">
            <div class="toggle-label">
              <span class="toggle-icon">🔔</span>
              <div>
                <strong>Activity Reminders</strong>
                <p>Get notifications before activities</p>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="user.remindersEnabled" :disabled="!isEditing" />
              <span class="toggle-slider"></span>
            </label>
          </div>
  
          <div class="info-item">
            <span class="info-label">Dietary Restrictions</span>
            <div class="info-value">
              <input 
                v-if="isEditing" 
                v-model="user.dietaryRestrictions" 
                class="edit-input"
                type="text"
                placeholder="e.g., Vegetarian, No nuts"
              />
              <span v-else>{{ user.dietaryRestrictions || 'None' }}</span>
            </div>
          </div>
  
          <div class="info-item">
            <span class="info-label">Special Needs</span>
            <div class="info-value">
              <textarea 
                v-if="isEditing" 
                v-model="user.specialNeeds" 
                class="edit-textarea"
                placeholder="Any special requirements or assistance needed"
                rows="3"
              ></textarea>
              <span v-else>{{ user.specialNeeds || 'None' }}</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Settings Menu -->
      <div class="section">
        <h3 class="section-title">Settings</h3>
        <div class="settings-menu">
          <button class="menu-item" @click="changePassword">
            <div class="menu-content">
              <span class="menu-icon">🔒</span>
              <span>Change Password</span>
            </div>
            <span class="menu-arrow">›</span>
          </button>
  
          <button class="menu-item" @click="notificationSettings">
            <div class="menu-content">
              <span class="menu-icon">🔔</span>
              <span>Notification Settings</span>
            </div>
            <span class="menu-arrow">›</span>
          </button>
  
          <button class="menu-item" @click="privacySettings">
            <div class="menu-content">
              <span class="menu-icon">🔐</span>
              <span>Privacy & Data</span>
            </div>
            <span class="menu-arrow">›</span>
          </button>
  
          <button class="menu-item" @click="helpSupport">
            <div class="menu-content">
              <span class="menu-icon">❓</span>
              <span>Help & Support</span>
            </div>
            <span class="menu-arrow">›</span>
          </button>
  
          <button class="menu-item" @click="aboutApp">
            <div class="menu-content">
              <span class="menu-icon">ℹ️</span>
              <span>About MINDS</span>
            </div>
            <span class="menu-arrow">›</span>
          </button>
        </div>
      </div>
  
      <!-- Save Button (shown when editing) -->
      <div v-if="isEditing" class="action-section">
        <button class="save-btn" @click="saveChanges">
          Save Changes
        </button>
      </div>
  
      <!-- Logout Button -->
      <div class="action-section">
        <button class="logout-btn" @click="logout">
          <span>🚪</span>
          Logout
        </button>
      </div>
  
      <!-- Version Info -->
      <div class="version-info">
        Version 1.0.0 • © 2026 MINDS
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const isEditing = ref(false);
  
  // Mock user data - replace with actual user data from store/API
  const user = ref({
    name: 'Wong Xuan Yu',
    initials: 'XY',
    avatarColor: '#6366f1',
    email: 'xuanyu.wong@email.com',
    contactNo: '+65 9123 4567',
    dateOfBirth: '1995-06-15',
    center: 'MTC Central',
    membership: 'gold',
    joinedYear: 2024,
    activitiesAttended: 24,
    points: 480,
    badges: 5,
    caregiverName: 'Mary Wong',
    caregiverContact: '+65 9876 5432',
    caregiverRelationship: 'Parent',
    wheelchairRequired: false,
    remindersEnabled: true,
    dietaryRestrictions: 'Vegetarian',
    specialNeeds: ''
  });
  
  // Methods
  const getMembershipIcon = (membership) => {
    const icons = {
      basic: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎'
    };
    return icons[membership] || '🥉';
  };
  
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const contactCaregiver = () => {
    alert(`Calling ${user.value.caregiverName} at ${user.value.caregiverContact}...`);
  };
  
  const saveChanges = () => {
    // API call to save user data
    console.log('Saving changes:', user.value);
    isEditing.value = false;
    alert('Changes saved successfully!');
  };
  
  const changePassword = () => {
    console.log('Change password');
    // Navigate to change password screen
  };
  
  const notificationSettings = () => {
    console.log('Notification settings');
    // Navigate to notification settings
  };
  
  const privacySettings = () => {
    console.log('Privacy settings');
    // Navigate to privacy settings
  };
  
  const helpSupport = () => {
    console.log('Help & Support');
    // Navigate to help screen
  };
  
  const aboutApp = () => {
    console.log('About MINDS');
    // Show about modal
  };
  
  const logout = () => {
    if (confirm('Are you sure you want to logout?')) {
      console.log('Logging out...');
      // Clear session and navigate to login
      // this.$router.push('/login');
    }
  };
  </script>
  
  <style scoped>
  .page-container {
    background: #f8fafc;
    min-height: 100vh;
    padding-bottom: 40px;
  }
  
  /* Profile Header */
  .profile-header {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    padding: 20px 20px 40px 20px;
    text-align: center;
    color: white;
    position: relative;
  }
  
  .profile-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .back-btn,
  .edit-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: all 0.2s;
  }
  
  .back-btn:hover,
  .edit-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  .profile-avatar {
    position: relative;
    display: inline-block;
    margin-bottom: 16px;
  }
  
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    font-weight: 700;
    color: white;
    border: 4px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    margin: 0 auto;
  }
  
  .change-photo-btn {
    position: absolute;
    bottom: 0;
    right: 50%;
    transform: translateX(50%);
    background: white;
    color: #6366f1;
    border: none;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  .profile-name {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px 0;
  }
  
  .membership-badge {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 8px;
    text-transform: capitalize;
  }
  
  .membership-badge.basic {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .membership-badge.silver {
    background: rgba(226, 232, 240, 0.3);
  }
  
  .membership-badge.gold {
    background: rgba(251, 191, 36, 0.3);
  }
  
  .membership-badge.platinum {
    background: rgba(167, 139, 250, 0.3);
  }
  
  .member-since {
    font-size: 14px;
    opacity: 0.9;
    margin: 0;
  }
  
  /* Stats Section */
  .stats-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 0 20px;
    margin-top: -30px;
    margin-bottom: 20px;
  }
  
  .stat-box {
    background: white;
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
  }
  
  .stat-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .stat-content strong {
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
  }
  
  .stat-content span {
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
  }
  
  /* Section */
  .section {
    padding: 0 20px;
    margin-bottom: 24px;
  }
  
  .section-title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 12px 0;
  }
  
  /* Info Card */
  .info-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  
  .info-item:last-child {
    border-bottom: none;
  }
  
  .info-label {
    font-size: 14px;
    color: #64748b;
    font-weight: 600;
  }
  
  .info-value {
    font-size: 15px;
    color: #0f172a;
    font-weight: 600;
    text-align: right;
    flex: 1;
    max-width: 60%;
  }
  
  .edit-input,
  .edit-select,
  .edit-textarea {
    width: 100%;
    padding: 8px 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    transition: all 0.2s;
  }
  
  .edit-input:focus,
  .edit-select:focus,
  .edit-textarea:focus {
    outline: none;
    border-color: #6366f1;
  }
  
  .edit-textarea {
    resize: vertical;
    font-family: inherit;
  }
  
  /* Toggle Item */
  .toggle-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  
  .toggle-item:last-child {
    border-bottom: none;
  }
  
  .toggle-label {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    flex: 1;
  }
  
  .toggle-icon {
    font-size: 24px;
  }
  
  .toggle-label strong {
    display: block;
    font-size: 15px;
    color: #0f172a;
    margin-bottom: 2px;
  }
  
  .toggle-label p {
    font-size: 13px;
    color: #64748b;
    margin: 0;
  }
  
  /* Toggle Switch */
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 52px;
    height: 28px;
    flex-shrink: 0;
  }
  
  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e1;
    transition: 0.3s;
    border-radius: 28px;
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
  
  input:checked + .toggle-slider {
    background-color: #6366f1;
  }
  
  input:checked + .toggle-slider:before {
    transform: translateX(24px);
  }
  
  input:disabled + .toggle-slider {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Contact Button */
  .contact-btn {
    width: 100%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    padding: 14px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    transition: all 0.2s;
  }
  
  .contact-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  /* Settings Menu */
  .settings-menu {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    overflow: hidden;
  }
  
  .menu-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 20px;
    border: none;
    background: white;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }
  
  .menu-item:last-child {
    border-bottom: none;
  }
  
  .menu-item:hover {
    background: #f8fafc;
  }
  
  .menu-item:active {
    background: #f1f5f9;
  }
  
  .menu-content {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
  }
  
  .menu-icon {
    font-size: 20px;
  }
  
  .menu-arrow {
    font-size: 24px;
    color: #94a3b8;
  }
  
  /* Action Section */
  .action-section {
    padding: 0 20px;
    margin-bottom: 16px;
  }
  
  .save-btn {
    width: 100%;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    padding: 16px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.2s;
  }
  
  .save-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  }
  
  .logout-btn {
    width: 100%;
    background: white;
    color: #dc2626;
    border: 2px solid #fca5a5;
    padding: 16px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
  }
  
  .logout-btn:hover {
    background: #fee2e2;
    border-color: #f87171;
  }
  
  /* Version Info */
  .version-info {
    text-align: center;
    padding: 20px;
    font-size: 13px;
    color: #94a3b8;
  }
  
  /* Responsive */
  @media (max-width: 600px) {
    .profile-header {
      padding: 16px 16px 32px 16px;
    }
  
    .stats-section {
      padding: 0 16px;
      gap: 12px;
    }
  
    .stat-box {
      padding: 16px 12px;
    }
  
    .stat-icon {
      font-size: 28px;
    }
  
    .stat-content strong {
      font-size: 20px;
    }
  
    .section {
      padding: 0 16px;
    }
  
    .info-value {
      max-width: 55%;
    }
  }
  </style>