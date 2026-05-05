<template>
  <div
    class="min-h-screen"
    style="background-image: url('./public/avtobuskaskopje.gif'); background-size: cover; background-position: center; background-repeat: no-repeat; background-attachment: fixed"
  >
    <div class="fixed inset-0 bg-blue-900/50 pointer-events-none z-0"></div>

    <!-- Header -->
    <div class="sticky top-0 z-50 bg-blue-700 text-white p-4 flex items-center gap-4">
      <RouterLink to="/" class="text-blue-200 hover:text-white">← Назад</RouterLink>
      <span class="font-bold text-lg mx-auto">СКОПЈЕ → {{ route.query.to }}</span>
      <span class="text-blue-200">{{ route.query.date }}</span>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto p-4">
      <!-- Search bar -->
      <div class="bg-white rounded-t-xl border-b shadow-sm p-4">
        <SearchForm :compact="true" />
        <DateSlider />
      </div>
      <p class="bg-blue-200 text-blue-800 font-bold mb-4 mt-0 text-center py-2 px-4 rounded-b-xl">
        {{ routesFoundText }}
      </p>

      <div v-if="store.loading" class="text-center py-12 text-white">Се вчитуваат автобуските линии...</div>
      <div v-else-if="store.error" class="text-red-600 text-center py-12">{{ store.error }}</div>

      <!-- Split layout -->
      <div v-else class="flex gap-4 items-start">

        <!-- Лево: листа на линии -->
        <div class="flex-1 min-w-0 overflow-y-auto max-h-[calc(100vh-260px)]">
          <RouteCard
            v-for="(r, i) in store.routes"
            :key="i"
            :r="r"
            :passengers="passengers"
            :selected="selectedRoute?.destination === r.destination && selectedRoute?.time === r.time"
            @select="selectedRoute = r; selectedDestination = r.destination"
          />
        </div>

        <!-- Десно: статична карта -->
        <!-- Десно: статична карта -->
<div style="width: 440px; flex-shrink: 0; position: sticky; top: 88px; height: calc(100vh - 120px);">
  <RouteMap
    v-if="selectedDestination"
    :destination="selectedDestination"
  />
</div>

      </div>
    </div>
  </div>
  <AiChatWidget />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBusRouteStore } from '../stores/bus_routes'
import type { BusRoute } from '../types/bus_route'
import RouteCard from '../components/RouteCard.vue'
import RouteMap from '../components/RouteMap.vue'
import SearchForm from '../components/SearchForm.vue'
import DateSlider from '../components/DateSlider.vue'
import AiChatWidget from '../components/AiChatWidget.vue'

const route = useRoute()
const store = useBusRouteStore()

const passengers = computed(() => Number(route.query.p) || 1)
const selectedRoute = ref<BusRoute | null>(null)
const selectedDestination = ref<string>('')

const routesFoundText = computed(() => {
  const count = store.routes.length
  if (count === 0) return 'Нема автобуски линии'
  if (count === 1) return '1 автобуска линија пронајдена'
  return `${count} автобуски линии пронајдени`
})

onMounted(() => {
  store.search(String(route.query.to || ''), String(route.query.carrier || ''))
})

watch(() => store.routes, (newRoutes) => {
  if (newRoutes.length > 0) {
    selectedRoute.value = newRoutes[0]
    selectedDestination.value = newRoutes[0].destination
  }
})

watch(
  () => [route.query.to, route.query.carrier],
  ([newTo, newCarrier]) => {
    store.search(String(newTo || ''), String(newCarrier || ''))
  }
)
</script>