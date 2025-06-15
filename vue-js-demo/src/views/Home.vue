<template>
  <div>
    <h2>🏡 首页</h2>
    <p>欢迎访问主页。</p>
    <p>访问次数: {{ count }}</p>
  </div>
</template>

<!-- 
<script setup> 是组合式 API 编译时语法糖，可以：
1. 自动导出组件, 不需要显式地定义和导出组件；
2. 不需要手动调用setup()函数;
    - 所有顶层代码会被自动编译到 setup() 函数内
    - 导入的组件无需手动注册，可直接在模板使用
3. 定义的变量和函数可以直接在模板中使用，无需显式返回;
    - 写在 <script setup> 块中最外层作用域的声明会被自动导出到模板
    - 
-->
<script setup>
import { ref, onMounted } from 'vue';

// 用于在客户端浏览器中存储键值对数据
// 数据存储在浏览器的本地存储空间中，与特定的域名绑定
// 每个域名通常有 5MB 的存储限制（具体大小取决于浏览器）
// 在跨域或隐私模式下，localStorage 可能不可用或者隐私页面关闭后自动清空
// 手动清理浏览器的缓存、历史会被清楚
// 这个 || 表示如果左侧的值为假值(null、undefined、0、NaN、false、"")则返回右侧的值
//   目的是没有数据时提供一个安全的默认值，避免 NaN 的出现，从而确保代码的稳定性。
const count = ref(Number(localStorage.getItem('visitCount') || 0));

// 每次浏览器刷新页面，都会触发
// 生命周期钩子，在组件挂载到 DOM 后触发
onMounted(() => {
  count.value++;
  localStorage.setItem('visitCount', count.value);
});
</script>
