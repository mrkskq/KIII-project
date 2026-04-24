<template>
  <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="text-sm font-semibold text-gray-500 uppercase">Од</label>
        <input type="text" value="СКОПЈЕ" disabled class="w-full border rounded-lg p-3 mt-1 bg-gray-100 text-gray-500 cursor-not-allowed" />
      </div>

      <div>
        <label class="text-sm font-semibold text-gray-500 uppercase">До</label>
        <input v-model="destination" type="text" placeholder="пр. ОХРИД" list="destinations-list" class="w-full border rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />

        <datalist id="destinations-list">
          <option v-for="d in sortedDestinations" :key="d" :value="d" />
        </datalist>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label class="text-sm font-semibold text-gray-500 uppercase">Датум:</label>
        <input v-model="date" type="date" class="w-full border rounded-lg p-3 mt-1" />
      </div>

      <div>
        <label class="text-sm font-semibold text-gray-500 uppercase">Број на патници:</label>
        <select v-model="passengers" class="w-full border rounded-lg p-3 mt-1">
          <option v-for="n in 9" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>
    </div>

    <button @click="search" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg">Пребарај</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useBusRouteStore } from "../stores/bus_routes.ts";

const router = useRouter();
const store = useBusRouteStore();

const destination = ref("");
const date = ref(new Date().toISOString().split("T")[0]);
const passengers = ref(1);

const sortedDestinations = computed(() => {
  return [...store.destinations].sort((a, b) => a.localeCompare(b));
});

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
