<template>
  <div class="chat-box">
    <!-- Message Bubble -->
    <button class="toggle-btn" @click="open = !open" aria-label="Отвори чет">
<<<<<<< Updated upstream
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="34" height="34">
        <!-- chat bubble -->
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />

        <!-- dots -->
        <circle cx="9" cy="11" r="1" fill="white" stroke="none" />
        <circle cx="12" cy="11" r="1" fill="white" stroke="none" />
        <circle cx="15" cy="11" r="1" fill="white" stroke="none" />
      </svg>
=======
      <span class="icon"><i class="fa-solid fa-comment" style="color: white;"></i></span>
>>>>>>> Stashed changes
    </button>

    <div v-if="open" class="chat-panel">
      <!-- Header -->
      <div class="chat-header">
<<<<<<< Updated upstream
        <div class="chat-avatar">
          <!-- AI Robot Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
            <rect x="4" y="8" width="16" height="12" rx="1.5" />
            <rect x="8" y="12" width="2.5" height="2.5" rx="0.5" fill="white" stroke="none" />
            <rect x="13.5" y="12" width="2.5" height="2.5" rx="0.5" fill="white" stroke="none" />
            <path d="M9 17.5h6" />
            <path d="M8 8V6.5a4 4 0 0 1 8 0V8" />
            <line x1="12" y1="3" x2="12" y2="5" />
            <line x1="4" y1="13.5" x2="2" y2="13.5" />
            <line x1="22" y1="13.5" x2="20" y2="13.5" />
            >
            <rect x="3" y="8" width="18" height="12" rx="3" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            <circle cx="9" cy="14" r="1.5" fill="white" stroke="none" />
            <circle cx="15" cy="14" r="1.5" fill="white" stroke="none" />
            <path d="M9.5 17.5h5" />
            <path d="M12 3v2" />
          </svg>
        </div>
=======
        <div class="chat-avatar"><i class="fa-solid fa-robot " style="color: white;"></i></div>
>>>>>>> Stashed changes
        <div class="chat-header-info">
          <p class="chat-header-name">AI Асистент</p>
          <p class="chat-header-sub">Busly</p>
        </div>
        <div class="online-dot" />
      </div>

      <div class="chat-messages" ref="msgBox">
        <div v-for="(m, i) in messages" :key="i" class="msg-row" :class="{ user: m.role === 'you' }">
<<<<<<< Updated upstream
          <div class="msg-icon" :class="m.role === 'you' ? 'user' : 'ai'">
            <!-- AI Robot Icon -->
            <svg
              v-if="m.role !== 'you'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              width="20"
              height="20"
            >
              <rect x="4" y="8" width="16" height="12" rx="1.5" />
              <rect x="8" y="12" width="2.5" height="2.5" rx="0.5" fill="white" stroke="none" />
              <rect x="13.5" y="12" width="2.5" height="2.5" rx="0.5" fill="white" stroke="none" />
              <path d="M9 17.5h6" />
              <path d="M8 8V6.5a4 4 0 0 1 8 0V8" />
              <line x1="12" y1="3" x2="12" y2="5" />
              <line x1="4" y1="13.5" x2="2" y2="13.5" />
              <line x1="22" y1="13.5" x2="20" y2="13.5" />
            </svg>

            <!-- User Person Icon -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <div class="bubble" :class="m.role === 'you' ? 'user' : 'ai'">
            {{ m.text }}
=======
          <div class="msg-icon" :class="m.role === 'you' ? 'user' : 'ai'" style="background-color: lightblue;">
            <i :class="m.role === 'you' ? 'fa-solid fa-user' : 'fa-solid fa-robot'" style="color: white;"></i>
>>>>>>> Stashed changes
          </div>
          <div class="bubble" :class="m.role === 'you' ? 'user' : 'ai'" v-html="m.text"></div>
        </div>
      </div>

      <div class="chat-input-row">
        <input v-model="text" class="chat-input" placeholder="Постави прашање..." @keyup.enter="send" />
        <button class="send-btn" @click="send"><i class="fa-solid fa-paper-plane"></i></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";

const props = defineProps({ defaultOpen: { type: Boolean, default: false } });
const open = ref(props.defaultOpen);
const text = ref("");
const messages = ref([{ role: "ai", text: `Здраво! Планираш патување? Ќе ти помогнам да ја најдеш најдобрата автобуска линија.`}]);
const msgBox = ref(null);
const lastCity = ref("");

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
    body: JSON.stringify({ question: userMsg, context: lastCity.value }),
  });
  const data = await res.json();

  if (data.detectedCity) lastCity.value = data.detectedCity;

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
  width: 66px;
  height: 66px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 0;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35);
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
  border: 0.5px solid rgba(0, 0, 0, 0.08);
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
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.chat-header-info {
  flex: 1;
}
.chat-header-name {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}
.chat-header-sub {
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  margin: 0;
}

.online-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #4ade80;
  border: 2px solid rgba(255, 255, 255, 0.4);
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

.msg-row.user {
  flex-direction: row-reverse;
}

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

.msg-icon.ai {
  background: linear-gradient(135deg, #1d4ed8, #1d4ed8);
}
.msg-icon.user {
  background: #e0e7ff;
}

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
  border: 0.5px solid rgba(0, 0, 0, 0.08);
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
  border-top: 0.5px solid rgba(0, 0, 0, 0.08);
  background: #fff;
}

.chat-input {
  flex: 1;
  border: 0.5px solid rgba(0, 0, 0, 0.12);
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
