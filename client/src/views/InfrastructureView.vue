<template>
  <div class="infra-page">
    <aside class="infra-panel facility-panel">
      <div class="panel-title">
        <div>
          <span>基础设施保障</span>
          <strong>{{ summary?.online_rate ?? 0 }}%</strong>
        </div>
        <button class="icon-button" title="刷新设施状态" @click="refresh">↻</button>
      </div>

      <div class="summary-grid">
        <div class="summary-item">
          <span>设施总数</span>
          <b>{{ summary?.total ?? 0 }}</b>
        </div>
        <div class="summary-item">
          <span>在线设施</span>
          <b class="green">{{ summary?.online ?? 0 }}</b>
        </div>
        <div class="summary-item">
          <span>异常设施</span>
          <b class="red">{{ summary?.fault ?? 0 }}</b>
        </div>
        <div class="summary-item">
          <span>待办工单</span>
          <b class="yellow">{{ summary?.pending_orders ?? 0 }}</b>
        </div>
      </div>

      <div class="filter-row">
        <select v-model="filterType" class="control">
          <option value="">全部类型</option>
          <option v-for="item in typeOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>
        <select v-model="filterStatus" class="control">
          <option value="">全部状态</option>
          <option value="online">在线</option>
          <option value="maintenance">维护中</option>
          <option value="fault">故障</option>
          <option value="offline">离线</option>
        </select>
      </div>
      <input v-model="keyword" class="control search-input" placeholder="搜索设备、型号、单位" />

      <div class="facility-list">
        <button
          v-for="facility in filteredFacilities"
          :key="facility.id"
          class="facility-card"
          :class="[statusTone(facility.status), { active: facility.id === selectedFacilityId }]"
          @click="selectFacility(facility.id)"
        >
          <div class="card-head">
            <strong>{{ facility.name }}</strong>
            <span class="badge" :class="statusTone(facility.status)">{{ facility.status_label }}</span>
          </div>
          <dl>
            <div><dt>类型</dt><dd>{{ facility.type_label }}</dd></div>
            <div><dt>覆盖</dt><dd>{{ facility.coverage_radius }}m / {{ facility.min_alt }}-{{ facility.max_alt }}m</dd></div>
            <div><dt>健康度</dt><dd>{{ facility.health_score }}%</dd></div>
          </dl>
        </button>
      </div>
    </aside>

    <main class="scene-pass-through">
      <div class="scene-metrics">
        <div v-for="item in summary?.by_type || []" :key="item.type" class="metric-chip">
          <span>{{ item.label }}</span>
          <b>{{ item.online }}/{{ item.count }}</b>
        </div>
      </div>
    </main>

    <aside class="infra-panel detail-panel">
      <template v-if="selectedFacility">
        <div class="detail-header">
          <div>
            <span>{{ selectedFacility.type_label }}</span>
            <h2>{{ selectedFacility.name }}</h2>
          </div>
          <span class="badge large" :class="statusTone(selectedFacility.status)">{{ selectedFacility.status_label }}</span>
        </div>

        <section>
          <h3>运行状态</h3>
          <div class="health-block">
            <div class="health-ring" :style="healthStyle(selectedFacility.health_score)">
              <b>{{ selectedFacility.health_score }}</b>
              <span>%</span>
            </div>
            <div class="info-grid">
              <div><span>型号</span><b>{{ selectedFacility.model || '-' }}</b></div>
              <div><span>部署高度</span><b>{{ selectedFacility.alt || 0 }}m</b></div>
              <div><span>所属单位</span><b>{{ selectedFacility.owner_unit || '-' }}</b></div>
              <div><span>运维单位</span><b>{{ selectedFacility.maintenance_unit || '-' }}</b></div>
            </div>
          </div>
          <div class="status-actions">
            <button @click="setStatus('online')">置为在线</button>
            <button @click="setStatus('maintenance')">维护中</button>
            <button @click="setStatus('fault')">标记故障</button>
          </div>
        </section>

        <section>
          <div class="section-head">
            <h3>覆盖能力</h3>
            <button class="tool-button" :class="{ active: coverageEvaluation }" @click="runCoverageEvaluation">
              {{ coverageEvaluation ? '取消评估' : '航线覆盖评估' }}
            </button>
          </div>
          <div class="capability-grid">
            <div>
              <span>覆盖半径</span>
              <b>{{ selectedFacility.coverage_radius }}m</b>
            </div>
            <div>
              <span>高度范围</span>
              <b>{{ selectedFacility.min_alt }}-{{ selectedFacility.max_alt }}m</b>
            </div>
            <div>
              <span>能力标签</span>
              <b>{{ capabilityText(selectedFacility.capabilities) }}</b>
            </div>
            <div>
              <span>下次维护</span>
              <b>{{ shortTime(selectedFacility.next_maintenance_time) }}</b>
            </div>
          </div>
          <div v-if="coverageEvaluation" class="coverage-result in-card">
            <span>{{ evaluatedRouteName }}</span>
            <strong>{{ coverageEvaluation.overall_score }}</strong>
            <em>受影响 {{ coverageEvaluation.blind_zones.length }} 段</em>
          </div>
        </section>

        <section>
          <h3>实时指标</h3>
          <div class="metrics-grid">
            <div v-for="(value, key) in selectedFacility.metrics" :key="key">
              <span>{{ metricLabel(key) }}</span>
              <b>{{ formatMetric(value) }}</b>
            </div>
          </div>
        </section>

        <section>
          <div class="section-head">
            <h3>关联告警</h3>
            <span>{{ facilityAlerts.length }}</span>
          </div>
          <div class="event-list">
            <div v-if="!facilityAlerts.length" class="empty">暂无关联告警</div>
            <article v-for="alert in facilityAlerts" :key="alert.id" class="event-item">
              <div>
                <strong>{{ alert.title }}</strong>
                <span>{{ alert.description }}</span>
              </div>
              <button @click="createOrder(alert)">转工单</button>
            </article>
          </div>
        </section>

        <section>
          <div class="section-head">
            <h3>维护工单</h3>
            <span>{{ facilityOrders.length }}</span>
          </div>
          <div class="event-list">
            <div v-if="!facilityOrders.length" class="empty">暂无维护工单</div>
            <article v-for="order in facilityOrders" :key="order.id" class="event-item">
              <div>
                <strong>{{ orderTypeLabel(order.order_type) }} · {{ order.assignee || '未派发' }}</strong>
                <span>{{ order.description || '-' }}</span>
              </div>
              <button v-if="order.status !== 'completed'" @click="completeOrder(order.id)">完成</button>
              <em v-else>已完成</em>
            </article>
          </div>
        </section>
      </template>
      <div v-else class="empty-detail">暂无设施数据</div>
    </aside>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfrastructureStore } from '../stores/infrastructure'
import { useWdpEngine } from '../composables/useWdpEngine'
import { useWdpEntities } from '../composables/useWdpEntities'
import { useGlobalSearch } from '../composables/useGlobalSearch'
import { routes } from '../data/situationMock'

const store = useInfrastructureStore()
const { summary, facilities, alerts, orders, selectedFacilityId, selectedFacility, coverageEvaluation } = storeToRefs(store)
const { isSceneReady } = useWdpEngine()
const { getApp, batchAddEntities, buildFacilityDescriptors, removeFacilityEntity, buildCoverageEvaluationDescriptors, removeCoverageEvaluationEntities, focusEntity, registerEntityClick } = useWdpEntities()
const { globalSearchQuery } = useGlobalSearch()

const filterType = ref('')
const filterStatus = ref('')
const keyword = ref('')
const evaluatedRoute = ref([])
const evaluatedRouteName = ref('未评估航线')
const drawnFacilityIds = new Set()

const typeOptions = [
  { value: '5ga', label: '5G-A通感站' },
  { value: 'radar', label: '低空雷达' },
  { value: 'counter_uas', label: '反无人机装置' },
  { value: 'communication', label: '通信保障装置' },
  { value: 'identification', label: '识别装置' }
]

const activeKeyword = computed(() => (keyword.value || globalSearchQuery.value).trim().toLowerCase())

const filteredFacilities = computed(() => facilities.value.filter((facility) => {
  const text = `${facility.name || ''} ${facility.model || ''} ${facility.owner_unit || ''}`.toLowerCase()
  return (!filterType.value || facility.type === filterType.value)
    && (!filterStatus.value || facility.status === filterStatus.value)
    && (!activeKeyword.value || text.includes(activeKeyword.value))
}))

const facilityAlerts = computed(() => alerts.value.filter(item => item.facility_id === selectedFacilityId.value && !['resolved', 'closed'].includes(item.status)))
const facilityOrders = computed(() => orders.value.filter(item => item.facility_id === selectedFacilityId.value))

async function refresh() {
  await store.fetchAll()
  await drawFacilities()
}

function selectFacility(id) {
  store.selectFacility(id)
  focusFacility(id)
}

async function onSceneReady() {
  await clearSceneOverlays()
  await drawFacilities()
  setupEntityClick()
}

async function clearSceneOverlays() {
  const App = getApp()
  if (!App || !isSceneReady.value) return
  try {
    if (App.Scene?.Covering?.Clear) {
      await App.Scene.Covering.Clear()
    } else {
      await App.Scene.ClearByTypes?.(['Poi', 'Path', 'Range', 'Particle', 'Effects'])
    }
  } catch (e) {
    console.warn('[Infrastructure] 清除场景覆盖物失败:', e)
  }
  drawnFacilityIds.clear()
}

async function drawFacilities() {
  const App = getApp()
  if (!App || !isSceneReady.value) return

  for (const id of drawnFacilityIds) {
    await removeFacilityEntity(App, id)
  }
  drawnFacilityIds.clear()

  const descriptors = []
  for (const facility of filteredFacilities.value) {
    descriptors.push(...buildFacilityDescriptors(App, facility))
    drawnFacilityIds.add(facility.id)
  }
  await batchAddEntities(App, descriptors)
}

function setupEntityClick() {
  const App = getApp()
  if (!App) return
  registerEntityClick(App, ({ type, id }) => {
    if (type === 'facility') store.selectFacility(id)
  })
}

async function focusSelected() {
  await focusFacility(selectedFacilityId.value)
}

async function focusFacility(id) {
  const App = getApp()
  if (!App || !id) return
  await focusEntity(App, 'facility', id)
}

async function setStatus(status) {
  if (!selectedFacility.value) return
  const health = status === 'online' ? Math.max(selectedFacility.value.health_score || 0, 88) : status === 'fault' ? 38 : 68
  await store.updateFacilityStatus(selectedFacility.value.id, { status, health_score: health })
  await drawFacilities()
}

async function createOrder(alert) {
  await store.createOrderFromAlert(alert)
}

async function completeOrder(id) {
  await store.completeOrder(id)
}

async function runCoverageEvaluation() {
  if (coverageEvaluation.value) {
    await cancelCoverageEvaluation()
    return
  }
  const route = nearestRouteToSelectedFacility()
  if (!route?.path?.length) return
  evaluatedRouteName.value = route.name || route.id
  evaluatedRoute.value = route.path.map(([lon, lat], index) => [lon, lat, 120 + Math.min(index * 10, 80)])
  const result = await store.evaluateRoute(evaluatedRoute.value)
  await drawCoverageEvaluation(result)
}

async function cancelCoverageEvaluation() {
  const App = getApp()
  if (App && isSceneReady.value) {
    await removeCoverageEvaluationEntities(App)
  }
  evaluatedRoute.value = []
  evaluatedRouteName.value = '未评估航线'
  store.coverageEvaluation = null
}

async function drawCoverageEvaluation(result) {
  const App = getApp()
  if (!App || !isSceneReady.value || evaluatedRoute.value.length < 2) return
  await removeCoverageEvaluationEntities(App)
  await batchAddEntities(App, buildCoverageEvaluationDescriptors(App, evaluatedRoute.value, result))
}

function nearestRouteToSelectedFacility() {
  if (!routes.length) return null
  if (!selectedFacility.value) return routes[0]
  let best = routes[0]
  let bestDistance = Infinity
  for (const route of routes) {
    for (const point of route.path || []) {
      const distance = roughDistanceMeters([selectedFacility.value.lon, selectedFacility.value.lat], point)
      if (distance < bestDistance) {
        bestDistance = distance
        best = route
      }
    }
  }
  return best
}

function roughDistanceMeters(a, b) {
  const lonMeters = (a[0] - b[0]) * 111320 * Math.cos((a[1] * Math.PI) / 180)
  const latMeters = (a[1] - b[1]) * 110540
  return Math.sqrt(lonMeters * lonMeters + latMeters * latMeters)
}

function statusTone(status) {
  if (status === 'online') return 'is-green'
  if (status === 'maintenance') return 'is-yellow'
  if (status === 'fault') return 'is-red'
  return 'is-muted'
}

function healthStyle(value) {
  const color = value >= 85 ? '#17e18a' : value >= 65 ? '#ffc333' : '#ff4d42'
  return { background: `conic-gradient(${color} ${value * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }
}

function capabilityText(value = []) {
  const labels = {
    communication: '通信',
    sensing: '通感',
    surveillance: '监视',
    identification: '识别',
    countermeasure: '反制'
  }
  return value.map(item => labels[item] || item).join(' / ') || '-'
}

function metricLabel(key) {
  const labels = {
    latency_ms: '链路时延',
    uplink_mbps: '上行带宽',
    load_percent: '负载率',
    connected_targets: '连接目标',
    refresh_rate_s: '刷新周期',
    track_quality: '航迹质量',
    targets: '目标数',
    blind_zone_count: '盲区数',
    standby: '待机状态',
    power_percent: '功率余量',
    authorized: '授权状态',
    response_level: '响应级别',
    packet_loss_percent: '丢包率',
    bandwidth_mbps: '带宽',
    backup_link: '备用链路',
    battery_percent: '电量',
    identify_rate: '识别率',
    remote_id_quality: 'ID质量',
    active_targets: '活跃目标',
    noise_floor: '噪声底'
  }
  return labels[key] || key
}

function formatMetric(value) {
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (typeof value === 'number' && value > 0 && value < 1) return `${Math.round(value * 100)}%`
  return String(value)
}

function shortTime(value) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

function orderTypeLabel(type) {
  const labels = { repair: '维修', inspection: '巡检', calibration: '校准', upgrade: '升级' }
  return labels[type] || type
}

onMounted(() => {
  refresh()
  if (isSceneReady.value) {
    onSceneReady()
  } else {
    const stop = watch(isSceneReady, (ready) => {
      if (ready) {
        onSceneReady()
        stop()
      }
    })
  }
})

watch(selectedFacilityId, () => focusSelected())
watch([filterType, filterStatus, keyword, globalSearchQuery], async () => {
  if (filteredFacilities.value.length && !filteredFacilities.value.some((facility) => facility.id === selectedFacilityId.value)) {
    store.selectFacility(filteredFacilities.value[0].id)
  }
  await drawFacilities()
})

onBeforeUnmount(async () => {
  const App = getApp()
  if (!App) return
  for (const id of drawnFacilityIds) {
    await removeFacilityEntity(App, id)
  }
  await removeCoverageEvaluationEntities(App)
  drawnFacilityIds.clear()
})
</script>

<style scoped>
.infra-page {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr) 410px;
  gap: 8px;
  padding: 0 8px 8px;
  color: #dceceb;
  pointer-events: none;
}
.infra-panel {
  min-height: 0;
  overflow: hidden;
  pointer-events: auto;
  border: 1px solid rgba(83, 119, 120, 0.32);
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(8, 25, 27, 0.94), rgba(4, 17, 18, 0.92));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 0 28px rgba(0,0,0,0.28);
}
.facility-panel,
.detail-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
}
.panel-title,
.detail-header,
.section-head,
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.panel-title span,
.detail-header span,
.summary-item span,
.info-grid span,
.capability-grid span,
.metrics-grid span {
  color: #8fa9a8;
  font-size: 12px;
}
.panel-title strong {
  color: #17e18a;
  font-size: 26px;
}
.icon-button,
.tool-button,
.status-actions button,
.event-item button {
  border: 1px solid rgba(23, 225, 138, 0.42);
  border-radius: 5px;
  background: rgba(23, 225, 138, 0.1);
  color: #eafff8;
  cursor: pointer;
  transition: all 0.15s ease;
}
.icon-button {
  width: 34px;
  height: 34px;
}
.icon-button:hover,
.tool-button:hover,
.status-actions button:hover,
.event-item button:hover {
  border-color: #17e18a;
  box-shadow: 0 0 12px rgba(23, 225, 138, 0.22);
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.summary-item {
  padding: 10px;
  border: 1px solid rgba(88, 122, 123, 0.28);
  border-radius: 5px;
  background: rgba(5, 17, 18, 0.52);
}
.summary-item b {
  display: block;
  margin-top: 4px;
  font-size: 22px;
}
.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.control {
  width: 100%;
  height: 36px;
  border: 1px solid rgba(93, 122, 123, 0.35);
  border-radius: 5px;
  background: rgba(10, 25, 25, 0.86);
  color: #dceeed;
  padding: 0 10px;
  outline: none;
}
.search-input {
  flex-shrink: 0;
}
.facility-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}
.facility-card {
  width: 100%;
  padding: 13px;
  border: 1px solid rgba(80, 111, 112, 0.35);
  border-radius: 6px;
  background: rgba(7, 22, 23, 0.76);
  color: #dceceb;
  text-align: left;
  cursor: pointer;
}
.facility-card.active {
  border-color: currentColor;
  box-shadow: inset 0 0 0 1px currentColor, 0 0 22px color-mix(in srgb, currentColor 24%, transparent);
}
.facility-card strong {
  color: #eafff8;
  font-size: 15px;
}
dl {
  display: grid;
  gap: 5px;
  margin: 8px 0 0;
}
dl div {
  display: grid;
  grid-template-columns: 68px 1fr;
}
dt { color: #8aa2a1; }
dd { margin: 0; color: #d2e1df; }
.badge {
  display: inline-flex;
  align-items: center;
  height: 23px;
  padding: 0 8px;
  border: 1px solid currentColor;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.badge.large { height: 28px; padding: 0 12px; }
.scene-pass-through {
  position: relative;
  min-width: 0;
  pointer-events: none;
}
.scene-metrics {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}
.metric-chip,
.coverage-result {
  border: 1px solid rgba(83, 119, 120, 0.32);
  border-radius: 6px;
  background: rgba(4, 17, 18, 0.76);
  backdrop-filter: blur(8px);
}
.metric-chip {
  padding: 10px 12px;
}
.metric-chip span { color: #8fa9a8; font-size: 12px; }
.metric-chip b { display: block; margin-top: 2px; color: #eafff8; font-size: 20px; }
.tool-button {
  height: 36px;
  padding: 0 14px;
}
.tool-button.active {
  color: #03100e;
  background: #17e18a;
}
.coverage-result {
  display: grid;
  grid-template-columns: auto auto auto;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
}
.coverage-result.in-card {
  margin-top: 10px;
  background: rgba(10, 25, 25, 0.5);
}
.coverage-result span,
.coverage-result em { color: #b7c9c8; font-style: normal; }
.coverage-result strong { color: #17e18a; font-size: 26px; }
.detail-panel {
  overflow-y: auto;
}
.detail-header h2 {
  margin: 2px 0 0;
  color: #eafff8;
  font-size: 20px;
}
section {
  padding: 12px;
  border: 1px solid rgba(88, 122, 123, 0.28);
  border-radius: 5px;
  background: rgba(5, 17, 18, 0.52);
}
h3 {
  margin: 0 0 10px;
  color: #eafff7;
  font-size: 15px;
}
.health-block {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 14px;
  align-items: center;
}
.health-ring {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  position: relative;
}
.health-ring::after {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: #071617;
}
.health-ring b,
.health-ring span {
  position: absolute;
  left: 50%;
  z-index: 1;
}
.health-ring b {
  top: 43%;
  color: #eafff8;
  font-size: 22px;
  line-height: 1;
  transform: translate(-50%, -50%);
}
.health-ring span {
  top: 64%;
  color: #8fa9a8;
  font-size: 13px;
  line-height: 1;
  transform: translate(-50%, -50%);
}
.info-grid,
.capability-grid,
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
}
.info-grid div,
.capability-grid div,
.metrics-grid div {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.info-grid b,
.capability-grid b,
.metrics-grid b {
  color: #dceeed;
  overflow-wrap: anywhere;
}
.status-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
}
.status-actions button,
.event-item button {
  height: 32px;
  padding: 0 10px;
}
.event-list {
  display: grid;
  gap: 8px;
}
.event-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border: 1px solid rgba(88, 122, 123, 0.22);
  border-radius: 5px;
  background: rgba(10, 25, 25, 0.5);
}
.event-item div {
  display: grid;
  gap: 3px;
  min-width: 0;
}
.event-item strong { color: #eafff8; font-size: 13px; }
.event-item span { color: #9fb5b4; font-size: 12px; overflow-wrap: anywhere; }
.event-item em { color: #17e18a; font-style: normal; font-size: 12px; }
.empty,
.empty-detail {
  color: #8fa9a8;
  font-size: 13px;
}
.empty-detail {
  margin: auto;
}
.green,
.is-green { color: #17e18a; }
.yellow,
.is-yellow { color: #ffc333; }
.red,
.is-red { color: #ff4d42; }
.is-muted { color: #8aa1a2; }
@media (max-width: 1500px) {
  .infra-page {
    grid-template-columns: 330px minmax(0, 1fr) 360px;
  }
  .scene-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
