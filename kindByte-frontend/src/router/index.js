import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public Routes
    { 
      path: '/', 
      name: 'home', 
      component: HomeView,
      meta: { public: true }
    },
    
    // Beneficiary/Caregiver Routes
    { 
      path: '/userhome', 
      name: 'UserHome', 
      component: () => import('../components/UserHome.vue'),
      meta: { requiresAuth: true, roles: ['beneficiary', 'caregiver'] }
    },
    { 
      path: '/calendar', 
      name: 'Calendar', 
      component: () => import('../components/ActivityCalendar.vue'),
      meta: { requiresAuth: true, roles: ['beneficiary', 'caregiver'] }
    },
    { 
      path: '/my-plans', 
      name: 'MyPlans', 
      component: () => import('../components/MyPlans.vue'),
      meta: { requiresAuth: true, roles: ['beneficiary', 'caregiver'] }
    },
    
    // Volunteer Routes
    { 
      path: '/volunteerhome', 
      name: 'VolunteerHome', 
      component: () => import('../components/VolunteerHome.vue'),
      meta: { requiresAuth: true, roles: ['volunteer'] }
    },
    { 
      path: '/my-shifts', 
      name: 'MyShifts', 
      component: () => import('../components/MyPlans.vue'), // Can reuse or create separate
      meta: { requiresAuth: true, roles: ['volunteer'] }
    },
    
    // Staff/Admin Routes
    { 
      path: '/staffhome', 
      name: 'StaffHome', 
      component: () => import('../components/StaffHome.vue'),
      meta: { requiresAuth: true, roles: ['staff'] }
    },
    { 
      path: '/staff/users', 
      name: 'UserManagement',
      component: () => import('../components/UserManagement.vue'),
      meta: { requiresAuth: true, roles: ['staff'] }
    },
    { 
      path: '/staff/events', 
      name: 'StaffEvents',
      component: () => import('../components/ActivityCalendar.vue'), // Can reuse with staff view
      meta: { requiresAuth: true, roles: ['staff'] }
    },
    { 
      path: '/staff/registrations', 
      name: 'StaffRegistrations',
      component: () => import('../components/StaffHome.vue'), // Placeholder
      meta: { requiresAuth: true, roles: ['staff'] }
    },
    
    // Shared Routes (All authenticated users)
    { 
      path: '/profile', 
      name: 'Profile', 
      component: () => import('../components/Profile.vue'),
      meta: { requiresAuth: true, roles: ['beneficiary', 'caregiver', 'volunteer', 'staff'] }
    },
    
  ],
})

// Navigation Guard for Role-Based Access Control
router.beforeEach((to, from, next) => {
  // Get current user role from your auth store/state management
  // Replace this with your actual auth logic
  const currentUser = getCurrentUser() // You'll need to implement this
  const isAuthenticated = !!currentUser
  const userRole = currentUser?.role

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login/home if not authenticated
    next({ name: 'home' })
    return
  }

  // Check if user has required role
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    // Redirect to user's appropriate home page
    const homeRoutes = {
      beneficiary: '/userhome',
      caregiver: '/userhome',
      volunteer: '/volunteerhome',
      staff: '/staffhome'
    }
    next(homeRoutes[userRole] || '/')
    return
  }

  next()
})

// Helper function - implement based on your auth system
function getCurrentUser() {
  // Example: Get from localStorage, Pinia store, or Vuex
  // return JSON.parse(localStorage.getItem('user'))
  
  // For development, you can mock a user:
  return {
    id: '1',
    name: 'Xuan Yu',
    role: 'beneficiary' // Change this to test different roles
  }
}

export default router