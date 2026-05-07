import { computed, type Ref } from "vue";
import type { BusRoute } from "../types/bus_route";

export function useRouteBadges(routes: Ref<BusRoute[]>) {
  const cheapestPrice = computed(() => (routes.value.length ? Math.min(...routes.value.map((r) => r.price)) : 0));

  const cheapestRoute = computed(() => routes.value.filter((r) => r.price === cheapestPrice.value).sort((a, b) => a.time.localeCompare(b.time))[0] ?? null);

  const nextRoute = computed(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return (
      routes.value
        .map((r) => {
          const [h, m] = r.time.split(":").map(Number);
          return { ...r, minutes: h * 60 + m };
        })
        .filter((r) => r.minutes >= nowMinutes)
        .sort((a, b) => a.minutes - b.minutes)[0] ?? null
    );
  });

  const cheapestReturnPrice = computed(() => (routes.value.some((r) => r.returnPrice > 0) ? Math.min(...routes.value.filter((r) => r.returnPrice > 0).map((r) => r.returnPrice)) : 0));

  const cheapestReturnNext = computed(() => {
    if (!cheapestReturnPrice.value) return null;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const candidates = routes.value
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
    const same = (a: BusRoute | null, b: BusRoute) => {
      if (!a) return false;
      return a.time === b.time && a.carrier === b.carrier && a.destination === b.destination && a.price === b.price && a.returnPrice === b.returnPrice;
    };

    if (same(cheapestReturnNext.value, r)) return "recommended";
    if (same(nextRoute.value, r)) return "next";
    if (same(cheapestRoute.value, r)) return "cheapest";
    return null;
  }

  return { cheapestRoute, nextRoute, cheapestReturnNext, getBadge };
}
