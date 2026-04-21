<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { t } from '@/stores/i18n'

const router = useRouter()
</script>

<template>
  <section class="stage flex items-center justify-center" style="min-height: 100vh; padding: 96px 1rem">
    <div class="text-center max-w-md">
      <h1 class="display not-found__code">
        4<span class="not-found__zero">0</span>4
      </h1>

      <p class="not-found__text">
        {{ t('notfound.text') }}
      </p>

      <div class="flex gap-3 justify-center">
        <RouterLink to="/" class="btn-amber">
          <AppIcon name="home" :size="16" />
          {{ t('common.home') }}
        </RouterLink>
        <button class="btn-ghost" type="button" @click="router.back()">
          <AppIcon name="chevron-left" :size="16" />
          {{ t('common.back') }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.not-found__code {
  color: var(--text);
  font-size: clamp(4.5rem, 14vw, 9rem);
  line-height: 1;
  letter-spacing: 0.04em;
}
.not-found__zero { color: var(--amber); }
.not-found__text {
  margin-top: 1rem;
  margin-bottom: 2rem;
  color: var(--text-dim);
  font-size: 1rem;
  line-height: 1.6;
}
</style>
