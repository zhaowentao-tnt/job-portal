<template>
  <div class="content-inner">
    <h2 class="section-title">成长轨迹</h2>

    <!-- Learning paths -->
    <h3 class="subsection-title">学习路径</h3>
    <div v-for="path in data.learningPaths" :key="path.name" class="path-block">
      <div class="path-header">
        <span class="path-dot" :style="{ background: path.color }"></span>
        <span class="path-name" :style="{ color: path.color }">{{ path.name }}</span>
      </div>
      <div class="timeline" :style="{ '--line-color': path.color }">
        <div v-for="(item, i) in path.items" :key="i" class="timeline-item" :style="{ borderColor: path.color }">
          <p class="timeline-date">{{ item.date }}</p>
          <p class="timeline-desc">{{ item.content }}</p>
        </div>
      </div>
    </div>

    <div v-if="!data.learningPaths || !data.learningPaths.length" class="empty-state">
      <div class="empty-state-icon">🌱</div>
      <p>暂无学习路径记录</p>
    </div>

    <!-- Certificates -->
    <h3 class="subsection-title" style="margin-top: 40px;">证书与荣誉</h3>
    <div v-if="data.certificates && data.certificates.length" class="cert-grid">
      <div v-for="cert in data.certificates" :key="cert.name" class="card cert-card">
        <div class="cert-icon">🏅</div>
        <div>
          <h4 class="cert-name">{{ cert.name }}</h4>
          <p class="cert-date">{{ cert.date }}</p>
        </div>
      </div>
    </div>
    <div v-else class="empty-state"><div class="empty-state-icon">🏅</div><p>暂无证书记录</p></div>

    <!-- Books -->
    <h3 class="subsection-title" style="margin-top: 40px;">阅读书单</h3>
    <div v-if="data.books && data.books.length" class="book-list">
      <div v-for="book in data.books" :key="book.title" class="book-item">
        <span class="book-icon">📖</span>
        <div class="book-info">
          <h4 class="book-title">{{ book.title }}</h4>
          <p class="book-author">{{ book.author }}</p>
        </div>
        <span class="tag" :class="book.status === '已读' ? 'tag--success' : 'tag--primary'">{{ book.status }}</span>
      </div>
    </div>
    <div v-else class="empty-state"><div class="empty-state-icon">📖</div><p>暂无书单记录</p></div>
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

.path-block {
  margin-bottom: 28px;
}

.path-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.path-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.path-name {
  font-size: 15px;
  font-weight: 600;
}

/* Override timeline line color */
.path-block .timeline::before {
  background: var(--border-light);
}

.path-block .timeline-item::before {
  border-color: var(--line-color, var(--primary));
}

/* Certificates */
.cert-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.cert-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
}

.cert-icon {
  font-size: 28px;
}

.cert-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.cert-date {
  font-size: 13px;
  color: var(--text-light);
}

/* Books */
.book-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.book-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--card-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}

.book-icon {
  font-size: 24px;
}

.book-info {
  flex: 1;
}

.book-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.book-author {
  font-size: 13px;
  color: var(--text-light);
}
</style>
