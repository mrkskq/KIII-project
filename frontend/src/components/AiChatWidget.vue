<template>
  <div class="chat-box">
    <button class="toggle" @click="open = !open">💬</button>

    <div v-if="open" class="panel">
      <div class="messages">
        <div v-for="(m, i) in messages" :key="i" class="msg">
          <div v-if="m.role === 'you'">🧑 {{ m.text }}</div>
          <div v-else>
            🤖
            <div style="white-space: pre-line">{{ m.text }}</div>
          </div>
        </div>
      </div>
      <input v-model="text" placeholder="Побарај најефтина карта, следен термин..." @keyup.enter="send" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const open = ref(false);
const text = ref("");
const messages = ref([]);

async function send() {
  if (!text.value) return;

  const userMsg = text.value;
  messages.value.push({ role: "you", text: userMsg });
  text.value = "";

  const res = await fetch("http://localhost:3001/ai/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: userMsg }),
  });

  const data = await res.json();
  const routes = data.routes || [];

  // const formatted = routes
  //   .map(r => `${r.destination} – ${r.time} – ${r.price} МКД${r.note ? " (" + r.note + ")" : ""}`)
  //   .join("\n");

  messages.value.push({
    role: "ai",
    text: data.answer,
  });
}
</script>

<style>
.chat-box {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

.toggle {
  background: blue;
  color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
}

.panel {
  width: 250px;
  height: 420px;
  background: white;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  overflow-y: auto;
  font-size: 13px;
  padding-right: 5px;
}
</style>
