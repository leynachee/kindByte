<template>
  <div class="page-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>

    <template v-else>
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-top">
          <div></div>
          <button class="edit-btn" @click="toggleEdit">
            {{ isEditing ? 'Cancel' : 'Edit' }}
          </button>
        </div>

        <div class="profile-avatar">
          <div class="avatar" :style="{ background: avatarColor }">
            <template v-if="user.name">
              {{ userInitials }}
            </template>
            <svg v-else class="default-avatar-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <button v-if="isEditing" class="change-photo-btn">
            📷 Change
          </button>
        </div>

        <h2 class="profile-name">{{ user.name || 'User' }}</h2>
        <div class="membership-badge" :class="user.role">
          {{ getRoleIcon(user.role) }} {{ formatRole(user.role) }}
        </div>
      </div>

      <!-- Stats Section -->
      <div class="stats-section">
        <div class="stat-box">
          <div class="stat-icon">🎉</div>
          <div class="stat-content">
            <strong>{{ userStats.activitiesAttended }}</strong>
            <span>Activities</span>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <strong>{{ userStats.upcomingEvents }}</strong>
            <span>Upcoming</span>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <strong>{{ userStats.thisMonth }}</strong>
            <span>This Month</span>
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
              <input v-if="isEditing" v-model="editForm.name" class="edit-input" type="text" />
              <span v-else>{{ user.name }}</span>
            </div>
          </div>

          <div class="info-item">
            <span class="info-label">Email</span>
            <div class="info-value">
              <span>{{ user.email }}</span>
            </div>
          </div>

          <div class="info-item no-border">
            <span class="info-label">Role</span>
            <div class="info-value">
              <span>{{ formatRole(user.role) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Emergency Contact (for beneficiary) -->
      <div v-if="user.role === 'beneficiary' && caregiver" class="section">
        <h3 class="section-title">Emergency Contact</h3>
        <div class="info-card">
          <div class="info-item">
            <span class="info-label">Caregiver Name</span>
            <div class="info-value">
              <span>{{ caregiver.name }}</span>
            </div>
          </div>

          <div class="info-item no-border">
            <span class="info-label">Caregiver Email</span>
            <div class="info-value">
              <span>{{ caregiver.email }}</span>
            </div>
          </div>

          <button class="contact-btn" @click="contactCaregiver">
            <span>📞</span>
            Contact Caregiver
          </button>
        </div>
      </div>

      <!-- Linked Beneficiary (for caregiver) -->
      <div v-if="user.role === 'caregiver' && beneficiary" class="section">
        <h3 class="section-title">Linked Beneficiary</h3>
        <div class="info-card">
          <div class="info-item">
            <span class="info-label">Name</span>
            <div class="info-value">
              <span>{{ beneficiary.name }}</span>
            </div>
          </div>

          <div class="info-item no-border">
            <span class="info-label">Email</span>
            <div class="info-value">
              <span>{{ beneficiary.email }}</span>
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

          <button class="menu-item no-border" @click="helpSupport">
            <div class="menu-content">
              <span class="menu-icon">❓</span>
              <span>Help & Support</span>
            </div>
            <span class="menu-arrow">›</span>
          </button>
        </div>
      </div>

      <!-- Save Button (shown when editing) -->
      <div v-if="isEditing" class="action-section">
        <button class="save-btn" @click="saveChanges" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <!-- Logout Button -->
      <div class="action-section">
        <button class="logout-btn" @click="showLogoutModal = true">
          <span>🚪</span>
          Logout
        </button>
      </div>

      <!-- Version Info -->
      <div class="version-info">
        Version 1.0.0 • © 2026 MINDS
      </div>
    </template>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="modal-overlay" @click.self="showLogoutModal = false">
      <div class="modal-content">
        <div class="modal-icon">🚪</div>
        <h3>Logout</h3>
        <p>Are you sure you want to logout?</p>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="showLogoutModal = false">Cancel</button>
          <button class="modal-btn confirm" @click="confirmLogout" :disabled="loggingOut">
            {{ loggingOut ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success/Error Toast -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/firebase';

const router = useRouter();
const loading = ref(true);
const isEditing = ref(false);
const saving = ref(false);
const showLogoutModal = ref(false);
const loggingOut = ref(false);
const currentUserId = ref(null);

const toast = ref({
  show: false,
  message: '',
  type: 'success'
});

const user = ref({
  name: '',
  email: '',
  role: '',
  caregiverID: null,
  beneficiaryID: null
});

const editForm = ref({
  name: ''
});

const caregiver = ref(null);
const beneficiary = ref(null);
const userStats = ref({
  activitiesAttended: 0,
  upcomingEvents: 0,
  thisMonth: 0
});

// Computed
const userInitials = computed(() => {
  if (!user.value.name) return '';
  const names = user.value.name.split(' ');
  if (names.length >= 2) {
    return names[0][0] + names[names.length - 1][0];
  }
  return names[0].substring(0, 2).toUpperCase();
});

const avatarColor = computed(() => {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
  if (!user.value.name) return '#94a3b8'; // Gray color for default avatar
  const index = user.value.name.charCodeAt(0) % colors.length;
  return colors[index];
});

// Show toast notification
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// Fetch user data
onMounted(() => {
  onAuthStateChanged(auth, async (authUser) => {
    if (authUser) {
      currentUserId.value = authUser.uid;
      await fetchUserData(authUser.uid);
      await fetchUserStats(authUser.uid);
    } else {
      router.push('/login');
    }
    loading.value = false;
  });
});

const fetchUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      user.value = {
        id: userId,
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || '',
        caregiverID: userData.caregiverID || null,
        beneficiaryID: userData.beneficiaryID || null
      };
      
      editForm.value.name = user.value.name;

      // Fetch caregiver info if beneficiary
      if (userData.role === 'beneficiary' && userData.caregiverID) {
        const caregiverDoc = await getDoc(doc(db, 'users', userData.caregiverID));
        if (caregiverDoc.exists()) {
          caregiver.value = {
            id: userData.caregiverID,
            ...caregiverDoc.data()
          };
        }
      }

      // Fetch beneficiary info if caregiver
      if (userData.role === 'caregiver' && userData.beneficiaryID) {
        const beneficiaryDoc = await getDoc(doc(db, 'users', userData.beneficiaryID));
        if (beneficiaryDoc.exists()) {
          beneficiary.value = {
            id: userData.beneficiaryID,
            ...beneficiaryDoc.data()
          };
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

const fetchUserStats = async (userId) => {
  try {
    const eventsRef = collection(db, 'events');
    const querySnapshot = await getDocs(eventsRef);
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let attended = 0;
    let upcoming = 0;
    let thisMonth = 0;

    querySnapshot.docs.forEach(eventDoc => {
      const eventData = eventDoc.data();
      
      if (eventData.attendees && eventData.attendees.includes(userId)) {
        const startTime = eventData.startTime?.toDate?.() || new Date(eventData.startTime);
        
        if (startTime < now) {
          attended++;
        } else {
          upcoming++;
          if (startTime >= startOfMonth) {
            thisMonth++;
          }
        }
      }
    });

    userStats.value = {
      activitiesAttended: attended,
      upcomingEvents: upcoming,
      thisMonth: thisMonth
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
  }
};

// Methods
const getRoleIcon = (role) => {
  const icons = {
    beneficiary: '🌟',
    caregiver: '💜',
    volunteer: '🤝',
    staff: '👔'
  };
  return icons[role] || '👤';
};

const formatRole = (role) => {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const toggleEdit = () => {
  if (isEditing.value) {
    editForm.value.name = user.value.name;
  }
  isEditing.value = !isEditing.value;
};

const saveChanges = async () => {
  if (!editForm.value.name.trim()) {
    showToast('Name cannot be empty', 'error');
    return;
  }

  saving.value = true;
  try {
    const userRef = doc(db, 'users', currentUserId.value);
    await updateDoc(userRef, {
      name: editForm.value.name.trim()
    });

    user.value.name = editForm.value.name.trim();
    isEditing.value = false;
    showToast('Changes saved successfully');
  } catch (error) {
    console.error('Error saving changes:', error);
    showToast('Failed to save changes', 'error');
  } finally {
    saving.value = false;
  }
};

const contactCaregiver = () => {
  if (caregiver.value?.email) {
    window.location.href = `mailto:${caregiver.value.email}`;
  }
};

const changePassword = () => {
  router.push('/change-password');
};

const helpSupport = () => {
  router.push('/help');
};

const confirmLogout = async () => {
  loggingOut.value = true;
  try {
    await signOut(auth);
    showLogoutModal.value = false;
    router.push('/login');
  } catch (error) {
    console.error('Error logging out:', error);
    showToast('Failed to logout', 'error');
  } finally {
    loggingOut.value = false;
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.page-container {
  background: #f8fafc;
  min-height: 100%;
  padding-bottom: 20px;
  position: relative;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: #64748b;
  font-size: 14px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Profile Header */
.profile-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 16px 16px 50px 16px;
  text-align: center;
  color: white;
  position: relative;
}

.profile-top {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.profile-avatar {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.default-avatar-icon {
  width: 44px;
  height: 44px;
  color: rgba(255, 255, 255, 0.9);
}

.change-photo-btn {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  color: #6366f1;
  border: none;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.membership-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
  background: rgba(255, 255, 255, 0.2);
}

/* Stats Section */
.stats-section {
  display: flex;
  gap: 10px;
  padding: 0 16px;
  margin-top: -30px;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
}

.stat-box {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.stat-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-content strong {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.stat-content span {
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
}

/* Section */
.section {
  padding: 0 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

/* Info Card */
.info-card {
  background: white;
  border-radius: 12px;
  padding: 4px 14px;
  border: 1px solid #e2e8f0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  gap: 12px;
}

.info-item.no-border {
  border-bottom: none;
}

.info-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  color: #0f172a;
  font-weight: 600;
  text-align: right;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-value span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-input {
  width: 100%;
  padding: 8px 10px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  background: white;
}

.edit-input:focus {
  outline: none;
  border-color: #6366f1;
}

/* Contact Button */
.contact-btn {
  width: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 10px 0 6px 0;
}

/* Settings Menu */
.settings-menu {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border: none;
  background: white;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  text-align: left;
}

.menu-item.no-border {
  border-bottom: none;
}

.menu-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.menu-icon {
  font-size: 16px;
}

.menu-arrow {
  font-size: 18px;
  color: #94a3b8;
}

/* Action Section */
.action-section {
  padding: 0 16px;
  margin-bottom: 12px;
}

.save-btn {
  width: 100%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.logout-btn {
  width: 100%;
  background: white;
  color: #dc2626;
  border: 2px solid #fca5a5;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logout-btn:hover {
  background: #fee2e2;
}

/* Version Info */
.version-info {
  text-align: center;
  padding: 16px;
  font-size: 11px;
  color: #94a3b8;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 28px 24px;
  width: 100%;
  max-width: 320px;
  text-align: center;
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.modal-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.modal-content p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.cancel {
  background: #f1f5f9;
  color: #64748b;
  border: none;
}

.modal-btn.cancel:hover {
  background: #e2e8f0;
}

.modal-btn.confirm {
  background: #dc2626;
  color: white;
  border: none;
}

.modal-btn.confirm:hover {
  background: #b91c1c;
}

.modal-btn.confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  z-index: 1001;
  animation: toastIn 0.3s ease;
}

.toast.success {
  background: #10b981;
  color: white;
}

.toast.error {
  background: #dc2626;
  color: white;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>