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

## 对比 Node.js Express 路由

| 特性                | Vue Router                              | Express Router                          |
|---------------------|-----------------------------------------|-----------------------------------------|
| **用途**            | 前端路由，用于 SPA 页面导航             | 后端路由，用于处理 HTTP 请求            |
| **定义路由**        | 使用 `createRouter` 定义路径和组件映射   | 使用 `app.get` 或 `app.post` 定义路径和处理函数 |
| **动态路由**        | 支持动态路由，例如 `/user/:id`          | 支持动态路由，例如 `/user/:id`          |
| **导航守卫**        | 提供 `beforeEach` 等钩子函数             | 需要手动实现中间件                      |
| **状态管理**        | 通常结合 Vuex 或 Pinia 使用              | 通常结合数据库或其他存储机制            |

一个简单的对比：

- Vue Router 动态路由

```javascript
const routes = [
    { path: '/user/:id', component: User },
];
```

- Express 动态路由

```javascript
app.get('/user/:id', (req, res) => {
    res.send(`User ID: ${req.params.id}`);
});
```

通过以上对比可以看出，Vue Router 专注于前端页面的导航，而 Express Router 主要用于后端 HTTP 请求的处理。

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
