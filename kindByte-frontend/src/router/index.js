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
    
    // AUTH ROUTES
    {
      path: '/login',
      name: 'Login',
      component: () => import('../components/Login.vue'),
      meta: { public: true }
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/SignupView.vue'),
      meta: { public: true }
    },
    {
      path: '/forgotpassword',
      name: 'ForgotPassword',
      component: () => import('../views/ForgotPasswordView.vue'),
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
      component: () => import('../components/MyPlans.vue'),
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
      path: '/staff/events', 
      name: 'StaffEvents',
      component: () => import('../components/ActivityCalendar.vue'),
      meta: { requiresAuth: true, roles: ['staff'] }
    },
    {
      path: '/createevent',
      name: 'CreateEvent',
      component: () => import('../components/CreateEvent.vue'),
      meta: { requiresAuth: true, roles: ['staff'] }
    },
    {
      path: '/editevent/:id',
      name: 'EditEvent',
      component: () => import('../components/EditEvent.vue'),
      meta: { requiresAuth: true, roles: ['staff'] }
    },
    {
      path: '/staff/calendar',
      name: 'StaffCalendar',
      component: () => import('../views/StaffCalendar.vue'), 
      meta: { requiresAuth: true, roles: ['staff'] }
    },
    
    // --- UPDATED PROFILE ROUTES ---
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../components/Profile.vue'),
      meta: { requiresAuth: true, roles: ['beneficiary', 'caregiver', 'volunteer'] }
    },
    {
      path: '/staff-profile',
      name: 'StaffProfile',
      component: () => import('../components/StaffProfile.vue'),
      meta: { requiresAuth: true, roles: ['staff'] }
    },
    // ------------------------------

    {
      path: '/viewevent/:id', 
      name: 'ViewEvent',
      component: () => import('../views/ViewEvent.vue'),
      meta: { requiresAuth: true, roles: ['beneficiary', 'caregiver', 'volunteer', 'staff'] }
    },
    {
      path: '/registerevent/:id', 
      name: 'RegisterEvent',
      component: () => import('../views/RegisterEvent.vue'),
      meta: { requiresAuth: true, roles: ['beneficiary', 'caregiver', 'volunteer'] }
    },
    {
      path: '/manage-events',
      name: 'ManageEvents',
      component: () => import('@/components/ManageEvents.vue'),
      meta: { requiresAuth: true, roles: ['staff'] }
    },
    {
      path: '/user-management',
      name: 'UserManagement',
      component: () => import('@/components/UserManagement.vue'),
      meta: { requiresAuth: true, roles: ['staff'] }
    }, 
    {
      path: '/attendance-report',
      name: 'AttendanceReport',
      component: () => import('@/components/AttendanceReport.vue'),
      meta: { requiresAuth: true, roles: ['staff'] }
    }, 
  ],
})

export default router