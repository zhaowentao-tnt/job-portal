<template>
  <div class="content-inner experience" ref="root">
    <h2 class="section-title">经历</h2>

    <!-- ============ 职业跨度条 ============ -->
    <div class="span-wrap">
      <div class="span-track">
        <div
          v-for="seg in segments"
          :key="seg.label"
          class="span-seg"
          :class="`span-seg--${seg.type}`"
          :style="{ left: pos(seg.start) + '%', width: (pos(seg.end) - pos(seg.start)) + '%' }"
        >
          <span class="span-label">{{ seg.label }}</span>
        </div>
      </div>
      <div class="span-axis">
        <span v-for="y in axisYears" :key="y">{{ y }}</span>
      </div>
    </div>

    <!-- ============ 教育背景 ============ -->
    <h3 class="subsection-title">教育背景</h3>
    <div class="timeline">
      <div v-for="edu in data.education" :key="edu.school" class="tl-item tl-item--edu reveal">
        <div class="tl-node">
          <div class="tl-badge tl-badge--edu">{{ initial(edu.school) }}</div>
        </div>
        <div class="tl-body card">
          <p class="tl-date">{{ edu.startDate }} — {{ edu.endDate || '至今' }}</p>
          <h4 class="tl-title">{{ edu.school }}</h4>
          <p class="tl-subtitle">{{ edu.degree }} · {{ edu.major }}<span v-if="edu.department"> · {{ edu.department }}</span></p>
          <div v-if="edu.gpa" class="tl-gpa">GPA {{ edu.gpa }}</div>
          <div v-if="edu.highlights && edu.highlights.length" class="tl-highlights">
            <span v-for="h in edu.highlights" :key="h" class="tag tag--success">{{ h }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ 实习经历 ============ -->
    <h3 class="subsection-title" style="margin-top: 40px;">实习经历</h3>
    <div class="timeline">
      <div
        v-for="exp in data.experiences"
        :key="exp.company"
        class="tl-item tl-item--work reveal"
        :class="{ 'tl-item--current': exp.current }"
      >
        <div class="tl-node">
          <div class="tl-badge tl-badge--work">{{ initial(exp.company) }}</div>
        </div>
        <div class="tl-body card">
          <p class="tl-date">
            {{ exp.startDate }} — {{ exp.endDate || '至今' }}
            <span v-if="exp.current" class="status-dot status-dot--current"></span>
            <span v-if="exp.current" style="color: var(--accent); font-size: 12px;">当前</span>
          </p>
          <h4 class="tl-title">{{ exp.company }}</h4>
          <p class="tl-subtitle">{{ exp.position }}<span v-if="exp.department"> · {{ exp.department }}</span></p>

          <p v-if="exp.description" class="tl-quote">{{ exp.description }}</p>

          <div v-if="exp.metrics && exp.metrics.length" class="metrics-block">
            <div class="metrics-title">量化成果</div>
            <v-chart class="metrics-chart" :option="barOption(exp.metrics)" autoresize />
          </div>

          <ul v-if="exp.achievements && exp.achievements.length" class="achievement-list">
            <li v-for="a in exp.achievements" :key="a">{{ a }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps({ data: { type: Object, default: () => ({}) } })

function initial(name) {
  if (!name) return '?'
  return name.trim().charAt(0)
}

/* ---- 职业跨度条 ---- */
const SPAN = { start: 2020, end: 2027 }
function pos(y) {
  return ((y - SPAN.start) / (SPAN.end - SPAN.start)) * 100
}
const axisYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027]
const segments = [
  { label: '本科·合工大', start: 2020, end: 2024, type: 'edu' },
  { label: '硕士·中南财', start: 2024, end: 2027, type: 'edu' },
  { label: '容诚·审计', start: 2023.95, end: 2024.2, type: 'work' },
  { label: '极兔·财务BP', start: 2026.2, end: 2026.5, type: 'work' }
]

/* ---- 滚动浮现 ---- */
const root = ref(null)
onMounted(() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('in-view')
    })
  }, { threshold: 0.15 })
  if (root.value) root.value.querySelectorAll('.reveal').forEach((el) => io.observe(el))
})

/* ---- 量化成果条形图（橙青主题） ---- */
const BAR_COLORS = ['#FF6B35', '#FF922B', '#00B894', '#14B8A6']
function barOption(metrics) {
  const maxVal = Math.max(...metrics.map(m => m.value)) * 1.18
  return {
    grid: { left: 92, right: 56, top: 6, bottom: 6 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', max: maxVal, show: false },
    yAxis: {
      type: 'category',
      data: metrics.map(m => m.label),
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 12 }
    },
    series: [
      {
        type: 'bar',
        data: metrics.map((m, i) => ({
          value: m.value,
          itemStyle: { color: BAR_COLORS[i % BAR_COLORS.length], borderRadius: [0, 8, 8, 0] }
        })),
        barWidth: 16,
        label: {
          show: true,
          position: 'right',
          formatter: (p) => metrics[p.dataIndex].value + metrics[p.dataIndex].unit,
          color: '#374151',
          fontSize: 12,
          fontWeight: 700
        }
      }
    ]
  }
}
</script>

<style scoped>
.content-inner.experience {
  --primary: #FF6B35;
  --accent: #00B894;
}
.section-title { font-size: 24px; font-weight: 800; color: var(--text); margin: 0 0 20px; }

/* ============ 职业跨度条 ============ */
.span-wrap { margin-bottom: 34px; }
.span-track {
  position: relative;
  height: 34px;
  border-radius: 10px;
  background: var(--border-light);
}
.span-seg {
  position: absolute;
  top: 4px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease, filter 0.2s ease;
}
.span-seg:hover { transform: translateY(-2px); filter: brightness(1.05); }
.span-seg--edu { background: linear-gradient(135deg, #00B894, #14B8A6); }
.span-seg--work { background: linear-gradient(135deg, #FF6B35, #FF922B); }
.span-label {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  padding: 0 6px;
}
.span-axis {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-light);
}

/* ============ 图形化时间线 ============ */
.subsection-title { font-size: 19px; font-weight: 700; color: var(--text); margin: 0 0 20px; }
.timeline { position: relative; padding-left: 4px; }
.tl-item { position: relative; padding-left: 62px; padding-bottom: 30px; }
.tl-item::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 46px;
  bottom: -4px;
  width: 2px;
  background: linear-gradient(180deg, var(--primary), var(--accent));
  opacity: 0.5;
}
.tl-item:last-child::before { display: none; }
.tl-node {
  position: absolute;
  left: 0; top: 0;
  width: 42px; height: 42px;
  z-index: 2;
}
.tl-badge {
  width: 42px; height: 42px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 17px; color: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}
.tl-badge--edu { background: linear-gradient(135deg, #00B894, #14B8A6); }
.tl-badge--work { background: linear-gradient(135deg, #FF6B35, #FF922B); }
.tl-item--current .tl-badge--work { background: linear-gradient(135deg, #FF922B, #FFB020); }

.tl-body { padding: 18px 22px; }
.tl-date { font-size: 12.5px; color: var(--text-light); margin: 0 0 4px; display: flex; align-items: center; gap: 6px; }
.tl-title { font-size: 17px; font-weight: 800; color: var(--text); margin: 0; }
.tl-subtitle { font-size: 13.5px; color: var(--text-sub); margin: 4px 0 0; }
.tl-gpa {
  display: inline-block;
  margin-top: 8px;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--accent);
  background: rgba(0, 184, 148, 0.1);
}
.tl-highlights { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }

.tl-quote {
  margin: 12px 0 0;
  padding: 12px 14px;
  border-radius: 12px;
  border-left: 4px solid var(--primary);
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.07), rgba(0, 184, 148, 0.05));
  font-size: 14px;
  font-weight: 600;
  line-height: 1.7;
  color: var(--text);
}

/* ============ 量化成果条形图 ============ */
.metrics-block { margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--border-light); }
.metrics-title { font-size: 13px; font-weight: 700; color: var(--text-sub); margin-bottom: 4px; }
.metrics-chart { width: 100%; height: 126px; }

.achievement-list { margin-top: 12px; padding-left: 20px; }
.achievement-list li { font-size: 13.5px; color: var(--text-sub); line-height: 1.85; }

/* ============ 滚动浮现 ============ */
.reveal {
  opacity: 0;
  transform: translateY(26px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.in-view { opacity: 1; transform: translateY(0); }

/* ============ RESPONSIVE ============ */
@media (max-width: 640px) {
  .tl-item { padding-left: 54px; }
  .span-label { font-size: 9px; }
}
</style>
