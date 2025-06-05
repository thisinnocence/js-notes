<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { BContainer } from 'bootstrap-vue-next'
</script>

<template>
  <div class="d-flex flex-column vh-100">
    <!-- 主导航 -->
    <nav class="main-nav bg-white border-bottom">
      <BContainer class="container-custom">
        <div class="nav-wrapper">
          <!-- 导航链接 -->
          <div class="nav-links">
            <RouterLink to="/" class="nav-link">Home</RouterLink>
            <RouterLink to="/posts" class="nav-link">Posts</RouterLink>
            <RouterLink to="/about" class="nav-link">About</RouterLink>
          </div>
        </div>
      </BContainer>
    </nav>

    <!-- 主内容区 -->
    <main class="flex-grow-1">
      <BContainer class="container-custom py-4">
        <RouterView />
      </BContainer>
    </main>

    <!-- Footer -->
    <footer class="footer bg-light border-top py-4">
      <BContainer class="container-custom">
        <div class="text-muted">
          <p class="mb-0">&copy; Kitty 2025 All rights reserved.</p>
        </div>
      </BContainer>
    </footer>
  </div>
</template>

<style scoped>
.nav-wrapper {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  gap: 2rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  padding: 0.5rem 1rem;
}

.container-custom {
  max-width: 1080px !important;
  margin: 0 auto;
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>
