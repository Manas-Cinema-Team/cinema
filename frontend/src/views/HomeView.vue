<template>
  <section class="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
    <div class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur sm:p-10">
      <p class="text-sm font-medium uppercase tracking-[0.3em] text-amber-300">Cinema</p>
      <h1 class="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Frontend каркас для каталога фильмов и сериалов.
      </h1>
      <p class="mt-4 max-w-xl text-base leading-7 text-stone-300">
        Здесь уже есть базовый layout приложения, маршруты и чистая стартовая страница без
        шаблонного кода Vite/Vue.
      </p>

      <div class="mt-8 flex flex-wrap gap-3">
        <RouterLink
          to="/about"
          class="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-200"
        >
          О проекте
        </RouterLink>
        <a
          href="#stack"
          class="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
        >
          Что внутри
        </a>
      </div>
    </div>

    <aside class="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-8">
      <p class="text-sm uppercase tracking-[0.3em] text-amber-200">Status</p>
      <ul class="mt-6 space-y-4 text-sm text-stone-200">
        <li class="rounded-2xl border border-white/10 bg-black/10 p-4">Vue Router подключён.</li>
        <li class="rounded-2xl border border-white/10 bg-black/10 p-4">Tailwind v4 импортирован корректно.</li>
        <li class="rounded-2xl border border-white/10 bg-black/10 p-4">Header, main и footer вынесены в layout.</li>
      </ul>
    </aside>
  </section>

  <section id="stack" class="mt-8 grid gap-4 md:grid-cols-3">
    <article class="rounded-3xl border border-white/10 bg-stone-900/80 p-6">
      <h2 class="text-lg font-semibold text-white">Структура</h2>
      <p class="mt-3 text-sm leading-6 text-stone-300">
        Основной layout находится в `App.vue`, а отображение страниц строится через `RouterView`.
      </p>
    </article>

    <article class="rounded-3xl border border-white/10 bg-stone-900/80 p-6">
      <h2 class="text-lg font-semibold text-white">Компоненты</h2>
      <p class="mt-3 text-sm leading-6 text-stone-300">
        Header и footer вынесены в отдельные компоненты, чтобы дальше наращивать интерфейс без
        хаоса в корневом файле.
      </p>
    </article>

    <article class="rounded-3xl border border-white/10 bg-stone-900/80 p-6">
      <h2 class="text-lg font-semibold text-white">Стили</h2>
      <p class="mt-3 text-sm leading-6 text-stone-300">
        Tailwind можно дальше использовать без дополнительного шаблонного CSS от стартового проекта.
      </p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
