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
<<<<<<< Updated upstream
      <template v-if="badge === 'next'">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 15" />
        </svg>
        <span>{{ getNextLabel(r.time) }}</span>
      </template>

      <template v-else-if="badge === 'cheapest'">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
        </svg>
        <span>Најевтина · Во еден правец</span>
      </template>

      <template v-else>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="flex-shrink: 0">
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
        </svg>
        <span>Препорачано · Најевтина повратна</span>
      </template>
=======
      <span v-if="badge === 'next'" v-html="getNextLabel(r.time)"></span>
      <span v-else-if="badge === 'cheapest'"><i class="fa-solid fa-sack-dollar"></i> Најевтина · Во еден правец</span>
      <span v-else><i class="fa-solid fa-star"></i> Препорачано · Најевтина повратна</span>
>>>>>>> Stashed changes
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
      </div>
      <div class="flex flex-col items-end">
        <span class="text-l font-bold text-gray-900">{{ r.time }}</span>
        <span class="text-xs text-gray-400">поаѓање</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCarrierInitials, getCarrierColor } from "../utils/carrierImage";
import { ref } from "vue";
import { getNextLabel } from "../utils/time";

defineProps<{ r: any; passengers: number; selected?: boolean; badge?: "next" | "cheapest" | "recommended" | null }>();
const emit = defineEmits<{ select: [] }>();
</script>
