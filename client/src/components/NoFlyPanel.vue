<template>
  <div class="nofly-panel">
    <div class="panel-header">
      <h3>禁飞区管理</h3>
      <button class="btn-primary" @click="showForm = !showForm">{{ showForm ? '取消' : '新建禁飞区' }}</button>
    </div>

    <div v-if="showForm" class="form-card">
      <div class="form-row">
        <label>名称</label>
        <input v-model="form.name" placeholder="禁飞区名称" />
      </div>
      <div class="form-row">
        <label>GeoJSON 多边形</label>
        <textarea v-model="form.geometry_text" rows="4" placeholder='{"type":"Polygon","coordinates":[[[lon,lat],...]]}'></textarea>
      </div>
      <div class="form-group">
        <h4>高度限制范围</h4>
        <div class="form-row-inline">
          <input v-model.number="form.min_alt" type="number" step="any" placeholder="最低高度(m)" />
          <input v-model.number="form.max_alt" type="number" step="any" placeholder="最高高度(m)" />
        </div>
      </div>
      <button class="btn-primary" @click="submitZone">提交禁飞区</button>
    </div>

    <div class="zone-list">
      <div v-if="zones.length === 0" class="empty">暂无禁飞区</div>
      <div v-for="zone in zones" :key="zone.id" class="zone-item">
        <div class="zone-info">
          <strong>{{ zone.name || zone.id.substring(0, 8) }}</strong>
          <span class="zone-meta">高度: {{ zone.min_alt || 0 }}m - {{ zone.max_alt || '∞' }}m</span>
        </div>
        <button class="btn-sm btn-danger" @click="removeZone(zone.id)">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useNoFlyStore } from '../stores/nofly';

const store = useNoFlyStore();
const zones = computed(() => store.zones);
const showForm = ref(false);

const form = reactive({
  name: '',
  geometry_text: '',
  min_alt: 0,
  max_alt: 500
});

async function submitZone() {
  let geometry;
  try { geometry = JSON.parse(form.geometry_text); } catch { alert('GeoJSON格式错误'); return; }
  await store.createZone({
    name: form.name,
    geometry,
    min_alt: form.min_alt,
    max_alt: form.max_alt
  });
  form.name = '';
  form.geometry_text = '';
  showForm.value = false;
}

async function removeZone(id) {
  if (confirm('确认删除？')) await store.deleteZone(id);
}

onMounted(() => store.fetchZones());
</script>

<style scoped>
.nofly-panel { display: flex; flex-direction: column; gap: 12px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; }
.panel-header h3 { margin: 0; font-size: 16px; color: var(--green-primary); font-weight: 600; }
.form-card {
  background: rgba(120, 190, 45, 0.03);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
.form-row input, .form-row textarea {
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  font-family: inherit;
  transition: all var(--transition-fast);
  resize: vertical;
  width: 100%;
  min-width: 0;
}
.form-row input:focus, .form-row textarea:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-glow);
}
.form-group h4 { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500; }
.form-row-inline { display: flex; gap: 6px; }
.form-row-inline input {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: all var(--transition-fast);
}
.form-row-inline input::-webkit-inner-spin-button,
.form-row-inline input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.form-row-inline input[type="number"] {
  -moz-appearance: textfield;
}
.form-row-inline input:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-glow);
}
.zone-list { display: flex; flex-direction: column; gap: 6px; }
.empty { text-align: center; color: var(--text-disabled); padding: 20px; font-size: 13px; }
.zone-item {
  background: rgba(62, 63, 62, 0.58);
  border: 1px solid rgba(29, 29, 29, 0.5);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all var(--transition-fast);
}
.zone-item:hover {
  border-color: var(--green-primary);
  box-shadow: 0 0 8px rgba(120, 190, 45, 0.1);
}
.zone-info { display: flex; flex-direction: column; gap: 2px; }
.zone-info strong { color: var(--text-primary); font-size: 14px; }
.zone-meta { font-size: 11px; color: var(--text-secondary); }
</style>
