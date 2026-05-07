<template>
  <div class="flex items-center gap-2 bg-white border-b px-4 py-3">
    <button @click="slide(-1)" class="text-gray-400 hover:text-blue-600 text-xl font-bold px-2">←</button>

    <div class="flex gap-2 flex-1 justify-center">
      <button
        v-for="(d, i) in visibleDates"
        :key="d"
        @click="selectDate(d, i)"
        :disabled="d < TODAY"
        :class="[
          'flex flex-col items-center px-4 py-2 rounded-xl border text-sm transition-all min-w-[90px]',
          d === selectedDate
            ? 'bg-blue-50 text-blue-700 border-blue-400 font-bold'
            : d < TODAY
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200'
              : 'bg-white text-gray-600 hover:border-blue-400',
        ]"
      >
        <span>{{ formatDate(d) }}</span>
      </button>
    </div>

    <button @click="slide(1)" class="text-gray-400 hover:text-blue-600 text-xl font-bold px-2">→</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useBusRouteStore } from "../stores/bus_routes.ts";
import { getTodayStr } from "../utils/date";

const router = useRouter();
const route = useRoute();
const store = useBusRouteStore();

const VISIBLE = 5;
const TODAY = getTodayStr();

const selectedDate = ref(String(route.query.date || TODAY));
const startOffset = ref(0);
function addDays(base: string, n: number): string {
  const [year, month, day] = base.split("-").map(Number);
  const d = new Date(year, month - 1, day + n);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

const windowStart = computed(() => {
  const candidate = addDays(selectedDate.value, startOffset.value);
  return candidate < TODAY ? TODAY : candidate;
});
const visibleDates = computed(() => {
  return Array.from({ length: VISIBLE }, (_, i) => addDays(windowStart.value, i));
});

function slide(dir: number) {
  const newOffset = startOffset.value + dir * 1;
  const candidate = addDays(selectedDate.value, newOffset);
  if (candidate < TODAY) return;
  startOffset.value = newOffset;
}

function selectDate(dateStr: string, index: number) {
  if (dateStr < TODAY) return;

  if (index === VISIBLE - 1) startOffset.value += 2;
  else if (index === 0) {
    const candidate = addDays(windowStart.value, -2);
    startOffset.value = candidate < TODAY ? 0 : startOffset.value - 2;
  }

  selectedDate.value = dateStr;
  router.push({
    path: "/results",
    query: { ...route.query, date: dateStr },
  });
  store.search(String(route.query.to || ""));
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("mk-MK", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
</script>
