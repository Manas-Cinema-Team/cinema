<script setup lang="ts">
import { RouterLink } from 'vue-router'

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/about', label: 'О проекте' },
]
</script>

<template>
  <header class="sticky top-0 z-10 py-6">
    <div class="flex flex-col gap-4 rounded-3xl border border-white/10 bg-stone-950/70 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <RouterLink to="/" class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-300 text-sm font-bold text-stone-950">
          C
        </span>
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-amber-300">Cinema</p>
          <p class="text-sm text-stone-400">Vue 3 + Tailwind v4</p>
        </div>
      </RouterLink>

      <nav class="flex items-center gap-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="rounded-full px-4 py-2 text-sm font-medium text-stone-300 transition hover:bg-white/5 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
