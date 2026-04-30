<template>
  <div class="agent-dialog">
    <div v-if="!connected" class="connecting">
      <span class="spinner"></span> 正在连接Agent...
    </div>
    <div class="messages" ref="msgContainer">
      <div v-for="(msg, idx) in messages" :key="idx" :class="['msg', msg._class]">
        <div class="msg-role" v-if="msg._class !== 'message-system'">
          <span v-if="msg._class === 'message-tool'" class="role-badge tool">🛠 {{ msg.name || '工具调用' }}</span>
          <span v-else-if="msg._class === 'message-assistant'"  class="role-badge assistant">🤖 Agent</span>
          <span v-else-if="msg._class === 'message-user'" class="role-badge user">👤 用户</span>
        </div>
        <div class="msg-content">
          <pre v-if="msg.type === 'tool_call'">调用: {{ msg.name }}({{ formatArgs(msg.arguments) }})</pre>
          <pre v-else-if="msg.type === 'tool_result'" class="tool-result">{{ formatResult(msg.result) }}</pre>
          <div v-else>{{ msg.content }}</div>
        </div>
      </div>
    </div>
    <div v-if="waitingConfirm" class="confirm-bar">
      <span>是否接受此方案？</span>
      <button class="btn-accept" @click="confirm(true)">接受</button>
      <button class="btn-reject" @click="confirm(false)">拒绝</button>
    </div>
    <div class="input-area">
      <input v-model="userInput" @keyup.enter="sendMessage" placeholder="输入调整意见..." :disabled="!connected" />
      <button @click="sendMessage" :disabled="!connected || !userInput">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { createWebSocket, api } from '../utils/api';

const props = defineProps({
  conflictId: String
});

const emit = defineEmits(['resolved']);

const connected = ref(false);
const messages = ref([]);
const userInput = ref('');
const waitingConfirm = ref(false);
const msgContainer = ref(null);
let ws = null;

function scrollToBottom() {
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
    }
  });
}

function addMessage(data, msgClass) {
  const msg = { ...data, _class: msgClass || 'message-system' };
  messages.value.push(msg);
  scrollToBottom();
}

function formatArgs(args) {
  if (typeof args === 'string') return args;
  return JSON.stringify(args, null, 2);
}

function formatResult(result) {
  if (typeof result === 'string') return result;
  return JSON.stringify(result, null, 2);
}

function sendMessage() {
  if (!userInput.value || !ws) return;
  addMessage({ type: 'user_message', content: userInput.value }, 'message-user');
  ws.send(JSON.stringify({ type: 'user_message', content: userInput.value }));
  userInput.value = '';
}

function confirm(accept) {
  if (!ws) return;
  ws.send(JSON.stringify({ type: 'confirm_solution', accept }));
  waitingConfirm.value = false;
}

onMounted(async () => {
  try {
    const session = await api.createSession(props.conflictId);
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/agent?sessionId=${session.id}`;
    ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      connected.value = true;
    };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'tool_call' || msg.type === 'tool_result') {
          addMessage(msg, 'message-tool');
        } else if (msg.type === 'text') {
          addMessage(msg, 'message-assistant');
        } else if (msg.type === 'confirmation_required') {
          addMessage(msg, 'message-system');
          waitingConfirm.value = true;
        } else if (msg.type === 'session_end') {
          addMessage(msg, 'message-system');
          connected.value = false;
          if (msg.status === 'resolved') emit('resolved');
        } else if (msg.type === 'error') {
          addMessage(msg, 'message-system');
        } else {
          addMessage(msg, 'message-system');
        }
      } catch (e) {
        addMessage({ type: 'text', content: event.data }, 'message-system');
      }
    };
    ws.onerror = () => {
      connected.value = false;
      addMessage({ type: 'error', content: 'WebSocket连接错误' }, 'message-system');
    };
    ws.onclose = () => {
      connected.value = false;
    };
  } catch (e) {
    addMessage({ type: 'error', content: `创建会话失败: ${e.message}` }, 'message-system');
  }
});

onBeforeUnmount(() => {
  if (ws) ws.close();
});
</script>

<style scoped>
.agent-dialog {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary);
}
.connecting { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; color: var(--text-secondary); font-size: 14px; }
.spinner { width: 16px; height: 16px; border: 2px solid var(--border-default); border-top-color: var(--green-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.msg { padding: 10px 14px; border-radius: var(--radius-md); max-width: 85%; }
.message-user {
  align-self: flex-end;
  background: rgba(42, 212, 178, 0.1);
  border: 1px solid rgba(42, 212, 178, 0.25);
}
.message-assistant {
  align-self: flex-start;
  background: rgba(42, 212, 178, 0.04);
  border: 1px solid var(--border-default);
}
.message-tool {
  align-self: flex-start;
  background: rgba(255, 179, 71, 0.06);
  border: 1px solid rgba(255, 179, 71, 0.2);
}
.message-system {
  align-self: center;
  background: rgba(42, 212, 178, 0.03);
  border: 1px dashed var(--border-default);
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}
.msg-content { font-size: 13px; color: var(--text-primary); line-height: 1.5; white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word; min-width: 0; }
.msg-content pre { margin: 0; font-size: 11px; color: var(--warning-color); white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word; max-width: 100%; overflow-x: hidden; }
.msg-content pre.tool-result { color: var(--green-primary); }
.msg-role { margin-bottom: 4px; }
.role-badge { font-size: 11px; padding: 2px 8px; border-radius: var(--radius-sm); font-weight: 500; }
.role-badge.tool { background: rgba(255, 179, 71, 0.15); color: var(--warning-color); }
.role-badge.assistant { background: rgba(42, 212, 178, 0.15); color: var(--green-primary); }
.role-badge.user { background: rgba(42, 212, 178, 0.1); color: var(--green-hover); }
.confirm-bar {
  display: flex; align-items: center; gap: 10px; padding: 12px 14px;
  background: rgba(42, 212, 178, 0.06); border-top: 1px solid var(--border-default); color: var(--text-primary); font-size: 13px;
}
.btn-accept {
  padding: 8px 20px;
  background: var(--green-primary);
  border: none;
  border-radius: var(--radius-md);
  color: #0A0F0F;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-accept:hover { background: var(--green-hover); box-shadow: 0 0 10px var(--green-glow); }
.btn-reject {
  padding: 8px 20px;
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-reject:hover { border-color: var(--error-color); color: var(--error-color); }
.input-area {
  display: flex; gap: 8px; padding: 12px 14px; border-top: 1px solid var(--border-default);
}
.input-area input {
  flex: 1;
  padding: 10px 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: all var(--transition-fast);
}
.input-area input:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-glow);
}
.input-area input:disabled { opacity: 0.5; }
.input-area button {
  padding: 10px 22px;
  background: var(--green-primary);
  border: none;
  border-radius: var(--radius-lg);
  color: #0A0F0F;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: all var(--transition-fast);
}
.input-area button:hover { background: var(--green-hover); box-shadow: 0 0 10px var(--green-glow); }
.input-area button:disabled { opacity: 0.5; cursor: not-allowed; background: #3A3F3F; color: #5D6E6E; }
</style>
