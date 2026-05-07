<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center p-6"
    style="background-image: url(&quot;./public/avtobuskaskopje.gif&quot;); background-size: cover; background-position: center; background-repeat: no-repeat"
  >
    <div class="absolute inset-0 bg-blue-900/50"></div>

    <div class="flex items-center gap-3 mb-6">
      <div class="flex flex-col leading-tight">
        <div class="mb-4 py-4 px-10 rounded-full bg-white/10 text-blue-100 text-3xl font-bold backdrop-blur">🚏Busly</div>
      </div>
    </div>

    <div class="relative z-10 flex flex-col items-center">
      <h1 class="text-white text-4xl font-bold mb-3 text-center leading-tight">Апликација за меѓуградски превоз</h1>
      <p class="text-blue-200 mb-8 text-lg text-center max-w-md">Спореди линии, цени и време на поаѓање низ Македонија и Европа – на едно место.</p>
      <SearchForm />
    </div>
  </div>
  <AiChatWidget />
</template>

<script setup lang="ts">
import SearchForm from "../components/SearchForm.vue";
import AiChatWidget from "../components/AiChatWidget.vue";
</script>
