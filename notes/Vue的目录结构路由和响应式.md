# Vue3目录结构、路由与响应式

## 目录结构解析

一个典型的 Vue 3 项目（基于 Vite）目录结构如下，每个文件/目录都有明确职责：

```bash
├── public/            # 静态资源（直接复制到构建产物）
├── src/               # 核心代码
│   ├── assets/        # 需编译的静态资源（图片/SVG）
│   ├── components/    # 可复用组件
│   ├── views/         # 页面级组件（可选）
│   ├── router/        # 路由配置（推荐）
│   ├── main.js        # 应用入口
│   └── App.vue        # 根组件
├── index.html         # 应用入口HTML
├── vite.config.js     # 构建工具配置
```

### 关键文件说明

| 文件/目录            | 作用说明                                                                 |
|----------------------|------------------------------------------------------------------------|
| `public/`            | 存放无需编译的静态资源（如 `favicon.ico`、`robots.txt`）               |
| `src/main.js`        | 初始化 Vue 应用实例并挂载到 DOM                                        |
| `src/App.vue`        | 根组件，通常包含全局布局和路由视图（`<router-view>`）                   |
| `vite.config.js`     | 配置 Vite 构建行为，如插件、路径别名等                                 |

---

## 路由与全局布局设计

### 1. 路由视图(Router View)

路由视图是动态内容渲染区域，由 `<router-view>` 组件实现：

```vue
<!-- src/App.vue -->
<template>
  <header>导航栏</header>
  <main>
    <!-- 页面内容在此动态渲染 -->
    <router-view></router-view>
  </main>
  <footer>页脚</footer>
</template>
```

### 2. 路由配置

通过 Vue Router 定义页面映射关系：

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### 3. 嵌套路由布局

不同页面可使用不同布局：

```javascript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,  // 管理后台布局
    children: [
      { path: 'dashboard', component: Dashboard }
    ]
  }
]
```

---

## 响应式基础

响应式（Reactivity）​​ 是 Vue 的核心特性，指 ​数据变化时自动触发相关 视图更新​ 的机制。

- ​传统编程​：修改数据 → 手动操作 DOM 更新
- ​Vue 响应式​：修改数据 → 框架自动更新 DOM

```js
// 传统方式
let count = 0
const el = document.getElementById('count')
function updateDOM() {
  el.textContent = count
}
updateDOM()

// 每次修改数据后需手动更新 DOM
count++
updateDOM() 
```

传统方式的痛点：

- 手动同步状态与视图​：容易遗漏更新导致 UI 不同步
- ​复杂状态依赖​：多个数据变化需要精确控制更新范围
- ​性能低下​：全量 DOM 更新消耗资源

Vue 的响应式系统自动追踪数据依赖关系，​精确更新相关视图部分，无需开发者手动干预。

举例：表单双向绑定

```js
<script setup>
const text = ref('')
</script>

<template>
  <input v-model="text">
  <p>{{ text }}</p>
</template>
```

举例：异步数据更新

```js
const data = ref(null)

fetch('/api/data')
  .then(res => res.json())
  .then(json => data.value = json) // 自动触发视图更新
```

### 1. 什么是 ref

`ref` 是 Vue 3 的响应式 API，用于**包装基本类型数据为响应式对象**：

```javascript
// ref 基本类型包装为 { value: ... } 对象实现响应式
import { ref } from 'vue'
const count = ref(0)  // { value: 0 }

// 使用 reactive,通过 Proxy 代理整个对象
const user = reactive({ name: 'Alice' })
console.log(user.name) // Alice
```

### 2. 为什么要用 ref

| 场景                | 普通变量         | ref 变量               |
|---------------------|------------------|------------------------|
| 响应式更新          | ❌ 无法触发更新  | ✅ 自动触发视图更新     |
| 模板使用            | 需要额外处理     | ✅ 自动解包（无需 .value） |
| 类型支持            | 无特殊处理       | ✅ 明确的类型推断       |

### 3. 使用规范

- **访问值**：通过 `.value` 属性
- **模板中自动解包**：直接使用变量名

```vue
<script setup>
const count = ref(0)

function increment() {
  count.value++  // JS 中需用 .value
}
</script>

<!-- Vue 的模板语法 经过 Vue 编译器的处理，最终转换为标准的 JavaScript 渲染函数 -->
<template>
  <!-- 模板中自动解包 -->
  <button @click="increment">{{ count }}</button>
</template>
```

### 4. ref 与 reactive 对比

| 特性                | ref             | reactive          |
|---------------------|-----------------|-------------------|
| 适用数据类型        | 基本类型/对象   | 对象/数组         |
| 访问方式            | 需要 `.value`   | 直接访问属性      |
| 重新赋值            | ✅ 支持         | ❌ 破坏响应式     |
| 模板自动解包        | ✅ 支持         | ❌ 不需要         |

**建议：统一用 ref 管理所有类型，减少心智负担。**

---

## 最佳实践总结

### 1. 目录结构建议

- 保持组件分类清晰：`components/` 放复用组件，`views/` 放页面级组件
- 按功能拆分目录：如 `composables/` 存放组合式函数，`utils/` 放工具函数

### 2. 路由设计原则

- 在 `App.vue` 中定义全局布局
- 使用嵌套路由实现多层级布局
- 按需加载组件提升性能：

  ```javascript
  { 
    path: '/profile',
    component: () => import('../views/Profile.vue') // 懒加载
  }
  ```

### 3. 响应式数据选择

- **优先用 ref**：处理基本类型和简单对象
- **复杂对象用 reactive**：深层次嵌套数据
- **避免直接解构响应式对象**
- **组合式函数封装**：

  ```javascript
  // useCounter.js
  export function useCounter(initial = 0) {
    const count = ref(initial)
    const double = computed(() => count.value * 2)
    return { count, double }
  }
  ```
