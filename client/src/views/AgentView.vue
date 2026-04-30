<template>
  <div class="agent-view">
    <div class="agent-header">
      <button class="back-btn" @click="goBack">← 返回主工作台</button>
      <h3>智能冲突解脱 - {{ conflictId?.substring(0, 8) }}</h3>
      <div v-if="conflict" class="conflict-summary">
        <span class="severity-tag" :class="'severity-' + conflict.severity">{{ severityLabel(conflict.severity) }}</span>
        <span>涉及计划: {{ involvedPlanNames }}</span>
        <span>最小间距: {{ conflict.distance?.toFixed(1) }}m</span>
      </div>
    </div>
    <div class="agent-main">
      <div class="agent-chat">
        <AgentDialog :conflictId="conflictId" @resolved="onResolved" />
      </div>
      <div class="agent-map">
        <CesiumViewer />
      </div>
    </div>
    <div v-if="resolved" class="resolved-overlay">
      <div class="resolved-card">
        <h3>✅ 冲突已解决</h3>
        <button @click="goBack">返回主工作台</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../utils/api';
import AgentDialog from '../components/AgentDialog.vue';
import CesiumViewer from '../components/CesiumViewer.vue';

const props = defineProps({ conflictId: String });
const router = useRouter();
const conflict = ref(null);
const resolved = ref(false);

const involvedPlanNames = computed(() => {
  if (!conflict.value) return '-';
  const plans = JSON.parse(conflict.value.involved_plans || '[]');
  return plans.join(', ');
});

function severityLabel(s) {
  const map = { high: '高危', medium: '中危', low: '低危' };
  return map[s] || s;
}

function goBack() { router.push('/'); }
function onResolved() { resolved.value = true; }

onMounted(async () => {
  try {
    conflict.value = await api.getConflict(props.conflictId);
  } catch (e) {
    console.error('获取冲突详情失败:', e);
  }
});
</script>

<style scoped>
.agent-view { width: 100%; height: 100%; display: flex; flex-direction: column; background: var(--bg-primary); position: relative; }
.agent-header {
  display: flex; align-items: center; gap: 16px; padding: 12px 18px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-default); flex-wrap: wrap;
}
.agent-header h3 { margin: 0; font-size: 16px; color: var(--green-primary); font-weight: 600; }
.back-btn {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  transition: all var(--transition-fast);
}
.back-btn:hover { border-color: var(--green-primary); color: var(--green-primary); }
.conflict-summary { display: flex; gap: 12px; font-size: 12px; color: var(--text-secondary); width: 100%; }
.agent-main { display: flex; flex: 1; overflow: hidden; }
.agent-chat { width: 480px; min-width: 480px; height: 100%; border-right: 1px solid var(--border-default); }
.agent-map { flex: 1; height: 100%; }
.resolved-overlay {
  position: absolute; inset: 0; background: rgba(10, 15, 15, 0.85); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100;
}
.resolved-card {
  background: var(--bg-secondary); border: 2px solid var(--green-primary); border-radius: var(--radius-lg); padding: 48px; text-align: center;
  box-shadow: 0 0 30px var(--green-glow);
}
.resolved-card h3 { color: var(--green-primary); margin-bottom: 20px; font-size: 20px; }
.resolved-card button {
  padding: 10px 28px;
  background: var(--green-primary);
  border: none;
  border-radius: var(--radius-md);
  color: #0A0F0F;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-fast);
}
.resolved-card button:hover { background: var(--green-hover); box-shadow: 0 0 12px var(--green-glow); }
.severity-tag { font-size: 11px; padding: 2px 8px; border-radius: var(--radius-sm); font-weight: 500; }
.severity-high { color: var(--error-color); background: rgba(255, 92, 92, 0.12); }
.severity-medium { color: var(--warning-color); background: rgba(255, 179, 71, 0.12); }
.severity-low { color: var(--green-primary); background: rgba(42, 212, 178, 0.12); }
</style>
