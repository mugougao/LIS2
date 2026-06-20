<template>
  <aside class="data-panel" :class="`is-${activeObjectType}`">
    <div class="panel-title">
      <div>
        <strong>{{ selected.name }}</strong>
      </div>
    </div>
    <div class="insight-grid" aria-label="详情摘要">
      <div v-for="card in summaryCards" :key="card.label" class="insight-card" :class="card.tone">
        <i class="insight-icon" :class="`icon-${card.icon}`" aria-hidden="true"></i>
        <span>{{ card.label }}</span>
        <b>{{ card.value }}</b>
      </div>
    </div>
    <AirspaceDetailPanel v-if="activeObjectType === 'airspace'" :item="selected" />
    <RouteDetailPanel v-else-if="activeObjectType === 'route'" :item="selected" />
    <AircraftDetailPanel v-else :item="selected" />
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { findObject } from '../../data/situationMock'
import AirspaceDetailPanel from './AirspaceDetailPanel.vue'
import RouteDetailPanel from './RouteDetailPanel.vue'
import AircraftDetailPanel from './AircraftDetailPanel.vue'

const props = defineProps({
  activeObjectType: { type: String, required: true },
  selectedObjectId: { type: String, required: true },
  airspaces: { type: Array, default: null }
})

const selected = computed(() => {
  if (props.activeObjectType === 'airspace' && props.airspaces) {
    return props.airspaces.find((a) => a.id === props.selectedObjectId) || props.airspaces[0]
  }
  return findObject(props.activeObjectType, props.selectedObjectId)
})
const title = computed(() => {
  if (props.activeObjectType === 'airspace') return '数据面板'
  if (props.activeObjectType === 'route') return '航线面板'
  return '飞行器详情'
})
const summaryCards = computed(() => {
  const item = selected.value || {}
  if (props.activeObjectType === 'airspace') {
    return [
      { label: '高度', value: item.heightRange || '-', tone: item.color || 'green', icon: 'height' },
      { label: '占用', value: `${item.occupancy ?? 0}%`, tone: item.color || 'green', icon: 'occupancy' },
      { label: '航线', value: item.relatedRoutes?.length ?? 0, tone: 'cyan', icon: 'route' },
      { label: '计划', value: item.plans?.total ?? 0, tone: 'yellow', icon: 'plan' }
    ]
  }
  if (props.activeObjectType === 'route') {
    return [
      { label: '长度', value: item.length || '-', tone: item.color || 'green', icon: 'route' },
      { label: '航点', value: item.waypointCount ?? 0, tone: 'cyan', icon: 'waypoint' },
      { label: '占用', value: `${item.occupancy ?? 0}%`, tone: 'green', icon: 'occupancy' },
      { label: '风险', value: item.riskPoints ?? 0, tone: 'yellow', icon: 'risk' }
    ]
  }
  return [
    { label: '高度', value: `${item.altitude ?? 0}m`, tone: item.color || 'green', icon: 'height' },
    { label: '速度', value: item.speed || '-', tone: 'cyan', icon: 'speed' },
    { label: '电量', value: `${item.battery ?? 0}%`, tone: item.battery <= 30 ? 'red' : 'green', icon: 'battery' },
    { label: '进度', value: `${item.missionProgress ?? 0}%`, tone: 'yellow', icon: 'progress' }
  ]
})
</script>

<style scoped>
.data-panel {
  position: relative;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--surface-panel);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(16px) saturate(1.05);
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
.panel-title::before {
  content: '';
  width: 4px;
  align-self: stretch;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--green-hover), rgba(34, 215, 255, 0.82));
  box-shadow: 0 0 16px rgba(168, 255, 37, 0.34);
}
strong {
  color: #e8ffe7;
  font-size: 20px;
}
.insight-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}
.insight-card {
  position: relative;
  min-width: 0;
  min-height: 82px;
  padding: 10px 8px 9px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background:
    linear-gradient(145deg, rgba(9, 24, 20, 0.94), rgba(5, 13, 12, 0.9)) padding-box,
    linear-gradient(145deg, color-mix(in srgb, currentColor 44%, transparent), rgba(148, 175, 164, 0.12)) border-box;
  color: var(--green-hover);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.045), 0 0 18px color-mix(in srgb, currentColor 10%, transparent);
  overflow: hidden;
}
.insight-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, color-mix(in srgb, currentColor 18%, transparent), transparent 52%);
  pointer-events: none;
}
.insight-icon {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin: 0 auto 7px;
  border: 1px solid color-mix(in srgb, currentColor 55%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, currentColor 9%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 12px color-mix(in srgb, currentColor 18%, transparent);
}
.insight-icon::before,
.insight-icon::after {
  content: '';
  position: absolute;
}
.insight-icon::before {
  inset: 3px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  filter: drop-shadow(0 0 7px color-mix(in srgb, currentColor 55%, transparent));
}
.insight-icon::after {
  inset: 3px;
  border: 1px solid color-mix(in srgb, currentColor 26%, transparent);
  border-radius: 7px;
  opacity: 0.72;
}
.icon-height::before {
  background-image: url('../../assets/insight-icons/height.svg');
}
.icon-occupancy::before {
  background-image: url('../../assets/insight-icons/occupancy.svg');
}
.icon-route::before {
  background-image: url('../../assets/insight-icons/route.svg');
}
.icon-plan::before {
  background-image: url('../../assets/insight-icons/plan.svg');
}
.icon-waypoint::before {
  background-image: url('../../assets/insight-icons/waypoint.svg');
}
.icon-risk::before {
  background-image: url('../../assets/insight-icons/risk.svg');
}
.icon-speed::before {
  background-image: url('../../assets/insight-icons/speed.svg');
}
.icon-battery::before {
  background-image: url('../../assets/insight-icons/battery.svg');
}
.icon-progress::before {
  background-image: url('../../assets/insight-icons/progress.svg');
}
.insight-card span,
.insight-card b {
  position: relative;
  z-index: 1;
  display: block;
  text-align: center;
}
.insight-card span {
  color: var(--text-muted);
  font-size: 12px;
}
.insight-card b {
  margin-top: 2px;
  color: #f2fff0;
  font-size: 18px;
  line-height: 1.15;
  overflow-wrap: anywhere;
}
.insight-card.cyan { color: var(--cyan-primary); }
.insight-card.yellow { color: var(--warning-color); }
.insight-card.red { color: var(--error-color); }
.insight-card.blue { color: #55a7ff; }
.insight-card.muted { color: var(--text-muted); }
</style>
