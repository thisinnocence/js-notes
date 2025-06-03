<script setup lang="ts">
import { ref } from 'vue'
import { BButton } from 'bootstrap-vue-next'

const count = ref(0)
function increment() {
  count.value++
}
</script>

<template>
  <BButton 
    variant="primary"
    size="lg"
    class="modern-btn rounded-3 px-7 py-4"
    @click="increment"
  >
    <span class="fs-3">Clicked {{ count }} times</span>
  </BButton>
</template>

<style scoped>
/* 现代化按钮样式 */
.modern-btn {
  /* 渐变背景色 - 从浅蓝到深蓝 */
  background: linear-gradient(135deg, #60a5fa 0%, #818cf8 100%) !important;
  border: none !important;
  /* 添加过渡动画效果 */
  transition: all 0.3s ease;
  font-weight: 500 !important;
  /* 控制按钮最小尺寸 */
  min-width: 300px;
  min-height: 80px;
  font-size: 1.5rem !important;
  border-radius: 12px !important;
}

/* 悬停效果 */
.modern-btn:hover {
  /* 上浮效果 */
  transform: translateY(-2px);
  /* 阴影效果 */
  box-shadow: 0 8px 25px rgba(96, 165, 250, 0.35) !important;
  /* 增加亮度 */
  filter: brightness(1.1);
}

/* 点击效果 */
.modern-btn:active {
  transform: translateY(0);
}
</style>
