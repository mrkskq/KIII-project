<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-700 to-blue-900 flex flex-col items-center justify-center p-6">
    <h1 class="text-white text-4xl font-bold mb-2">OMIO Clone – Апликација за меѓуградски превоз</h1>
    <p class="text-blue-200 mb-8 text-lg">Види ги автобуските линии низ цела Македонија</p>
    <SearchForm />
  </div>
   <AiChatWidget />
</template>

<script setup lang="ts">
import SearchForm from "../components/SearchForm.vue";
import AiChatWidget from "../components/AiChatWidget.vue";
</script>
