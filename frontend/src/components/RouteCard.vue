<template>
  <div class="rounded-xl border border-gray-200 mb-3 overflow-hidden hover:shadow-md transition bg-white">
    <div class="flex items-center gap-4 px-5 py-4">
      <div class="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" :style="{ backgroundColor: getCarrierColor(r.carrier) }">
        {{ getCarrierInitials(r.carrier) }}
      </div>

      <div class="flex flex-1 items-center gap-3">
        <div class="flex flex-col">
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

        <div class="flex flex-col">
          <span class="text-xl font-bold text-gray-900 leading-tight">{{ r.destination }}</span>
          <span class="text-xs text-gray-400 mt-0.5">Автобуска Станица</span>
        </div>
      </div>

      <div class="text-right flex-shrink-0 ml-4">
        <p class="text-2xl font-bold text-gray-900">{{ (r.price * passengers).toLocaleString() }} ден.</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ passengers }} {{ passengers > 1 ? "патници" : "патник" }} · Еднонасочна</p>
        <p v-if="r.returnPrice > 0" class="text-xl text-green-600 mt-0.5 font-medium">{{ r.returnPrice.toLocaleString() }} ден.</p>
        <p v-if="r.returnPrice > 0" class="text-xs text-green-700 bg-green-50 rounded px-1.5 py-0.5 mt-0.5 block font-medium">
          Заштеди {{ Math.round((1 - r.returnPrice / (r.price * 2)) * 100) }}% со повратна
        </p>
        <button class="mt-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-1.5 rounded-lg text-sm font-semibold transition">Одбери</button>
      </div>
    </div>

    <div class="border-t border-gray-100 px-5 py-2 flex items-center gap-2">
      <div class="w-5 h-5 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0" :style="{ backgroundColor: getCarrierColor(r.carrier), fontSize: '9px' }">
        {{ getCarrierInitials(r.carrier) }}
      </div>
      <span class="text-xs text-gray-400">{{ r.carrier }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCarrierInitials, getCarrierColor } from "../utils/carrierImage";

defineProps<{
  r: any;
  passengers: number;
}>();
</script>
