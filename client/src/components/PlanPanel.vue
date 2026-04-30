<template>
  <div class="plan-panel">
    <div class="panel-header">
      <h3>飞行计划管理</h3>
      <button class="btn-primary" @click="showForm = !showForm">{{ showForm ? '取消' : '新建计划' }}</button>
    </div>

    <div v-if="showForm" class="form-card">
      <div class="form-row">
        <label>运营商</label>
        <select v-model="form.operator_id">
          <option value="">-- 选择 --</option>
          <option v-for="op in operators" :key="op.id" :value="op.id">{{ op.name }}</option>
        </select>
      </div>
      <div class="form-row">
        <label>计划名称</label>
        <input v-model="form.plan_name" placeholder="计划名称" />
      </div>
      <div class="form-row">
        <label>起飞时间</label>
        <div class="datetime-row">
          <input type="date" v-model="form.start_date" />
          <input type="time" v-model="form.start_time_only" step="60" />
        </div>
      </div>
      <div class="form-row">
        <label>降落时间</label>
        <div class="datetime-row">
          <input type="date" v-model="form.end_date" />
          <input type="time" v-model="form.end_time_only" step="60" />
        </div>
      </div>
      <div class="form-group">
        <h4>起飞机场</h4>
        <div class="form-row-inline">
          <input v-model.number="form.start_lon" type="number" step="any" placeholder="经度" />
          <input v-model.number="form.start_lat" type="number" step="any" placeholder="纬度" />
          <input v-model.number="form.start_alt" type="number" step="any" placeholder="高度(m)" />
        </div>
      </div>
      <div class="form-group">
        <h4>降落机场</h4>
        <div class="form-row-inline">
          <input v-model.number="form.end_lon" type="number" step="any" placeholder="经度" />
          <input v-model.number="form.end_lat" type="number" step="any" placeholder="纬度" />
          <input v-model.number="form.end_alt" type="number" step="any" placeholder="高度(m)" />
        </div>
      </div>
      <div class="form-row">
        <label>飞行器类型</label>
        <input v-model="form.aircraft_type" placeholder="如: DJI M300" />
      </div>
      <div class="form-row">
        <label>航路点 JSON</label>
        <textarea v-model="form.waypoints_text" rows="3" placeholder="GeoJSON LineString, 可为空(自动生成)"></textarea>
      </div>
      <div class="form-row-inline">
        <label class="checkbox-label">
          <input type="checkbox" v-model="form.time_flexible" />
          时间柔性
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="form.alt_flexible" />
          高度柔性
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="form.interruptible" />
          可中断
        </label>
      </div>
      <div class="form-row">
        <label>非结构化诉求</label>
        <textarea v-model="form.unstructured_notes" rows="2" placeholder="描述特殊需求..."></textarea>
      </div>
      <button class="btn-primary" @click="submitPlan">提交计划</button>
    </div>

    <div class="plan-list">
      <div v-if="plans.length === 0" class="empty">暂无飞行计划</div>
      <div v-for="plan in plans" :key="plan.id" class="plan-item">
        <div class="plan-info">
          <strong>{{ plan.plan_name || plan.id.substring(0, 8) }}</strong>
          <span class="plan-meta">运营: {{ plan.operator_id }} | 状态: {{ plan.status }}</span>
          <span class="plan-time">{{ formatTime(plan.start_time) }} → {{ formatTime(plan.end_time) }}</span>
        </div>
        <div class="plan-actions">
          <button class="btn-sm" @click="editPlan(plan)">编辑</button>
          <button class="btn-sm btn-danger" @click="removePlan(plan.id)">删除</button>
        </div>
      </div>
    </div>

    <div v-if="editMode" class="form-card edit-card">
      <h4>编辑计划: {{ editForm.plan_name }}</h4>
      <div class="form-row">
        <label>状态</label>
        <select v-model="editForm.status">
          <option value="active">激活</option>
          <option value="modified">已修改</option>
          <option value="cancelled">已取消</option>
        </select>
      </div>
      <div class="form-row">
        <label>起飞时间</label>
        <div class="datetime-row">
          <input type="date" v-model="editForm.start_date" />
          <input type="time" v-model="editForm.start_time_only" step="60" />
        </div>
      </div>
      <div class="form-row">
        <label>降落时间</label>
        <div class="datetime-row">
          <input type="date" v-model="editForm.end_date" />
          <input type="time" v-model="editForm.end_time_only" step="60" />
        </div>
      </div>
      <div class="form-row-inline">
        <input v-model.number="editForm.start_alt" type="number" step="any" placeholder="高度" />
        <input v-model.number="editForm.end_alt" type="number" step="any" placeholder="终点高度" />
      </div>
      <div class="form-actions">
        <button class="btn-primary" @click="submitEdit">保存</button>
        <button class="btn-secondary" @click="editMode = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { usePlansStore } from '../stores/plans';
import { api } from '../utils/api';

const plansStore = usePlansStore();

const plans = computed(() => plansStore.plans);
const operators = computed(() => plansStore.operators);

const showForm = ref(false);
const editMode = ref(false);

function nowDateTime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 10);
  return d;
}

function toISODate(d) {
  return d.toISOString().substring(0, 10);
}

function toISOTime(d) {
  return d.toISOString().substring(11, 16);
}

const defaultForm = () => {
  const start = nowDateTime();
  const end = new Date(start.getTime() + 3600000);
  return {
    operator_id: '',
    plan_name: '',
    start_date: toISODate(start),
    start_time_only: toISOTime(start),
    end_date: toISODate(end),
    end_time_only: toISOTime(end),
    start_lon: 116.4,
    start_lat: 39.9,
    start_alt: 100,
    end_lon: 116.5,
    end_lat: 39.95,
    end_alt: 100,
    aircraft_type: '',
    waypoints_text: '',
    time_flexible: true,
    alt_flexible: true,
    interruptible: true,
    unstructured_notes: ''
  };
};

const form = reactive(defaultForm());
const editForm = reactive({});

function formatTime(t) {
  if (!t) return '-';
  return new Date(t).toLocaleString('zh-CN');
}

async function submitPlan() {
  let waypoints = null;
  if (form.waypoints_text) {
    try { waypoints = JSON.parse(form.waypoints_text); } catch { alert('航路点JSON格式错误'); return; }
  }
  const start_time = `${form.start_date}T${form.start_time_only}:00.000Z`;
  const end_time = `${form.end_date}T${form.end_time_only}:00.000Z`;
  await plansStore.createPlan({
    ...form,
    start_time,
    end_time,
    waypoints,
    time_flexible: form.time_flexible ? 1 : 0,
    alt_flexible: form.alt_flexible ? 1 : 0,
    interruptible: form.interruptible ? 1 : 0
  });
  Object.assign(form, defaultForm());
  showForm.value = false;
}

function splitISODateTime(iso) {
  if (!iso) return { date: '', time: '' };
  return {
    date: iso.substring(0, 10),
    time: iso.substring(11, 16)
  };
}

function editPlan(plan) {
  const start = splitISODateTime(plan.start_time);
  const end = splitISODateTime(plan.end_time);
  Object.assign(editForm, {
    id: plan.id,
    plan_name: plan.plan_name,
    status: plan.status,
    start_date: start.date,
    start_time_only: start.time,
    end_date: end.date,
    end_time_only: end.time,
    start_alt: plan.start_alt,
    end_alt: plan.end_alt
  });
  editMode.value = true;
}

async function submitEdit() {
  const start_time = editForm.start_date && editForm.start_time_only
    ? `${editForm.start_date}T${editForm.start_time_only}:00.000Z`
    : undefined;
  const end_time = editForm.end_date && editForm.end_time_only
    ? `${editForm.end_date}T${editForm.end_time_only}:00.000Z`
    : undefined;
  await plansStore.updatePlan(editForm.id, {
    status: editForm.status,
    start_time,
    end_time,
    start_alt: editForm.start_alt,
    end_alt: editForm.end_alt
  });
  editMode.value = false;
}

async function removePlan(id) {
  if (confirm('确认删除此计划？')) {
    await plansStore.deletePlan(id);
  }
}

onMounted(async () => {
  await plansStore.fetchPlans();
  await plansStore.fetchOperators();
});
</script>

<style scoped>
.plan-panel { display: flex; flex-direction: column; gap: 12px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; }
.panel-header h3 { margin: 0; font-size: 16px; color: var(--green-primary); font-weight: 600; }
.form-card {
  background: rgba(42, 212, 178, 0.03);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
.form-row input, .form-row select, .form-row textarea {
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
  transition: all var(--transition-fast);
  outline: none;
  font-family: inherit;
}
.form-row input:focus, .form-row select:focus, .form-row textarea:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-glow);
}
.form-row select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232AD4B2' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
  cursor: pointer;
}
.form-row-inline { display: flex; gap: 6px; }
.form-row-inline input {
  flex: 1;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: all var(--transition-fast);
}
.form-row-inline input:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-glow);
}
.datetime-row { display: flex; gap: 6px; }
.datetime-row input {
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: all var(--transition-fast);
}
.datetime-row input[type="date"] { flex: 1; min-width: 0; color-scheme: dark; }
.datetime-row input[type="time"] { width: 110px; flex-shrink: 0; color-scheme: dark; }
.datetime-row input:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-glow);
}
.form-group h4 { font-size: 13px; color: var(--green-primary); margin-bottom: 4px; font-weight: 500; }
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--transition-fast);
}
.checkbox-label:hover { color: var(--green-primary); }
.checkbox-label input { width: auto; accent-color: var(--green-primary); }
.plan-list { display: flex; flex-direction: column; gap: 6px; }
.empty { text-align: center; color: var(--text-disabled); padding: 20px; font-size: 13px; }
.plan-item {
  background: rgba(42, 212, 178, 0.03);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all var(--transition-fast);
}
.plan-item:hover {
  border-color: var(--green-primary);
  box-shadow: 0 0 8px rgba(42, 212, 178, 0.1);
}
.plan-info { display: flex; flex-direction: column; gap: 2px; }
.plan-info strong { color: var(--text-primary); font-size: 14px; }
.plan-meta, .plan-time { font-size: 11px; color: var(--text-secondary); }
.plan-actions { display: flex; gap: 6px; }
.edit-card { margin-top: 8px; }
.form-actions { display: flex; gap: 10px; margin-top: 4px; }
</style>
