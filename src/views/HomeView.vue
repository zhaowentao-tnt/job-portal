<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero" :class="{ 'hero--has-bg': effectiveHeroBg }" :style="heroStyle">
      <div v-if="effectiveHeroBg" class="hero-overlay"></div>
      <div class="hero-inner container">
        <div class="hero-text">
          <h1 class="hero-name">{{ profile.name }}</h1>
          <p class="hero-title">{{ profile.title }}</p>
          <p class="hero-tagline">{{ profile.tagline }}</p>
          <div class="hero-links">
            <a
              v-for="link in profile.links"
              :key="link.label"
              :href="resolveLinkUrl(link)"
              class="btn"
              :class="link.primary ? 'btn--primary' : 'btn--outline'"
              :target="link.type === 'email' ? '_self' : '_blank'"
              rel="noopener"
            >
              {{ link.icon }} {{ link.label }}
            </a>
          </div>
        </div>
        <div class="hero-avatar">
          <div class="avatar-ring">
            <img v-if="avatarSrc" :src="avatarSrc" class="avatar-img" />
            <div v-else class="avatar-placeholder">
              {{ profile.name?.charAt(0) }}
            </div>
          </div>
        </div>
      </div>
      <div class="hero-scroll"><span>&darr;</span></div>
    </section>

    <!-- Sub Navigation -->
    <nav class="subnav" :class="{ 'subnav--stuck': isSubnavStuck }" ref="subnavRef">
      <div class="container">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="subnav-tab"
          :class="{ 'subnav-tab--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </nav>

    <!-- Tab Content -->
    <section class="container tab-content">
      <component :is="currentTabComponent" :data="currentTabData" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useData } from '../composables/useData'
import AboutTab from '../components/home/tabs/AboutTab.vue'
import ExperienceTab from '../components/home/tabs/ExperienceTab.vue'
import PortfolioTab from '../components/home/tabs/PortfolioTab.vue'
import GrowthTab from '../components/home/tabs/GrowthTab.vue'
import LifeTab from '../components/home/tabs/LifeTab.vue'

const { data } = useData()

const activeTab = ref('about')
const isSubnavStuck = ref(false)
const subnavRef = ref(null)

const tabs = [
  { id: 'about', label: '关于我', component: AboutTab, dataKey: 'profile' },
  { id: 'experience', label: '经历', component: ExperienceTab, dataKey: 'experiences' },
  { id: 'portfolio', label: '作品集', component: PortfolioTab, dataKey: 'portfolio' },
  { id: 'growth', label: '成长轨迹', component: GrowthTab, dataKey: 'growth' },
  { id: 'life', label: '校园&生活', component: LifeTab, dataKey: 'life' }
]

const currentTabComponent = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.component || AboutTab
})

const currentTabData = computed(() => {
  const tab = tabs.find(t => t.id === activeTab.value)
  return data.value[tab?.dataKey] || {}
})

const profile = computed(() => data.value.profile || {
  name: '',
  title: '',
  tagline: '',
  links: [],
  avatar: '',
  avatarPath: '',
  logo: '',
  logoPath: '',
  heroBg: '',
  heroBgPath: ''
})

// Resolve avatar: uploaded base64 > path > empty (show first char)
const avatarSrc = computed(() => profile.value.avatar || profile.value.avatarPath || '')

// Resolve hero background: uploaded base64 > path > empty (use gradient)
const effectiveHeroBg = computed(() => {
  const p = profile.value
  return p.heroBg || p.heroBgPath || ''
})

const heroStyle = computed(() => {
  if (!effectiveHeroBg.value) return {}
  return {
    backgroundImage: `url(${effectiveHeroBg.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

// Resolve link URL: email type -> mailto:, url type -> direct
function resolveLinkUrl(link) {
  if (!link) return '#'
  if (link.type === 'email') {
    const email = link.url || ''
    return email ? `mailto:${email}` : '#'
  }
  return link.url || '#'
}

let observer = null

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => { isSubnavStuck.value = !entry.isIntersecting },
    { threshold: 0 }
  )
  if (subnavRef.value) observer.observe(subnavRef.value)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
/* === Hero === */
.hero {
  background: linear-gradient(135deg, #f0f4ff 0%, #f6f7fa 40%, #eefaf5 100%);
  padding: 80px 0 60px;
  position: relative;
  overflow: hidden;
}

.hero--has-bg {
  background: none;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(240, 244, 255, 0.82) 0%, rgba(246, 247, 250, 0.78) 40%, rgba(238, 250, 245, 0.82) 100%);
  z-index: 0;
}

.hero-inner {
  display: flex;
  align-items: center;
  gap: 60px;
  position: relative;
  z-index: 1;
}

.hero-text { flex: 1; }

.hero-name {
  font-size: 48px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -1px;
  line-height: 1.2;
  margin-bottom: 8px;
}

.hero-title {
  font-size: 18px;
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 14px;
}

.hero-tagline {
  font-size: 20px;
  color: var(--text-sub);
  line-height: 1.6;
  margin-bottom: 28px;
}

.hero-links {
  display: flex;
  gap: 12px;
}

.hero-avatar { flex-shrink: 0; }

.avatar-ring {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  padding: 4px;
  box-shadow: 0 8px 32px rgba(67, 97, 238, 0.25);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  font-weight: 800;
  color: var(--primary);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.hero-scroll {
  text-align: center;
  margin-top: 40px;
  opacity: 0;
  animation: fadeInUp 1s ease 0.5s forwards;
}

.hero-scroll span {
  font-size: 20px;
  color: var(--text-light);
  animation: bounce 2s infinite;
}

@keyframes fadeInUp {
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(6px); }
  60% { transform: translateY(3px); }
}

/* === Sub Nav === */
.subnav {
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-light);
  padding: 0;
  position: sticky;
  top: var(--nav-height);
  z-index: 90;
  transition: box-shadow 0.3s;
}

.subnav--stuck {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.subnav .container {
  display: flex;
  gap: 0;
  overflow-x: auto;
}

.subnav-tab {
  padding: 14px 22px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-sub);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: var(--font-family);
}

.subnav-tab:hover { color: var(--primary); }

.subnav-tab--active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

/* === Tab Content === */
.tab-content {
  padding-top: 48px;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-inner {
    flex-direction: column-reverse;
    text-align: center;
    gap: 30px;
  }

  .hero-name { font-size: 36px; }
  .hero-links { justify-content: center; }
  .avatar-ring { width: 140px; height: 140px; }
  .avatar-placeholder { font-size: 42px; }
  .subnav-tab { padding: 12px 16px; font-size: 13px; }
}
</style>
