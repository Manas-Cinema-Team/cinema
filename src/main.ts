import './main.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { initializeAuth } from './stores/auth'

await initializeAuth()

const app = createApp(App)

app.use(router)

app.mount('#app')
