<template>
  <div class="about-wide" ref="root">
    <!-- ============ A. MANIFESTO 暗色宣言带 ============ -->
    <section class="manifesto-band">
      <div class="manifesto-glow left"></div>
      <div class="manifesto-glow right"></div>
      <div class="manifesto-inner">
        <div class="manifesto-text">
          <p v-for="(line, i) in data.manifesto" :key="i" class="manifesto-line reveal">{{ line }}</p>
          <div class="manifesto-cta">
            <a :href="'mailto:' + emailLink" class="cta-btn cta-btn--primary">✉ 发邮件</a>
            <a :href="ghLink" target="_blank" rel="noopener" class="cta-btn cta-btn--ghost">⌘ GitHub</a>
            <span v-if="phone" class="cta-phone">{{ phone }}</span>
          </div>
        </div>
        <div class="manifesto-avatar reveal">
          <div class="avatar-glow-ring">
            <img v-if="data.avatarPath" :src="'/job-portal/' + data.avatarPath" class="avatar-img" alt="头像" />
            <div v-else class="avatar-letter">{{ initial }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ B+C+D. 能力 BENTO + 雷达图 + 快速事实 ============ -->
    <div class="cap-row">
      <!-- B: 能力 Bento (2x2 glass) -->
      <div class="bento-col">
        <div
          v-for="cap in data.capabilities"
          :key="cap.name"
          class="bento-card glass-card reveal"
          :style="{ '--cap-color': cap.color }"
        >
          <div class="bc-icon">{{ cap.icon }}</div>
          <div class="bc-name">{{ cap.name }}</div>
          <p class="bc-desc">{{ cap.description }}</p>
          <div class="bc-tags">
            <span v-for="sk in cap.skills" :key="sk" class="bc-tag">{{ sk }}</span>
          </div>
        </div>
      </div>
      <!-- C: 雷达图 + D: 快速事实 -->
      <div class="side-col">
        <div class="radar-card glass-card reveal">
          <v-chart class="radar-chart" :option="radarOption" autoresize />
        </div>
        <div class="facts-card reveal">
          <div class="facts-item" v-for="f in facts" :key="f.label">
            <span class="facts-icon">{{ f.icon }}</span>
            <span class="facts-label">{{ f.label }}</span>
            <span class="facts-value">{{ f.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ E. 转型故事 ============ -->
    <section v-if="data.transitionStory" class="story-section">
      <h2 class="story-heading reveal">为什么做产品</h2>
      <div class="story-body">
        <p class="story-narrative reveal">{{ data.transitionStory.narrative }}</p>
        <div class="story-turning reveal">
          <div
            v-for="tp in (data.transitionStory.turningPoints || [])"
            :key="tp.title"
            class="tp-card"
          >
            <div class="tp-icon">{{ tp.icon }}</div>
            <div class="tp-title">{{ tp.title }}</div>
            <p class="tp-desc">{{ tp.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([RadarChart, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps({ data: { type: Object, default: () => ({}) } })

const initial = computed(() => (props.data.name || '?').trim().charAt(0))

const emailLink = computed(() => {
  const links = props.data.links || []
  const email = links.find(l => l.type === 'email')
  return email?.url || ''
})

const ghLink = computed(() => {
  const links = props.data.links || []
  const gh = links.find(l => l.label?.includes('GitHub'))
  return gh?.url || '#'
})

const phone = computed(() => {
  const c = (props.data.contact || []).find(x => x.type === 'phone')
  return c?.value || ''
})

const facts = computed(() => {
  const c = props.data.contact || []
  const items = c.filter(x => x.type !== 'phone').map(x => ({ icon: x.icon, label: x.label, value: x.value }))
  if (props.data.availability) {
    items.unshift({ icon: '💼', label: '求职状态', value: props.data.availability })
  }
  return items
})

const radarOption = computed(() => {
  const caps = props.data.capabilities || []
  return {
    tooltip: { trigger: 'item' },
    radar: {
      indicator: caps.map(c => ({ name: c.name, max: 5 })),
      radius: '64%',
      center: ['50%', '56%'],
      axisName: { color: '#6b7280', fontSize: 11.5, fontWeight: 600 },
      splitNumber: 5,
      splitArea: { areaStyle: { color: ['rgba(67,97,238,0.03)', 'rgba(6,214,160,0.04)'] } },
      splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
      axisLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: caps.map(c => c.score || 3),
            name: '能力评分',
            symbolSize: 5,
            itemStyle: { color: '#4361ee' },
            lineStyle: { color: '#4361ee', width: 2.5, shadowBlur: 10, shadowColor: 'rgba(67,97,238,0.45)' },
            areaStyle: { color: 'rgba(67,97,238,0.18)' }
          }
        ]
      }
    ]
  }
})

const root = ref(null)
onMounted(() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') })
  }, { threshold: 0.12 })
  if (root.value) root.value.querySelectorAll('.reveal').forEach(el => io.observe(el))
})
</script>

<style scoped>
/* ============ MANIFESTO 暗色带 ============ */
.manifesto-band {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0f1e 0%, #151530 35%, #1a1e3a 70%, #16213e 100%);
  margin-bottom: 36px;
}
.manifesto-glow {
  position: absolute;
  width: 280px; height: 280px;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.35;
}
.manifesto-glow.left  { left: -80px; top: -100px; background: rgba(67, 97, 238, 0.7); }
.manifesto-glow.right { right: -60px; bottom: -80px; background: rgba(6, 214, 160, 0.55); }

.manifesto-inner {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 40px;
  padding: 48px 44px;
}
.manifesto-text { flex: 1; }
.manifesto-line {
  margin: 0 0 14px;
  font-size: 26px; font-weight: 800; line-height: 1.45;
  color: #e8ecf8;
  letter-spacing: 0.5px;
}
.manifesto-line:first-child { color: var(--accent); }
.manifesto-line:last-child  { font-size: 22px; font-weight: 700; }

.manifesto-cta { display: flex; align-items: center; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
.cta-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 22px; border-radius: 999px;
  font-size: 14px; font-weight: 700; text-decoration: none;
  transition: all 0.25s ease;
}
.cta-btn--primary { background: var(--primary); color: #fff; box-shadow: var(--glow-primary); }
.cta-btn--primary:hover { transform: translateY(-3px); box-shadow: 0 0 50px rgba(67,97,238,0.45); }
.cta-btn--ghost   { background: rgba(255,255,255,0.08); color: #c8cde0; border: 1px solid rgba(255,255,255,0.18); }
.cta-btn--ghost:hover   { background: rgba(255,255,255,0.15); color: #fff; transform: translateY(-3px); }
.cta-phone { font-size: 13px; color: #7a82a0; letter-spacing: 0.5px; }

.manifesto-avatar { flex-shrink: 0; }
.avatar-glow-ring {
  width: 130px; height: 130px;
  border-radius: 50%; padding: 4px;
  background: conic-gradient(from 180deg, var(--accent), var(--primary), var(--accent));
  box-shadow: 0 0 30px rgba(6,214,160,0.3), 0 10px 30px rgba(0,0,0,0.4);
  animation: ringSpin 12s linear infinite;
}
@keyframes ringSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid rgba(15,15,30,0.8); }
.avatar-letter {
  width: 100%; height: 100%; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 52px; font-weight: 900; color: var(--accent);
  background: rgba(6,214,160,0.08); border: 3px solid rgba(15,15,30,0.8);
}

/* ============ CAPABILITY ROW (bento + radar side) ============ */
.cap-row {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  margin-bottom: 36px;
}
.bento-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.bento-card {
  padding: 22px;
  border-left: 3px solid var(--cap-color, var(--primary));
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 16px;
}
.bento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.1), 0 0 20px rgba(var(--cap-color-r), var(--cap-color-g), var(--cap-color-b), 0.12);
}
.bc-icon { font-size: 28px; margin-bottom: 6px; }
.bc-name { font-size: 16px; font-weight: 800; color: var(--text); margin-bottom: 6px; }
.bc-desc { font-size: 13px; color: var(--text-sub); line-height: 1.65; margin-bottom: 10px; }
.bc-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.bc-tag {
  padding: 3px 9px; border-radius: 999px;
  font-size: 11px; font-weight: 600;
  background: rgba(67,97,238,0.08); color: var(--primary);
}

/* Side column */
.side-col { display: flex; flex-direction: column; gap: 16px; }
.radar-card { padding: 16px; border-radius: 16px; }
.radar-chart { width: 100%; height: 300px; }

.facts-card { padding: 18px; background: var(--card-bg); border-radius: 16px; box-shadow: var(--shadow); }
.facts-item {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 0; border-bottom: 1px solid var(--border-light);
}
.facts-item:last-child { border-bottom: none; }
.facts-icon { font-size: 18px; flex-shrink: 0; }
.facts-label { font-size: 12px; color: var(--text-light); min-width: 52px; }
.facts-value { font-size: 13.5px; font-weight: 600; color: var(--text); margin-left: auto; }

/* ============ TRANSITION STORY ============ */
.story-section { margin-top: 8px; }
.story-heading {
  font-size: 22px; font-weight: 800; color: var(--text);
  margin-bottom: 22px; letter-spacing: -0.5px;
}
.story-body { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
.story-narrative {
  font-size: 15px; color: var(--text-sub); line-height: 1.95;
  padding: 24px; background: var(--card-bg); border-radius: 18px;
  box-shadow: var(--shadow); border-left: 4px solid var(--primary);
}
.story-turning { display: flex; flex-direction: column; gap: 14px; }
.tp-card {
  padding: 18px 20px; border-radius: 16px;
  background: linear-gradient(135deg, var(--card-bg), rgba(67,97,238,0.03));
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.tp-card:hover { transform: translateX(6px); box-shadow: var(--shadow-hover); }
.tp-icon { font-size: 28px; margin-bottom: 4px; }
.tp-title { font-size: 15px; font-weight: 800; color: var(--text); margin-bottom: 4px; }
.tp-desc { font-size: 13px; color: var(--text-sub); line-height: 1.55; margin: 0; }

/* ============ REVEAL ============ */
.reveal {
  opacity: 0; transform: translateY(22px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}
.reveal.in-view { opacity: 1; transform: translateY(0); }

/* ============ RESPONSIVE ============ */
@media (max-width: 900px) {
  .manifesto-inner { flex-direction: column-reverse; text-align: center; padding: 36px 24px; }
  .manifesto-line { font-size: 21px; }
  .manifesto-cta { justify-content: center; }
  .cap-row { grid-template-columns: 1fr; }
  .story-body { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .bento-col { grid-template-columns: 1fr; }
  .manifesto-line { font-size: 18px; }
  .manifesto-inner { padding: 28px 18px; gap: 24px; }
}
</style>
