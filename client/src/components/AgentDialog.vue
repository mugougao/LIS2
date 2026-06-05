<template>
  <div class="agent-dialog">
    <div v-if="!connected && !sessionEnded" class="connecting">
      <span class="spinner"></span> 正在连接 Agent...
    </div>

    <div class="messages-scroll" ref="scrollContainer" @scroll="onScroll">
      <div class="timeline">
        <template v-for="(item, idx) in timeline" :key="idx">
          <!-- 用户气泡 -->
          <div v-if="item.kind === 'user'" class="bubble bubble-user">
            <div class="bubble-role">用户</div>
            <div class="bubble-content">{{ item.content }}</div>
          </div>

          <!-- Agent 自然语言气泡 -->
          <div v-else-if="item.kind === 'assistant'" class="bubble bubble-assistant">
            <div class="bubble-role">Agent</div>
            <div class="bubble-content">{{ item.content }}</div>
          </div>

          <!-- 系统提示 -->
          <div
            v-else-if="item.kind === 'system'"
            class="system-hint"
            :class="'system-' + (item.level || 'info')"
          >{{ item.content }}</div>

          <!-- 工具步骤组 (时间线) -->
          <div v-else-if="item.kind === 'step-group'" class="step-group">
            <div class="step-group-title">执行步骤</div>
            <div class="step-list">
              <div
                v-for="step in item.steps"
                :key="step.id"
                class="step"
                :class="['step-' + step.status, { expanded: step.expanded }]"
              >
                <div class="step-rail">
                  <span class="step-dot" :class="'dot-' + step.status"></span>
                </div>

                <div class="step-row" @click="toggleStep(step)">
                  <span class="step-label">{{ step.label }}</span>
                  <span v-if="step.summary" class="step-summary">{{ step.summary }}</span>
                  <span class="step-status" :class="'status-' + step.status">{{ statusText(step.status) }}</span>
                  <span class="step-duration">{{ formatDuration(step) }}</span>
                  <span class="step-caret">{{ step.expanded ? '▾' : '▸' }}</span>
                </div>

                <div v-if="step.expanded" class="step-detail">
                  <div class="detail-block">
                    <div class="detail-head">
                      <span>入参</span>
                      <button class="copy-btn" @click.stop="copyJson(step.args)">复制</button>
                    </div>
                    <pre class="detail-body args">{{ formatJson(step.args) }}</pre>
                  </div>
                  <div class="detail-block" v-if="step.status !== 'running'">
                    <div class="detail-head">
                      <span :class="{ 'is-error': step.status === 'failed' }">
                        {{ step.status === 'failed' ? '出参 (错误)' : '出参' }}
                      </span>
                      <button class="copy-btn" @click.stop="copyJson(step.result)">复制</button>
                    </div>
                    <pre class="detail-body result" :class="{ 'is-error': step.status === 'failed' }">{{ formatJson(step.result) }}</pre>
                  </div>
                  <div v-else class="detail-running">
                    <span class="mini-spinner"></span> 执行中...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div v-if="thinking" class="thinking">
          <span class="thinking-dot"></span>
          <span class="thinking-dot"></span>
          <span class="thinking-dot"></span>
          <span class="thinking-text">Agent 正在思考...</span>
        </div>
      </div>
    </div>

    <div v-if="waitingConfirm" class="confirm-bar">
      <span>是否接受此方案？</span>
      <button class="btn-accept" @click="confirm(true)">接受</button>
      <button class="btn-reject" @click="confirm(false)">拒绝</button>
    </div>

    <div class="input-area">
      <input
        v-model="userInput"
        @keyup.enter="sendMessage"
        placeholder="输入调整意见..."
        :disabled="!connected"
      />
      <button @click="sendMessage" :disabled="!connected || !userInput">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { api } from '../utils/api'
import { useAgentTimeline } from '../composables/useAgentTimeline'

const props = defineProps({ conflictId: String })
const emit = defineEmits(['resolved'])

const {
  timeline,
  appendUser,
  appendAssistant,
  appendSystem,
  appendToolCall,
  appendToolResult,
  toggleStep
} = useAgentTimeline()

const connected = ref(false)
const sessionEnded = ref(false)
const userInput = ref('')
const waitingConfirm = ref(false)
const scrollContainer = ref(null)
const autoScroll = ref(true)
let ws = null

const thinking = computed(() => {
  if (!connected.value || sessionEnded.value) return false
  if (timeline.value.length === 0) return true
  const last = timeline.value[timeline.value.length - 1]
  if (last.kind === 'step-group') {
    const tail = last.steps[last.steps.length - 1]
    return tail && tail.status === 'running'
  }
  return false
})

function statusText(s) {
  return s === 'running' ? '执行中' : s === 'success' ? '成功' : '失败'
}

function formatDuration(step) {
  if (step.status === 'running' || !step.endedAt) return ''
  const ms = step.endedAt - step.startedAt
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

function formatJson(v) {
  if (v == null) return ''
  if (typeof v === 'string') return v
  try { return JSON.stringify(v, null, 2) } catch { return String(v) }
}

function copyJson(v) {
  const text = formatJson(v)
  if (!text) return
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {})
  }
}

function onScroll() {
  const el = scrollContainer.value
  if (!el) return
  const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
  autoScroll.value = distanceToBottom < 80
}

function scrollToBottom(force = false) {
  if (!force && !autoScroll.value) return
  nextTick(() => {
    const el = scrollContainer.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

watch(timeline, () => scrollToBottom(), { deep: true })

function sendMessage() {
  if (!userInput.value || !ws) return
  const content = userInput.value
  appendUser(content)
  ws.send(JSON.stringify({ type: 'user_message', content }))
  userInput.value = ''
  autoScroll.value = true
  scrollToBottom(true)
}

function confirm(accept) {
  if (!ws) return
  ws.send(JSON.stringify({ type: 'confirm_solution', accept }))
  waitingConfirm.value = false
}

function handleWsMessage(msg) {
  switch (msg.type) {
    case 'tool_call':
      appendToolCall(msg)
      break
    case 'tool_result':
      appendToolResult(msg)
      break
    case 'text':
      appendAssistant(msg.content)
      break
    case 'confirmation_required':
      waitingConfirm.value = true
      break
    case 'session_end':
      appendSystem(msg.message || '会话结束', 'end')
      sessionEnded.value = true
      connected.value = false
      if (msg.status === 'resolved') emit('resolved')
      break
    case 'error':
      appendSystem(msg.content || '发生错误', 'error')
      break
    default:
      if (msg.content) appendSystem(msg.content, 'info')
  }
}

onMounted(async () => {
  try {
    const session = await api.createSession(props.conflictId)
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/agent?sessionId=${session.id}`
    ws = new WebSocket(wsUrl)
    ws.onopen = () => { connected.value = true }
    ws.onmessage = (event) => {
      try {
        handleWsMessage(JSON.parse(event.data))
      } catch {
        appendSystem(event.data, 'info')
      }
    }
    ws.onerror = () => {
      connected.value = false
      appendSystem('WebSocket 连接错误', 'error')
    }
    ws.onclose = () => { connected.value = false }
  } catch (e) {
    appendSystem(`创建会话失败: ${e.message}`, 'error')
  }
})

onBeforeUnmount(() => { if (ws) ws.close() })
</script>

<style scoped>
.agent-dialog {
  position: relative;
  height: 100%;
  background: rgba(3, 14, 15, 0.36);
}
.connecting {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 12px; color: var(--text-secondary); font-size: 14px;
}
.spinner {
  width: 16px; height: 16px;
  border: 2px solid var(--border-default);
  border-top-color: var(--green-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.messages-scroll {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 56px;
  overflow-y: auto;
  padding: 14px 14px 60px 14px;
}
.messages-scroll::-webkit-scrollbar { width: 6px; }
.messages-scroll::-webkit-scrollbar-track { background: var(--bg-tertiary); }
.messages-scroll::-webkit-scrollbar-thumb { background: var(--green-primary); border-radius: 10px; }

.timeline { display: flex; flex-direction: column; gap: 10px; }

/* ===== 气泡 ===== */
.bubble {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-primary);
  word-break: break-word;
}
.bubble-role {
  font-size: 11px;
  margin-bottom: 3px;
  opacity: 0.7;
}
.bubble-content { white-space: pre-wrap; }
.bubble-user {
  margin-left: auto;
  background: rgba(120, 190, 45, 0.12);
  border: 1px solid rgba(120, 190, 45, 0.28);
}
.bubble-user .bubble-role { color: var(--green-hover); text-align: right; }
.bubble-assistant {
  margin-right: auto;
  background: rgba(120, 190, 45, 0.04);
  border: 1px solid var(--border-default);
}
.bubble-assistant .bubble-role { color: var(--green-primary); }

/* ===== 系统提示 ===== */
.system-hint {
  align-self: center;
  max-width: 90%;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px dashed var(--border-default);
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.02);
  text-align: center;
}
.system-error {
  color: #FF8A8A;
  border-color: rgba(255, 92, 92, 0.4);
  background: rgba(255, 92, 92, 0.06);
}
.system-end {
  color: var(--green-primary);
  border-color: rgba(120, 190, 45, 0.4);
  background: rgba(120, 190, 45, 0.06);
}

/* ===== 步骤组 ===== */
.step-group {
  background: rgba(120, 190, 45, 0.03);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 10px 12px;
}
.step-group-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  opacity: 0.7;
}
.step-list { display: flex; flex-direction: column; }

/* ===== 单步 ===== */
.step {
  position: relative;
  display: grid;
  grid-template-columns: 22px 1fr;
  align-items: start;
}
.step-rail {
  position: relative;
  width: 22px;
  align-self: stretch;
  min-height: 28px;
}
.step-rail::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-default);
}
.step:first-child .step-rail::before { top: 12px; }
.step:last-child .step-rail::before { bottom: calc(100% - 12px); }
.step-dot {
  position: absolute;
  left: 4px;
  top: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 2px solid var(--border-default);
  box-sizing: border-box;
  z-index: 1;
}
.dot-running {
  border-color: var(--green-primary);
  background: var(--green-primary);
  animation: pulse 1s ease-in-out infinite;
}
.dot-success {
  border-color: var(--green-primary);
  background: var(--green-primary);
}
.dot-failed {
  border-color: #FF5C5C;
  background: #FF5C5C;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--green-glow); transform: scale(1); }
  50%      { box-shadow: 0 0 0 6px rgba(120,190,45,0.05); transform: scale(1.2); }
}

.step-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: 13px;
  transition: background var(--transition-fast);
  min-width: 0;
}
.step-row:hover { background: rgba(120, 190, 45, 0.06); }
.step-label {
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
}
.step-summary {
  color: var(--text-secondary);
  font-size: 12px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.step-status {
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 999px;
  font-weight: 500;
  flex-shrink: 0;
}
.status-running {
  background: rgba(120, 190, 45, 0.12);
  color: var(--green-primary);
}
.status-success {
  background: rgba(120, 190, 45, 0.18);
  color: var(--green-primary);
}
.status-failed {
  background: rgba(255, 92, 92, 0.15);
  color: #FF8A8A;
}
.step-duration {
  font-size: 11px;
  color: var(--text-disabled);
  flex-shrink: 0;
  min-width: 40px;
  text-align: right;
}
.step-caret {
  color: var(--text-disabled);
  font-size: 10px;
  flex-shrink: 0;
}

/* ===== 展开详情 ===== */
.step-detail {
  grid-column: 2;
  margin: 4px 0 10px 0;
  padding: 8px 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail-block { display: flex; flex-direction: column; gap: 4px; }
.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: 0.4px;
}
.detail-head .is-error { color: #FF8A8A; }
.copy-btn {
  font-size: 10px;
  padding: 2px 8px;
  background: transparent;
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.copy-btn:hover {
  border-color: var(--green-primary);
  color: var(--green-primary);
}
.detail-body {
  margin: 0;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: var(--radius-sm);
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 240px;
  overflow: auto;
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
}
.detail-body.args { color: #B0C4C4; }
.detail-body.result { color: var(--green-primary); }
.detail-body.is-error { color: #FF8A8A; }
.detail-running {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary);
}
.mini-spinner {
  width: 10px; height: 10px;
  border: 2px solid var(--border-default);
  border-top-color: var(--green-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ===== 思考态 ===== */
.thinking {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 12px;
  align-self: flex-start;
  color: var(--text-secondary);
  font-size: 12px;
}
.thinking-dot {
  width: 6px; height: 6px;
  background: var(--green-primary);
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}
.thinking-dot:nth-child(2) { animation-delay: 0.2s; }
.thinking-dot:nth-child(3) { animation-delay: 0.4s; }
.thinking-text { margin-left: 6px; }
@keyframes bounce {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40%           { opacity: 1;   transform: scale(1.1); }
}

/* ===== 底部 ===== */
.confirm-bar {
  position: absolute;
  bottom: 50px; left: 0; right: 0;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px;
  background: rgba(120, 190, 45, 0.06);
  border-top: 1px solid var(--border-default);
  color: var(--text-primary);
  font-size: 13px;
  z-index: 1;
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
.btn-reject:hover { border-color: #FF5C5C; color: #FF8A8A; }

.input-area {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  display: flex; gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid var(--border-default);
  background: rgba(5, 18, 20, 0.94);
  z-index: 1;
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
