<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-blue-700 text-white p-4 flex items-center gap-4">
      <RouterLink to="/" class="text-blue-200 hover:text-white"> ← Назад </RouterLink>
      <span class="font-bold text-lg mx-auto"> СКОПЈЕ → {{ route.query.to }} </span>
      <span class="text-blue-200">{{ route.query.date }}</span>
    </div>

    <div class="max-w-4xl mx-auto p-6">
      <div v-if="store.loading" class="text-center py-12 text-gray-500">Се вчитуваат автобуските линии...</div>

      <div v-else-if="store.error" class="text-red-600 text-center py-12">
        {{ store.error }}
      </div>

      <div v-else>
        <p class="text-gray-500 mb-4">{{ routesFoundText }}</p>
        <RouteCard v-for="(r, i) in store.routes" :key="i" :r="r" :passengers="passengers" />
      </div>
    </div>
  </div>
  <AiChatWidget/>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import  AiChatWidget from "../components/AiChatWidget.vue"
import { useRoute } from "vue-router";
import { useBusRouteStore } from "../stores/bus_routes.ts";
import RouteCard from "../components/RouteCard.vue";

const route = useRoute();
const store = useBusRouteStore();

const passengers = computed(() => Number(route.query.p) || 1);

const routesFoundText = computed(() => {
  const count = store.routes.length;

  if (count === 0) return "Нема автобуски линии";
  if (count === 1) return "1 автобуска линија пронајдена";

  return `${count} автобуски линии пронајдени`;
});

onMounted(() => {
  store.search(String(route.query.to || ""));
});
</script>
