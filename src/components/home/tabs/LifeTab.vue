<template>
  <div class="content-inner">
    <h2 class="section-title">校园 & 生活</h2>

    <!-- Campus -->
    <h3 class="subsection-title">社团经历</h3>
    <div v-if="data.campus && data.campus.length" class="campus-grid">
      <div v-for="role in data.campus" :key="role.role" class="card campus-card">
        <div class="campus-header">
          <span class="campus-icon">🎓</span>
          <div>
            <h4 class="campus-role">{{ role.role }}</h4>
            <p class="campus-org">{{ role.organization }}</p>
          </div>
        </div>
        <p class="campus-period">{{ role.period }}</p>
        <ul v-if="role.achievements && role.achievements.length" class="campus-achievements">
          <li v-for="a in role.achievements" :key="a">{{ a }}</li>
        </ul>
      </div>
    </div>
    <div v-else class="empty-state"><div class="empty-state-icon">🎓</div><p>暂无社团经历</p></div>

    <!-- Interests -->
    <h3 class="subsection-title" style="margin-top: 40px;">兴趣爱好</h3>
    <div v-if="data.interests && data.interests.length" class="interest-cloud">
      <span v-for="(interest, i) in data.interests" :key="interest" class="interest-tag" :style="getInterestStyle(i)">
        {{ interest }}
      </span>
    </div>
    <div v-else class="empty-state"><div class="empty-state-icon">💫</div><p>暂无兴趣记录</p></div>

    <!-- Photos placeholder -->
    <h3 class="subsection-title" style="margin-top: 40px;">生活剪影</h3>
    <div class="photo-wall">
      <div v-for="n in 6" :key="n" class="photo-placeholder">
        <span>📷</span>
        <p>照片待上传</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ data: { type: Object, default: () => ({}) } })

const colors = [
  { bg: '#eef1fd', color: '#4361ee' },
  { bg: '#e6faf3', color: '#06d6a0' },
  { bg: '#f3e8ff', color: '#8b5cf6' },
  { bg: '#fef3c7', color: '#f59e0b' },
  { bg: '#ffe4e6', color: '#f43f5e' },
  { bg: '#e0f2fe', color: '#0ea5e9' }
]

function getInterestStyle(i) {
  const c = colors[i % colors.length]
  return { background: c.bg, color: c.color }
}
</script>

<style scoped>
.subsection-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 20px;
}

/* Campus */
.campus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.campus-card {
  padding: 20px;
}

.campus-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.campus-icon {
  font-size: 24px;
}

.campus-role {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.campus-org {
  font-size: 13px;
  color: var(--text-light);
}

.campus-period {
  font-size: 13px;
  color: var(--primary);
  font-weight: 500;
  margin-bottom: 8px;
}

.campus-achievements {
  padding-left: 18px;
}

.campus-achievements li {
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.8;
}

/* Interests */
.interest-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.interest-tag {
  padding: 8px 18px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  transition: transform 0.2s;
  cursor: default;
}

.interest-tag:hover {
  transform: translateY(-2px);
}

/* Photos */
.photo-wall {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.photo-placeholder {
  aspect-ratio: 1;
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  gap: 8px;
}

.photo-placeholder span {
  font-size: 32px;
  opacity: 0.4;
}

.photo-placeholder p {
  font-size: 12px;
}

@media (max-width: 640px) {
  .photo-wall { grid-template-columns: repeat(2, 1fr); }
}
</style>
