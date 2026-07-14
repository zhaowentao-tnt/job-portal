<template>
  <div class="content-inner">
    <h2 class="section-title">经历</h2>

    <!-- Education -->
    <h3 class="subsection-title">教育背景</h3>
    <div class="timeline">
      <div v-for="edu in data.education" :key="edu.school" class="timeline-item">
        <p class="timeline-date">{{ edu.startDate }} — {{ edu.endDate || '至今' }}</p>
        <h4 class="timeline-title">{{ edu.school }}</h4>
        <p class="timeline-subtitle">{{ edu.degree }} · {{ edu.major }}<span v-if="edu.department"> · {{ edu.department }}</span></p>
        <div v-if="edu.gpa" class="timeline-desc">GPA: {{ edu.gpa }}</div>
        <div v-if="edu.highlights && edu.highlights.length" class="timeline-highlights">
          <span v-for="h in edu.highlights" :key="h" class="tag tag--success">{{ h }}</span>
        </div>
      </div>
    </div>

    <!-- Work Experience -->
    <h3 class="subsection-title" style="margin-top: 40px;">工作经历</h3>
    <div class="timeline">
      <div
        v-for="exp in data.experiences"
        :key="exp.company"
        class="timeline-item"
        :class="{ 'timeline-item--current': exp.current }"
      >
        <p class="timeline-date">
          {{ exp.startDate }} — {{ exp.endDate || '至今' }}
          <span v-if="exp.current" class="status-dot status-dot--current"></span>
          <span v-if="exp.current" style="color: var(--accent); font-size: 12px;">当前</span>
        </p>
        <h4 class="timeline-title">{{ exp.company }}</h4>
        <p class="timeline-subtitle">{{ exp.position }}<span v-if="exp.department"> · {{ exp.department }}</span></p>
        <p v-if="exp.description" class="timeline-desc">{{ exp.description }}</p>
        <ul v-if="exp.achievements && exp.achievements.length" class="achievement-list">
          <li v-for="a in exp.achievements" :key="a">{{ a }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ data: { type: Object, default: () => ({}) } })
</script>

<style scoped>
.subsection-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 20px;
}

.timeline-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.achievement-list {
  margin-top: 8px;
  padding-left: 20px;
}

.achievement-list li {
  font-size: 14px;
  color: var(--text-sub);
  line-height: 1.8;
}
</style>
