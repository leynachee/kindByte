<template>
  <div class="mobile-wrapper">
    <div class="content-view">
      <router-view />
    </div>
    
    <nav class="bottom-nav">
      <router-link to="/userhome" class="nav-item">
        <span class="icon">🏠</span>
        <span class="label">Home</span>
      </router-link>
      
      <router-link to="/staffhome" class="nav-item">
        <span class="icon">📅</span>
        <span class="label">Calendar</span>
      </router-link>
      
      <router-link to="/my-plans" class="nav-item">
        <span class="icon">📋</span>
        <span class="label">My Plans</span>
      </router-link>
      
      <router-link to="/profile" class="nav-item">
        <span class="icon">👤</span>
        <span class="label">Profile</span>
      </router-link>
    </nav>
  </div>
</template>

<style>
:root {
  --minds-blue: #0369a1;
  --bg-soft: #f8fafc;
}

body { 
  margin: 0; 
  background-color: #f1f5f9; 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica;
}

.mobile-wrapper {
  max-width: 430px; 
  margin: 0 auto;
  background: white;
  min-height: 100vh;
  position: relative;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

.content-view {
  padding-bottom: 100px; 
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 430px;
  height: 85px;
  background: white;
  display: flex;
  border-top: 1px solid #e2e8f0;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
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
  color: var(--minds-blue);
}

.nav-item .icon { font-size: 24px; margin-bottom: 4px; }
.nav-item .label { font-size: 11px; font-weight: 600; }
</style>