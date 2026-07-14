<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/home" class="nav-brand">
        <span class="brand-logo">
          <img v-if="logoSrc" :src="logoSrc" class="brand-logo-img" alt="logo" />
          <span v-else>{{ logoFallback }}</span>
        </span>
        <span class="brand-text">
          <span class="brand-name">{{ brandName }}</span>
          <span class="brand-sub">PM · 数据驱动</span>
        </span>
      </router-link>

      <button class="nav-toggle" @click="menuOpen = !menuOpen" :class="{ 'nav-toggle--open': menuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="nav-links" :class="{ 'nav-links--open': menuOpen }">
        <router-link to="/home" class="nav-link" active-class="nav-link--active" @click="menuOpen = false">
          个人主页
        </router-link>
        <router-link to="/tracker" class="nav-link" active-class="nav-link--active" @click="menuOpen = false">
          投递追踪
        </router-link>
        <router-link to="/jobs" class="nav-link" active-class="nav-link--active" @click="menuOpen = false">
          招聘信息
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useData } from '../../composables/useData'

const menuOpen = ref(false)
const { data } = useData()

const profile = computed(() => data.value.profile || {})

// Logo: uploaded base64 > path > first character of name
const logoSrc = computed(() => profile.value.logo || profile.value.logoPath || '')
const logoFallback = computed(() => profile.value.name?.charAt(0) || '赵')
const brandName = computed(() => profile.value.name || '赵文涛')
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-light);
  height: var(--nav-height);
}

.navbar-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* === Brand === */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none !important;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: #fff;
  font-size: 18px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
  flex-shrink: 0;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.brand-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nav-brand:hover .brand-logo {
  transform: rotate(-5deg) scale(1.05);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.5px;
}

.brand-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-light);
  letter-spacing: 0.5px;
}

/* === Links === */
.nav-links {
  display: flex;
  gap: 4px;
  align-items: center;
}

.nav-link {
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-sub) !important;
  transition: all 0.2s;
  text-decoration: none !important;
}

.nav-link:hover {
  background: var(--primary-light);
  color: var(--primary) !important;
}

.nav-link--active {
  background: var(--primary-light);
  color: var(--primary) !important;
}

/* === Mobile toggle === */
.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}

.nav-toggle span {
  width: 22px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition: all 0.3s;
}

.nav-toggle--open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.nav-toggle--open span:nth-child(2) {
  opacity: 0;
}
.nav-toggle--open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* === Responsive === */
@media (max-width: 768px) {
  .brand-sub {
    display: none;
  }

  .nav-toggle {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: var(--nav-height);
    left: 0;
    right: 0;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-light);
    padding: 12px 24px;
    gap: 4px;
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s;
  }

  .nav-links--open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .nav-link {
    width: 100%;
    padding: 12px 18px;
  }
}
</style>
