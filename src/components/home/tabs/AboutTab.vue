<template>
  <div class="content-inner">
    <h2 class="section-title">关于我</h2>

    <div class="card about-card">
      <p>{{ data.summary }}</p>
    </div>

    <h3 class="subsection-title">核心能力</h3>

    <!-- Bento Grid -->
    <div class="bento-grid">
      <div
        v-for="(cap, idx) in data.capabilities"
        :key="cap.name"
        class="bento-card"
        :class="[`bento-card--${idx % 4}`, idx === 0 || idx === 3 ? 'bento-card--wide' : '']"
      >
        <div class="bento-icon" :style="{ background: cap.color + '18', color: cap.color }">
          {{ cap.icon }}
        </div>
        <h4 class="bento-name">{{ cap.name }}</h4>
        <p v-if="cap.description" class="bento-desc">{{ cap.description }}</p>
        <div class="bento-skills">
          <span v-for="skill in cap.skills" :key="skill" class="tag" :style="{ background: cap.color + '12', color: cap.color, borderColor: cap.color + '30' }">{{ skill }}</span>
        </div>
      </div>
    </div>

    <div class="card contact-card">
      <div class="contact-grid">
        <div v-for="item in data.contact" :key="item.label" class="contact-item">
          <span class="contact-label">{{ item.icon }} {{ item.label }}</span>
          <a
            v-if="item.type === 'email'"
            :href="`mailto:${item.value}`"
            class="contact-value contact-link"
          >{{ item.value }}</a>
          <span v-else class="contact-value">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ data: { type: Object, default: () => ({}) } })

function isEmail(value) {
  if (!value) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
</script>

<style scoped>
.about-card {
  line-height: 1.9;
  font-size: 15px;
  color: var(--text-sub);
}

.subsection-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 32px 0 16px;
}

/* === Bento Grid === */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.bento-card {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  position: relative;
  overflow: hidden;
}

.bento-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 16px 16px 0 0;
  background: var(--card-accent, var(--primary));
  opacity: 0;
  transition: opacity 0.25s;
}

.bento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.bento-card:hover::before {
  opacity: 1;
}

/* Accent colors via nth-child since we have the color in JS */
.bento-card--0 { --card-accent: #4361ee; }
.bento-card--1 { --card-accent: #06d6a0; }
.bento-card--2 { --card-accent: #8b5cf6; }
.bento-card--3 { --card-accent: #f59e0b; }

/* Wide cards span 2 columns */
.bento-card--wide {
  grid-column: span 2;
}

.bento-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}

.bento-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.bento-desc {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-sub);
  margin: 0;
}

.bento-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.bento-skills .tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
}

/* Contact */
.contact-card {
  margin-top: 24px;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-label {
  font-size: 13px;
  color: var(--text-light);
}

.contact-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.contact-link {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.2s;
}

.contact-link:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 900px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .bento-card--wide {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
  .bento-card--wide {
    grid-column: span 1;
  }
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
