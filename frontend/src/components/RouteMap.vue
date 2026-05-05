<template>
  <div style="position: relative; height: 100%; width: 100%;">
    <div ref="mapEl" style="height: 100%; width: 100%;" />
    <div
      v-if="loading"
      style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.7); font-size: 14px; color: #1d4ed8;"
    >
      Се вчитува рутата...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import { cityCoords } from '../utils/cityCoords'

const props = defineProps<{ destination: string }>()

const mapEl = ref<HTMLDivElement | null>(null)
const loading = ref(false)
let map: L.Map | null = null
let routeLayer: L.Polyline | null = null

onMounted(() => {
  if (!mapEl.value) return

  map = L.map(mapEl.value, {
    zoomControl: true,
    scrollWheelZoom: false
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  setTimeout(() => {
    map?.invalidateSize()
    drawRoute()
  }, 100)
})

onUnmounted(() => {
  map?.remove()
  map = null
})

watch(() => props.destination, () => {
  if (map) {
    map.invalidateSize()
    drawRoute()
  }
})

const blueIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#1d4ed8;border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
})

const redIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#dc2626;border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
})

async function drawRoute() {
  if (!map) return

  const origin = cityCoords['СКОПЈЕ']
  const destKey = props.destination.toUpperCase().trim()
  const dest = cityCoords[destKey]

  if (!dest) return

  // Исчисти стари слоеви
  map.eachLayer(l => {
    if (l instanceof L.Polyline || l instanceof L.Marker) l.remove()
  })

  // Маркери веднаш
  L.marker(origin, { icon: blueIcon }).bindPopup('<b>Скопје</b>').addTo(map!)
  L.marker(dest, { icon: redIcon }).bindPopup(`<b>${props.destination}</b>`).addTo(map!)

  // Права линија привремено додека се вчитува рутата
  const straightLine = L.polyline([origin, dest], {
    color: '#93c5fd', weight: 2, dashArray: '6,6'
  }).addTo(map!)
  map!.fitBounds(straightLine.getBounds(), { padding: [50, 50] })

  // Реална патна рута преку OSRM
  try {
    loading.value = true
    const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const json = await res.json()

    if (json.routes && json.routes[0]) {
      // Отстрани привремената линија
      straightLine.remove()

      const coords = json.routes[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as L.LatLngExpression
      )

      routeLayer = L.polyline(coords, {
        color: '#1d4ed8',
        weight: 4,
        opacity: 0.85
      }).addTo(map!)

      map!.fitBounds(routeLayer.getBounds(), { padding: [50, 50] })
    }
  } catch (e) {
    // Ако OSRM не работи, остани со правата линија
    console.warn('OSRM failed, showing straight line')
  } finally {
    loading.value = false
  }
}
</script>