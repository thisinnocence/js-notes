# Vue 的路由入门

Vue Router 是 Vue.js 官方的路由管理器，用于在单页面应用程序 (SPA) 中实现页面导航。以下是 Vue3 路由的基本用法，并与 Node.js Express 的路由进行对比。

## Vue3 路由基础

1. **安装 Vue Router**

   <https://router.vuejs.org/zh/installation.html>

   ```bash
   pnpm add vue-router@4
   ```

2. **定义路由**
   在 Vue3 中，路由是通过 `createRouter` 和 `createWebHistory` 定义的。例如：

   ```javascript
   // router/index.js
   import { createRouter, createWebHistory } from 'vue-router';
   import Home from '../views/Home.vue';
   import About from '../views/About.vue';

   const routes = [
       { path: '/', component: Home },
       { path: '/about', component: About },
   ];

   const router = createRouter({
       history: createWebHistory(),
       routes,
   });

   export default router;
   ```

3. **在 Vue 应用中使用路由**

   ```javascript
   // main.js
   import { createApp } from 'vue';
   import App from './App.vue';
   import router from './router';

   const app = createApp(App);
   app.use(router);
   app.mount('#app');
   ```

4. **在模板中使用路由**

   ```html
   <template>
     <nav>
       <router-link to="/">Home</router-link>
       <router-link to="/about">About</router-link>
     </nav>
     <router-view></router-view>
   </template>
   ```

## vue Router 与 Express Router 的对比

### vue和express的路由区别

Vue Router 和 Express Router 都是路由管理工具，但它们的用途和工作原理有所不同。以下是它们的对比：

| 特性                | Vue Router                              | Express Router                          |
|---------------------|-----------------------------------------|-----------------------------------------|
| **用途**            | 前端路由，用于 SPA 页面导航             | 后端路由，用于处理 HTTP 请求            |
| **定义路由**        | 使用 `createRouter` 定义路径和组件映射   | 使用 `app.get` 或 `app.post` 定义路径和处理函数 |
| **动态路由**        | 支持动态路由，例如 `/user/:id`          | 支持动态路由，例如 `/user/:id`          |
| **导航守卫**        | 提供 `beforeEach` 等钩子函数             | 需要手动实现中间件                      |
| **状态管理**        | 通常结合 Vuex 或 Pinia 使用              | 通常结合数据库或其他存储机制            |

### 前后端路由的配合使用

| 项目         | 建议                                       |
| ---------- | ---------------------------------------- |
| Vue 负责     | 控制组件页面的切换，使用 `vue-router`                |
| Express 负责 | 提供 API 接口，返回 Vue 的 `index.html`          |
| 避免冲突       | Express 不要拦截 `/about` 等前端路由              |
| 后端兜底       | 使用 `app.get('*')` 返回 `index.html` 支持 SPA |
| API 路由     | 统一用 `/api/xxx` 形式                        |

在使用 Vue Router 和 Express Router 时，可能会遇到路由冲突的问题。为了避免这种情况，可以采取以下措施：

1. **前端路由优先**：在 Express 中，确保前端路由的处理在后端 API 路由之前。例如：

   ```javascript
   // 处理静态资源它发现路径以 /path-to/my-app 开头，并且静态目录中有 index.html，
   // 直接返回该文件, 不会继续往下走 app.get('/api/items')
   app.use('/path-to/my-app', express.static(path.join(__dirname, '../frontend/dist')));

   // 后端 API 路由
   app.get('/api/items', (req, res) => {
       // 处理 API 请求
   });
   ```

2. **兜底路由**：在 Express 中添加一个兜底路由，处理所有未匹配的请求，将其重定向到 Vue 的 `index.html`：

   ```javascript
   app.get('/path-to/my-app/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
   });

   ```

3. **API 路由命名规范**：前后端交互的API路由规范：

   ```javascript
   // 前端路由: /path-to/my-app/about
   // API 路由: /api/items
   app.get('/api/items', (req, res) => {
    // 处理 API 请求
   });
   ```

    这种配置确保：

    - 前端路由（如 `/about`）由 Vue Router 处理
    - API 请求（如 `/api/items`）由 Express 处理
    - 其他请求重定向到 Vue 的 index.html

前端项目（如 `Vue + vue-router`）使用了 `HTML5 History` 模式（非 hash），所有路径如 /users/123 都需要返回 index.html，然后由前端 JS 解释路由。所以你必须让 Express：优先响应静态资源路径（前端页面）, 然后后处理 API 请求。

推荐的配置：

```js
// 1. 静态文件托管（Vue 编译后的 dist）
app.use('/my-app', express.static(path.join(__dirname, '../frontend/dist')));

// 2. API 路由（前缀清晰，避免冲突）
app.use('/api', apiRouter);

// 3. 前端路由 fallback（非 /api 的全部都返回 index.html）
app.get('/my-app/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

## Vue3 + Express 实现 Web App

在本节中，我们将介绍如何在 `localhost:3000/path-to/my-app` 显示 Vue3 页面，并通过 RESTful JSON API 与后端 Express 实现增删改查。

### 前端配置

1. **设置 Vue Router 的基础路径**
   在 `router/index.js` 中，设置 `createWebHistory` 的基础路径为 `/path-to/my-app`：

   ```javascript
   import { createRouter, createWebHistory } from 'vue-router';
   import Home from '../views/Home.vue';
   import About from '../views/About.vue';

   const routes = [
     { path: '/', component: Home },
     { path: '/about', component: About },
   ];

   const router = createRouter({
      // Vue的History模式，使用浏览器的History API
      // 告诉Vue Router，所有的路由都应该以这个路径为前缀
      // e.g. 路由 / 实际访问路径是 /path-to/my-app/
      history: createWebHistory('/path-to/my-app'),
      // 路由规则数组, 路径和对应的组件映射关系
      // 当访问 /path-to/my-app/ 时，渲染 Home 组件
      // 当访问 /path-to/my-app/about 时，渲染 About 组件
      routes,
   });

   export default router;
   ```

   而 MyApp 是 App.vue, 是主组件，是整个应用的入口，但它不会直接出现在路由配置中，路由配置只定义了页面级别的组件。主组件通常是一个容器，用于包含路由视图和其他全局内容。如：

   ```Javascript
   <template>
     <div id="app">
       <nav>
         <router-link to="/">Home</router-link>
         <router-link to="/about">About</router-link>
       </nav>
       // 是路由占位符，表示根据当前路由渲染对应的组件
       <router-view></router-view>
     </div>
   </template>
   ```

2. **配置前端 API 调用**
   在 Vue3 中，可以使用 `fetch` 或 `axios` 调用后端 API。例如：

   ```javascript
   // services/api.js
   import axios from 'axios';

   const apiClient = axios.create({
       baseURL: 'http://localhost:3000/api',
       headers: {
           'Content-Type': 'application/json',
       },
   });

   export default {
       getItems() {
           return apiClient.get('/items');
       },
       createItem(data) {
           return apiClient.post('/items', data);
       },
       updateItem(id, data) {
           return apiClient.put(`/items/${id}`, data);
       },
       deleteItem(id) {
           return apiClient.delete(`/items/${id}`);
       },
   };
   ```

### 后端配置

1. **设置静态文件路径**
   在 Express 中，将 Vue3 构建后的静态文件托管到 `/path-to/my-app`：

   ```javascript
   import express from 'express';
   import path from 'path';
   import { fileURLToPath } from 'url';

   // 当前模块的文件 URL 转换为文件系统路径, 获取当前文件绝对路径
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);

   const app = express();
   // 每次调用 app.use 都会注册一个新的中间件或路由处理程序, 根据路径匹配到
   // 前端默认构建到 ../frontend/dist 目录，托管到 /path-to/my-app 路径下
   app.use('/path-to/my-app', express.static(path.join(__dirname, '../frontend/dist')));
   ```

2. **实现 RESTful JSON API**
   定义增删改查的 API 路由：

   ```javascript
   // 当客户端发送带有 JSON 格式数据的请求时, req.body自动解析json
   app.use(express.json());

   const items = []; // 模拟数据库

   app.get('/api/items', (req, res) => {
       res.json(items);
   });

   app.post('/api/items', (req, res) => {
       const newItem = req.body;
       items.push(newItem);
       res.status(201).json(newItem);
   });

   app.put('/api/items/:id', (req, res) => {
       const id = parseInt(req.params.id, 10);
       const index = items.findIndex(item => item.id === id);
       if (index !== -1) {
           items[index] = req.body;
           res.json(items[index]);
       } else {
           res.status(404).send('Item not found');
       }
   });

   app.delete('/api/items/:id', (req, res) => {
       const id = parseInt(req.params.id, 10);
       const index = items.findIndex(item => item.id === id);
       if (index !== -1) {
           const deletedItem = items.splice(index, 1);
           res.json(deletedItem);
       } else {
           res.status(404).send('Item not found');
       }
   });
   ```

3. **启动服务器**

   ```javascript
   const PORT = 3000;
   app.listen(PORT, () => {
       console.log(`Server is running at http://localhost:${PORT}/path-to/my-app`);
   });
   ```

### 总结

通过以上配置，前端 Vue3 应用可以在 `localhost:3000/path-to/my-app` 正常显示，并通过 RESTful JSON API 与后端 Express 实现增删改查功能。这种架构适合构建现代化的单页面应用程序。
