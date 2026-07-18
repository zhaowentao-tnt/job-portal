<template>
  <div class="exp-wide" ref="root">
    <!-- ============ A. 数据驱动职业跨度条 ============ -->
    <div class="span-wrap">
      <div class="span-track">
        <div
          v-for="seg in segments"
          :key="seg.label"
          class="span-seg"
          :class="'span-seg--' + seg.type"
          :style="{ left: pct(seg.min) + '%', width: Math.max(pct(seg.max) - pct(seg.min), 4) + '%' }"
          :title="seg.label + ': ' + seg.min.toFixed(1) + ' - ' + seg.max.toFixed(1)"
        >
          <span class="span-label">{{ seg.label }}</span>
        </div>
      </div>
      <div class="span-axis">
        <span v-for="y in axisYears" :key="y">{{ y }}</span>
      </div>
    </div>

    <!-- ============ B. KPI 高光带 ============ -->
    <div class="kpi-band" ref="kpiRef">
      <div v-for="(k, idx) in kpiItems" :key="k.label" class="kpi-card reveal">
        <div class="kpi-value">
          <template v-if="k.isStatic">{{ k.prefix || '' }}{{ k.value }}{{ k.unit }}</template>
          <template v-else>{{ k.prefix || '' }}{{ kDisplay[idx] }}{{ k.unit }}</template>
        </div>
        <div class="kpi-label">{{ k.label }}</div>
        <div class="kpi-source">{{ k.source }}</div>
      </div>
    </div>

    <!-- ============ C. 交错时间线 (zigzag) ============ -->
    <div class="zigzag">
      <div class="zigzag-line"></div>
      <div
        v-for="(item, i) in timeline"
        :key="item.id"
        class="zz-item reveal"
        :class="[i % 2 === 0 ? 'zz-left' : 'zz-right', 'zz-type--' + item.type]"
      >
        <div class="zz-dot"></div>
        <div class="zz-card card">
          <p class="zz-date">{{ item.start }} — {{ item.end || '至今' }}</p>
          <h4 class="zz-title">{{ item.title }}</h4>
          <p class="zz-subtitle">{{ item.subtitle }}</p>
          <p v-if="item.description" class="zz-desc">{{ item.description }}</p>

          <!-- edu highlights -->
          <div v-if="item.type === 'edu' && item.highlights?.length" class="zz-highlights">
            <span v-for="h in item.highlights" :key="h" class="tag tag--success">{{ h }}</span>
          </div>
          <div v-if="item.gpa" class="zz-gpa">GPA {{ item.gpa }}</div>

          <!-- work metrics bar chart -->
          <div v-if="item.type === 'work' && item.metrics?.length" class="zz-metrics">
            <v-chart class="zz-chart" :option="miniBar(item.metrics)" autoresize />
          </div>

          <!-- achievements list -->
          <ul v-if="item.achievements?.length" class="zz-achieve">
            <li v-for="a in item.achievements" :key="a">{{ a }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, reactive } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps({ data: { type: Object, default: () => ({}) } })

/* ---- span bar (data-driven) ---- */
function toYear(s) {
  if (!s) return 0
  const [y, m] = s.split('-').map(Number)
  return y + (m ? (m - 0.5) / 12 : 0)
}

const segments = computed(() => {
  const segs = []
  const edu = props.data.education || []
  const exp = props.data.experiences || []
  edu.forEach(e => {
    segs.push({ type: 'edu', label: e.school, min: toYear(e.startDate), max: toYear(e.endDate) })
  })
  exp.forEach(e => {
    segs.push({ type: 'work', label: e.company, min: toYear(e.startDate), max: toYear(e.endDate || '2027-06') })
  })
  segs.sort((a, b) => a.min - b.min)
  return segs
})

const spanMin = computed(() => {
  const vals = segments.value.flatMap(s => [s.min, s.max])
  return Math.floor(Math.min(...vals))
})
const spanMax = computed(() => {
  const vals = segments.value.flatMap(s => [s.min, s.max])
  return Math.ceil(Math.max(...vals))
})

function pct(y) {
  const range = spanMax.value - spanMin.value
  return range ? ((y - spanMin.value) / range) * 100 : 0
}

const axisYears = computed(() => {
  const a = spanMin.value, b = spanMax.value
  const years = []
  for (let y = a; y <= b; y++) years.push(y)
  return years
})

/* ---- KPI items (from all experiences metrics) ---- */
const kpiItems = computed(() => {
  const exps = props.data.experiences || []
  const items = []
  exps.forEach(exp => {
    const src = exp.company ? exp.company.replace('容诚会计师事务所上海分所','容诚').replace('极兔速递有限公司','极兔') : ''
    ;(exp.metrics || []).forEach(m => {
      items.push({
        ...m,
        source: src,
        displayValue: (m.prefix || '') + m.value + m.unit,
        isStatic: m.isStatic || false
      })
    })
  })
  return items
})

/* ---- KPI scroll count ---- */
const kDisplay = reactive([])
const kpiRef = ref(null)
let kStarted = false

function animateKpi(idx, target) {
  if (kDisplay[idx] === undefined) kDisplay[idx] = 0
  const start = performance.now()
  function step(now) {
    const t = Math.min((now - start) / 1400, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    kDisplay[idx] = Math.round(target * eased)
    if (t < 1) requestAnimationFrame(step)
    else kDisplay[idx] = target
  }
  requestAnimationFrame(step)
}

/* ---- zigzag timeline (merged + sorted) ---- */
const timeline = computed(() => {
  const items = []
  const edu = props.data.education || []
  const exp = props.data.experiences || []

  edu.forEach((e, i) => {
    items.push({
      id: 'edu-' + i,
      type: 'edu',
      start: e.startDate, end: e.endDate,
      title: e.school,
      subtitle: (e.degree || '') + (e.major ? ' · ' + e.major : ''),
      description: e.description || '',
      highlights: e.highlights || [],
      gpa: e.gpa || '',
      _start: toYear(e.startDate)
    })
  })
  exp.forEach((e, i) => {
    items.push({
      id: 'exp-' + i,
      type: 'work',
      start: e.startDate, end: e.endDate,
      title: e.company,
      subtitle: (e.position || '') + (e.location ? ' · ' + e.location : '') + (e.department ? ', ' + e.department : ''),
      description: e.description || '',
      metrics: e.metrics || [],
      achievements: e.achievements || [],
      _start: toYear(e.startDate)
    })
  })
  items.sort((a, b) => a._start - b._start)
  return items
})

/* ---- mini bar chart ---- */
const BAR_COLORS = ['#4361ee', '#5a7cf5', '#06d6a0', '#14b8a6']
function miniBar(metrics) {
  const maxVal = Math.max(...metrics.map(m => m.value))
  return {
    grid: { left: 80, right: 60, top: 4, bottom: 4 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', max: maxVal * 1.2, show: false },
    yAxis: {
      type: 'category', data: metrics.map(m => m.label), inverse: true,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 11 }
    },
    series: [{
      type: 'bar',
      data: metrics.map((m, i) => ({
        value: m.value,
        itemStyle: { color: BAR_COLORS[i % BAR_COLORS.length], borderRadius: [0, 6, 6, 0] }
      })),
      barWidth: 14,
      label: {
        show: true, position: 'right',
        formatter: (p) => metrics[p.dataIndex].value + (metrics[p.dataIndex].unit || ''),
        color: '#374151', fontSize: 11, fontWeight: 700
      }
    }]
  }
}

/* ---- IO ---- */
const root = ref(null)
onMounted(() => {
  // reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') })
  }, { threshold: 0.12 })
  if (root.value) root.value.querySelectorAll('.reveal').forEach(el => io.observe(el))

  // KPI count
  if (kpiRef.value) {
    const kio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !kStarted) {
          kStarted = true
          kpiItems.value.forEach((k, i) => { if (!k.isStatic) animateKpi(i, k.value) })
        }
      })
    }, { threshold: 0.2 })
    kio.observe(kpiRef.value)
  }
})
</script>

<style scoped>
/* ============ 跨度条 ============ */
.span-wrap { margin-bottom: 28px; }
.span-track {
  position: relative; height: 36px;
  border-radius: 10px; background: var(--border-light);
}
.span-seg {
  position: absolute; top: 5px; height: 26px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}
.span-seg:hover { transform: translateY(-2px); z-index: 2; }
.span-seg--edu  { background: linear-gradient(135deg, var(--accent), #14b8a6); }
.span-seg--work { background: linear-gradient(135deg, var(--primary), #5a7cf5); }
.span-label { font-size: 11px; font-weight: 700; color: #fff; white-space: nowrap; padding: 0 8px; }
.span-axis { display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; color: var(--text-light); }

/* ============ KPI 高光带 ============ */
.kpi-band {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 32px;
}
.kpi-card {
  padding: 18px; border-radius: 16px;
  background: linear-gradient(145deg, var(--card-bg), rgba(67,97,238,0.03));
  box-shadow: var(--shadow);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.kpi-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-hover); }
.kpi-value {
  font-size: 34px; font-weight: 900; letter-spacing: -1px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}
.kpi-label { font-size: 13px; font-weight: 600; color: var(--text); }
.kpi-source { font-size: 11px; color: var(--text-light); margin-top: 2px; }

/* ============ zigzag timeline ============ */
.zigzag { position: relative; padding: 10px 0; }
.zigzag-line {
  position: absolute; left: 50%; top: 0; bottom: 0; width: 2px;
  background: linear-gradient(180deg, var(--primary), var(--accent), var(--primary));
  opacity: 0.4;
  transform: translateX(-50%);
}
.zz-item { position: relative; width: 48%; margin-bottom: 32px; }
.zz-left  { margin-right: auto; padding-right: 40px; text-align: right; }
.zz-right { margin-left: auto;  padding-left: 40px;  text-align: left; }

.zz-dot {
  position: absolute; top: 18px; width: 16px; height: 16px; border-radius: 50%;
  background: var(--card-bg); border: 3px solid var(--primary);
  box-shadow: 0 0 12px rgba(67,97,238,0.3);
  z-index: 2;
}
.zz-left  .zz-dot { right: -8px; }
.zz-right .zz-dot { left: -8px; }
.zz-type--edu .zz-dot { border-color: var(--accent); box-shadow: 0 0 12px rgba(6,214,160,0.3); }

.zz-card { padding: 20px 24px; text-align: left; }
.zz-date { font-size: 12.5px; color: var(--text-light); margin: 0 0 4px; }
.zz-title { font-size: 17px; font-weight: 800; color: var(--text); margin: 0 0 4px; }
.zz-subtitle { font-size: 13.5px; color: var(--text-sub); margin: 0; }
.zz-desc { font-size: 13px; color: var(--text-sub); line-height: 1.65; margin: 8px 0 0; }
.zz-highlights { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.zz-gpa {
  display: inline-block; margin-top: 8px; padding: 3px 12px;
  border-radius: 999px; font-size: 12.5px; font-weight: 700;
  color: var(--accent); background: rgba(6,214,160,0.1);
}
.zz-metrics { margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border-light); }
.zz-chart { width: 100%; height: 130px; }
.zz-achieve { margin-top: 10px; padding-left: 18px; }
.zz-achieve li { font-size: 13px; color: var(--text-sub); line-height: 1.8; }

/* ============ REVEAL ============ */
.reveal {
  opacity: 0; transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.in-view { opacity: 1; transform: translateY(0); }

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
  .zigzag-line { left: 18px; }
  .zz-item { width: 100%; margin-left: 0; margin-right: 0; padding-left: 48px; padding-right: 0; text-align: left; }
  .zz-dot { left: 10px !important; right: auto !important; }
  .kpi-band { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 480px) {
  .kpi-band { grid-template-columns: repeat(2, 1fr); }
  .kpi-value { font-size: 26px; }
}
</style>
