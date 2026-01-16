<template>
  <div id="app-wrapper">
    <div class="mobile-frame">
      <header class="app-header" v-if="showHeader">
        <div class="header-left">
          <img src="@/assets/minds-logo.png" alt="MINDS" class="logo" />
        </div>
      </header>

      <main class="scroll-area" :class="{ 'full-screen': !showHeader }">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <nav class="bottom-nav" v-if="showBottomNav">
        <router-link :to="homePath" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">Home</span>
        </router-link>
        
        <router-link :to="calendarPath" class="nav-item">
          <span class="nav-icon">📅</span>
          <span class="nav-label">Calendar</span>
        </router-link>
        
        <router-link :to="activityPath" class="nav-item">
          <span class="nav-icon">📋</span>
          <span class="nav-label">{{ activityLabel }}</span>
        </router-link>
        
        <router-link to="/profile" class="nav-item">
          <span class="nav-icon">👤</span>
          <span class="nav-label">Profile</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { authStore } from '@/authStore'; 

const route = useRoute();

// Get the role from your store
const userRole = computed(() => authStore.user?.role || 'beneficiary');
const isStaff = computed(() => userRole.value === 'staff');

// Dynamic Paths
const homePath = computed(() => {
  const routes = {
    staff: '/staffhome',
    volunteer: '/volunteerhome',
    beneficiary: '/userhome'
  };
  return routes[userRole.value] || '/';
});

// FIX: Targeting the StaffCalendar route
const calendarPath = computed(() => {
  // If staff, go to /staff/calendar (StaffCalendar.vue)
  // If user, go to /calendar (ActivityCalendar.vue)
  return isStaff.value ? '/staff/calendar' : '/calendar';
});

const activityPath = computed(() => {
  return isStaff.value ? '/staff/manage-events' : '/my-plans';
});

const activityLabel = computed(() => {
  return isStaff.value ? 'Manage' : 'My Plans';
});

// Visibility logic
const hideOnRoutes = ['Landing', 'Login', 'Signup', 'ForgotPassword'];
const showHeader = computed(() => route.name && !hideOnRoutes.includes(route.name));
const showBottomNav = computed(() => route.name && !hideOnRoutes.includes(route.name));
</script>

<style>
/* --- THEMED MOBILE FRAME STYLES --- */
* { box-sizing: border-box; margin: 0; padding: 0; }

#app-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  width: 100vw;
}

.mobile-frame {
  width: 100%;
  max-width: 400px;      /* Slightly narrower for better proportion */
  height: 800px;         /* Fixed height for a consistent look */
  max-height: 85vh;      /* Prevents it from being taller than your screen */
  background: white;
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 40px;   /* The "rounded" phone look */
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  margin-top: 20px;      /* Centering tweak */
}

.app-header {
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.logo { height: 28px; }

.scroll-area {
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
}

.scroll-area.full-screen {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* --- REPAIRED BOTTOM NAV --- */
.bottom-nav {
  position: sticky;
  bottom: 0;
  width: 100%;
  height: 85px;
  background: white;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #e2e8f0;
  padding-bottom: 20px; /* Space for home bar on mobile */
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #94a3b8;
}

.nav-item.router-link-active {
  color: #667eea; /* Purple highlight for active link */
}

.nav-icon { font-size: 24px; margin-bottom: 4px; }
.nav-label { font-size: 11px; font-weight: 600; }
</style>