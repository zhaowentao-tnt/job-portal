<template>
  <div class="about-wide" ref="root">
    <!-- ============ A. MANIFESTO 暗色宣言带 ============ -->
    <section class="manifesto-band">
      <div class="manifesto-glow left"></div>
      <div class="manifesto-glow right"></div>
      <div class="manifesto-inner">
        <div class="manifesto-text">
          <div v-for="(line, i) in (data.manifesto || [])" :key="i" class="manifesto-line-row reveal">
            <ClickEdit
              :value="line"
              module="profile"
              :path="`manifesto.${i}`"
              placeholder="宣言行（点击编辑）"
            />
            <button class="btn-del-sm" @click="removeLine(i)" title="删除该行">×</button>
          </div>
          <button class="btn-add-line" @click="addLine">+ 添加一行</button>
        </div>
      </div>
    </section>

    <!-- ============ B+C+D. 能力 BENTO + 雷达图 + 快速事实 ============ -->
    <div class="cap-row">
      <!-- B: 能力 Bento -->
      <div class="bento-col">
        <div
          v-for="(cap, i) in (data.capabilities || [])"
          :key="i"
          class="bento-card glass-card reveal"
          :style="{ '--cap-color': cap.color }"
        >
          <div class="bc-head">
            <ClickEdit :value="cap.icon" module="profile" :path="`capabilities.${i}.icon`" placeholder="📊" />
            <button class="btn-del-sm" @click="removeCap(i)" title="删除能力">×</button>
          </div>
          <div class="bc-name">
            <ClickEdit :value="cap.name" module="profile" :path="`capabilities.${i}.name`" placeholder="能力名" />
          </div>
          <p class="bc-desc">
            <ClickEdit :value="cap.description" type="longtext" module="profile" :path="`capabilities.${i}.description`" placeholder="能力描述" />
          </p>
          <div class="bc-tags">
            <span v-for="(sk, si) in (cap.skills || [])" :key="si" class="bc-tag-wrap">
              <ClickEdit :value="sk" module="profile" :path="`capabilities.${i}.skills.${si}`" placeholder="技能" />
              <button class="btn-del-x" @click="removeSkill(i, si)" title="删除">×</button>
            </span>
            <button class="bc-tag bc-tag--add" @click="addSkill(i)">+</button>
          </div>
          <div class="bc-score">
            评分：
            <ClickEdit
              :value="cap.score"
              type="select"
              :options="scoreOptions"
              module="profile"
              :path="`capabilities.${i}.score`"
              :display="`${cap.score} / 5`"
            />
            <span class="bc-color">· 色
              <ClickEdit :value="cap.color" module="profile" :path="`capabilities.${i}.color`" placeholder="#hex" />
            </span>
          </div>
        </div>
        <button class="btn-add-cap" @click="addCap">+ 添加能力</button>
      </div>

      <!-- C: 雷达图 + D: 快速事实 -->
      <div class="side-col">
        <div class="radar-card glass-card reveal">
          <v-chart class="radar-chart" :option="radarOption" autoresize />
        </div>
        <div class="facts-card reveal">
          <div class="facts-item facts-availability">
            <span class="facts-icon">💼</span>
            <span class="facts-label">求职状态</span>
            <span class="facts-value">
              <ClickEdit :value="data.availability" module="profile" path="availability" placeholder="如：2026 暑期可实习" />
            </span>
          </div>
          <div v-for="(f, i) in facts" :key="i" class="facts-item">
            <span class="facts-icon">{{ f.icon || '·' }}</span>
            <span class="facts-label">
              <ClickEdit :value="f.label" module="profile" :path="`contact.${f._idx}.label`" placeholder="标签" />
            </span>
            <span class="facts-value">
              <ClickEdit :value="f.value" module="profile" :path="`contact.${f._idx}.value`" placeholder="值" />
            </span>
            <button class="btn-del-sm" @click="removeContact(f._idx)" title="删除该条">×</button>
          </div>
          <button class="btn-add-fact" @click="addContact">+ 添加事实</button>
        </div>
      </div>
    </div>

    <!-- ============ E. 转型故事 ============ -->
    <section v-if="data.transitionStory" class="story-section">
      <h2 class="story-heading reveal">为什么做产品</h2>
      <div class="story-body">
        <div class="story-narrative reveal">
          <ClickEdit
            :value="data.transitionStory.narrative"
            type="longtext"
            module="profile"
            path="transitionStory.narrative"
            placeholder="叙事段落（点击编辑）"
          />
        </div>
        <div class="story-turning reveal">
          <div
            v-for="(tp, i) in (data.transitionStory.turningPoints || [])"
            :key="i"
            class="tp-card"
          >
            <div class="tp-head">
              <div class="tp-icon">
                <ClickEdit :value="tp.icon" module="profile" :path="`transitionStory.turningPoints.${i}.icon`" placeholder="🔍" />
              </div>
              <button class="btn-del-sm" @click="removeTp(i)" title="删除">×</button>
            </div>
            <div class="tp-title">
              <ClickEdit :value="tp.title" module="profile" :path="`transitionStory.turningPoints.${i}.title`" placeholder="小标题" />
            </div>
            <p class="tp-desc">
              <ClickEdit :value="tp.desc" module="profile" :path="`transitionStory.turningPoints.${i}.desc`" placeholder="说明" />
            </p>
          </div>
          <button class="btn-add-tp" @click="addTp">+ 添加转折点</button>
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
import { useData } from '../../../composables/useData'
import ClickEdit from '../../common/ClickEdit.vue'

use([RadarChart, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const { updateField, arrayOp } = useData()

const scoreOptions = [
  { value: 1, label: '1 / 5' },
  { value: 2, label: '2 / 5' },
  { value: 3, label: '3 / 5' },
  { value: 4, label: '4 / 5' },
  { value: 5, label: '5 / 5' }
]

const facts = computed(() => {
  const c = props.data.contact || []
  return c.map((x, i) => ({ icon: x.icon, label: x.label, value: x.value, _idx: i }))
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

// === CRUD ===
function addLine() {
  arrayOp('profile', 'manifesto', 'push', '新一行（点击编辑）')
}
function removeLine(i) {
  if (!confirm('删除该宣言行？')) return
  arrayOp('profile', 'manifesto', 'remove', null, i)
}
function addCap() {
  arrayOp('profile', 'capabilities', 'push', {
    name: '新能力', icon: '✨', color: '#4361ee', score: 3,
    description: '描述（点击编辑）', skills: []
  })
}
function removeCap(i) {
  if (!confirm('删除该能力？')) return
  arrayOp('profile', 'capabilities', 'remove', null, i)
}
function addSkill(i) {
  arrayOp('profile', `capabilities.${i}.skills`, 'push', '新技能')
}
function removeSkill(i, si) {
  arrayOp('profile', `capabilities.${i}.skills`, 'remove', null, si)
}
function addContact() {
  arrayOp('profile', 'contact', 'push', { icon: '📌', label: '新标签', value: '新内容' })
}
function removeContact(i) {
  if (!confirm('删除该条？')) return
  arrayOp('profile', 'contact', 'remove', null, i)
}
function addTp() {
  arrayOp('profile', 'transitionStory.turningPoints', 'push', { icon: '🌟', title: '新转折点', desc: '说明' })
}
function removeTp(i) {
  if (!confirm('删除该转折点？')) return
  arrayOp('profile', 'transitionStory.turningPoints', 'remove', null, i)
}
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
  padding: 48px 44px;
}
.manifesto-text { flex: 1; }
.manifesto-line-row {
  margin: 0 0 14px;
  font-size: 26px; font-weight: 800; line-height: 1.45;
  color: #e8ecf8;
  letter-spacing: 0.5px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.manifesto-line-row:first-child { color: var(--accent); }
.manifesto-line-row:last-child  { font-size: 22px; font-weight: 700; }
.btn-add-line {
  margin-top: 8px;
  background: rgba(255,255,255,0.06);
  color: rgba(232,236,248,0.7);
  border: 1px dashed rgba(255,255,255,0.2);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  font-family: var(--font-family);
}
.btn-add-line:hover { background: rgba(255,255,255,0.12); color: #fff; }

/* 古色木粉边窗保留 */
.manifesto-window {
  display: flex; justify-content: flex-start;
  margin-top: 28px;
}
.window-outer {
  position: relative;
  max-width: 460px; width: 100%;
  padding: 14px;
  border-radius: 26px;
  background: linear-gradient(145deg, #8b6f47 0%, #a68a64 40%, #c4a882 100%);
  box-shadow:
    inset 2px 2px 6px rgba(255,255,255,0.22),
    inset -2px -2px 6px rgba(60,40,20,0.35),
    0 14px 34px rgba(60,40,20,0.22);
}
.window-outer::before {
  content: '';
  position: absolute; inset: 7px;
  border-radius: 20px;
  border: 1px dashed rgba(232,180,184,0.55);
  pointer-events: none;
}
.window-inner {
  position: relative;
  min-height: 118px;
  border-radius: 14px;
  border: 2px solid rgba(232,180,184,0.75);
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  padding: 24px 28px;
}
.window-garden {
  position: absolute; inset: 0;
  background: url('/job-portal/garden-pattern.svg') center / cover no-repeat;
  opacity: 0.72;
  pointer-events: none;
}
.window-quote {
  position: relative; z-index: 1;
  margin: 0;
  font-size: 18px; font-weight: 700;
  color: #2f4a34;
  text-align: center; line-height: 1.55;
  text-shadow: 0 1px 0 rgba(255,255,255,0.35);
  letter-spacing: 1px;
}

/* ============ CAPABILITY ROW ============ */
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
  position: relative;
}
.bento-card {
  padding: 22px;
  border-left: 3px solid var(--cap-color, var(--primary));
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 16px;
}
.bento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.1);
}
.bc-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 4px;
}
.bc-icon { font-size: 28px; }
.bc-name { font-size: 16px; font-weight: 800; color: var(--text); margin-bottom: 6px; }
.bc-desc { font-size: 13px; color: var(--text-sub); line-height: 1.65; margin-bottom: 10px; }
.bc-tags { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.bc-tag-wrap {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: rgba(67,97,238,0.08);
  color: var(--primary);
  padding: 3px 4px 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.btn-del-x {
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 12px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.btn-del-x:hover { background: var(--danger); color: #fff; }
.bc-tag--add {
  background: none;
  border: 1px dashed var(--border);
  color: var(--text-light);
  padding: 3px 9px;
  cursor: pointer;
  font-family: var(--font-family);
}
.bc-tag--add:hover { border-color: var(--primary); color: var(--primary); }
.bc-score {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-light);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.bc-color { color: var(--text-light); display: inline-flex; align-items: center; gap: 4px; }
.btn-add-cap {
  grid-column: span 2;
  background: none;
  border: 1.5px dashed var(--border);
  color: var(--text-light);
  padding: 10px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 13px;
  font-family: var(--font-family);
}
.btn-add-cap:hover { border-color: var(--primary); color: var(--primary); }

.btn-del-sm {
  border: 1px solid var(--border-light);
  background: var(--card-bg);
  color: var(--text-light);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}
.btn-del-sm:hover { background: var(--danger); color: #fff; border-color: var(--danger); }

/* Side column */
.side-col { display: flex; flex-direction: column; gap: 16px; }
.radar-card { padding: 16px; border-radius: 16px; }
.radar-chart { width: 100%; height: 300px; }

.facts-card {
  padding: 18px;
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: var(--shadow);
}
.facts-availability {
  background: rgba(67,97,238,0.06);
  border-radius: 8px;
  padding: 8px 6px;
  margin-bottom: 6px;
}
.facts-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-light);
}
.facts-item:last-of-type { border-bottom: none; }
.facts-icon { font-size: 18px; flex-shrink: 0; }
.facts-label { font-size: 12px; color: var(--text-light); min-width: 52px; }
.facts-value { font-size: 13.5px; font-weight: 600; color: var(--text); margin-left: auto; text-align: right; flex: 1; }
.btn-add-fact {
  margin-top: 8px;
  background: none;
  border: 1px dashed var(--border);
  color: var(--text-light);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  font-family: var(--font-family);
  width: 100%;
}
.btn-add-fact:hover { border-color: var(--primary); color: var(--primary); }

/* ============ TRANSITION STORY ============ */
.story-section { margin-top: 8px; }
.story-heading {
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 22px;
  letter-spacing: -0.5px;
}
.story-body { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
.story-narrative {
  font-size: 15px;
  color: var(--text-sub);
  line-height: 1.95;
  padding: 24px;
  background: var(--card-bg);
  border-radius: 18px;
  box-shadow: var(--shadow);
  border-left: 4px solid var(--primary);
}
.story-turning { display: flex; flex-direction: column; gap: 14px; }
.tp-card {
  padding: 18px 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--card-bg), rgba(67,97,238,0.03));
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.tp-card:hover { transform: translateX(6px); box-shadow: var(--shadow-hover); }
.tp-head { display: flex; justify-content: space-between; align-items: flex-start; }
.tp-icon { font-size: 28px; margin-bottom: 4px; }
.tp-title { font-size: 15px; font-weight: 800; color: var(--text); margin-bottom: 4px; }
.tp-desc { font-size: 13px; color: var(--text-sub); line-height: 1.55; margin: 0; }
.btn-add-tp {
  background: none;
  border: 1.5px dashed var(--border);
  color: var(--text-light);
  padding: 10px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 13px;
  font-family: var(--font-family);
}
.btn-add-tp:hover { border-color: var(--primary); color: var(--primary); }

/* ============ REVEAL ============ */
.reveal { opacity: 0; transform: translateY(22px); transition: opacity 0.65s ease, transform 0.65s ease; }
.reveal.in-view { opacity: 1; transform: translateY(0); }

/* ============ RESPONSIVE ============ */
@media (max-width: 900px) {
  .manifesto-inner { text-align: center; padding: 36px 24px; }
  .manifesto-line-row { font-size: 21px; }
  .cap-row { grid-template-columns: 1fr; }
  .story-body { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .bento-col { grid-template-columns: 1fr; }
  .manifesto-line-row { font-size: 18px; }
  .manifesto-inner { padding: 28px 18px; gap: 24px; }
}
</style>