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
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/ProfileView.vue'),
    },
  ],
})


export default router