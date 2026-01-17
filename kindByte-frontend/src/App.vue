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

      <!-- Bottom Navigation -->
      <nav class="bottom-nav" v-if="showBottomNav">
        <!-- Home - use div with click handler instead of router-link -->
        <div 
          class="nav-item" 
          :class="{ active: isHomeActive }"
          @click="goToHome"
        >
          <span class="nav-icon">🏠</span>
          <span class="nav-label">Home</span>
        </div>
        
        <router-link to="/activitycalendar" class="nav-item">
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

const route = useRoute();
const router = useRouter();

const userRole = ref(null);

// Fetch user role from Firestore
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          userRole.value = userDoc.data().role;
          console.log('User role from Firebase:', userRole.value);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    } else {
      userRole.value = null;
    }
  });
});

// Get home path based on role
const getHomePath = () => {
  switch (userRole.value) {
    case 'beneficiary':
      return '/userhome';
    case 'staff':
      return '/staffhome';
    case 'volunteer':
      return '/volunteerhome';
    default:
      return '/userhome';
  }
};

// Navigate to home
const goToHome = () => {
  router.push(getHomePath());
};

// Check if current route is any home page
const isHomeActive = computed(() => {
  const homePaths = ['/userhome', '/caregiverhome', '/staffhome', '/volunteerhome'];
  return homePaths.includes(route.path);
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
  transition: all 0.2s;
  padding: 8px 12px;
  border-radius: 12px;
  min-width: 65px;
  cursor: pointer;
}

.nav-item:hover {
  color: #64748b;
  background: #f8fafc;
}

.nav-icon {
  font-size: 22px;
  transition: transform 0.2s;
}

.nav-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-align: center;
}

/* Active state for both router-link and custom home button */
.nav-item.router-link-active,
.nav-item.active {
  color: #667eea;
}

.nav-item.router-link-active .nav-icon,
.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-item.router-link-active .nav-label,
.nav-item.active .nav-label {
  font-weight: 700;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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

@media (min-width: 481px) {
  .mobile-frame {
    height: 85vh;
  }
}

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