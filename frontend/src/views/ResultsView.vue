<template>
  <div
    class="min-h-screen"
    style="background-image: url(&quot;./public/avtobuskaskopje.gif&quot;); background-size: cover; background-position: center; background-repeat: no-repeat; background-attachment: fixed"
  >
    <div class="fixed inset-0 bg-blue-900/50 pointer-events-none z-0"></div>

    <!-- Header -->
    <div class="sticky top-0 z-50 bg-blue-700 text-white px-4 py-3 flex items-center">
      <RouterLink to="/" class="text-blue-200 hover:text-white"> ← Назад </RouterLink>
      <div class="flex items-center mx-auto">
        <!-- <div class="px-4 py-1.5 rounded-l-full bg-white/10 text-blue-100 text-md font-bold backdrop-blur-md shadow-sm">🚏 Busly</div> -->
        <div class="px-4 py-1.5 rounded-l-full bg-white/10 text-blue-100 text-md font-bold backdrop-blur-md shadow-sm flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-100 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM19 11H5V6h14v5z"
            />
          </svg>

          Busly
        </div>
        <div class="px-4 py-1.5 rounded-r-full bg-white/20 text-white text-md font-semibold backdrop-blur-md shadow-sm border-l border-white/10">СКОПЈЕ → {{ route.query.to }}</div>
      </div>
      <div class="text-blue-200 text-sm font-medium">
        {{ route.query.date }}
      </div>
    </div>

    <div class="relative z-10 max-w-7xl ml-11 mt-4 p-4">
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
        <div class="flex-1 min-w-0 overflow-y-auto max-h-[calc(100vh-323px)]">
          <RouteCard
            v-for="(r, i) in store.routes"
            :key="i"
            :r="r"
            :passengers="passengers"
            :badge="getBadge(r)"
            :selected="selectedRoute?.destination === r.destination && selectedRoute?.time === r.time"
            @select="
              selectedRoute = r;
              selectedDestination = r.destination;
            "
          />
        </div>

        <div style="width: 440px; flex-shrink: 0; position: sticky; top: 88px" class="self-stretch">
          <RouteMap v-if="selectedDestination" :destination="selectedDestination" class="h-full" />
        </div>
      </div>
    </div>
  </div>
  <AiChatWidget :defaultOpen="true" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useBusRouteStore } from "../stores/bus_routes";
import { useRouteBadges } from "../composables/useRouteBadges";
import type { BusRoute } from "../types/bus_route";
import RouteCard from "../components/RouteCard.vue";
import RouteMap from "../components/RouteMap.vue";
import SearchForm from "../components/SearchForm.vue";
import DateSlider from "../components/DateSlider.vue";
import AiChatWidget from "../components/AiChatWidget.vue";

const route = useRoute();
const store = useBusRouteStore();

const passengers = computed(() => Number(route.query.p) || 1);

const selectedRoute = ref<BusRoute | null>(null);
const selectedDestination = ref<string>("");

const { getBadge } = useRouteBadges(computed(() => store.routes));

const routesFoundText = computed(() => {
  const count = store.routes.length;
  if (count === 0) return "Нема автобуски линии";
  if (count === 1) return "1 автобуска линија пронајдена";
  return `${count} автобуски линии пронајдени`;
});

onMounted(() => {
  store.search(String(route.query.to || ""), String(route.query.carrier || ""));
});

watch(
  () => store.routes,
  (newRoutes) => {
    if (newRoutes.length > 0) {
      selectedRoute.value = newRoutes[0];
      selectedDestination.value = newRoutes[0].destination;
    }
  },
);

watch(
  () => [route.query.to, route.query.carrier],
  ([newTo, newCarrier]) => {
    store.search(String(newTo || ""), String(newCarrier || ""));
  },
);
</script>
