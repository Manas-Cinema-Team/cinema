<script setup lang="ts">
import MovieCard from '@/components/MovieCard.vue'
import { movies } from '@/data/cinema'
import { t } from '@/stores/i18n'
</script>

<template>
  <section class="stage" style="min-height: 100vh; padding-top: 96px">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p class="eyebrow mb-2">{{ t('afisha.eyebrow') }}</p>
      <h1 class="display page-title">
        {{ t('afisha.title') }}
      </h1>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        <MovieCard v-for="m in movies" :key="m.id" :movie="m" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-title {
  color: var(--text);
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 2rem;
}
</style>
