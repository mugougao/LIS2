<template>
  <div class="situation-page">
    <main class="situation-layout">
      <MonitorList
        :active-object-type="activeObjectType"
        :selected-object-id="selectedObjectId"
        :is-altitude-matched="isAltitudeMatched"
        @type-change="handleTypeChange"
        @select="selectedObjectId = $event"
      />
      <div class="scene-pass-through">
        <div class="scene-metrics" aria-label="总体统计">
          <MetricCard icon="▣" label="空域总数" value="12" />
          <MetricCard icon="⌁" label="活跃航线" value="8" />
          <MetricCard icon="✣" label="在线飞行器" value="15" tone="cyan" />
          <MetricCard icon="△" label="冲突预警" value="2" tone="yellow" />
          <MetricCard icon="!" label="告警总数" value="3" tone="red" />
        </div>
        <AltitudeAxis v-model="selectedAltitudeRange" />
      </div>
      <DataPanel :active-object-type="activeObjectType" :selected-object-id="selectedObjectId" />
    </main>
    <EventTimeline
      :selected-event-id="selectedEventId"
      :selected-object-id="selectedObjectId"
      @select="selectedEventId = $event"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { airspaces, aircraft, events, routes } from '../data/situationMock'
import MonitorList from '../components/situation/MonitorList.vue'
import DataPanel from '../components/situation/DataPanel.vue'
import EventTimeline from '../components/situation/EventTimeline.vue'
import AltitudeAxis from '../components/situation/AltitudeAxis.vue'
import MetricCard from '../components/situation/MetricCard.vue'
import { onMounted, watch } from 'vue'
import { useWdpEngine } from '../composables/useWdpEngine'

const { isSceneReady } = useWdpEngine()

async function onSceneEntered() {
  // 删除所有覆盖物
  await App?.Scene?.ClearByTypes?.(['Poi', 'Path', 'Range'])
}

onMounted(() => {
  if (isSceneReady.value) {
    onSceneEntered()
  } else {
    const stop = watch(isSceneReady, (v) => {
      if (v) {
        onSceneEntered()
        stop()
      }
    })
  }
})
defineProps({
  sceneMode: { type: String, default: '3D' }
})

const activeObjectType = ref('airspace')
const selectedObjectId = ref('A01')
const selectedAltitudeRange = ref({ min: 0, max: 300 })
const selectedEventId = ref(events[5].id)

const firstIdByType = {
  airspace: airspaces[0].id,
  route: routes[0].id,
  aircraft: aircraft[0].id
}

function handleTypeChange(type) {
  activeObjectType.value = type
  selectedObjectId.value = firstIdByType[type]
}

function isAltitudeMatched(item) {
  const { min, max } = selectedAltitudeRange.value
  if (typeof item.altitude === 'number') {
    return item.altitude >= min && item.altitude <= max
  }
  return item.maxAltitude >= min && item.minAltitude <= max
}
</script>

<style scoped>
.situation-page {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 164px;
  gap: 8px;
  padding: 0 8px 8px;
  overflow: hidden;
  color: #dceceb;
  background: transparent;
  pointer-events: none;
}
.situation-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr) 392px;
  gap: 8px;
  min-height: 0;
  pointer-events: none;
}
.scene-pass-through {
  position: relative;
  min-width: 0;
  min-height: 0;
  pointer-events: none;
}
.scene-metrics {
  position: absolute;
  left: 0;
  right: 116px;
  bottom: 0;
  z-index: 8;
  display: flex;
  justify-content: center;
  border: 1px solid rgba(83, 119, 120, 0.32);
  border-radius: 6px 0 0 6px;
  background: rgba(5, 18, 20, 0.78);
  backdrop-filter: blur(8px);
  pointer-events: auto;
}
.scene-pass-through :deep(.altitude-axis) {
  pointer-events: auto;
}
.situation-page :deep(.monitor-list),
.situation-page :deep(.data-panel),
.situation-page :deep(.event-timeline) {
  pointer-events: auto;
}
@media (max-width: 1500px) {
  .situation-layout {
    grid-template-columns: 292px minmax(0, 1fr) 344px;
  }
}
</style>
