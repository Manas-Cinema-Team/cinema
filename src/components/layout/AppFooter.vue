<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer
    style="
      background: #08080e;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      margin-top: auto;
    "
  >
    <div
      class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3"
    >
      <div class="flex items-center gap-2">
        <span class="display" style="font-size: 1rem; letter-spacing: 0.14em">
          <span style="color: #f59e0b">CINE</span><span style="color: #f5f5f5">MA</span>
        </span>
        <span style="color: #52525b; font-size: 0.8rem">· 2026</span>
      </div>

      <nav class="flex items-center gap-5">
        <RouterLink to="/" class="footer-link">Главная</RouterLink>
        <RouterLink to="/movies" class="footer-link">Афиша</RouterLink>
        <RouterLink to="/schedule" class="footer-link">Расписание</RouterLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.footer-link {
  color: #71717a;
  font-size: 0.8rem;
  transition: color 180ms ease;
}
.footer-link:hover { color: #f59e0b; }
</style>
