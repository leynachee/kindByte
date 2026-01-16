<template>
  <div class="page-container">
    <div class="profile-header">
      <div class="profile-top">
        <div></div>
        <button class="edit-btn" @click="isEditing = !isEditing">
          {{ isEditing ? 'Done' : 'Edit' }}
        </button>
      </div>

      <div class="profile-avatar">
        <div class="avatar" :style="{ background: user.avatarColor }">
          {{ user.initials }}
        </div>
        <button v-if="isEditing" class="change-photo-btn">
          📷 Change
        </button>
      </div>

      <h2 class="profile-name">{{ user.name }}</h2>
      <div class="membership-badge platinum">
         🛡️ Staff Administrator
      </div>
      <p class="member-since">Employee ID: #{{ user.employeeId }}</p>
    </div>

    <div class="stats-section">
      <div class="stat-box">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <strong>{{ user.eventsManaged }}</strong>
          <span>Events Led</span>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <strong>{{ user.reportsFiled }}</strong>
          <span>Reports</span>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <strong>{{ user.yearsService }}</strong>
          <span>Years</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Personal Information</h3>
      <div class="info-card">
        <div class="info-item">
          <span class="info-label">Full Name</span>
          <div class="info-value">
            <input v-if="isEditing" v-model="user.name" class="edit-input" type="text" />
            <span v-else>{{ user.name }}</span>
          </div>
        </div>

        <div class="info-item">
          <span class="info-label">Work Email</span>
          <div class="info-value">
            <input v-if="isEditing" v-model="user.email" class="edit-input" type="email" />
            <span v-else>{{ user.email }}</span>
          </div>
        </div>

        <div class="info-item">
          <span class="info-label">Department</span>
          <div class="info-value">
            <input v-if="isEditing" v-model="user.department" class="edit-input" type="text" />
            <span v-else>{{ user.department }}</span>
          </div>
        </div>

        <div class="info-item no-border">
          <span class="info-label">Base Center</span>
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

    <div class="section">
      <h3 class="section-title">Employment Details</h3>
      <div class="info-card">
        <div class="info-item">
          <span class="info-label">Job Title</span>
          <div class="info-value">
            <input v-if="isEditing" v-model="user.jobTitle" class="edit-input" type="text" />
            <span v-else>{{ user.jobTitle }}</span>
          </div>
        </div>

        <div class="info-item">
          <span class="info-label">Employment Type</span>
          <div class="info-value">
            <span>{{ user.employmentType }}</span>
          </div>
        </div>

        <div class="info-item no-border">
          <span class="info-label">Joined Date</span>
          <div class="info-value">
            <span>{{ user.joinedDate }}</span>
          </div>
        </div>
      </div>
    </div>    

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

        <button class="menu-item no-border" @click="helpSupport">
          <div class="menu-content">
            <span class="menu-icon">❓</span>
            <span>Admin Support</span>
          </div>
          <span class="menu-arrow">›</span>
        </button>
      </div>
    </div>

    <div v-if="isEditing" class="action-section">
      <button class="save-btn" @click="saveChanges">
        Save Changes
      </button>
    </div>

    <div class="action-section">
      <button class="logout-btn" @click="logout">
        <span>🚪</span>
        Logout
      </button>
    </div>

    <div class="version-info">
      Staff Portal v1.0.0 • © 2026 MINDS
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isEditing = ref(false);

// Updated for Staff Data
const user = ref({
  name: 'Xuan Yu',
  initials: 'XY',
  avatarColor: '#7c3aed',
  email: 'xuan.yu@minds.org.sg',
  contactNo: '+65 9123 4567',
  center: 'MTC Central',
  employeeId: '9921',
  department: 'Programs',
  jobTitle: 'Senior Program Executive',
  employmentType: 'Full-Time',
  joinedDate: '12 Jan 2024',
  yearsService: 2,
  eventsManaged: 142,
  reportsFiled: 12
});

const saveChanges = () => {
  console.log('Saving staff changes:', user.value);
  isEditing.value = false;
  alert('Staff profile updated!');
};

const changePassword = () => router.push('/change-password');
const helpSupport = () => router.push('/help');

const logout = () => {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/login');
  }
};
</script>

<style scoped>
/* ALL STYLES RETAINED FROM ORIGINAL */
* { box-sizing: border-box; }
.page-container { background: #f8fafc; min-height: 100vh; padding-bottom: 100px; max-width: 100%; overflow-x: hidden; }
.profile-header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 20px 20px 60px 20px; text-align: center; color: white; position: relative; }
.profile-top { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 20px; }
.edit-btn { background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; backdrop-filter: blur(10px); transition: all 0.2s; }
.profile-avatar { position: relative; display: inline-block; margin-bottom: 16px; }
.avatar { width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700; color: white; border: 4px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); }
.profile-name { font-size: 24px; font-weight: 700; margin: 0 0 8px 0; }
.membership-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-bottom: 6px; text-transform: capitalize; }
.membership-badge.platinum { background: rgba(167, 139, 250, 0.3); }
.member-since { font-size: 13px; opacity: 0.9; margin: 0; }
.stats-section { display: flex; gap: 12px; padding: 0 16px; margin-top: -35px; margin-bottom: 24px; position: relative; z-index: 10; }
.stat-box { flex: 1; background: white; border-radius: 12px; padding: 14px 10px; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; min-width: 0; }
.stat-icon { font-size: 24px; margin-bottom: 6px; }
.stat-content strong { font-size: 20px; font-weight: 800; color: #0f172a; }
.stat-content span { font-size: 11px; color: #64748b; font-weight: 600; }
.section { padding: 0 16px; margin-bottom: 20px; }
.section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0; }
.info-card { background: white; border-radius: 12px; padding: 4px 16px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }
.info-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #f1f5f9; gap: 12px; }
.info-item.no-border { border-bottom: none; }
.info-label { font-size: 13px; color: #64748b; font-weight: 600; flex-shrink: 0; }
.info-value { font-size: 14px; color: #0f172a; font-weight: 600; text-align: right; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.edit-input, .edit-select { width: 100%; padding: 8px 10px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 13px; font-weight: 600; color: #0f172a; background: white; }
.settings-menu { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); overflow: hidden; }
.menu-item { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border: none; background: white; border-bottom: 1px solid #f1f5f9; cursor: pointer; text-align: left; }
.menu-item.no-border { border-bottom: none; }
.menu-content { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: #0f172a; }
.menu-arrow { font-size: 20px; color: #94a3b8; }
.action-section { padding: 0 16px; margin-bottom: 12px; }
.save-btn { width: 100%; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
.logout-btn { width: 100%; background: white; color: #dc2626; border: 2px solid #fca5a5; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
.version-info { text-align: center; padding: 16px; font-size: 12px; color: #94a3b8; }
</style>