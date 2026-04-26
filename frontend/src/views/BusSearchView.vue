<template>
  <div>
    <input v-model="to" placeholder="To..." />
    <button @click="go">Search</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const to = ref("");
const router = useRouter();

function go() {
  router.push({
    path: "/results",
    query: { to: to.value }
  });
}
</script>