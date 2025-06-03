<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { BCard, BSpinner } from 'bootstrap-vue-next'

// 定义帖子类型
interface Post {
  userId: number
  id: number
  title: string
  body: string
}

// ​类型关联​：ref<Post[]> 中的 Post 是接口类型，声明 .value 必须是 Post[] 数组
// ​值约束​：posts.value = response.data 时，TS会检查数据是否符合 Post 结构
// ​智能提示​：输入 posts.value. 时，IDE会提示 Post 接口的字段（如 title、body）
// ​错误拦截​：若赋值错误类型（如 posts.value = '字符串'），TS直接报错
// ​响应式保类型​：即使被 ref 包装，.value 仍保持 Post[] 的完整类型推断
const posts = ref<Post[]>([])
const loading = ref(true)

// 获取帖子数据
async function fetchPosts() {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts')
    posts.value = response.data
  } catch (error) {
    console.error('Error fetching posts:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchPosts)
</script>

<template>
  <div class="posts-container p-4">
    <h1 class="mb-4">Posts</h1>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-5">
      <BSpinner variant="primary" label="Loading..."></BSpinner>
    </div>

    <!-- 帖子列表 -->
    <div v-else class="posts-grid">
      <BCard
        v-for="post in posts"
        :key="post.id"
        class="mb-4 post-card"
        :title="post.title"
      >
        <BCard-text>
          {{ post.body }}
        </BCard-text>
        <template #footer>
          <small class="text-muted">Post ID: {{ post.id }}</small>
        </template>
      </BCard>
    </div>
  </div>
</template>

<style scoped>
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.post-card {
  height: 100%;
  transition: transform 0.2s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>