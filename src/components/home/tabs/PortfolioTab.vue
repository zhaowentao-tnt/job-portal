<template>
  <div class="content-inner">
    <div class="head-row">
      <h2 class="section-title">作品集</h2>
      <button class="btn-add" @click="addItem">+ 新增作品</button>
    </div>

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
          v-for="(item, idx) in featuredItems"
          :key="item.id"
          class="card featured-card"
          @click="openDetail(item)"
        >
          <div class="featured-thumb" :style="{ background: getGradient(item.id) }">
            <span class="featured-emoji">{{ getCategoryIcon(item.category) }}</span>
          </div>
          <div class="featured-body">
            <div class="featured-header">
              <h4 class="featured-title">
                <ClickEdit
                  :value="item.title"
                  module="portfolio"
                  :path="`items.${realIdx(item)}.title`"
                  placeholder="作品标题"
                />
              </h4>
              <span class="tag tag--primary">
                <ClickEdit
                  :value="item.category"
                  module="portfolio"
                  :path="`items.${realIdx(item)}.category`"
                  placeholder="分类"
                />
              </span>
            </div>
            <p class="featured-desc">
              <ClickEdit
                :value="item.description"
                type="longtext"
                module="portfolio"
                :path="`items.${realIdx(item)}.description`"
                placeholder="描述"
              />
            </p>
            <div class="featured-tech">
              <span v-for="(t, ti) in item.techStack" :key="ti" class="tag-wrap">
                <span class="tag">
                  <ClickEdit
                    :value="t"
                    module="portfolio"
                    :path="`items.${realIdx(item)}.techStack.${ti}`"
                    placeholder="技术"
                  />
                </span>
                <button class="btn-del-x" @click.stop="removeTech(item, ti)">×</button>
              </span>
              <button class="btn-add-tag" @click.stop="addTech(item)">+ 技术</button>
            </div>
            <div class="featured-footer">
              <ClickEdit
                :value="item.date"
                module="portfolio"
                :path="`items.${realIdx(item)}.date`"
                placeholder="时间"
              />
              <button class="btn-del-card" @click.stop="removeItem(item)" title="删除">×</button>
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
          v-for="(item, idx) in otherItems"
          :key="item.id"
          class="card more-card"
          @click="openDetail(item)"
        >
          <div class="more-thumb" :style="{ background: getGradient(item.id) }">
            <span class="more-emoji">{{ getCategoryIcon(item.category) }}</span>
          </div>
          <div class="more-body">
            <h4 class="more-title">
              <ClickEdit :value="item.title" module="portfolio" :path="`items.${realIdx(item)}.title`" placeholder="作品标题" />
            </h4>
            <p class="more-desc">
              <ClickEdit :value="item.description" type="longtext" module="portfolio" :path="`items.${realIdx(item)}.description`" placeholder="描述" />
            </p>
            <div class="more-footer">
              <span class="tag tag--primary">
                <ClickEdit :value="item.category" module="portfolio" :path="`items.${realIdx(item)}.category`" placeholder="分类" />
              </span>
              <ClickEdit :value="item.date" module="portfolio" :path="`items.${realIdx(item)}.date`" placeholder="时间" />
              <button class="btn-del-card" @click.stop="removeItem(item)" title="删除">×</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!featuredItems.length && !otherItems.length" class="empty-state">
      <div class="empty-state-icon">📂</div>
      <p>暂无作品</p>
      <button class="btn-add" @click="addItem" style="margin-top: 12px;">+ 新增作品</button>
    </div>

    <!-- Detail Modal -->
    <Modal :show="!!selectedItem" :title="selectedItem?.title || ''" @close="selectedItem = null">
      <div v-if="selectedItem" class="detail-content">
        <div class="detail-thumb" :style="{ background: getGradient(selectedItem.id) }">
          <span class="detail-emoji">{{ getCategoryIcon(selectedItem.category) }}</span>
        </div>
        <div class="detail-meta">
          <span class="tag tag--primary">
            <ClickEdit :value="selectedItem.category" module="portfolio" :path="`items.${realIdx(selectedItem)}.category`" placeholder="分类" />
          </span>
          <span class="detail-date">
            <ClickEdit :value="selectedItem.date" module="portfolio" :path="`items.${realIdx(selectedItem)}.date`" placeholder="时间" />
          </span>
          <button class="btn-del-card" @click="removeItem(selectedItem); selectedItem = null">删除</button>
        </div>
        <p class="detail-desc">
          <ClickEdit :value="selectedItem.description" type="longtext" module="portfolio" :path="`items.${realIdx(selectedItem)}.description`" placeholder="描述" />
        </p>
        <p class="detail-text">
          <ClickEdit :value="selectedItem.detail" type="longtext" module="portfolio" :path="`items.${realIdx(selectedItem)}.detail`" placeholder="详细内容" />
        </p>
        <div class="detail-highlights">
          <h4>亮点</h4>
          <ul>
            <li v-for="(h, hi) in selectedItem.highlights" :key="hi" class="hl-row">
              <ClickEdit :value="h" module="portfolio" :path="`items.${realIdx(selectedItem)}.highlights.${hi}`" placeholder="亮点" />
              <button class="btn-del-x" @click="removeHL(selectedItem, hi)">×</button>
            </li>
            <button class="btn-add-tag" @click="addHL(selectedItem)">+ 添加亮点</button>
          </ul>
        </div>
        <div class="detail-tech">
          <h4>技术栈</h4>
          <div class="detail-tags">
            <span v-for="(t, ti) in selectedItem.techStack" :key="ti" class="tag-wrap">
              <span class="tag tag--primary">
                <ClickEdit :value="t" module="portfolio" :path="`items.${realIdx(selectedItem)}.techStack.${ti}`" placeholder="技术" />
              </span>
              <button class="btn-del-x" @click="removeTech(selectedItem, ti)">×</button>
            </span>
            <button class="btn-add-tag" @click="addTech(selectedItem)">+ 添加技术</button>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Modal from '../../shared/Modal.vue'
import ClickEdit from '../../common/ClickEdit.vue'
import { useData } from '../../../composables/useData'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const { arrayOp } = useData()

const items = computed(() => props.data.items || [])

const activeCategory = ref('全部')
const categories = computed(() => {
  const set = new Set(['全部'])
  items.value.forEach(i => i.category && set.add(i.category))
  return [...set]
})

const featuredItems = computed(() => items.value.filter(i => i.featured && (activeCategory.value === '全部' || i.category === activeCategory.value)))
const otherItems = computed(() => items.value.filter(i => !i.featured && (activeCategory.value === '全部' || i.category === activeCategory.value)))

const selectedItem = ref(null)
function openDetail(item) { selectedItem.value = item }

function realIdx(item) {
  return items.value.findIndex(i => i.id === item.id)
}

const GRADIENT_PALETTE = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
]
function getGradient(id) {
  let hash = 0
  for (let i = 0; i < (id || '').length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return GRADIENT_PALETTE[Math.abs(hash) % GRADIENT_PALETTE.length]
}
const ICON_MAP = {
  '项目': '🚀', '文章': '📝', 'AI应用': '🤖', '竞赛': '🏆'
}
function getCategoryIcon(cat) {
  return ICON_MAP[cat] || '✨'
}

/* ---- CRUD ---- */
function addItem() {
  const id = 'p' + Date.now().toString(36)
  arrayOp('portfolio', 'items', 'push', {
    id,
    title: '新作品',
    category: '项目',
    description: '简短描述（点击编辑）',
    detail: '详细内容（点击编辑）',
    thumbnail: '',
    highlights: [],
    techStack: [],
    date: new Date().toISOString().slice(0, 7),
    links: {},
    featured: false
  })
}
function removeItem(item) {
  if (!confirm('删除此作品？')) return
  const idx = realIdx(item)
  arrayOp('portfolio', 'items', 'remove', null, idx)
}
function addHL(item) {
  arrayOp('portfolio', `items.${realIdx(item)}.highlights`, 'push', '新亮点')
}
function removeHL(item, hi) {
  arrayOp('portfolio', `items.${realIdx(item)}.highlights`, 'remove', null, hi)
}
function addTech(item) {
  arrayOp('portfolio', `items.${realIdx(item)}.techStack`, 'push', '新技术')
}
function removeTech(item, ti) {
  arrayOp('portfolio', `items.${realIdx(item)}.techStack`, 'remove', null, ti)
}
</script>

<style scoped>
.head-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px; gap: 12px;
}
.section-title { font-size: 22px; font-weight: 800; color: var(--text); margin: 0; }
.btn-add {
  background: none;
  border: 1.5px dashed var(--border);
  color: var(--text-light);
  padding: 5px 12px;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 13px;
  font-family: var(--font-family);
}
.btn-add:hover { border-color: var(--primary); color: var(--primary); }
.btn-del-x {
  border: none;
  background: var(--border-light);
  color: var(--text-light);
  width: 18px; height: 18px;
  border-radius: 50%;
  font-size: 11px;
  cursor: pointer;
  padding: 0; line-height: 1;
}
.btn-del-x:hover { background: var(--danger); color: #fff; }
.btn-del-card {
  background: none;
  border: 1px solid var(--border-light);
  color: var(--text-light);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  cursor: pointer;
  font-family: var(--font-family);
}
.btn-del-card:hover { background: var(--danger); color: #fff; border-color: var(--danger); }
.btn-add-tag {
  background: none;
  border: 1px dashed var(--border);
  color: var(--text-light);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  cursor: pointer;
  font-family: var(--font-family);
}
.btn-add-tag:hover { border-color: var(--primary); color: var(--primary); }

.subsection-title { font-size: 18px; font-weight: 600; color: var(--text); margin: 0 0 16px; }

.portfolio-filter {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-bottom: 24px;
}
.filter-btn {
  padding: 6px 14px;
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
.filter-btn:hover { border-color: var(--primary); color: var(--primary); }
.filter-btn--active { background: var(--primary); border-color: var(--primary); color: #fff; }

.featured-section, .more-section { margin-bottom: 32px; }

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.featured-card {
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;
}
.featured-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-hover); }

.featured-thumb {
  height: 140px;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.featured-emoji { font-size: 56px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2)); }

.featured-body { padding: 18px 20px; }
.featured-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 8px; }
.featured-title { font-size: 16px; font-weight: 700; color: var(--text); margin: 0; flex: 1; }
.featured-desc { font-size: 13px; color: var(--text-sub); line-height: 1.6; margin: 6px 0 10px; }
.featured-tech { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.tag { padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 600; background: var(--card-bg); color: var(--text-sub); }
.tag--primary { background: rgba(67,97,238,0.1); color: var(--primary); }
.tag-wrap { display: inline-flex; align-items: center; gap: 2px; }
.featured-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-light);
}

.more-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.more-card { padding: 0; overflow: hidden; cursor: pointer; transition: transform 0.25s; }
.more-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-hover); }
.more-thumb { height: 100px; display: flex; align-items: center; justify-content: center; }
.more-emoji { font-size: 40px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2)); }
.more-body { padding: 14px 16px; }
.more-title { font-size: 14px; font-weight: 700; color: var(--text); margin: 0 0 4px; }
.more-desc { font-size: 12px; color: var(--text-sub); line-height: 1.55; margin: 0 0 8px; }
.more-footer { display: flex; gap: 6px; align-items: center; font-size: 11px; color: var(--text-light); }

/* Detail Modal */
.detail-content { display: flex; flex-direction: column; gap: 14px; }
.detail-thumb {
  height: 200px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.detail-emoji { font-size: 72px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25)); }
.detail-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.detail-date { font-size: 13px; color: var(--text-light); }
.detail-desc { font-size: 15px; line-height: 1.7; color: var(--text); margin: 0; }
.detail-text { font-size: 14px; line-height: 1.75; color: var(--text-sub); margin: 0; }
.detail-highlights h4, .detail-tech h4 { font-size: 14px; font-weight: 700; color: var(--text); margin: 0 0 8px; }
.detail-highlights ul { padding-left: 0; list-style: none; margin: 0; }
.detail-highlights li { font-size: 13.5px; color: var(--text-sub); line-height: 1.7; }
.hl-row {
  display: flex; align-items: center; gap: 4px;
  margin-bottom: 2px;
}
.hl-row::before { content: '• '; color: var(--primary); font-weight: 700; }
.detail-tags { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }

.empty-state { text-align: center; padding: 48px 0; color: var(--text-light); }
.empty-state-icon { font-size: 40px; margin-bottom: 12px; }
</style>