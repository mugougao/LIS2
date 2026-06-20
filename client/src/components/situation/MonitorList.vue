<template>
  <aside class="monitor-list">
    <h2>监控列表</h2>
    <div class="search-row">
      <label><span>⌕</span><input placeholder="搜索 空域名称/编号" /></label>
      <button title="筛选">▽</button>
    </div>
    <ObjectTypeTabs :model-value="activeObjectType" @update:model-value="$emit('type-change', $event)" />
    <AirspaceList
      v-if="activeObjectType === 'airspace'"
      :items="airspaceItems"
      :selected-id="selectedObjectId"
      :is-altitude-matched="isAltitudeMatched"
      @select="$emit('select', $event)"
    />
    <RouteList
      v-else-if="activeObjectType === 'route'"
      :items="routes"
      :selected-id="selectedObjectId"
      :is-altitude-matched="isAltitudeMatched"
      @select="$emit('select', $event)"
    />
    <AircraftList
      v-else
      :items="aircraft"
      :selected-id="selectedObjectId"
      :is-altitude-matched="isAltitudeMatched"
      @select="$emit('select', $event)"
    />
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { airspaces as airspacesMock, aircraft, routes } from '../../data/situationMock'
import ObjectTypeTabs from './ObjectTypeTabs.vue'
import AirspaceList from './AirspaceList.vue'
import RouteList from './RouteList.vue'
import AircraftList from './AircraftList.vue'

const props = defineProps({
  activeObjectType: { type: String, required: true },
  selectedObjectId: { type: String, required: true },
  isAltitudeMatched: { type: Function, required: true },
  airspaces: { type: Array, default: null }
})

const airspaceItems = computed(() => props.airspaces || airspacesMock)

defineEmits(['type-change', 'select'])
</script>

<style scoped>
.monitor-list {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 16px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--surface-panel);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(16px) saturate(1.05);
  overflow: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge legacy */
}
.monitor-list::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
h2 {
  margin: 0 0 12px;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
}
.search-row {
  display: grid;
  grid-template-columns: 1fr 38px;
  gap: 8px;
}
label,
.search-row button {
  height: 36px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: rgba(5, 13, 12, 0.72);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  color: #8aa2a1;
}
label:focus-within,
.search-row button:hover {
  border-color: rgba(168, 255, 37, 0.48);
  box-shadow: 0 0 14px rgba(118, 185, 0, 0.16);
}
label span {
  position: relative;
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  font-size: 0;
}
label span::before {
  content: '';
  position: absolute;
  inset: 1px 4px 4px 1px;
  border: 1.7px solid currentColor;
  border-radius: 50%;
}
label span::after {
  content: '';
  position: absolute;
  right: 1px;
  bottom: 1px;
  width: 6px;
  height: 1.7px;
  border-radius: 999px;
  background: currentColor;
  transform: rotate(45deg);
}
input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #dceceb;
}
.search-row button {
  position: relative;
  color: #b9cccb;
  cursor: pointer;
  font-size: 0;
}
.search-row button::before,
.search-row button::after {
  content: '';
  position: absolute;
  left: 11px;
  right: 11px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}
.search-row button::before {
  top: 12px;
  box-shadow: 5px 5px 0 -0.4px currentColor;
}
.search-row button::after {
  top: 22px;
  width: 10px;
  left: 14px;
}
</style>
