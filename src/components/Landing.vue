<script setup>
    import { RouterLink } from 'vue-router'
    import { ref, onMounted, computed } from 'vue'
    
    const currentSlide = ref(0)
    const isLoaded = ref(false)
    
    const slides = [
      {
        icon: '🎨',
        title: 'Discover Activities',
        description: 'Explore a wide range of engaging activities designed to bring joy and connection to your community.'
      },
      {
        icon: '📅',
        title: 'Easy Scheduling',
        description: 'Sign up for events with just a tap. View your calendar and never miss an activity you love.'
      },
      {
        icon: '🤝',
        title: 'Connect & Grow',
        description: 'Join a supportive community, earn badges, and celebrate milestones together.'
      }
    ]
    
    const isLastSlide = computed(() => currentSlide.value === slides.length - 1)
    
    const nextSlide = () => {
      if (currentSlide.value < slides.length - 1) {
        currentSlide.value++
      }
    }
    
    const goToSlide = (index) => {
      currentSlide.value = index
    }
    
    onMounted(() => {
      setTimeout(() => {
        isLoaded.value = true
      }, 100)
    })
    </script>
    
    <template>
      <div class="landing-page" :class="{ 'is-loaded': isLoaded }">
        <!-- Background Elements -->
        <div class="bg-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
    
        <!-- Header Logo -->
        <header class="landing-header">
            <img src="@/assets/minds-logo.png" alt="MINDS" class="logo" />
        </header>
    
        <!-- Main Content -->
        <main class="landing-main">
          <!-- Illustration Area -->
          <div class="illustration-area">
            <div class="illustration-circle">
              <span class="illustration-icon">{{ slides[currentSlide].icon }}</span>
            </div>
            <div class="floating-elements">
              <span class="float-item float-1">⭐</span>
              <span class="float-item float-2">💜</span>
              <span class="float-item float-3">✨</span>
            </div>
          </div>
    
          <!-- Slider Content -->
          <div class="slider-content">
            <transition name="slide-fade" mode="out-in">
              <div :key="currentSlide" class="slide-text">
                <h1 class="slide-title">{{ slides[currentSlide].title }}</h1>
                <p class="slide-description">{{ slides[currentSlide].description }}</p>
              </div>
            </transition>
          </div>
    
          <!-- Pagination Dots -->
          <div class="pagination">
            <button 
              v-for="(slide, index) in slides" 
              :key="index"
              class="pagination-dot"
              :class="{ active: currentSlide === index }"
              @click="goToSlide(index)"
              :aria-label="'Go to slide ' + (index + 1)"
            ></button>
          </div>
        </main>
    
        <!-- Bottom Actions -->
        <footer class="landing-footer">
          <!-- Show Next/Skip if NOT last slide -->
          <template v-if="!isLastSlide">
            <button class="btn-next" @click="nextSlide">
              Next
            </button>
            <button class="btn-skip" @click="goToSlide(slides.length - 1)">
              Skip
            </button>
          </template>
    
          <!-- Show Get Started if last slide -->
          <template v-else>
            <RouterLink to="/signup" class="btn-primary">
              Get Started
            </RouterLink>
            <p class="login-prompt">
              Already have an account? 
              <RouterLink to="/login" class="link">Log in</RouterLink>
            </p>
          </template>
        </footer>
      </div>
    </template>
    
    <style scoped>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
    
    * {
      box-sizing: border-box;
    }
    
    .landing-page {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(165deg, #f0f4ff 0%, #e8eeff 50%, #f5f0ff 100%);
      display: flex;
      flex-direction: column;
      font-family: 'Nunito', sans-serif;
      overflow: hidden;
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    
    .landing-page.is-loaded {
      opacity: 1;
    }
    
    /* Background Shapes */
    .bg-shapes {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }
    
    .shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.5;
    }
    
    .shape-1 {
      width: 180px;
      height: 180px;
      background: linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%);
      top: -50px;
      right: -40px;
      animation: float-slow 8s ease-in-out infinite;
    }
    
    .shape-2 {
      width: 140px;
      height: 140px;
      background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
      bottom: 20%;
      left: -35px;
      animation: float-slow 10s ease-in-out infinite reverse;
    }
    
    .shape-3 {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%);
      bottom: 5%;
      right: -20px;
      animation: float-slow 7s ease-in-out infinite;
    }
    
    @keyframes float-slow {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-12px) rotate(5deg); }
    }
    
    /* Header */
    .landing-header {
      padding: 24px 20px 16px;
      text-align: center;
      position: relative;
      z-index: 10;
      flex-shrink: 0;
    }
    
    .minds-logo {
      height: 36px;
      width: auto;
    }
    
    /* Main Content */
    .landing-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 20px;
      position: relative;
      z-index: 10;
    }
    
    /* Illustration */
    .illustration-area {
      position: relative;
      margin-bottom: 28px;
      flex-shrink: 0;
    }
    
    .illustration-circle {
      width: 130px;
      height: 130px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 12px 40px rgba(99, 102, 241, 0.12),
        0 4px 16px rgba(99, 102, 241, 0.08);
      position: relative;
      animation: pulse-soft 3s ease-in-out infinite;
    }
    
    .illustration-icon {
      font-size: 52px;
      animation: bounce-soft 2s ease-in-out infinite;
    }
    
    @keyframes pulse-soft {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    
    @keyframes bounce-soft {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    
    /* Floating Elements */
    .floating-elements {
      position: absolute;
      inset: -15px;
      pointer-events: none;
    }
    
    .float-item {
      position: absolute;
      font-size: 18px;
      animation: float-around 4s ease-in-out infinite;
    }
    
    .float-1 {
      top: 0px;
      right: -8px;
      animation-delay: 0s;
    }
    
    .float-2 {
      bottom: 10px;
      left: -12px;
      animation-delay: 1s;
    }
    
    .float-3 {
      top: -8px;
      left: 15px;
      animation-delay: 2s;
    }
    
    @keyframes float-around {
      0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
      50% { transform: translateY(-8px) rotate(10deg); opacity: 1; }
    }
    
    /* Slider Content */
    .slider-content {
      text-align: center;
      padding: 0 16px;
      min-height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .slide-text {
      max-width: 280px;
    }
    
    .slide-title {
      font-size: 22px;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 10px 0;
      line-height: 1.2;
    }
    
    .slide-description {
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }
    
    /* Slide Transition */
    .slide-fade-enter-active,
    .slide-fade-leave-active {
      transition: all 0.3s ease;
    }
    
    .slide-fade-enter-from {
      opacity: 0;
      transform: translateX(20px);
    }
    
    .slide-fade-leave-to {
      opacity: 0;
      transform: translateX(-20px);
    }
    
    /* Pagination */
    .pagination {
      display: flex;
      gap: 8px;
      margin-top: 20px;
      flex-shrink: 0;
    }
    
    .pagination-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: none;
      background: #cbd5e1;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
    }
    
    .pagination-dot.active {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      width: 24px;
      border-radius: 4px;
    }
    
    .pagination-dot:hover:not(.active) {
      background: #94a3b8;
    }
    
    /* Footer / Actions */
    .landing-footer {
      padding: 24px 20px 32px;
      text-align: center;
      position: relative;
      z-index: 10;
      flex-shrink: 0;
    }
    
    .btn-next {
      width: 100%;
      max-width: 280px;
      padding: 14px 24px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      font-size: 15px;
      font-weight: 700;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
      transition: all 0.3s ease;
      margin-bottom: 12px;
    }
    
    .btn-next:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(99, 102, 241, 0.4);
    }
    
    .btn-skip {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      padding: 6px 16px;
      transition: color 0.2s;
    }
    
    .btn-skip:hover {
      color: #64748b;
    }
    
    .btn-primary {
      display: block;
      width: 100%;
      max-width: 280px;
      margin: 0 auto 12px;
      padding: 14px 24px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      font-size: 15px;
      font-weight: 700;
      border: none;
      border-radius: 12px;
      text-decoration: none;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
      transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(99, 102, 241, 0.4);
    }
    
    .login-prompt {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }
    
    .link {
      color: #6366f1;
      font-weight: 700;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .link:hover {
      color: #4f46e5;
      text-decoration: underline;
    }
    </style>