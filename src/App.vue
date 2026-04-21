<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import '@/stores/i18n'
import '@/stores/theme'

const route = useRoute()
const hideFooter = computed(() => route.name === 'booking-success' || route.name === 'not-found')
</script>

<template>
  <div class="min-h-screen flex flex-col app-shell">
    <AppHeader />
    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <transition name="route-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
    <AppFooter v-if="!hideFooter" />
  </div>
</template>

<style scoped>
.app-shell {
  background: var(--bg);
  color: var(--text);
}
</style>
