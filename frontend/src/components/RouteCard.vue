<template>
  <div class="bg-white rounded-xl shadow-sm border p-5 mb-3 flex items-center justify-between hover:shadow-md transition">
    <div>
      <p class="text-2xl font-bold text-blue-700">{{ r.time }}</p>
      <p class="text-gray-700 font-semibold mt-1">СКОПЈЕ → {{ r.destination }}</p>
      <p class="text-sm text-gray-400 mt-1">{{ r.carrier }}</p>
    </div>

    <div class="text-right">
      <p class="text-2xl font-bold text-gray-800">{{ (r.price * passengers).toLocaleString() }} ден.</p>

      <p v-if="r.returnPrice > 0" class="text-md text-green-600">
        Повратна карта:
        <span class="font-bold">{{ r.returnPrice.toLocaleString() }} ден.</span>
      </p>

      <button class="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold">Одбери</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  r: any;
  passengers: number;
}>();
</script>
