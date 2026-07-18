<template>
  <div class="content-inner">
    <h2 class="section-title">经历</h2>

    <!-- Education -->
    <h3 class="subsection-title">教育背景</h3>
    <div class="timeline">
      <div v-for="edu in data.education" :key="edu.school" class="tl-item">
        <div class="tl-node">
          <div class="tl-badge tl-badge--edu">{{ initial(edu.school) }}</div>
        </div>
        <div class="tl-body card">
          <p class="tl-date">{{ edu.startDate }} — {{ edu.endDate || '至今' }}</p>
          <h4 class="tl-title">{{ edu.school }}</h4>
          <p class="tl-subtitle">{{ edu.degree }} · {{ edu.major }}<span v-if="edu.department"> · {{ edu.department }}</span></p>
          <div v-if="edu.gpa" class="tl-desc">GPA: {{ edu.gpa }}</div>
          <div v-if="edu.highlights && edu.highlights.length" class="tl-highlights">
            <span v-for="h in edu.highlights" :key="h" class="tag tag--success">{{ h }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Work Experience -->
    <h3 class="subsection-title" style="margin-top: 40px;">工作经历</h3>
    <div class="timeline">
      <div
        v-for="exp in data.experiences"
        :key="exp.company"
        class="tl-item"
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
          <p v-if="exp.description" class="tl-desc">{{ exp.description }}</p>

          <!-- 量化成果条形图 -->
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

function barOption(metrics) {
  const maxVal = Math.max(...metrics.map(m => m.value)) * 1.15
  return {
    grid: { left: 96, right: 56, top: 6, bottom: 6 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'value',
      max: maxVal,
      show: false
    },
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
        data: metrics.map(m => ({
          value: m.value,
          itemStyle: { color: '#4361ee', borderRadius: [0, 8, 8, 0] }
        })),
        barWidth: 16,
        label: {
          show: true,
          position: 'right',
          formatter: (p) => metrics[p.dataIndex].value + metrics[p.dataIndex].unit,
          color: '#374151',
          fontSize: 12,
          fontWeight: 600
        }
      }
    ]
  }
}
</script>

<style scoped>
.subsection-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 20px;
}

/* === 图形化时间线 === */
.timeline {
  position: relative;
  padding-left: 4px;
}

.tl-item {
  position: relative;
  padding-left: 60px;
  padding-bottom: 30px;
}

.tl-item::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 44px;
  bottom: -4px;
  width: 2px;
  background: var(--border-light);
}

.tl-item:last-child::before {
  display: none;
}

.tl-node {
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 40px;
  z-index: 2;
}

.tl-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.tl-badge--edu {
  background: linear-gradient(135deg, #4361ee, #7048e8);
}

.tl-badge--work {
  background: linear-gradient(135deg, #06d6a0, #0ca678);
}

.tl-item--current .tl-badge--work {
  background: linear-gradient(135deg, #f59e0b, #f08c00);
}

.tl-body {
  padding: 18px 20px;
}

.tl-date {
  font-size: 12.5px;
  color: var(--text-light);
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tl-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.tl-subtitle {
  font-size: 13.5px;
  color: var(--text-sub);
  margin: 4px 0 0;
}

.tl-desc {
  font-size: 13.5px;
  color: var(--text-sub);
  line-height: 1.7;
  margin: 8px 0 0;
}

.tl-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

/* === 量化成果条形图 === */
.metrics-block {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed var(--border-light);
}

.metrics-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-sub);
  margin-bottom: 4px;
}

.metrics-chart {
  width: 100%;
  height: 132px;
}

.achievement-list {
  margin-top: 12px;
  padding-left: 20px;
}

.achievement-list li {
  font-size: 14px;
  color: var(--text-sub);
  line-height: 1.8;
}
</style>
