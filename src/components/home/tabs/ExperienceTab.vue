<template>
  <div class="exp-wide" ref="root">
    <!-- ============ A. 数据驱动职业跨度条 ============ -->
    <div class="span-wrap">
      <div class="span-track">
        <div
          v-for="seg in segments"
          :key="seg.label + seg.min"
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
      <div v-for="(k, idx) in kpiItems" :key="k.label + k.source + idx" class="kpi-card reveal">
        <div class="kpi-value">
          <template v-if="k.isStatic">{{ k.prefix || '' }}{{ k.value }}{{ k.unit }}</template>
          <template v-else>{{ k.prefix || '' }}{{ kDisplay[idx] }}{{ k.unit }}</template>
        </div>
        <div class="kpi-label">{{ k.label }}</div>
        <div class="kpi-source">{{ k.source }}</div>
      </div>
    </div>

    <!-- 增删按钮 -->
    <div class="toolbar">
      <button class="btn-add" @click="addEdu">+ 新增教育经历</button>
      <button class="btn-add" @click="addExp">+ 新增工作经历</button>
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
          <p class="zz-date">
            <ClickEdit :value="item.start" type="date" module="experiences" :path="`${item._kind}.${item._idx}.startDate`" placeholder="开始日期" />
            <span> — </span>
            <ClickEdit :value="item.end" type="date" module="experiences" :path="`${item._kind}.${item._idx}.endDate`" placeholder="结束日期（可空）" />
          </p>

          <h4 class="zz-title">
            <template v-if="item._kind === 'education'">
              <ClickEdit :value="item.title" module="experiences" :path="`education.${item._idx}.school`" placeholder="学校名" />
            </template>
            <template v-else>
              <ClickEdit :value="item.title" module="experiences" :path="`experiences.${item._idx}.company`" placeholder="公司名" />
            </template>
            <button class="btn-del-sm" @click="removeItem(item)" title="删除此条">×</button>
          </h4>

          <p class="zz-subtitle">
            <template v-if="item._kind === 'education'">
              <ClickEdit :value="item.degree" module="experiences" :path="`education.${item._idx}.degree`" placeholder="学历" />
              <span v-if="item.major"> · <ClickEdit :value="item.major" module="experiences" :path="`education.${item._idx}.major`" placeholder="专业" /></span>
              <span v-if="item.department">, <ClickEdit :value="item.department" module="experiences" :path="`education.${item._idx}.department`" placeholder="学院" /></span>
            </template>
            <template v-else>
              <ClickEdit :value="item.position" module="experiences" :path="`experiences.${item._idx}.position`" placeholder="岗位" />
              <span v-if="item.location"> · <ClickEdit :value="item.location" module="experiences" :path="`experiences.${item._idx}.location`" placeholder="地点" /></span>
              <span v-if="item.department">, <ClickEdit :value="item.department" module="experiences" :path="`experiences.${item._idx}.department`" placeholder="部门" /></span>
            </template>
          </p>

          <p class="zz-desc">
            <ClickEdit :value="item.description" type="longtext" module="experiences" :path="`${item._kind}.${item._idx}.description`" placeholder="描述" />
          </p>

          <!-- edu highlights -->
          <div v-if="item._kind === 'education'" class="zz-highlights">
            <span v-for="(h, hi) in (item.highlights || [])" :key="hi" class="tag-wrap">
              <span class="tag tag--success">
                <ClickEdit :value="h" module="experiences" :path="`education.${item._idx}.highlights.${hi}`" placeholder="亮点" />
              </span>
              <button class="btn-del-x" @click="removeEduHL(item._idx, hi)">×</button>
            </span>
            <button class="btn-add-tag" @click="addEduHL(item._idx)">+ 添加亮点</button>
          </div>
          <div v-if="item._kind === 'education' && item.gpa" class="zz-gpa">
            GPA <ClickEdit :value="item.gpa" module="experiences" :path="`education.${item._idx}.gpa`" placeholder="如 3.82/4.0" />
          </div>

          <!-- work metrics -->
          <div v-if="item._kind === 'experiences' && (item.metrics || []).length" class="zz-metrics">
            <v-chart class="zz-chart" :option="miniBar(item.metrics)" autoresize />
            <div class="zz-metrics-edit">
              <div v-for="(m, mi) in item.metrics" :key="mi" class="metric-row">
                <ClickEdit :value="m.label" module="experiences" :path="`experiences.${item._idx}.metrics.${mi}.label`" placeholder="指标名" />
                <ClickEdit :value="m.value" type="number" module="experiences" :path="`experiences.${item._idx}.metrics.${mi}.value`" placeholder="值" />
                <ClickEdit :value="m.unit" module="experiences" :path="`experiences.${item._idx}.metrics.${mi}.unit`" placeholder="单位" />
                <ClickEdit :value="m.prefix || ''" module="experiences" :path="`experiences.${item._idx}.metrics.${mi}.prefix`" placeholder="前缀" />
                <button class="btn-del-x" @click="removeMetric(item._idx, mi)">×</button>
              </div>
              <button class="btn-add-tag" @click="addMetric(item._idx)">+ 添加指标</button>
            </div>
          </div>

          <!-- achievements -->
          <ul v-if="(item.achievements || []).length || item._kind === 'experiences'" class="zz-achieve">
            <li v-for="(a, ai) in (item.achievements || [])" :key="ai" class="achievement-row">
              <ClickEdit
                :value="a"
                type="longtext"
                module="experiences"
                :path="`experiences.${item._idx}.achievements.${ai}`"
                placeholder="成就描述"
              />
              <button class="btn-del-x" @click="removeAch(item._idx, ai)">×</button>
            </li>
            <button class="btn-add-tag" @click="addAch(item._idx)">+ 添加成就</button>
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
import { useData } from '../../../composables/useData'
import ClickEdit from '../../common/ClickEdit.vue'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const { arrayOp } = useData()

/* ---- helpers ---- */
function toYear(s) {
  if (!s) return 0
  const [y, m] = s.split('-').map(Number)
  return y + (m ? (m - 0.5) / 12 : 0)
}

const segments = computed(() => {
  const segs = []
  const edu = props.data.education || []
  const exp = props.data.experiences || []
  edu.forEach(e => segs.push({ type: 'edu', label: e.school || '(学校)', min: toYear(e.startDate), max: toYear(e.endDate) }))
  exp.forEach(e => segs.push({ type: 'work', label: e.company || '(公司)', min: toYear(e.startDate), max: toYear(e.endDate || '2027-06') }))
  segs.sort((a, b) => a.min - b.min)
  return segs
})

const spanMin = computed(() => {
  const vals = segments.value.flatMap(s => [s.min, s.max])
  return vals.length ? Math.floor(Math.min(...vals)) : 2020
})
const spanMax = computed(() => {
  const vals = segments.value.flatMap(s => [s.min, s.max])
  return vals.length ? Math.ceil(Math.max(...vals)) : 2027
})
function pct(y) {
  const range = spanMax.value - spanMin.value
  return range ? ((y - spanMin.value) / range) * 100 : 0
}
const axisYears = computed(() => {
  const years = []
  for (let y = spanMin.value; y <= spanMax.value; y++) years.push(y)
  return years
})

/* ---- KPI ---- */
const kpiItems = computed(() => {
  const exps = props.data.experiences || []
  const items = []
  exps.forEach(exp => {
    const src = exp.company
      ? exp.company.replace('容诚会计师事务所上海分所', '容诚').replace('极兔速递有限公司', '极兔')
      : ''
    ;(exp.metrics || []).forEach(m => {
      items.push({ ...m, source: src, isStatic: m.isStatic || false })
    })
  })
  return items
})

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

/* ---- timeline ---- */
const timeline = computed(() => {
  const items = []
  const edu = props.data.education || []
  const exp = props.data.experiences || []

  edu.forEach((e, i) => items.push({
    id: 'edu-' + i,
    type: 'edu',
    _kind: 'education',
    _idx: i,
    start: e.startDate, end: e.endDate,
    title: e.school, subtitle: '',
    description: e.description || '',
    degree: e.degree || '',
    major: e.major || '',
    department: e.department || '',
    highlights: e.highlights || [],
    gpa: e.gpa || '',
    _start: toYear(e.startDate)
  }))

  exp.forEach((e, i) => items.push({
    id: 'exp-' + i,
    type: 'work',
    _kind: 'experiences',
    _idx: i,
    start: e.startDate, end: e.endDate,
    title: e.company, subtitle: '',
    description: e.description || '',
    position: e.position || '',
    location: e.location || '',
    department: e.department || '',
    metrics: e.metrics || [],
    achievements: e.achievements || [],
    _start: toYear(e.startDate)
  }))

  items.sort((a, b) => a._start - b._start)
  return items
})

/* ---- mini bar chart ---- */
const BAR_COLORS = ['#4361ee', '#5a7cf5', '#06d6a0', '#14b8a6']
function miniBar(metrics) {
  const maxVal = Math.max(...metrics.map(m => m.value || 0), 1)
  return {
    grid: { left: 80, right: 60, top: 4, bottom: 4 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', max: maxVal * 1.2, show: false },
    yAxis: {
      type: 'category', data: metrics.map(m => m.label || ''), inverse: true,
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
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') })
  }, { threshold: 0.12 })
  if (root.value) root.value.querySelectorAll('.reveal').forEach(el => io.observe(el))
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

/* ---- CRUD ---- */
function addEdu() {
  arrayOp('experiences', 'education', 'push', {
    school: '新学校', degree: '本科', major: '专业', department: '',
    startDate: '2020-09', endDate: '2024-06', gpa: '',
    description: '描述（点击编辑）', highlights: []
  })
}
function addExp() {
  arrayOp('experiences', 'experiences', 'push', {
    company: '新公司', position: '岗位', department: '', location: '',
    startDate: '2026-01', endDate: '', current: false,
    description: '描述（点击编辑）',
    metrics: [], achievements: []
  })
}
function removeItem(item) {
  if (!confirm('删除此条经历？')) return
  arrayOp('experiences', item._kind, 'remove', null, item._idx)
}
function addEduHL(idx) {
  arrayOp('experiences', `education.${idx}.highlights`, 'push', '新亮点')
}
function removeEduHL(idx, hi) {
  arrayOp('experiences', `education.${idx}.highlights`, 'remove', null, hi)
}
function addMetric(idx) {
  arrayOp('experiences', `experiences.${idx}.metrics`, 'push', { label: '指标', value: 0, unit: '', prefix: '' })
}
function removeMetric(idx, mi) {
  arrayOp('experiences', `experiences.${idx}.metrics`, 'remove', null, mi)
}
function addAch(idx) {
  arrayOp('experiences', `experiences.${idx}.achievements`, 'push', '新成就（点击编辑）')
}
function removeAch(idx, ai) {
  arrayOp('experiences', `experiences.${idx}.achievements`, 'remove', null, ai)
}
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 8px;
  margin: -16px 0 20px;
  flex-wrap: wrap;
}
.btn-add {
  background: none;
  border: 1.5px dashed var(--border);
  color: var(--text-light);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 13px;
  font-family: var(--font-family);
  transition: all 0.15s;
}
.btn-add:hover { border-color: var(--primary); color: var(--primary); }
.btn-del-sm,
.btn-del-x {
  border: 1px solid var(--border-light);
  background: var(--card-bg);
  color: var(--text-light);
  border-radius: 50%;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}
.btn-del-sm { width: 20px; height: 20px; }
.btn-del-x { width: 18px; height: 18px; }
.btn-del-sm:hover,
.btn-del-x:hover { background: var(--danger); color: #fff; border-color: var(--danger); }

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

.kpi-band {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
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
.zz-title { font-size: 17px; font-weight: 800; color: var(--text); margin: 0 0 4px; display: flex; align-items: center; gap: 8px; justify-content: flex-start; }
.zz-subtitle { font-size: 13.5px; color: var(--text-sub); margin: 0; }
.zz-desc { font-size: 13px; color: var(--text-sub); line-height: 1.65; margin: 8px 0 0; }
.zz-highlights { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; align-items: center; }
.tag-wrap { display: inline-flex; align-items: center; gap: 2px; }
.tag { padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.tag--success { color: var(--accent); background: rgba(6,214,160,0.12); }
.zz-gpa {
  display: inline-block; margin-top: 8px; padding: 3px 12px;
  border-radius: 999px; font-size: 12.5px; font-weight: 700;
  color: var(--accent); background: rgba(6,214,160,0.1);
}
.zz-metrics { margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border-light); }
.zz-chart { width: 100%; height: 130px; }
.zz-metrics-edit { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
.metric-row {
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
  font-size: 12px; color: var(--text-light);
}
.zz-achieve { margin-top: 10px; padding-left: 18px; }
.zz-achieve li { font-size: 13px; color: var(--text-sub); line-height: 1.8; }
.achievement-row {
  display: flex; align-items: flex-start; gap: 4px;
  list-style: none; padding: 0;
}
.achievement-row::before { content: '• '; color: var(--primary); font-weight: 700; }
.btn-add-tag {
  background: none;
  border: 1px dashed var(--border);
  color: var(--text-light);
  padding: 2px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 11px;
  font-family: var(--font-family);
}
.btn-add-tag:hover { border-color: var(--primary); color: var(--primary); }

.reveal {
  opacity: 0; transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.in-view { opacity: 1; transform: translateY(0); }

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