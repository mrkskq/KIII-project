import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import type { BusRoute } from "../types/bus_route.ts";

const API = "http://localhost:3001/api";

export const useBusRouteStore = defineStore("bus_routes", () => {
  const routes = ref<BusRoute[]>([]);
  const destinations = ref<string[]>([]);
  const carriers = ref<string[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchDestinations() {
    const { data } = await axios.get<string[]>(`${API}/destinations`);
    destinations.value = data;
  }

  async function search(to: string, carrier?: string) {
    loading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams();
      if (to) params.set("to", to);
      if (carrier) params.set("carrier", carrier);
      const { data } = await axios.get(`${API}/routes?${params.toString()}`);
      routes.value = data.routes;
      console.log("API response:", data);
      console.log("params:", params.toString());
    } catch (e) {
      error.value = "Could not load routes. Is the API running?";
    } finally {
      loading.value = false;
    }
  }

  return { routes, destinations, carriers, loading, error, fetchDestinations, search };
});
