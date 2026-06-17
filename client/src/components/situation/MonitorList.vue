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
  border: 1px solid rgba(83, 119, 120, 0.32);
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(8, 25, 27, 0.92), rgba(4, 17, 18, 0.9));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
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
  color: #e9fffa;
  font-size: 18px;
}
.search-row {
  display: grid;
  grid-template-columns: 1fr 38px;
  gap: 8px;
}
label,
.search-row button {
  height: 34px;
  border: 1px solid rgba(93, 122, 123, 0.36);
  border-radius: 5px;
  background: rgba(3, 14, 15, 0.72);
}
label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  color: #8aa2a1;
}
input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #dceceb;
}
.search-row button {
  color: #b9cccb;
  cursor: pointer;
}
</style>
