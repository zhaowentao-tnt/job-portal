<template>
  <div class="content-inner about" ref="root">
    <!-- ============ HERO ============ -->
    <section class="hero">
      <div class="hero-glow"></div>
      <div class="hero-left">
        <p class="hero-hello">你好，我是</p>
        <h1 class="hero-name">{{ data.name }}</h1>
        <p class="hero-tag">{{ data.tagline }}</p>
        <div class="hero-tags">
          <span class="hero-tag-pill">📊 数据分析</span>
          <span class="hero-tag-pill">📋 业财融合</span>
          <span class="hero-tag-pill">🤖 AI 应用</span>
        </div>
        <div class="hero-actions">
          <a
            v-for="l in data.links"
            :key="l.label"
            class="btn"
            :class="l.primary ? 'btn-primary' : 'btn-ghost'"
            :href="l.type === 'email' ? 'mailto:' + l.url : l.url"
            :target="l.type === 'email' ? '_self' : '_blank'"
          >{{ l.icon }} {{ l.label }}</a>
        </div>
      </div>
      <div class="hero-right">
        <div class="avatar-ring">
          <img v-if="data.avatarPath" :src="'/job-portal/' + data.avatarPath" class="avatar-img" alt="头像" />
          <div v-else class="avatar-mono">{{ mono }}</div>
        </div>
      </div>
    </section>

    <!-- ============ ELEVATOR PITCH ============ -->
    <p class="pitch">{{ data.summary }}</p>

    <!-- ============ STATS (滚动计数) ============ -->
    <div class="stat-grid" ref="statRef">
      <div v-for="(s, idx) in data.stats" :key="s.label" class="stat-card">
        <div class="stat-icon">{{ s.icon }}</div>
        <div class="stat-value">
          <template v-if="s.static">{{ s.prefix }}{{ s.value }}{{ s.unit }}</template>
          <template v-else>{{ s.prefix }}{{ displayed[idx] }}{{ s.unit }}</template>
        </div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- ============ CAPABILITIES ============ -->
    <h3 class="subsection-title">核心能力</h3>
    <div class="bento-grid">
      <div
        v-for="(cap, idx) in data.capabilities"
        :key="cap.name"
        class="bento-card"
        :class="[`bento-card--${idx % 4}`, idx === 0 || idx === 3 ? 'bento-card--wide' : '']"
      >
        <div class="bento-icon" :style="{ background: cap.color + '1f', color: cap.color }">{{ cap.icon }}</div>
        <div class="bento-head">
          <h4 class="bento-name">{{ cap.name }}</h4>
          <span class="bento-score" :style="{ color: cap.color }">{{ '★'.repeat(cap.score) }}<span class="bento-score--dim">{{ '★'.repeat(5 - cap.score) }}</span></span>
        </div>
        <p class="bento-desc">{{ cap.description }}</p>
        <div class="bento-skills">
          <span v-for="skill in cap.skills" :key="skill" class="tag" :style="{ background: cap.color + '14', color: cap.color, borderColor: cap.color + '38' }">{{ skill }}</span>
        </div>
      </div>
    </div>

    <!-- ============ RADAR ============ -->
    <div class="card radar-card">
      <h4 class="radar-title">能力雷达</h4>
      <v-chart class="radar-chart" :option="radarOption" autoresize />
    </div>

    <!-- ============ CONTACT ============ -->
    <div class="card contact-card">
      <div class="contact-grid">
        <div v-for="item in data.contact" :key="item.label" class="contact-item">
          <span class="contact-label">{{ item.icon }} {{ item.label }}</span>
          <a
            v-if="item.type === 'email'"
            :href="`mailto:${item.value}`"
            class="contact-value contact-link"
          >{{ item.value }}</a>
          <span v-else class="contact-value">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([RadarChart, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps({ data: { type: Object, default: () => ({}) } })

const mono = computed(() => (props.data.name || '?').trim().charAt(0))
const email = computed(() => (props.data.contact || []).find(c => c.type === 'email')?.value || '')

/* ---- 滚动计数动画 ---- */
const statRef = ref(null)
const displayed = reactive((props.data.stats || []).map(() => 0))
let started = false
function animate(i, target) {
  const dur = 1300
  const start = performance.now()
  const step = (now) => {
    const p = Math.min((now - start) / dur, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    displayed[i] = Math.round(eased * target)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
onMounted(() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !started) {
        started = true
        ;(props.data.stats || []).forEach((s, i) => { if (!s.static) animate(i, s.value) })
      }
    })
  }, { threshold: 0.25 })
  if (statRef.value) io.observe(statRef.value)
})

/* ---- 发光雷达 ---- */
const radarOption = computed(() => {
  const caps = props.data.capabilities || []
  return {
    tooltip: { trigger: 'item' },
    radar: {
      indicator: caps.map(c => ({ name: c.name, max: 5 })),
      radius: '66%',
      center: ['50%', '55%'],
      axisName: { color: '#5b6b7b', fontSize: 12, fontWeight: 600 },
      splitNumber: 5,
      splitArea: { areaStyle: { color: ['rgba(255,107,53,0.03)', 'rgba(0,184,148,0.06)'] } },
      splitLine: { lineStyle: { color: 'rgba(0,0,0,0.08)' } },
      axisLine: { lineStyle: { color: 'rgba(0,0,0,0.08)' } }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: caps.map(c => c.score || 3),
            name: '能力评分',
            symbolSize: 6,
            itemStyle: { color: '#FF6B35' },
            lineStyle: { color: '#FF6B35', width: 3, shadowBlur: 12, shadowColor: 'rgba(255,107,53,0.55)' },
            areaStyle: { color: 'rgba(255,107,53,0.28)' }
          }
        ]
      }
    ]
  }
})
</script>

<style scoped>
/* 本地主题覆盖：活力橙青 */
.content-inner.about {
  --primary: #FF6B35;
  --accent: #00B894;
}

/* ============ HERO ============ */
.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 40px 38px;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(125deg, #FF6B35 0%, #FF8C42 45%, #FFB020 100%);
  color: #fff;
  box-shadow: 0 18px 44px rgba(255, 107, 53, 0.32);
}
.hero-glow {
  position: absolute;
  width: 320px;
  height: 320px;
  right: -80px;
  top: -120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 184, 148, 0.55), transparent 70%);
  filter: blur(8px);
  animation: float 6s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(18px); }
}
.hero-left { position: relative; z-index: 2; flex: 1; }
.hero-hello { margin: 0; font-size: 15px; opacity: 0.92; letter-spacing: 1px; }
.hero-name {
  margin: 4px 0 6px;
  font-size: 46px;
  font-weight: 900;
  letter-spacing: -1px;
  text-shadow: 0 4px 18px rgba(0, 0, 0, 0.18);
}
.hero-tag {
  margin: 0 0 18px;
  font-size: 17px;
  font-weight: 600;
  opacity: 0.97;
}
.hero-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
.hero-tag-pill {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(4px);
}
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 22px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btn-primary { background: #fff; color: #FF6B35; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18); }
.btn-ghost { background: rgba(255, 255, 255, 0.14); color: #fff; border: 1px solid rgba(255, 255, 255, 0.5); }
.btn:hover { transform: translateY(-3px); box-shadow: 0 12px 26px rgba(0, 0, 0, 0.24); }

.hero-right { position: relative; z-index: 2; flex-shrink: 0; }
.avatar-ring {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  padding: 5px;
  background: conic-gradient(from 180deg, #00B894, #FFB020, #FF6B35, #00B894);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}
.avatar-img, .avatar-mono {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.avatar-mono {
  font-size: 60px;
  font-weight: 900;
  color: #FF6B35;
  background: linear-gradient(135deg, #fff, #fff3ea);
}

/* ============ PITCH ============ */
.pitch {
  margin: 26px 2px 8px;
  font-size: 16px;
  line-height: 1.85;
  color: var(--text-sub);
  padding-left: 14px;
  border-left: 4px solid var(--primary);
}

/* ============ STATS ============ */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 22px;
}
.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: 18px;
  padding: 22px 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.stat-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.07), rgba(0, 184, 148, 0.07));
  opacity: 0;
  transition: opacity 0.25s;
}
.stat-card:hover { transform: translateY(-5px); box-shadow: 0 14px 30px rgba(255, 107, 53, 0.16); }
.stat-card:hover::after { opacity: 1; }
.stat-icon { font-size: 24px; margin-bottom: 8px; }
.stat-value {
  font-size: 28px;
  font-weight: 900;
  color: var(--primary);
  line-height: 1.2;
  letter-spacing: -0.5px;
  background: linear-gradient(120deg, #FF6B35, #FF922B);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.stat-label { font-size: 12.5px; color: var(--text-sub); margin-top: 6px; }

/* ============ BENTO ============ */
.subsection-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text);
  margin: 36px 0 18px;
}
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.bento-card {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: 18px;
  padding: 24px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  position: relative;
  overflow: hidden;
}
.bento-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--card-accent, var(--primary));
  opacity: 0;
  transition: opacity 0.25s;
}
.bento-card:hover { transform: translateY(-5px); box-shadow: 0 16px 34px rgba(0, 0, 0, 0.1); }
.bento-card:hover::before { opacity: 1; }
.bento-card--0 { --card-accent: #FF6B35; }
.bento-card--1 { --card-accent: #00B894; }
.bento-card--2 { --card-accent: #7C5CFC; }
.bento-card--3 { --card-accent: #FFB020; }
.bento-card--wide { grid-column: span 2; }
.bento-icon {
  width: 50px; height: 50px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 25px; flex-shrink: 0;
}
.bento-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.bento-name { font-size: 16px; font-weight: 800; color: var(--text); margin: 0; }
.bento-score { font-size: 13px; letter-spacing: 1px; }
.bento-score--dim { color: rgba(0, 0, 0, 0.18); }
.bento-desc { font-size: 13px; line-height: 1.7; color: var(--text-sub); margin: 0; }
.bento-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; }
.bento-skills .tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
}

/* ============ RADAR ============ */
.radar-card { margin-top: 24px; }
.radar-title { font-size: 16px; font-weight: 700; color: var(--text); margin: 0 0 8px; }
.radar-chart { width: 100%; height: 330px; }

/* ============ CONTACT ============ */
.contact-card { margin-top: 24px; }
.contact-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.contact-item { display: flex; flex-direction: column; gap: 4px; }
.contact-label { font-size: 13px; color: var(--text-light); }
.contact-value { font-size: 14px; font-weight: 600; color: var(--text); }
.contact-link { color: var(--primary); text-decoration: none; }
.contact-link:hover { text-decoration: underline; }

/* ============ RESPONSIVE ============ */
@media (max-width: 900px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
  .bento-card--wide { grid-column: span 2; }
  .contact-grid { grid-template-columns: repeat(2, 1fr); }
  .hero { flex-direction: column-reverse; text-align: center; }
  .hero-tags, .hero-actions { justify-content: center; }
  .hero-name { font-size: 38px; }
}
@media (max-width: 640px) {
  .stat-grid { grid-template-columns: 1fr; }
  .bento-grid { grid-template-columns: 1fr; }
  .bento-card--wide { grid-column: span 1; }
  .contact-grid { grid-template-columns: 1fr; }
}
</style>
