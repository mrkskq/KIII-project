import type { BusRoute } from "../src/types/bus_route";

export function filterRoutes(query: any, data: BusRoute[]): BusRoute[] {
  return data
    .filter((r) => (query.to ? r.destination.toLowerCase().includes(String(query.to).toLowerCase()) : true))
    .filter((r) => (query.carrier ? r.carrier.toLowerCase().includes(String(query.carrier).toLowerCase()) : true))
    .filter((r) => (query.minPrice ? r.price >= Number(query.minPrice) : true))
    .filter((r) => (query.maxPrice ? r.price <= Number(query.maxPrice) : true));
}
