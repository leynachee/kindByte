<template>
    <div class="page-container">
      <section class="welcome-section">
        <div class="greeting">
          <button @click="$router.push('/staffhome')" class="back-link">← Back to Dashboard</button>
          <h1>User Management 👥</h1>
          <p class="staff-badge">
            <span class="badge-icon">🛡️</span>
            <strong>Directory</strong> • MTC Central
          </p>
        </div>
      </section>
  
      <div class="tab-container">
        <button 
          type="button"
          @click="activeTab = 'beneficiary'" 
          :class="['tab-btn', { active: activeTab === 'beneficiary' }]"
        >
          Beneficiaries
        </button>
        <button 
          type="button"
          @click="activeTab = 'volunteer'" 
          :class="['tab-btn', { active: activeTab === 'volunteer' }]"
        >
          Volunteers
        </button>
      </div>
  
      <div class="section">
        <h3 class="section-title">Active Directory</h3>
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by name..." 
            class="search-input" 
          />
        </div>
  
        <div v-if="loading" class="loading-box">
          <div class="spinner"></div>
          <p>Fetching from database...</p>
        </div>
  
        <div v-else-if="filteredUsers.length === 0" class="empty-state">
          <p>No {{ activeTab }}s found matching your search.</p>
        </div>
  
        <div v-else class="user-list">
          <div v-for="user in filteredUsers" :key="user.id" class="user-card">
            <div class="user-avatar" :class="activeTab">
              {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
            </div>
            <div class="user-info">
              <h4 class="user-meta">{{ user.email }}</h4>
              <div class="user-status">
                <span class="status-badge" :class="activeTab">{{ activeTab }}</span>
                <span v-if="user.contact" class="status-badge neutral">📞 {{ user.contact }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { db } from '@/firebase';
  import { collection, getDocs } from 'firebase/firestore';
  
  const activeTab = ref('beneficiary');
  const users = ref([]);
  const loading = ref(true);
  const searchQuery = ref('');
  
  const fetchUsers = async () => {
    loading.value = true;
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      // Map data and normalize roles to lowercase for consistent filtering
      users.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: doc.data().role ? doc.data().role.toLowerCase() : 'beneficiary'
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      loading.value = false;
    }
  };
  
  const filteredUsers = computed(() => {
    return users.value.filter(user => {
      // Matches the active tab role (beneficiary or volunteer)
      const matchesRole = user.role === activeTab.value;
      // Matches search query (name or email)
      const matchesSearch = 
        (user.name?.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        (user.email?.toLowerCase().includes(searchQuery.value.toLowerCase()));
      
      return matchesRole && matchesSearch;
    });
  });
  
  onMounted(fetchUsers);
  </script>
  
  <style scoped>
  /* Ensure your StaffHome.vue global styles are applied here */
  .page-container {
    padding: 24px 20px 100px;
    max-width: 800px;
    margin: 0 auto;
    background: #f8fafc;
    min-height: 100vh;
  }
  
  .back-link { 
    background: none; border: none; color: #6366f1; 
    font-weight: 600; font-size: 13px; cursor: pointer; padding: 0; margin-bottom: 8px;
  }
  
  .tab-container {
    display: flex;
    background: #e2e8f0;
    padding: 4px;
    border-radius: 12px;
    margin-bottom: 24px;
  }
  
  .tab-btn {
    flex: 1; padding: 10px; border: none; border-radius: 10px;
    font-weight: 700; font-size: 14px; color: #64748b;
    cursor: pointer; background: transparent; transition: all 0.2s;
  }
  
  .tab-btn.active {
    background: white; color: #6366f1;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  }
  
  /* User Card Styles */
  .user-list { display: flex; flex-direction: column; gap: 12px; }
  .user-card {
    background: white; border-radius: 14px; padding: 12px;
    border: 1px solid #e2e8f0; display: flex; gap: 12px; align-items: center;
  }
  
  .user-avatar {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 18px; color: white;
  }
  .user-avatar.beneficiary { background: #6366f1; }
  .user-avatar.volunteer { background: #10b981; }
  
  .user-info { flex: 1; min-width: 0; }
  .user-name { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
  .user-meta { font-size: 12px; color: #64748b; margin-bottom: 4px; }
  
  .status-badge {
    padding: 3px 8px; border-radius: 8px; font-size: 10px; font-weight: 700;
    text-transform: capitalize; margin-right: 5px;
  }
  .status-badge.beneficiary { background: #e0e7ff; color: #6366f1; }
  .status-badge.volunteer { background: #d1fae5; color: #059669; }
  .status-badge.neutral { background: #f1f5f9; color: #64748b; }
  
  .search-input {
    width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0;
    margin-bottom: 20px; font-size: 14px;
  }
  
  .loading-box { text-align: center; padding: 40px; color: #64748b; }
  
  /* Stats Reused from StaffHome */
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .stat-card { background: white; border-radius: 14px; padding: 16px; border: 2px solid; }
  .stat-card.primary { border-color: #bfdbfe; }
  .stat-card.accent { border-color: #d1fae5; }
  </style>