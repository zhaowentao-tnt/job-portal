<template>
  <div class="content-inner">
    <div class="head-row">
      <h2 class="section-title">校园 & 生活</h2>
      <button class="btn-add" @click="addCampus">+ 社团经历</button>
    </div>

    <!-- Campus -->
    <h3 class="subsection-title">社团经历</h3>
    <div v-if="data.campus && data.campus.length" class="campus-grid">
      <div v-for="(role, ri) in data.campus" :key="ri" class="card campus-card">
        <div class="campus-header">
          <span class="campus-icon">🎓</span>
          <div style="flex: 1; min-width: 0;">
            <h4 class="campus-role">
              <ClickEdit :value="role.role" module="life" :path="`campus.${ri}.role`" placeholder="角色" />
            </h4>
            <p class="campus-org">
              <ClickEdit :value="role.organization" module="life" :path="`campus.${ri}.organization`" placeholder="组织" />
            </p>
          </div>
          <button class="btn-del-x" @click="removeCampus(ri)">×</button>
        </div>
        <p class="campus-period">
          <ClickEdit :value="role.period" module="life" :path="`campus.${ri}.period`" placeholder="时间段" />
        </p>
        <ul v-if="role.achievements && role.achievements.length" class="campus-achievements">
          <li v-for="(a, ai) in role.achievements" :key="ai" class="ach-row">
            <ClickEdit :value="a" type="longtext" module="life" :path="`campus.${ri}.achievements.${ai}`" placeholder="成就" />
            <button class="btn-del-x" @click="removeAch(ri, ai)">×</button>
          </li>
        </ul>
        <button class="btn-add-tag" @click="addAch(ri)">+ 添加成就</button>
      </div>
    </div>
    <div v-else class="empty-state"><div class="empty-state-icon">🎓</div><p>暂无社团经历</p></div>

    <!-- Interests -->
    <h3 class="subsection-title" style="margin-top: 40px;">兴趣爱好</h3>
    <div v-if="data.interests && data.interests.length" class="interest-cloud">
      <span v-for="(interest, i) in data.interests" :key="interest + i" class="interest-tag-wrap">
        <span class="interest-tag" :style="getInterestStyle(i)">
          <ClickEdit :value="interest" module="life" :path="`interests.${i}`" placeholder="兴趣" />
        </span>
        <button class="btn-del-x" @click="removeInterest(i)">×</button>
      </span>
      <button class="btn-add-tag" @click="addInterest">+ 添加</button>
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
import ClickEdit from '../../common/ClickEdit.vue'
import { useData } from '../../../composables/useData'

defineProps({ data: { type: Object, default: () => ({}) } })
const { arrayOp } = useData()

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

function addCampus() {
  arrayOp('life', 'campus', 'push', { role: '新角色', organization: '组织', period: '时间段', achievements: [] })
}
function removeCampus(ri) {
  if (!confirm('删除此社团经历？')) return
  arrayOp('life', 'campus', 'remove', null, ri)
}
function addAch(ri) {
  arrayOp('life', `campus.${ri}.achievements`, 'push', '新成就')
}
function removeAch(ri, ai) {
  arrayOp('life', `campus.${ri}.achievements`, 'remove', null, ai)
}
function addInterest() {
  arrayOp('life', 'interests', 'push', '新兴趣')
}
function removeInterest(i) {
  arrayOp('life', 'interests', 'remove', null, i)
}
</script>

<style scoped>
.head-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px; }
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
  border: 1px solid var(--border-light);
  background: var(--card-bg);
  color: var(--text-light);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}
.btn-del-x:hover { background: var(--danger); color: #fff; border-color: var(--danger); }
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

.subsection-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 20px;
}

.campus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.campus-card { padding: 20px; }
.campus-header {
  display: flex; align-items: flex-start; gap: 12px;
  margin-bottom: 8px;
}
.campus-icon { font-size: 24px; flex-shrink: 0; }
.campus-role { font-size: 15px; font-weight: 600; color: var(--text); margin: 0; }
.campus-org { font-size: 13px; color: var(--text-light); margin: 0; }
.campus-period {
  font-size: 13px;
  color: var(--primary);
  font-weight: 500;
  margin-bottom: 8px;
}
.campus-achievements { padding-left: 18px; margin: 6px 0; }
.campus-achievements li { font-size: 13px; color: var(--text-sub); line-height: 1.8; }
.ach-row {
  display: flex; align-items: center; gap: 4px;
  list-style: none;
  padding: 0;
}
.ach-row::before { content: '• '; color: var(--primary); font-weight: 700; }

.interest-cloud { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.interest-tag-wrap { display: inline-flex; align-items: center; gap: 4px; }
.interest-tag {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  transition: transform 0.2s;
  cursor: default;
}
.interest-tag:hover { transform: translateY(-2px); }

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
.photo-placeholder span { font-size: 32px; opacity: 0.4; }
.photo-placeholder p { font-size: 12px; }

.empty-state { text-align: center; padding: 32px 0; color: var(--text-light); }
.empty-state-icon { font-size: 36px; margin-bottom: 8px; }

@media (max-width: 640px) {
  .photo-wall { grid-template-columns: repeat(2, 1fr); }
}
</style>