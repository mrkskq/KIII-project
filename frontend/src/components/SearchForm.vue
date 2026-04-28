<template>
  <div :class="compact 
    ? 'flex items-center gap-2 bg-white border rounded-xl shadow p-2 w-full' 
    : 'bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl'">
    
    <!-- Од -->
    <div :class="compact ? 'flex-1' : 'mb-4'">
      <div>
        <label v-if="!compact" class="text-sm font-semibold text-gray-500 uppercase">Од</label>
        <input type="text" value="СКОПЈЕ" disabled
          :class="compact 
            ? 'w-full border rounded-lg p-2 bg-gray-100 text-gray-500 text-sm'
            : 'w-full border rounded-lg p-3 mt-1 bg-gray-100 text-gray-500 cursor-not-allowed'" />
      </div>
    </div>

    <span v-if="compact" class="text-gray-400">⇄</span>

    <!-- До -->
    <!-- До -->
<div :class="compact ? 'flex-1' : 'mb-4'" class="relative">
  <label v-if="!compact" class="text-sm font-semibold text-gray-500 uppercase">До</label>
  <input 
    v-model="destination" 
    type="text" 
    placeholder="пр. ОХРИД"
    @focus="showDropdown = true; isTyping = false"
    @input="isTyping = true"
    :class="compact 
      ? 'w-full border rounded-lg p-2 text-sm'
      : 'w-full border rounded-lg p-3 mt-1'" />
  
  <ul v-if="showDropdown" class="absolute z-50 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
    <li 
      v-for="d in filteredDestinations" 
      :key="d"
      @mousedown="destination = d; showDropdown = false"
      class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm">
      {{ d }}
    </li>
  </ul>
</div>

    <!-- Датум -->
    <div :class="compact ? 'flex-1' : 'mb-4'">
      <label v-if="!compact" class="text-sm font-semibold text-gray-500 uppercase">Датум:</label>
     <input v-model="date" type="date"
  :min="TODAY"
  :class="compact ? 'w-full border rounded-lg p-2 text-sm' : 'w-full border rounded-lg p-3 mt-1'" />
    </div>

    <!-- Патници -->
    <div v-if="!compact" class="mb-6">
      <label class="text-sm font-semibold text-gray-500 uppercase">Број на патници:</label>
      <select v-model="passengers" class="w-full border rounded-lg p-3 mt-1">
        <option v-for="n in 9" :key="n" :value="n">{{ n }}</option>
      </select>
    </div>

    <!-- Search Button -->
    <button @click="search"
      :class="compact 
        ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl text-sm whitespace-nowrap'
        : 'w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg'">
      Пребарај
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useBusRouteStore } from "../stores/bus_routes.ts";
import { useRoute } from "vue-router";
const showDropdown = ref(false);

const isTyping = ref(false);

const filteredDestinations = computed(() => {
  if (!isTyping.value || !destination.value) return sortedDestinations.value;
  return sortedDestinations.value.filter(d => 
    d.toLowerCase().includes(destination.value.toLowerCase())
  );
});
const props = defineProps({
  compact: { type: Boolean, default: false }
});

const route = useRoute();

const router = useRouter();
const store = useBusRouteStore();

const destination = ref(String(route.query.to || ""));
const date = ref(String(route.query.date || new Date().toISOString().split("T")[0]));
watch(() => route.query.date as string, (newDate) => {
  if (newDate) date.value = newDate;
});
watch(() => route.query.to as string, (newTo) => {
  if (newTo) destination.value = newTo;
});
const passengers = ref(1);

const sortedDestinations = computed(() => {
  return [...store.destinations].sort((a, b) => a.localeCompare(b));
});
const now = new Date();
const TODAY = now.getFullYear() + "-" + 
  String(now.getMonth() + 1).padStart(2, "0") + "-" + 
  String(now.getDate()).padStart(2, "0");


onMounted(() => store.fetchDestinations());

function search() {
  store.search(destination.value);
  router.push({
    path: "/results",
    query: {
      to: destination.value,
      date: date.value,
      p: passengers.value,
    },
  });
}


</script>