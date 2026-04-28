<template>
  <div 
    class="min-h-screen flex flex-col items-center justify-center p-6"
  style="background-image: url('./public/avtobuskaskopje.gif'); background-size: cover; background-position: center; background-repeat: no-repeat;">  
    
    <div class="absolute inset-0 bg-blue-900/50"></div>
    
    <div class="relative z-10 flex flex-col items-center">
      <h1 class="text-white text-4xl font-bold mb-2 text-center">OMIO Clone – Апликација за меѓуградски превоз</h1>
      <p class="text-blue-200 mb-8 text-lg">Види ги автобуските линии низ цела Македонија</p>
      <SearchForm />
    </div>
  </div>
  <AiChatWidget />
</template>

<script setup lang="ts">
import SearchForm from "../components/SearchForm.vue";
import AiChatWidget from "../components/AiChatWidget.vue";
</script>