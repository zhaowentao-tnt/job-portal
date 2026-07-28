<template>
  <div class="content-inner">
    <div class="head-row">
      <h2 class="section-title">成长轨迹</h2>
      <div class="head-btns">
        <button class="btn-add" @click="addPath">+ 学习路径</button>
        <button class="btn-add" @click="addCert">+ 证书</button>
        <button class="btn-add" @click="addBook">+ 书</button>
      </div>
    </div>

    <!-- Learning paths -->
    <h3 class="subsection-title">学习路径</h3>
    <div v-for="(path, pi) in (data.learningPaths || [])" :key="pi" class="path-block">
      <div class="path-header">
        <span class="path-dot" :style="{ background: path.color }">
          <ClickEdit :value="path.color" module="growth" :path="`learningPaths.${pi}.color`" placeholder="#hex" />
        </span>
        <span class="path-name" :style="{ color: path.color }">
          <ClickEdit :value="path.name" module="growth" :path="`learningPaths.${pi}.name`" placeholder="路径名" />
        </span>
        <button class="btn-del-sm" @click="removePath(pi)">×</button>
      </div>
      <div class="timeline" :style="{ '--line-color': path.color }">
        <div v-for="(item, ii) in (path.items || [])" :key="ii" class="timeline-item" :style="{ borderColor: path.color }">
          <p class="timeline-date">
            <ClickEdit :value="item.date" module="growth" :path="`learningPaths.${pi}.items.${ii}.date`" placeholder="日期" />
          </p>
          <p class="timeline-desc">
            <ClickEdit :value="item.content" type="longtext" module="growth" :path="`learningPaths.${pi}.items.${ii}.content`" placeholder="内容" />
          </p>
          <button class="btn-del-x" @click="removePathItem(pi, ii)">×</button>
        </div>
        <button class="btn-add-tag" @click="addPathItem(pi)">+ 添加节点</button>
      </div>
    </div>

    <div v-if="!data.learningPaths || !data.learningPaths.length" class="empty-state">
      <div class="empty-state-icon">🌱</div>
      <p>暂无学习路径记录</p>
    </div>

    <!-- Certificates -->
    <h3 class="subsection-title" style="margin-top: 40px;">证书与荣誉</h3>
    <div v-if="data.certificates && data.certificates.length" class="cert-grid">
      <div v-for="(cert, ci) in data.certificates" :key="ci" class="card cert-card">
        <div class="cert-icon">🏅</div>
        <div style="flex: 1; min-width: 0;">
          <h4 class="cert-name">
            <ClickEdit :value="cert.name" module="growth" :path="`certificates.${ci}.name`" placeholder="证书名" />
          </h4>
          <p class="cert-date">
            <ClickEdit :value="cert.date" module="growth" :path="`certificates.${ci}.date`" placeholder="日期" />
          </p>
        </div>
        <button class="btn-del-x" @click="removeCert(ci)">×</button>
      </div>
    </div>
    <div v-else class="empty-state"><div class="empty-state-icon">🏅</div><p>暂无证书记录</p></div>

    <!-- Books -->
    <h3 class="subsection-title" style="margin-top: 40px;">阅读书单</h3>
    <div v-if="data.books && data.books.length" class="book-list">
      <div v-for="(book, bi) in data.books" :key="bi" class="book-item">
        <span class="book-icon">📖</span>
        <div class="book-info">
          <h4 class="book-title">
            <ClickEdit :value="book.title" module="growth" :path="`books.${bi}.title`" placeholder="书名" />
          </h4>
          <p class="book-author">
            <ClickEdit :value="book.author" module="growth" :path="`books.${bi}.author`" placeholder="作者" />
          </p>
        </div>
        <ClickEdit
          :value="book.status"
          type="select"
          :options="[{value:'已读',label:'已读'},{value:'在读',label:'在读'},{value:'想读',label:'想读'}]"
          module="growth"
          :path="`books.${bi}.status`"
        >
          <template #display>
            <span class="tag" :class="book.status === '已读' ? 'tag--success' : 'tag--primary'">{{ book.status || '未分类' }}</span>
          </template>
        </ClickEdit>
        <button class="btn-del-x" @click="removeBook(bi)">×</button>
      </div>
    </div>
    <div v-else class="empty-state"><div class="empty-state-icon">📖</div><p>暂无书单记录</p></div>
  </div>
</template>

<script setup>
import ClickEdit from '../../common/ClickEdit.vue'
import { useData } from '../../../composables/useData'

defineProps({ data: { type: Object, default: () => ({}) } })
const { arrayOp } = useData()

function addPath() {
  arrayOp('growth', 'learningPaths', 'push', { name: '新学习路径', color: '#4361ee', items: [] })
}
function removePath(pi) {
  if (!confirm('删除该学习路径？')) return
  arrayOp('growth', 'learningPaths', 'remove', null, pi)
}
function addPathItem(pi) {
  arrayOp('growth', `learningPaths.${pi}.items`, 'push', { date: '2026-01', content: '新节点' })
}
function removePathItem(pi, ii) {
  arrayOp('growth', `learningPaths.${pi}.items`, 'remove', null, ii)
}
function addCert() {
  arrayOp('growth', 'certificates', 'push', { name: '新证书', date: '2026' })
}
function removeCert(ci) {
  arrayOp('growth', 'certificates', 'remove', null, ci)
}
function addBook() {
  arrayOp('growth', 'books', 'push', { title: '新书', author: '作者', status: '想读' })
}
function removeBook(bi) {
  arrayOp('growth', 'books', 'remove', null, bi)
}
</script>

<style scoped>
.head-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px; }
.head-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.section-title { font-size: 22px; font-weight: 800; color: var(--text); margin: 0; }
.btn-add {
  background: none;
  border: 1.5px dashed var(--border);
  color: var(--text-light);
  padding: 5px 12px;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 12px;
  font-family: var(--font-family);
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
.btn-del-sm { width: 22px; height: 22px; }
.btn-del-x { width: 20px; height: 20px; }
.btn-del-sm:hover, .btn-del-x:hover { background: var(--danger); color: #fff; border-color: var(--danger); }
.btn-add-tag {
  background: none;
  border: 1px dashed var(--border);
  color: var(--text-light);
  padding: 3px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  font-family: var(--font-family);
  margin-top: 8px;
}
.btn-add-tag:hover { border-color: var(--primary); color: var(--primary); }
.tag {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.tag--success { background: rgba(6,214,160,0.12); color: var(--accent); }
.tag--primary { background: rgba(67,97,238,0.1); color: var(--primary); }

.subsection-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 20px;
}

.path-block { margin-bottom: 28px; }
.path-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 16px;
}
.path-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
.path-name { font-size: 15px; font-weight: 600; flex: 1; }

.path-block .timeline::before { background: var(--border-light); }
.path-block .timeline-item::before { border-color: var(--line-color, var(--primary)); }
.timeline-item {
  display: flex; align-items: flex-start; gap: 6px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--border-light);
}
.timeline-date {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-sub);
  min-width: 80px;
  flex-shrink: 0;
  margin: 0;
}
.timeline-desc {
  font-size: 13.5px;
  color: var(--text-sub);
  margin: 0;
  flex: 1;
}

.cert-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.cert-card {
  display: flex; align-items: center; gap: 14px;
  padding: 18px;
}
.cert-icon { font-size: 28px; flex-shrink: 0; }
.cert-name { font-size: 14px; font-weight: 600; color: var(--text); margin: 0; }
.cert-date { font-size: 13px; color: var(--text-light); margin: 0; }

.book-list { display: flex; flex-direction: column; gap: 10px; }
.book-item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px;
  background: var(--card-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}
.book-icon { font-size: 24px; flex-shrink: 0; }
.book-info { flex: 1; min-width: 0; }
.book-title { font-size: 14px; font-weight: 600; color: var(--text); margin: 0; }
.book-author { font-size: 13px; color: var(--text-light); margin: 0; }

.empty-state { text-align: center; padding: 32px 0; color: var(--text-light); }
.empty-state-icon { font-size: 36px; margin-bottom: 8px; }
</style>