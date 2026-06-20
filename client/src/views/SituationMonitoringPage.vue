<template>
  <div class="situation-page">
    <main class="situation-layout">
      <MonitorList
        :active-object-type="activeObjectType"
        :selected-object-id="selectedObjectId"
        :is-altitude-matched="isAltitudeMatched"
        :airspaces="effectiveAirspaces"
        @type-change="handleTypeChange"
        @select="selectedObjectId = $event"
      />
      <div class="scene-pass-through">
        <div class="scene-metrics" aria-label="总体统计">
          <MetricCard :image="metricIcons.airspaceTotal" label="空域总数" value="9" />
          <MetricCard :image="metricIcons.activeRoutes" label="活跃航线" value="8" />
          <MetricCard :image="metricIcons.onlineAircraft" label="在线飞行器" value="15" tone="cyan" />
          <MetricCard :image="metricIcons.conflictWarning" label="冲突预警" value="2" tone="yellow" />
          <MetricCard :image="metricIcons.alarmTotal" label="告警总数" value="3" tone="red" />
        </div>
        <AltitudeAxis v-model="selectedAltitudeRange" @change="applyAltitudeFilter" />
      </div>
      <DataPanel :active-object-type="activeObjectType" :selected-object-id="selectedObjectId" :airspaces="effectiveAirspaces" />
    </main>
    <EventTimeline
      :selected-event-id="selectedEventId"
      :selected-object-id="selectedObjectId"
      @select="selectedEventId = $event"
      @scrub="onTimelineScrub"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { airspaces, aircraft, aircraftFlights, events, routes, airspaceStateAt } from '../data/situationMock'
import MonitorList from '../components/situation/MonitorList.vue'
import DataPanel from '../components/situation/DataPanel.vue'
import EventTimeline from '../components/situation/EventTimeline.vue'
import AltitudeAxis from '../components/situation/AltitudeAxis.vue'
import MetricCard from '../components/situation/MetricCard.vue'
import airspaceTotalIcon from '../assets/metric-icons/airspace-total.png'
import activeRoutesIcon from '../assets/metric-icons/active-routes.png'
import onlineAircraftIcon from '../assets/metric-icons/online-aircraft.png'
import conflictWarningIcon from '../assets/metric-icons/conflict-warning.png'
import alarmTotalIcon from '../assets/metric-icons/alarm-total.png'
import { onMounted, watch } from 'vue'
import { useWdpEngine } from '../composables/useWdpEngine'
import { useWdpEntities } from '../composables/useWdpEntities'

const { isSceneReady } = useWdpEngine()
const { getApp, buildAirspaceDescriptors, setAirspaceRangeHeight, setAirspaceRangeColor, buildRouteDescriptors, removeRouteEntity, batchAddEntities, drawAircraftFlight, removeAircraftEntity, focusEntity, followEntity, stopFollow, registerEntityClick } = useWdpEntities()
const metricIcons = {
  airspaceTotal: airspaceTotalIcon,
  activeRoutes: activeRoutesIcon,
  onlineAircraft: onlineAircraftIcon,
  conflictWarning: conflictWarningIcon,
  alarmTotal: alarmTotalIcon
}

// 时间轴当前分钟（00:00 = 0），空域 mock 数据为 00:00 默认状态
const currentMinute = ref(0)
// 按时间轴当前时刻计算每个空域的有效状态（类型/状态/颜色）
const effectiveAirspaces = computed(() =>
  airspaces.map((a) => {
    const s = airspaceStateAt(a, currentMinute.value)
    return { ...a, type: s.type, status: s.status, color: s.color }
  })
)
// 记录已下发到场景的空域状态（颜色|状态），避免拖动时重复更新
const lastAirspaceState = {}
function airspaceStateKey(a) {
  return `${a.color}|${a.status}`
}

// 已绘制的空域实体引用：id -> [range, label, ...]
const airspaceEntities = new Map()
// 已绘制的航线实体引用：id -> [path]
const routeEntities = new Map()
// 已绘制的飞行器实体引用：id -> POI 对象
const aircraftEntities = new Map()

async function onSceneEntered() {
  const App = getApp()
  if (!App) return

  // 删除所有覆盖物
  await App?.Scene?.ClearByTypes?.(['Poi', 'Path', 'Range'])
  airspaceEntities.clear()
  routeEntities.clear()

  // 调用 WDPAPI Range 方法，按列表颜色/高度批量绘制空域（使用时间轴生效状态）
  const descriptors = []
  for (const airspace of effectiveAirspaces.value) {
    const built = buildAirspaceDescriptors(App, airspace)
    if (built && built.length) {
      airspaceEntities.set(airspace.id, built.map(d => d.obj))
      descriptors.push(...built)
    }
    lastAirspaceState[airspace.id] = airspaceStateKey(airspace)
  }
  await batchAddEntities(App, descriptors)

  applyAltitudeFilter()
}

// 切换至航线 tab：空域 Range 压平为 10m（避免遮挡航线），绘制航线 Path
async function enterRouteMode() {
  const App = getApp()
  if (!App) return

  await clearAircraft(App)

  for (const airspace of effectiveAirspaces.value) {
    await setAirspaceRangeHeight(App, airspace, 10)
  }

  routeEntities.clear()
  const descriptors = []
  for (const route of routes) {
    const built = buildRouteDescriptors(App, route)
    if (built && built.length) {
      routeEntities.set(route.id, built.map(d => d.obj))
      descriptors.push(...built)
    }
  }
  await batchAddEntities(App, descriptors)

  applyAltitudeFilter()
}

// 切换至空域 tab：删除所有航线 Path，空域 Range 高度恢复正常
async function enterAirspaceMode() {
  const App = getApp()
  if (!App) return

  await clearAircraft(App)

  for (const id of routeEntities.keys()) {
    await removeRouteEntity(App, id)
  }
  routeEntities.clear()

  for (const airspace of effectiveAirspaces.value) {
    const height = Math.max((airspace.maxAltitude || 300) - (airspace.minAltitude || 0), 1)
    await setAirspaceRangeHeight(App, airspace, height)
    await setAirspaceRangeColor(App, airspace)
    lastAirspaceState[airspace.id] = airspaceStateKey(airspace)
  }

  applyAltitudeFilter()
}

// 切换至飞行器 tab：绘制航线（样式/数据同航线模块），空域压平，绘制飞行器并沿航线移动
async function enterAircraftMode() {
  const App = getApp()
  if (!App) return

  for (const airspace of effectiveAirspaces.value) {
    await setAirspaceRangeHeight(App, airspace, 10)
  }

  // 绘制航线 Path（与航线模块一致）
  for (const id of routeEntities.keys()) {
    await removeRouteEntity(App, id)
  }
  routeEntities.clear()
  const descriptors = []
  for (const route of routes) {
    const built = buildRouteDescriptors(App, route)
    if (built && built.length) {
      routeEntities.set(route.id, built.map(d => d.obj))
      descriptors.push(...built)
    }
  }
  await batchAddEntities(App, descriptors)

  // 绘制飞行器并沿航线移动
  await clearAircraft(App)
  for (const flight of aircraftFlights) {
    const route = routes.find(r => r.id === flight.routeId)
    if (!route) continue
    const poi = await drawAircraftFlight(App, flight, route)
    if (poi) {
      aircraftEntities.set(flight.id, poi)
    }
  }

  applyAltitudeFilter()
}

// 清除所有飞行器实体
async function clearAircraft(App) {
  for (const id of aircraftEntities.keys()) {
    await removeAircraftEntity(App, id)
  }
  aircraftEntities.clear()
}

// 根据高度轴筛选范围，隐藏范围外的空域 / 航线
async function applyAltitudeFilter() {
  const App = getApp()
  if (!App) return

  if (activeObjectType.value === 'aircraft') {
    // 航线显隐（与航线模块一致）
    for (const route of routes) {
      const entities = routeEntities.get(route.id)
      if (!entities || !entities.length) continue
      const visible = isAltitudeMatched(route)
      try {
        await App.Scene.SetVisible(entities, visible)
      } catch (e) {
        console.warn('[Situation] 设置航线显隐失败:', route.id, e)
      }
    }
    // 飞行器显隐
    for (const flight of aircraftFlights) {
      const poi = aircraftEntities.get(flight.id)
      if (!poi) continue
      const visible = isAltitudeMatched(flight)
      try {
        await App.Scene.SetVisible([poi], visible)
      } catch (e) {
        console.warn('[Situation] 设置飞行器显隐失败:', flight.id, e)
      }
    }
    return
  }

  if (activeObjectType.value === 'route') {
    for (const route of routes) {
      const entities = routeEntities.get(route.id)
      if (!entities || !entities.length) continue
      const visible = isAltitudeMatched(route)
      try {
        await App.Scene.SetVisible(entities, visible)
      } catch (e) {
        console.warn('[Situation] 设置航线显隐失败:', route.id, e)
      }
    }
    return
  }

  for (const airspace of effectiveAirspaces.value) {
    const entities = airspaceEntities.get(airspace.id)
    if (!entities || !entities.length) continue
    const visible = isAltitudeMatched(airspace)
    try {
      await App.Scene.SetVisible(entities, visible)
    } catch (e) {
      console.warn('[Situation] 设置空域显隐失败:', airspace.id, e)
    }
  }
}

// 拖动事件轴：同步面板数据与场景 range 颜色（各 tab 均生效）
async function onTimelineScrub(minute) {
  currentMinute.value = minute
  const App = getApp()
  if (!App) return
  for (const airspace of effectiveAirspaces.value) {
    const key = airspaceStateKey(airspace)
    if (lastAirspaceState[airspace.id] === key) continue
    lastAirspaceState[airspace.id] = key
    await setAirspaceRangeColor(App, airspace)
  }
}

onMounted(() => {
  if (isSceneReady.value) {
    onSceneEntered()
    setupEntityClick()
  } else {
    const stop = watch(isSceneReady, (v) => {
      if (v) {
        onSceneEntered()
        setupEntityClick()
        stop()
      }
    })
  }
})

// 场景 POI 点击 → 选中对应卡片（仅响应当前 tab 类型）
function setupEntityClick() {
  const App = getApp()
  if (!App) return
  registerEntityClick(App, ({ type, id }) => {
    if (type !== activeObjectType.value) return
    selectedObjectId.value = id
  })
}
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
  const prevType = activeObjectType.value
  activeObjectType.value = type
  selectedObjectId.value = firstIdByType[type]

  // 离开飞行器 tab 时停止镜头跟随
  if (prevType === 'aircraft' && type !== 'aircraft') {
    const App = getApp()
    if (App) stopFollow(App)
  }

  if (type === 'route') {
    enterRouteMode()
  } else if (type === 'airspace') {
    enterAirspaceMode()
  } else if (type === 'aircraft') {
    enterAircraftMode()
  }
}

function isAltitudeMatched(item) {
  const { min, max } = selectedAltitudeRange.value
  if (typeof item.altitude === 'number') {
    return item.altitude >= min && item.altitude <= max
  }
  return item.maxAltitude >= min && item.minAltitude <= max
}

// 选中对象变化（卡片点击 / POI 点击）→ 聚焦对应场景实体
// 飞行器沿航线移动，触发镜头跟随；空域/航线聚焦
watch(selectedObjectId, (id) => {
  const App = getApp()
  if (!App || !id) return
  if (activeObjectType.value === 'aircraft') {
    const poi = aircraftEntities.get(id)
    if (poi) followEntity(App, poi)
  } else {
    focusEntity(App, activeObjectType.value, id)
  }
})
</script>

<style scoped>
.situation-page {
  --situation-column-gap: 6px;
  --situation-row-gap: 2px;
  --side-panel-top-offset: 8px;
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 178px;
  gap: var(--situation-row-gap) var(--situation-column-gap);
  padding: 0 var(--situation-column-gap) var(--situation-column-gap);
  overflow: hidden;
  color: #dceceb;
  background: transparent;
  pointer-events: none;
}
.situation-layout {
  display: grid;
  grid-template-columns: var(--ui-panel-left) minmax(0, 1fr) var(--ui-panel-right);
  gap: var(--situation-column-gap);
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
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  background: rgba(5, 13, 12, 0.78);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(14px) saturate(1.05);
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
.situation-page :deep(.monitor-list),
.situation-page :deep(.data-panel) {
  margin-top: var(--side-panel-top-offset);
}
@media (max-width: 1500px) {
  .situation-layout {
    grid-template-columns: 330px minmax(0, 1fr) 360px;
  }
}
</style>
