<template>
  <aside class="data-panel">
    <div class="panel-title">
      <div>
        <h2>{{ title }}</h2>
        <strong>{{ selected.name }}</strong>
      </div>
      <StatusBadge :label="selected.status" />
    </div>
    <AirspaceDetailPanel v-if="activeObjectType === 'airspace'" :item="selected" />
    <RouteDetailPanel v-else-if="activeObjectType === 'route'" :item="selected" />
    <AircraftDetailPanel v-else :item="selected" />
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { findObject } from '../../data/situationMock'
import StatusBadge from './StatusBadge.vue'
import AirspaceDetailPanel from './AirspaceDetailPanel.vue'
import RouteDetailPanel from './RouteDetailPanel.vue'
import AircraftDetailPanel from './AircraftDetailPanel.vue'

const props = defineProps({
  activeObjectType: { type: String, required: true },
  selectedObjectId: { type: String, required: true }
})

const selected = computed(() => findObject(props.activeObjectType, props.selectedObjectId))
const title = computed(() => {
  if (props.activeObjectType === 'airspace') return '数据面板'
  if (props.activeObjectType === 'route') return '航线面板'
  return '飞行器详情'
})
</script>

<style scoped>
.data-panel {
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  border: 1px solid rgba(83, 119, 120, 0.32);
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(8, 25, 27, 0.94), rgba(4, 17, 18, 0.93));
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge legacy */
}
.data-panel::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
.panel-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
h2 {
  margin: 0 0 8px;
  color: #e9fffa;
  font-size: 18px;
}
strong {
  color: #dffff5;
  font-size: 20px;
}
</style>
