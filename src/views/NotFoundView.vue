<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'

const router = useRouter()
</script>

<template>
  <section class="stage flex items-center justify-center" style="min-height: 100vh; padding: 96px 1rem">
    <div class="text-center max-w-md">
      <h1
        class="display"
        style="color: #fff; font-size: clamp(4.5rem, 14vw, 9rem); line-height: 1; letter-spacing: 0.04em"
      >
        4<span style="color: #f59e0b">0</span>4
      </h1>

      <p class="mt-4 mb-8" style="color: #a1a1aa; font-size: 1rem; line-height: 1.6">
        Страница не найдена.
      </p>

      <div class="flex gap-3 justify-center">
        <RouterLink to="/" class="btn-amber">
          <AppIcon name="home" :size="16" />
          На главную
        </RouterLink>
        <button class="btn-ghost" type="button" @click="router.back()">
          <AppIcon name="chevron-left" :size="16" />
          Назад
        </button>
      </div>
    </div>
  </section>
</template>
