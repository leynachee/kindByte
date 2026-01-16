<template>
    <div class="page-container">
      <section class="welcome-section">
        <div class="greeting">
          <button @click="$router.push('/staffhome')" class="back-link">← Back to Dashboard</button>
          <h1>Attendance Report 📊</h1>
          <p class="staff-badge">
            <span class="badge-icon">📈</span>
            <strong>Data Export</strong> • MTC Central
          </p>
        </div>
      </section>
  
      <div class="section">
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <h3 class="stat-value">{{ events.length }}</h3>
              <p class="stat-label">Total Events</p>
            </div>
          </div>
          <div class="stat-card accent">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3 class="stat-value">{{ totalAttendees }}</h3>
              <p class="stat-label">Total Attendance</p>
            </div>
          </div>
        </div>
      </div>
  
      <div class="alert-banner">
        <div class="alert-content">
          <span class="alert-icon">📄</span>
          <div class="alert-text">
            <strong>Excel Export Ready</strong>
            <span>Download full event registration data</span>
          </div>
        </div>
        <button @click="exportToExcel" class="alert-action" :disabled="loading">
          {{ loading ? 'Loading...' : 'Export to Excel' }}
        </button>
      </div>
  
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Data Preview</h3>
        </div>
        
        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Category</th>
                <th>Joined</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in events" :key="event.id">
                <td class="event-name-cell">{{ event.name }}</td>
                <td>{{ formatDate(event.date) }}</td>
                <td>
                  <span class="status-badge volunteers">{{ event.category }}</span>
                </td>
                <td class="count-cell">{{ event.attendeeCount || 0 }}</td>
                <td class="capacity-cell">{{ event.maxCapacity }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { db } from '@/firebase';
  import { collection, getDocs, query, orderBy } from 'firebase/firestore';
  import * as XLSX from 'xlsx';
  
  const events = ref([]);
  const loading = ref(true);
  
  const fetchReportData = async () => {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      events.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } finally {
      loading.value = false;
    }
  };
  
  const totalAttendees = computed(() => 
    events.value.reduce((sum, e) => sum + (e.attendeeCount || 0), 0)
  );
  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-SG', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    });
  };
  
  const exportToExcel = () => {
    const excelData = events.value.map(e => ({
      'Event Name': e.name,
      'Date': e.date,
      'Category': e.category,
      'Joined': e.attendeeCount || 0,
      'Capacity': e.maxCapacity
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `MTC_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
  };
  
  onMounted(fetchReportData);
  </script>
  
  <style scoped>
  /* Reusing your StaffHome variables */
  .page-container {
    padding: 24px 20px 100px;
    max-width: 800px;
    margin: 0 auto;
    background: #f8fafc;
    min-height: 100vh;
  }
  
  .back-link { 
    background: none; border: none; color: #6366f1; 
    font-weight: 600; cursor: pointer; margin-bottom: 8px; font-size: 13px;
  }
  
  /* Stats Grid Layout */
  .stats-grid { 
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; 
  }
  
  .stat-card {
    background: white; border-radius: 14px; padding: 16px; border: 2px solid;
    display: flex; flex-direction: column; gap: 10px;
  }
  
  .stat-card.primary { border-color: #bfdbfe; background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%); }
  .stat-card.accent { border-color: #d1fae5; background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%); }
  
  .stat-value { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; }
  .stat-label { font-size: 12px; color: #64748b; font-weight: 600; margin: 0; }
  
  /* Alert Banner Style */
  .alert-banner {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border: 2px solid #86efac; border-radius: 14px;
    padding: 16px; margin-bottom: 28px;
    display: flex; justify-content: space-between; align-items: center;
  }
  
  .alert-content { display: flex; align-items: center; gap: 12px; }
  .alert-text { display: flex; flex-direction: column; }
  .alert-text strong { font-size: 14px; color: #166534; }
  .alert-text span { font-size: 12px; color: #15803d; }
  
  .alert-action {
    background: #10b981; color: white; border: none;
    padding: 10px 16px; border-radius: 10px;
    font-weight: 700; font-size: 13px; cursor: pointer;
  }
  
  /* Table Design */
  .table-container {
    background: white; border-radius: 14px; border: 1px solid #e2e8f0;
    overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  
  .report-table { width: 100%; border-collapse: collapse; text-align: left; }
  .report-table th {
    background: #f8fafc; padding: 12px 16px;
    color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase;
  }
  
  .report-table td { padding: 14px 16px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #1e293b; }
  .event-name-cell { font-weight: 700; }
  
  .status-badge.volunteers {
    background: #ddd6fe; color: #7c3aed;
    padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700;
  }
  </style>