<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { formatDuration, type Movie } from '@/data/cinema'

const props = defineProps<{
  movie: Movie
}>()

const router = useRouter()
const open = () => router.push(`/movies/${props.movie.id}`)

const posterFailed = ref(false)
</script>

<template>
  <article
    class="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-brand"
    @click="open"
  >
    <div class="relative aspect-[2/3] overflow-hidden bg-panel-2">
      <div
        v-if="posterFailed"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-[radial-gradient(ellipse_at_50%_30%,rgba(245,158,11,0.18),transparent_60%),var(--bg-elev-2)] p-4 text-center"
      >
        <div class="absolute inset-0 bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:28px_28px] opacity-60" />
        <AppIcon name="film" :size="36" fill="rgba(245,158,11,0.45)" />
        <span class="display text-[1.1rem] tracking-[0.06em] text-copy">
          {{ movie.title }}
        </span>
      </div>
      <img
        v-else
        :src="movie.posterUrl"
        :alt="movie.title"
        loading="lazy"
        class="block h-full w-full object-cover"
        @error="posterFailed = true"
      />
      <span class="absolute right-2 top-2 rounded border border-line bg-black/35 px-2 py-0.5 text-[0.7rem] font-semibold text-copy backdrop-blur-sm">
        {{ movie.ageRating }}
      </span>
    </div>

    <div class="px-4 pb-4 pt-3.5">
      <h3 class="mb-1.5 truncate text-[0.95rem] font-semibold text-copy">{{ movie.title }}</h3>
      <div class="flex items-center gap-1.5 text-[0.78rem] text-dim">
        <AppIcon name="clock" :size="12" />
        <span>{{ formatDuration(movie.duration) }}</span>
        <span class="text-line-strong">·</span>
        <span>{{ movie.genre[0] || '—' }}</span>
      </div>
    </div>
  </article>
</template>
