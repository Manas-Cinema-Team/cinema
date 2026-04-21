<script setup lang="ts">
import MovieCard from '@/components/MovieCard.vue'
import { movies } from '@/data/cinema'
</script>

<template>
  <section class="stage" style="min-height: 100vh; padding-top: 96px">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p class="eyebrow mb-2">Афиша</p>
      <h1
        class="display mb-8"
        style="color: #fff; font-size: clamp(2rem, 4vw, 3rem)"
      >
        Фильмы в прокате
      </h1>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        <MovieCard v-for="m in movies" :key="m.id" :movie="m" />
      </div>
    </div>
  </section>
</template>
