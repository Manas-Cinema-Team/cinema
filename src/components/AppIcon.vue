<script setup lang="ts">
defineProps<{
  name: string
  size?: number | string
  stroke?: number | string
  fill?: string
}>()
</script>

<template>
  <svg
    :width="size ?? 18"
    :height="size ?? 18"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="fill ?? 'currentColor'"
    :stroke-width="stroke ?? 2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- film -->
    <template v-if="name === 'film'">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 3v18M17 3v18M3 7.5h4M3 12h4M3 16.5h4M17 7.5h4M17 12h4M17 16.5h4" />
    </template>
    <!-- ticket -->
    <template v-else-if="name === 'ticket'">
      <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v1a2 2 0 0 0 0 4v1a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-1a2 2 0 0 0 0-4Z" />
      <path d="M13 5v14" stroke-dasharray="2 2" />
    </template>
    <!-- play -->
    <template v-else-if="name === 'play'">
      <polygon points="6 3 20 12 6 21 6 3" :fill="fill ?? 'currentColor'" />
    </template>
    <!-- star -->
    <template v-else-if="name === 'star'">
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        :fill="fill ?? 'none'"
      />
    </template>
    <!-- clock -->
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </template>
    <!-- calendar -->
    <template v-else-if="name === 'calendar'">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </template>
    <!-- chevron-left -->
    <template v-else-if="name === 'chevron-left'">
      <path d="M15 6l-6 6 6 6" />
    </template>
    <!-- chevron-right -->
    <template v-else-if="name === 'chevron-right'">
      <path d="M9 6l6 6-6 6" />
    </template>
    <!-- arrow-left -->
    <template v-else-if="name === 'arrow-left'">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </template>
    <!-- arrow-right -->
    <template v-else-if="name === 'arrow-right'">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </template>
    <!-- user -->
    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </template>
    <!-- mail -->
    <template v-else-if="name === 'mail'">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 7 9-7" />
    </template>
    <!-- lock -->
    <template v-else-if="name === 'lock'">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </template>
    <!-- info -->
    <template v-else-if="name === 'info'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7h.01" />
    </template>
    <!-- shield -->
    <template v-else-if="name === 'shield'">
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3Z" />
    </template>
    <!-- credit-card -->
    <template v-else-if="name === 'credit-card'">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </template>
    <!-- smartphone -->
    <template v-else-if="name === 'smartphone'">
      <rect x="8" y="2.5" width="8" height="19" rx="2" />
      <path d="M11 18.5h2" />
    </template>
    <!-- printer -->
    <template v-else-if="name === 'printer'">
      <path d="M7 8V3h10v5" />
      <rect x="5" y="12" width="14" height="8" rx="2" />
      <rect x="4" y="8" width="16" height="6" rx="2" />
    </template>
    <!-- trash -->
    <template v-else-if="name === 'trash-2'">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </template>
    <!-- logout -->
    <template v-else-if="name === 'log-out'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </template>
    <!-- eye -->
    <template v-else-if="name === 'eye'">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </template>
    <!-- eye-off -->
    <template v-else-if="name === 'eye-off'">
      <path d="M9.88 4.24A10.38 10.38 0 0 1 12 4c6.5 0 10 7 10 7a17.68 17.68 0 0 1-3.12 4.18M6.12 6.12A17.57 17.57 0 0 0 2 12s3.5 7 10 7a10.35 10.35 0 0 0 5-1.27" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
    </template>
    <!-- check -->
    <template v-else-if="name === 'check'">
      <path d="M5 12l5 5L20 7" />
    </template>
    <!-- check-circle -->
    <template v-else-if="name === 'check-circle'">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-6" />
    </template>
    <!-- menu -->
    <template v-else-if="name === 'menu'">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </template>
    <!-- close -->
    <template v-else-if="name === 'close'">
      <path d="M6 6l12 12M6 18L18 6" />
    </template>
    <!-- trending -->
    <template v-else-if="name === 'trending-up'">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </template>
    <!-- popcorn -->
    <template v-else-if="name === 'popcorn'">
      <path d="M7 9h10l-1 12H8L7 9Z" />
      <path d="M7 9a2.5 2.5 0 0 1 0-5c0-1.5 2-2 3-1 .5-1.5 3-1.5 3.5 0 1-1 3-.5 3 1a2.5 2.5 0 0 1 0 5" />
    </template>
    <!-- download -->
    <template v-else-if="name === 'download'">
      <path d="M12 3v12M6 11l6 6 6-6M4 21h16" />
    </template>
    <!-- home -->
    <template v-else-if="name === 'home'">
      <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2V10Z" />
    </template>
    <!-- map-pin -->
    <template v-else-if="name === 'map-pin'">
      <path d="M12 22s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </template>
    <!-- users -->
    <template v-else-if="name === 'users'">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M22 21a5 5 0 0 0-5-5" />
    </template>
    <!-- loader -->
    <template v-else-if="name === 'loader'">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </template>
    <!-- instagram -->
    <template v-else-if="name === 'instagram'">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </template>
    <!-- twitter -->
    <template v-else-if="name === 'twitter'">
      <path d="M22 5.8a8.2 8.2 0 0 1-2.36.65 4.1 4.1 0 0 0 1.8-2.27 8.2 8.2 0 0 1-2.6 1A4.1 4.1 0 0 0 11.8 9.5 11.7 11.7 0 0 1 3 4.8a4.1 4.1 0 0 0 1.27 5.47A4 4 0 0 1 2.4 9.7v.05a4.1 4.1 0 0 0 3.29 4.02 4 4 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.3a11.6 11.6 0 0 0 6.29 1.84c7.55 0 11.68-6.26 11.68-11.68v-.53A8.3 8.3 0 0 0 22 5.8Z" />
    </template>
    <!-- youtube -->
    <template v-else-if="name === 'youtube'">
      <path d="M22.5 7s-.2-1.5-.85-2.15C20.8 4 19.9 4 19.5 4 16.7 3.8 12 3.8 12 3.8s-4.7 0-7.5.2c-.4 0-1.3 0-2.15.85C1.7 5.5 1.5 7 1.5 7S1.3 8.8 1.3 10.5v1c0 1.7.2 3.5.2 3.5s.2 1.5.85 2.15C3.2 18 4.3 18 4.8 18.1c1.7.15 7.2.2 7.2.2s4.7 0 7.5-.2c.4 0 1.3 0 2.15-.85C22.3 16.5 22.5 15 22.5 15s.2-1.8.2-3.5v-1c0-1.7-.2-3.5-.2-3.5Z" />
      <path d="M10 8.5v5l4.5-2.5L10 8.5Z" fill="currentColor" stroke="none" />
    </template>
    <!-- facebook -->
    <template v-else-if="name === 'facebook'">
      <path d="M13 22v-8h3l.5-4H13V7.5c0-1 .3-1.7 1.7-1.7H17V2.1A24 24 0 0 0 14.3 2C11.7 2 10 3.6 10 6.6V10H7v4h3v8h3Z" />
    </template>
    <!-- sun -->
    <template v-else-if="name === 'sun'">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </template>
    <!-- moon -->
    <template v-else-if="name === 'moon'">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </template>
  </svg>
</template>
