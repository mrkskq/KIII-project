<template>
  <div
    @click="emit('select')"
    :class="['rounded-xl border mb-3 overflow-hidden transition bg-white cursor-pointer', selected ? 'border-blue-500 shadow-md ring-2 ring-blue-300' : 'border-gray-200 hover:shadow-md']"
  >
    <div
      v-if="badge"
      :class="[
        'text-xs font-bold px-4 py-1.5 flex items-center gap-1.5 shadow-sm',
        badge === 'next'
          ? 'bg-sky-300 text-sky-950 border-b border-sky-500'
          : badge === 'cheapest'
            ? 'bg-emerald-300 text-emerald-950 border-b border-emerald-500'
            : 'bg-amber-300 text-amber-950 border-b border-amber-500',
      ]"
    >
      <span v-if="badge === 'next'">{{ getNextLabel(r.time) }}</span>
      <span v-else-if="badge === 'cheapest'">💵 Најевтина · Во еден правец</span>
      <span v-else>⭐ Препорачано · Најевтина повратна</span>
    </div>

    <div class="flex items-center gap-5 px-5 py-5">
      <div class="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" :style="{ backgroundColor: getCarrierColor(r.carrier) }">
        {{ getCarrierInitials(r.carrier) }}
      </div>

      <div class="flex flex-1 items-center gap-3">
        <div class="flex flex-col items-center text-center">
          <span class="text-xl font-bold text-gray-900 leading-tight">СКОПЈЕ</span>
          <span class="text-xs text-gray-400 mt-0.5">Автобуска Станица</span>
        </div>

        <div class="flex-1 flex flex-col items-center gap-1">
          <div class="w-full flex items-center gap-1">
            <div class="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div class="flex-1 h-px bg-gray-300"></div>
            <svg class="w-6 h-6 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM19 11H5V6h14v5z"
              />
            </svg>
            <div class="flex-1 h-px bg-gray-300"></div>
            <div class="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"></div>
          </div>
        </div>

        <div class="flex flex-col items-center text-center">
          <span class="text-xl font-bold text-gray-900 leading-tight">{{ r.destination }}</span>
          <span class="text-xs text-gray-400 mt-0.5">Автобуска Станица</span>
        </div>
      </div>

      <div class="text-right flex flex-col justify-center flex-shrink-0 ml-4">
        <p class="text-2xl font-bold text-gray-900">{{ (r.price * passengers).toLocaleString() }} ден.</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ passengers }} {{ passengers > 1 ? "патници" : "патник" }} · Еднонасочна</p>
        <p v-if="r.returnPrice > 0" class="text-xl text-green-600 mt-0.5 font-medium">{{ r.returnPrice.toLocaleString() }} ден.</p>
        <p v-if="r.returnPrice > 0" class="text-xs text-green-700 bg-green-50 rounded px-1.5 py-0.5 mt-0.5 block font-medium">
          Заштеди {{ Math.round((1 - r.returnPrice / (r.price * 2)) * 100) }}% со повратна
        </p>
      </div>
    </div>

    <div class="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-5 h-5 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0" :style="{ backgroundColor: getCarrierColor(r.carrier), fontSize: '9px' }">
          {{ getCarrierInitials(r.carrier) }}
        </div>

        <span class="text-xs text-gray-500 font-medium">{{ r.carrier }}</span>

        <span class="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-300">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {{ r.time }}
        </span>
      </div>
      <button class="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-1.5 rounded-lg text-sm font-semibold transition">Одбери</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCarrierInitials, getCarrierColor } from "../utils/carrierImage";
import { ref } from "vue";
import RouteMap from "./RouteMap.vue";

defineProps<{ r: any; passengers: number; selected?: boolean; badge?: "next" | "cheapest" | "recommended" | null }>();
const emit = defineEmits<{ select: [] }>();

function getMinutesUntilDeparture(time: string) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const [h, m] = time.split(":").map(Number);
  const departureMinutes = h * 60 + m;

  return departureMinutes - nowMinutes;
}

function getNextLabel(time: string) {
  const diff = getMinutesUntilDeparture(time);

  if (diff <= 0) return "👋 Последниот автобус за денес тргна. Се гледаме утре!";
  if (diff === 1) return "🕒 Автобусот тргнува за 1 мин.";
  if (diff < 60) return `🕒 Автобусот тргнува за ${diff} мин.`;

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  if (hours > 0) {
    return mins > 0 ? `🕒 Автобусот тргнува за ${hours}ч. и ${mins}мин.` : `🕒 Автобусот тргнува за ${hours}ч.`;
  }

  return "🕒 Автобусот тргнува наскоро";
}
</script>
