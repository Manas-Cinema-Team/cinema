<script setup lang="ts">
import { RouterView } from 'vue-router'

import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-stone-950 text-stone-100">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
      <AppHeader />

      <main class="flex-1 py-10">
        <RouterView />
      </main>

      <AppFooter />
    </div>
  </div>
</template>
