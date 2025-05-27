<template>
  <div>
    <h1>🌐 Vue SPA demo</h1>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <!-- horizontal line separator -->
    <hr/>
    <!-- 这里显示的是子页面 -->
    <router-view />
  </div>
</template>