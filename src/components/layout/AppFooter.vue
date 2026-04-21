<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { t } from '@/stores/i18n'
</script>

<template>
  <footer class="app-footer">
    <div
      class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3"
    >
      <div class="flex items-center gap-2">
        <span class="display footer-brand">
          <span class="footer-brand__accent">CINE</span><span class="footer-brand__plain">MA</span>
        </span>
        <span class="footer-year">· 2026</span>
      </div>

      <nav class="flex items-center gap-5">
        <RouterLink to="/" class="footer-link">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/movies" class="footer-link">{{ t('nav.afisha') }}</RouterLink>
        <RouterLink to="/schedule" class="footer-link">{{ t('nav.schedule') }}</RouterLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--bg);
  border-top: 1px solid var(--line);
  margin-top: auto;
}

.footer-brand {
  font-size: 1rem;
  letter-spacing: 0.14em;
}
.footer-brand__accent { color: var(--amber); }
.footer-brand__plain { color: var(--text); }
.footer-year { color: var(--text-fade); font-size: 0.8rem; }

.footer-link {
  color: var(--text-dim);
  font-size: 0.8rem;
  transition: color 180ms ease;
}
.footer-link:hover { color: var(--amber); }
</style>
