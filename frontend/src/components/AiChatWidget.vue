<template>
  <div class="chat-box">
    <button class="toggle-btn" @click="open = !open" aria-label="Отвори чет">
      <span class="icon">💬</span>
    </button>

    <div v-if="open" class="chat-panel">
      <!-- Header -->
      <div class="chat-header">
        <div class="chat-avatar">🤖</div>
        <div class="chat-header-info">
          <p class="chat-header-name">AI Асистент</p>
          <p class="chat-header-sub">SkopjeBUS</p>
        </div>
        <div class="online-dot" />
      </div>

      <div class="chat-messages" ref="msgBox">
        <div
          v-for="(m, i) in messages"
          :key="i"
          class="msg-row"
          :class="{ user: m.role === 'you' }"
        >
          <div class="msg-icon" :class="m.role === 'you' ? 'user' : 'ai'">
            {{ m.role === 'you' ? '👤' : '🤖' }}
          </div>
          <div class="bubble" :class="m.role === 'you' ? 'user' : 'ai'">
            {{ m.text }}
          </div>
        </div>
      </div>

      <div class="chat-input-row">
        <input
          v-model="text"
          class="chat-input"
          placeholder="Постави прашање..."
          @keyup.enter="send"
        />
        <button class="send-btn" @click="send">➤</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";

const props = defineProps({ defaultOpen: { type: Boolean, default: false } })
const open = ref(props.defaultOpen)
// const open = ref(false);
const text = ref("");
const messages = ref([
  { role: "ai", text: "Здраво! Можам да ти помогнам да најдеш автобус. Прашај ме нешто! 🚌" }
]);
const msgBox = ref(null);

async function send() {
  if (!text.value.trim()) return;
  const userMsg = text.value;
  messages.value.push({ role: "you", text: userMsg });
  text.value = "";
  await nextTick();
  if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight;

  const res = await fetch("http://localhost:3001/ai/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: userMsg }),
  });
  const data = await res.json();
  messages.value.push({ role: "ai", text: data.answer });
  await nextTick();
  if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight;
}
</script>

<style scoped>
.chat-box {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.toggle-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1d4ed8, #1d4ed8);
  border: none;
  cursor: pointer;
  font-size: 22px;
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4);
}

.chat-panel {
  width: 300px;
  height: 440px;
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 0.5px solid rgba(0,0,0,0.08);
}

.chat-header {
  background: linear-gradient(135deg, #1d4ed8, #1d4ed8);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.chat-header-info { flex: 1; }
.chat-header-name { color: #fff; font-size: 14px; font-weight: 600; margin: 0; }
.chat-header-sub { color: rgba(255,255,255,0.7); font-size: 11px; margin: 0; }

.online-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #4ade80;
  border: 2px solid rgba(255,255,255,0.4);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f5f5f7;
}

.msg-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.msg-row.user { flex-direction: row-reverse; }

.msg-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
}

.msg-icon.ai { background: linear-gradient(135deg, #1d4ed8, #1d4ed8); }
.msg-icon.user { background: #e0e7ff; }

.bubble {
  max-width: 78%;
  padding: 9px 13px;
  border-radius: 16px;
  font-size: 13px;
  line-height: 1.5;
}

.bubble.ai {
  background: #fff;
  color: #1a1a1a;
  border-bottom-left-radius: 4px;
  border: 0.5px solid rgba(0,0,0,0.08);
}

.bubble.user {
  background: linear-gradient(135deg, #1d4ed8, #1d4ed8);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.chat-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 0.5px solid rgba(0,0,0,0.08);
  background: #fff;
}

.chat-input {
  flex: 1;
  border: 0.5px solid rgba(0,0,0,0.12);
  border-radius: 20px;
  padding: 8px 14px;
  font-size: 12.5px;
  background: #f5f5f7;
  outline: none;
}

.send-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1d4ed8, #1d4ed8);
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
}
</style>