<template>
  <div class="min-h-screen flex relative overflow-hidden" style="background-image: url(&quot;./public/avtobuskaskopje.gif&quot;); background-size: cover; background-position: center">
    <div class="absolute inset-0 bg-blue-950/70"></div>

    <div class="relative z-10 flex w-full max-w-6xl mx-auto px-8 items-center gap-16">
      <!-- Лево — текст -->
      <div class="flex-1 flex flex-col justify-center py-16 items-center text-center">
        <div class="flex items-center gap-2 mb-8">
          <span class="text-3xl">🚏</span>
          <span class="text-blue-300 text-2xl font-bold tracking-widest uppercase">Busly</span>
        </div>

        <h1 class="text-white text-6xl font-black leading-none tracking-tight mb-6">
          Автобуски<br />линии низ<br />
          <span class="text-blue-400">Македонија</span><br />
          и пошироко
        </h1>

        <p class="text-blue-200 text-lg leading-relaxed mb-10 max-w-sm">Спореди цени, времиња и превозници. Пронајди го најдобриот автобус за тебе.</p>

        <div class="flex flex-col gap-3 items-center">
          <div class="mt-3 w-full">
            <p class="text-blue-300/70 text-xs uppercase tracking-widest mb-3 text-center">Популарни дестинации</p>
            <div class="flex flex-wrap justify-center gap-2">
              <button
                v-for="dest in popularDestinations"
                :key="dest.name"
                @click="goTo(dest.name)"
                class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium backdrop-blur transition"
              >
                <span>{{ dest.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Десно — форма -->
      <div class="w-[480px] flex-shrink-0">
        <!-- <div class="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 class="text-white text-xl font-bold mb-6 text-center">Пребарај линија</h2>
          <SearchForm />
        </div> -->
        <SearchForm />
      </div>
    </div>
  </div>
  <AiChatWidget />
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import SearchForm from "../components/SearchForm.vue";
import AiChatWidget from "../components/AiChatWidget.vue";

const router = useRouter();

const popularDestinations = [
  { name: "ОХРИД" },
  { name: "ТЕТОВО" },
  { name: "ВЕЛЕС" },
  { name: "КОЧАНИ" },
  { name: "РЕСЕН" },
  { name: "ВИНИЦА" },
  { name: "СТРУГА" },
  { name: "БИТОЛА" },
  { name: "КАВАДАРЦИ" },
];

function goTo(destination: string) {
  router.push({
    path: "/results",
    query: {
      to: destination,
      date: new Date().toISOString().split("T")[0],
      p: 1,
    },
  });
}
</script>
