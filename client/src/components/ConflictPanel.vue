<template>
  <div class="conflict-panel">
    <div class="panel-header">
      <h3>冲突管理</h3>
      <div class="panel-buttons">
        <button class="btn-primary" @click="runGlobalDetect" :disabled="loading">全局检测</button>
      </div>
    </div>

    <div class="pair-detect">
      <h4>一对一检测</h4>
      <n-select v-model:value="pair1" :options="planOptions1" placeholder="选择计划1" clearable filterable :consistent-menu-width="false" />
      <n-select v-model:value="pair2" :options="planOptions2" placeholder="选择计划2" clearable filterable :consistent-menu-width="false" />
      <button class="btn-primary btn-sm" @click="runPairDetect" :disabled="!pair1 || !pair2">检测</button>
    </div>

    <div v-if="pairResult !== null" class="pair-result" :class="{ 'has-conflict': pairResult.hasConflict }">
      <p v-if="pairResult.hasConflict">
        检测到冲突！严重程度: <span :class="'severity-' + pairResult.severity">{{ pairResult.severity }}</span>，最小间距: {{ pairResult.min_distance?.toFixed(1) }}m
      </p>
      <p v-else>未检测到冲突</p>
    </div>

    <div class="conflict-list">
      <div v-if="conflicts.length === 0" class="empty">暂无冲突事件</div>
      <div v-for="c in conflicts" :key="c.id" class="conflict-item" :class="'severity-border-' + c.severity">
        <div class="conflict-info">
          <strong>{{ c.id.substring(0, 8) }}</strong>
          <span class="severity-tag" :class="'severity-' + c.severity">{{ severityLabel(c.severity) }}</span>
          <span class="conflict-meta">状态: {{ statusLabel(c.status) }}</span>
          <span class="conflict-time">{{ formatTime(c.time_window_start) }} ~ {{ formatTime(c.time_window_end) }}</span>
        </div>
        <div class="conflict-actions">
          <button class="btn-secondary btn-sm" @click="openAgent(c.id)">智能解脱</button>
          <button class="btn-sm btn-danger" @click="removeConflict(c.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConflictStore } from '../stores/conflict';
import { usePlansStore } from '../stores/plans';
import { api } from '../utils/api';
import { NSelect } from 'naive-ui';

const router = useRouter();
const conflictStore = useConflictStore();
const plansStore = usePlansStore();

const conflicts = computed(() => conflictStore.conflicts);
const plans = computed(() => plansStore.plans);
const loading = ref(false);
const pair1 = ref(null);
const pair2 = ref(null);
const pairResult = ref(null);

const planOptions = computed(() =>
  plans.value.map(p => ({ label: p.plan_name || p.id.substring(0, 8), value: p.id }))
);
const planOptions1 = computed(() =>
  planOptions.value.filter(o => o.value !== pair2.value)
);
const planOptions2 = computed(() =>
  planOptions.value.filter(o => o.value !== pair1.value)
);

function severityLabel(s) {
  const map = { high: '高危', medium: '中危', low: '低危' };
  return map[s] || s;
}

function statusLabel(s) {
  const map = { unresolved: '未解决', in_progress: '处理中', resolved: '已解决' };
  return map[s] || s;
}

function formatTime(t) {
  if (!t) return '-';
  return new Date(t).toLocaleString('zh-CN');
}

async function runGlobalDetect() {
  loading.value = true;
  try {
    const results = await conflictStore.detectGlobal();
    if (results.length === 0) alert('未检测到新冲突');
    else alert(`检测到 ${results.length} 个新冲突`);
  } catch (e) {
    alert('检测失败: ' + e.message);
  } finally {
    loading.value = false;
  }
}

async function runPairDetect() {
  if (!pair1.value || !pair2.value) return;
  pairResult.value = await api.detectPair(pair1.value, pair2.value);
}

async function removeConflict(id) {
  if (confirm('确认删除？')) await conflictStore.deleteConflict(id);
}

function openAgent(conflictId) {
  router.push(`/agent/${conflictId}`);
}

onMounted(async () => {
  await conflictStore.fetchConflicts();
  await plansStore.fetchPlans();
});
</script>

<style scoped>
.conflict-panel { display: flex; flex-direction: column; gap: 12px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; }
.panel-header h3 { margin: 0; font-size: 16px; color: var(--green-primary); font-weight: 600; }
.panel-buttons { display: flex; gap: 6px; }
.pair-detect {
  background: rgba(120, 190, 45, 0.03);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pair-detect h4 { font-size: 12px; color: var(--text-secondary); margin: 0; font-weight: 500; }
.pair-result {
  padding: 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: rgba(120, 190, 45, 0.03);
  border: 1px solid var(--border-default);
}
.pair-result.has-conflict {
  background: rgba(255, 92, 92, 0.06);
  border: 1px solid rgba(255, 92, 92, 0.25);
}
.conflict-list { display: flex; flex-direction: column; gap: 6px; }
.empty { text-align: center; color: var(--text-disabled); padding: 20px; font-size: 13px; }
.conflict-item {
  background: rgba(62, 63, 62, 0.58);
  border: 1px solid rgba(29, 29, 29, 0.5);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all var(--transition-fast);
}
.conflict-item.severity-border-high { border-left: 3px solid var(--error-color); }
.conflict-item.severity-border-medium { border-left: 3px solid var(--warning-color); }
.conflict-item.severity-border-low { border-left: 3px solid var(--green-primary); }
.conflict-item:hover {
  border-color: var(--green-primary);
  box-shadow: 0 0 8px rgba(120, 190, 45, 0.1);
}
.conflict-info { display: flex; flex-direction: column; gap: 2px; }
.conflict-info strong { color: var(--text-primary); font-size: 14px; }
.conflict-meta, .conflict-time { font-size: 11px; color: var(--text-secondary); }
.conflict-actions { display: flex; flex-direction: column; gap: 6px; }
.severity-tag { font-size: 11px; padding: 2px 8px; border-radius: var(--radius-sm); font-weight: 500; }
.severity-high { color: var(--error-color); background: rgba(255, 92, 92, 0.12); }
.severity-medium { color: var(--warning-color); background: rgba(255, 179, 71, 0.12); }
.severity-low { color: var(--green-primary); background: rgba(120, 190, 45, 0.12); }
</style>
