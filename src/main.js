import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useData } from './composables/useData'
import './assets/styles/variables.css'
import './assets/styles/main.css'

const { loadAll } = useData()

const app = createApp(App)
app.use(router)

// 先加载数据，再挂载应用
loadAll().finally(() => {
  app.mount('#app')
})
