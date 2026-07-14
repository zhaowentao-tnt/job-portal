<template>
  <div class="content-inner">
    <h2 class="section-title">作品集</h2>

    <!-- Category filter -->
    <div class="portfolio-filter">
      <button
        v-for="cat in categories"
        :key="cat"
        class="filter-btn"
        :class="{ 'filter-btn--active': activeCategory === cat }"
        @click="activeCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Featured -->
    <div v-if="featuredItems.length" class="featured-section">
      <h3 class="subsection-title">精选作品</h3>
      <div class="featured-grid">
        <div
          v-for="item in featuredItems"
          :key="item.id"
          class="card featured-card"
          @click="openDetail(item)"
        >
          <div class="featured-thumb" :style="{ background: getGradient(item.id) }">
            <span class="featured-emoji">{{ getCategoryIcon(item.category) }}</span>
          </div>
          <div class="featured-body">
            <div class="featured-header">
              <h4 class="featured-title">{{ item.title }}</h4>
              <span class="tag tag--primary">{{ item.category }}</span>
            </div>
            <p class="featured-desc">{{ item.description }}</p>
            <div class="featured-tech">
              <span v-for="t in item.techStack" :key="t" class="tag">{{ t }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- More works -->
    <div v-if="otherItems.length" class="more-section">
      <h3 class="subsection-title">更多作品</h3>
      <div class="more-grid">
        <div
          v-for="item in otherItems"
          :key="item.id"
          class="card more-card"
          @click="openDetail(item)"
        >
          <div class="more-thumb" :style="{ background: getGradient(item.id) }">
            <span class="more-emoji">{{ getCategoryIcon(item.category) }}</span>
          </div>
          <div class="more-body">
            <h4 class="more-title">{{ item.title }}</h4>
            <p class="more-desc">{{ item.description }}</p>
            <div class="more-footer">
              <span class="tag tag--primary">{{ item.category }}</span>
              <span class="more-date">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!featuredItems.length && !otherItems.length" class="empty-state">
      <div class="empty-state-icon">📂</div>
      <p>暂无作品，请在管理面板添加</p>
    </div>

    <!-- Detail Modal -->
    <Modal :show="!!selectedItem" :title="selectedItem?.title || ''" @close="selectedItem = null">
      <div v-if="selectedItem" class="detail-content">
        <div class="detail-thumb" :style="{ background: getGradient(selectedItem.id) }">
          <span class="detail-emoji">{{ getCategoryIcon(selectedItem.category) }}</span>
        </div>
        <div class="detail-meta">
          <span class="tag tag--primary">{{ selectedItem.category }}</span>
          <span class="detail-date">{{ selectedItem.date }}</span>
        </div>
        <p v-if="selectedItem.description" class="detail-desc">{{ selectedItem.description }}</p>
        <p v-if="selectedItem.detail" class="detail-text">{{ selectedItem.detail }}</p>
        <div v-if="selectedItem.highlights && selectedItem.highlights.length" class="detail-highlights">
          <h4>亮点</h4>
          <ul>
            <li v-for="h in selectedItem.highlights" :key="h">{{ h }}</li>
          </ul>
        </div>
        <div v-if="selectedItem.techStack && selectedItem.techStack.length" class="detail-tech">
          <h4>技术栈</h4>
          <div class="detail-tags">
            <span v-for="t in selectedItem.techStack" :key="t" class="tag tag--primary">{{ t }}</span>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Modal from '../../shared/Modal.vue'

const props = defineProps({ data: { type: Object, default: () => ({ items: [] }) } })

const items = computed(() => props.data.items || [])
const activeCategory = ref('全部')
const selectedItem = ref(null)

const categories = computed(() => {
  const cats = new Set(['全部'])
  items.value.forEach(i => { if (i.category) cats.add(i.category) })
  return [...cats]
})

const featuredItems = computed(() =>
  items.value.filter(i =>
    i.featured && (activeCategory.value === '全部' || i.category === activeCategory.value)
  )
)

const otherItems = computed(() =>
  items.value.filter(i =>
    !i.featured && (activeCategory.value === '全部' || i.category === activeCategory.value)
  )
)

function openDetail(item) {
  selectedItem.value = item
}

const gradients = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #30cfd0, #330867)'
]

function getGradient(id) {
  const idx = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return gradients[idx % gradients.length]
}

function getCategoryIcon(cat) {
  const map = { '项目': '🚀', '文章': '📝', 'AI应用': '🤖', '其他': '📦' }
  return map[cat] || '📦'
}
</script>

<style scoped>
.subsection-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 32px 0 16px;
}

.subsection-title:first-of-type {
  margin-top: 0;
}

/* Filter */
.portfolio-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--border);
  background: var(--card-bg);
  color: var(--text-sub);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-family);
}

.filter-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.filter-btn--active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

/* Featured */
.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.featured-card {
  padding: 0;
  overflow: hidden;
  cursor: pointer;
}

.featured-thumb {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.featured-emoji {
  font-size: 48px;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
}

.featured-body {
  padding: 20px;
}

.featured-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.featured-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.featured-desc {
  font-size: 14px;
  color: var(--text-sub);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.featured-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* More */
.more-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.more-card {
  padding: 0;
  overflow: hidden;
  cursor: pointer;
}

.more-thumb {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-emoji {
  font-size: 32px;
}

.more-body {
  padding: 14px;
}

.more-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
}

.more-desc {
  font-size: 13px;
  color: var(--text-light);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.more-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.more-date {
  font-size: 12px;
  color: var(--text-muted);
}

/* Detail modal */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-thumb {
  height: 180px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-emoji {
  font-size: 56px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-date {
  font-size: 13px;
  color: var(--text-light);
}

.detail-desc {
  font-size: 15px;
  color: var(--text);
  line-height: 1.7;
  font-weight: 500;
}

.detail-text {
  font-size: 14px;
  color: var(--text-sub);
  line-height: 1.8;
}

.detail-highlights h4,
.detail-tech h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.detail-highlights ul {
  padding-left: 20px;
}

.detail-highlights li {
  font-size: 14px;
  color: var(--text-sub);
  line-height: 1.8;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

@media (max-width: 768px) {
  .featured-grid { grid-template-columns: 1fr; }
  .more-grid { grid-template-columns: 1fr; }
}
</style>
