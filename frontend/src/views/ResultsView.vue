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
        <div class="px-4 py-1.5 rounded-l-full bg-white/10 text-blue-100 text-md font-bold backdrop-blur-md shadow-sm">🚏 Busly</div>
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

const cheapestPrice = computed(() => (store.routes.length ? Math.min(...store.routes.map((r) => r.price)) : 0));

const cheapestRoute = computed(() => store.routes.filter((r) => r.price === cheapestPrice.value).sort((a, b) => a.time.localeCompare(b.time))[0] ?? null);

const nextRoute = computed(() => {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    store.routes
      .map((r) => {
        const [h, m] = r.time.split(":").map(Number);
        return { ...r, minutes: h * 60 + m };
      })
      .filter((r) => r.minutes >= nowMinutes)
      .sort((a, b) => a.minutes - b.minutes)[0] ?? null
  );
});

const cheapestReturnPrice = computed(() => (store.routes.some((r) => r.returnPrice > 0) ? Math.min(...store.routes.filter((r) => r.returnPrice > 0).map((r) => r.returnPrice)) : 0));

const cheapestReturnNext = computed(() => {
  if (!cheapestReturnPrice.value) return null;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const candidates = store.routes
    .filter((r) => r.returnPrice === cheapestReturnPrice.value)
    .map((r) => {
      const [h, m] = r.time.split(":").map(Number);
      return { ...r, minutes: h * 60 + m };
    })
    .filter((r) => r.minutes >= nowMinutes)
    .sort((a, b) => a.minutes - b.minutes);

  const next = nextRoute.value;
  const cheapest = cheapestRoute.value;

  return (
    candidates.find((r) => {
      const isNext = next && r.time === next.time && r.carrier === next.carrier && r.destination === next.destination;

      const isCheapest = cheapest && r.time === cheapest.time && r.carrier === cheapest.carrier && r.destination === cheapest.destination;

      return !isNext && !isCheapest;
    }) ??
    candidates[0] ??
    null
  );
});

function getBadge(r: BusRoute): "recommended" | "next" | "cheapest" | null {
  const recommended = cheapestReturnNext.value;
  const next = nextRoute.value;
  const cheapest = cheapestRoute.value;

  const same = (a: BusRoute | null, b: BusRoute) => {
    if (!a) return false;
    return a.time === b.time && a.carrier === b.carrier && a.destination === b.destination && a.price === b.price && a.returnPrice === b.returnPrice;
  };

  if (same(recommended, r)) return "recommended";
  if (same(next, r)) return "next";
  if (same(cheapest, r)) return "cheapest";

  return null;
}

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
