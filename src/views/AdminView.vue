<template>
  <div class="admin-page">
    <!-- Password gate -->
    <div v-if="!authed" class="admin-login">
      <div class="login-box">
        <div class="login-icon">🔐</div>
        <h2>管理面板</h2>
        <p class="login-hint">请输入管理密码</p>
        <input
          v-model="password"
          type="password"
          class="form-input"
          placeholder="密码"
          @keyup.enter="login"
        />
        <p v-if="error" class="login-error">密码错误，请重试</p>
        <button class="btn btn--primary" @click="login" style="width: 100%; justify-content: center;">进入</button>
        <router-link to="/home" class="login-back">← 返回主页</router-link>
      </div>
    </div>

    <!-- Admin panel -->
    <AdminPanel v-else />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminPanel from '../components/admin/AdminPanel.vue'

const ADMIN_PASSWORD = 'zwt2026'
const SESSION_KEY = 'jp_admin_authed'

const authed = ref(sessionStorage.getItem(SESSION_KEY) === '1')
const password = ref('')
const error = ref(false)

function login() {
  if (password.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, '1')
    authed.value = true
    error.value = false
  } else {
    error.value = true
  }
}
</script>

<style scoped>
.admin-page {
  min-height: calc(100vh - var(--nav-height));
}

.admin-login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--nav-height) - 100px);
  padding: 24px;
}

.login-box {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  padding: 40px;
  max-width: 360px;
  width: 100%;
  text-align: center;
}

.login-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.login-box h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.login-hint {
  font-size: 14px;
  color: var(--text-light);
  margin-bottom: 20px;
}

.login-error {
  color: var(--danger);
  font-size: 13px;
  margin: 8px 0 12px;
}

.login-back {
  display: inline-block;
  margin-top: 20px;
  font-size: 13px;
  color: var(--text-light);
}
</style>
