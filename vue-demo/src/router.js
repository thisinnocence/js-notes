import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'

// components 是组件目录, 如按钮、卡片、导航栏等，不直接和路由绑定：
// views 页面视图目录, 用来放“和路由绑定的页面组件”

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
