<template>
  <div id="app-wrapper">
    <div class="mobile-frame">
      <!-- Header -->
      <header class="app-header">
        <div class="header-left">
          <img src="@/assets/minds-logo.png" alt="MINDS" class="logo" />
          <div :class="['role-badge', user.role]">
            {{ getRoleLabel(user.role) }}
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="scroll-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <!-- Bottom Navigation -->
      <nav class="bottom-nav" v-if="showBottomNav">
        <!-- Beneficiary/Caregiver Nav -->
        <template v-if="user.role === 'beneficiary' || user.role === 'caregiver'">
          <router-link :to="homePath" class="nav-item">
            <span class="nav-icon">🏠</span>
            <span class="nav-label">Home</span>
          </router-link>
          <router-link to="/calendar" class="nav-item">
            <span class="nav-icon">📅</span>
            <span class="nav-label">Activities</span>
          </router-link>
          <router-link to="/my-plans" class="nav-item">
            <span class="nav-icon">📋</span>
            <span class="nav-label">My Plans</span>
          </router-link>
          <router-link to="/profile" class="nav-item">
            <span class="nav-icon">👤</span>
            <span class="nav-label">Profile</span>
          </router-link>
        </template>

        <!-- Volunteer Nav -->
        <template v-if="user.role === 'volunteer'">
          <router-link :to="homePath" class="nav-item">
            <span class="nav-icon">🏠</span>
            <span class="nav-label">Home</span>
          </router-link>
          <router-link to="/calendar" class="nav-item">
            <span class="nav-icon">📅</span>
            <span class="nav-label">Opportunities</span>
          </router-link>
          <router-link to="/my-shifts" class="nav-item">
            <span class="nav-icon">📋</span>
            <span class="nav-label">My Shifts</span>
          </router-link>
          <router-link to="/profile" class="nav-item">
            <span class="nav-icon">👤</span>
            <span class="nav-label">Profile</span>
          </router-link>
        </template>

        <!-- Staff/Admin Nav -->
        <template v-if="user.role === 'staff'">
          <router-link :to="homePath" class="nav-item">
            <span class="nav-icon">🏠</span>
            <span class="nav-label">Dashboard</span>
          </router-link>
          <router-link to="/staff/users" class="nav-item">
            <span class="nav-icon">👥</span>
            <span class="nav-label">Users</span>
          </router-link>
          <router-link to="/staff/events" class="nav-item">
            <span class="nav-icon">📅</span>
            <span class="nav-label">Events</span>
          </router-link>
          <router-link to="/profile" class="nav-item">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">Settings</span>
          </router-link>
        </template>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// User state - In production, this should come from your auth store (Pinia/Vuex)
// The login/signup page will set this after authentication
const user = ref({ 
  name: "Xuan Yu", 
  role: 'volunteer' // This will be set by login/signup
});

// TODO: Replace with actual auth store
// Example: 
// import { useAuthStore } from '@/stores/auth'
// const authStore = useAuthStore()
// const user = computed(() => authStore.user)

// Compute home path based on role
const homePath = computed(() => {
  const roleRoutes = {
    beneficiary: '/userhome',
    caregiver: '/userhome',
    volunteer: '/volunteerhome',
    staff: '/staffhome'
  };
  return roleRoutes[user.value.role] || '/';
});

// Hide bottom nav on certain pages (login, 404, etc.)
const showBottomNav = computed(() => {
  const hideNavRoutes = ['home', 'NotFound', 'Login', 'Signup'];
  return !hideNavRoutes.includes(route.name);
});

// Get role label for badge
const getRoleLabel = (role) => {
  const labels = {
    beneficiary: 'Beneficiary',
    caregiver: 'Caregiver',
    volunteer: 'Volunteer',
    staff: 'Staff Admin'
  };
  return labels[role] || role;
};
</script>

<style>
/* Global Resets */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* App Wrapper */
#app-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  width: 100vw;
  padding: 20px;
}

/* Mobile Frame */
.mobile-frame {
  width: 100%;
  max-width: 430px;
  height: 90vh;
  max-height: 932px;
  background: white;
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Header */
.app-header {
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 28px;
  width: auto;
  object-fit: contain;
}

.role-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.beneficiary,
.role-badge.caregiver {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.role-badge.volunteer {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: #7c3aed;
}

.role-badge.staff {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
}

/* Scroll Area */
.scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f8fafc;
  position: relative;
  scroll-behavior: smooth;
}

/* Hide scrollbar for cleaner look */
.scroll-area::-webkit-scrollbar {
  width: 6px;
}

.scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.scroll-area::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Bottom Navigation */
.bottom-nav {
  position: sticky;
  bottom: 0;
  width: 100%;
  height: 75px;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  z-index: 10;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-decoration: none;
  color: #94a3b8;
  transition: all 0.2s;
  padding: 8px 16px;
  border-radius: 12px;
  min-width: 70px;
}

.nav-item:hover {
  color: #64748b;
  background: #f8fafc;
}

.nav-icon {
  font-size: 24px;
  transition: transform 0.2s;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* Active nav item */
.nav-item.router-link-active {
  color: #667eea;
}

.nav-item.router-link-active .nav-icon {
  transform: scale(1.1);
}

.nav-item.router-link-active .nav-label {
  font-weight: 700;
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive - Full screen on mobile */
@media (max-width: 480px) {
  #app-wrapper {
    padding: 0;
    background: white;
  }

  .mobile-frame {
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    box-shadow: none;
  }
}

/* Tablet and desktop - keep frame */
@media (min-width: 481px) {
  .mobile-frame {
    height: 85vh;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .scroll-area {
    scroll-behavior: auto;
  }
  
  .fade-enter-active,
  .fade-leave-active,
  .nav-item,
  .nav-icon {
    transition: none;
  }
}
</style>