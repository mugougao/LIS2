/**
 * useOverlayManager.js — 覆盖物管理层
 *
 * 职责：负责从后端获取数据、管理覆盖物生命周期（初始化、增量增删）。
 *       调用 useWdpEntities 中的绘制函数完成实际渲染。
 *
 * 引用者：WdpViewer.vue
 *
 * 依赖：
 *   useWdpEntities → 绘制/删除函数
 *   usePlansStore   → 飞行计划数据
 *   useNoFlyStore   → 禁飞区数据
 *   useConflictStore → 冲突事件数据
 */

import { useWdpEntities } from './useWdpEntities'
import { usePlansStore } from '../stores/plans'
import { useNoFlyStore } from '../stores/nofly'
import { useConflictStore } from '../stores/conflict'

// ============================================================
//  初始化 — 从后端获取全部数据
// ============================================================

async function fetchAllData() {
  const plansStore = usePlansStore()
  const noflyStore = useNoFlyStore()
  const conflictStore = useConflictStore()

  await Promise.all([
    plansStore.fetchPlans(),
    plansStore.fetchOperators(),
    noflyStore.fetchZones(),
    conflictStore.fetchConflicts()
  ])
}

// ============================================================
//  全量初始化绘制
// ============================================================

async function initOverlays() {
  const { getApp, isSceneReady } = getSharedState()

  const App = getApp()
  if (!App || !isSceneReady.value) return

  const plansStore = usePlansStore()
  const noflyStore = useNoFlyStore()
  const conflictStore = useConflictStore()

  await drawAllPlans(App, plansStore.plans)
  await drawAllZones(App, noflyStore.zones)
  await drawAllConflicts(App, conflictStore.conflicts)
}

// 离开页面时清空覆盖物（仅清场景中的图元，不动 store 数据）
async function clearOverlays() {
  const { getApp, isSceneReady } = getSharedState()
  const App = getApp()
  if (!App || !isSceneReady.value) return
  await App?.Scene?.ClearByTypes?.(['Poi', 'Path', 'Polygon'])
}

// ============================================================
//  飞行计划 — 增 / 删
// ============================================================

async function drawAllPlans(App, plans) {
  const { drawPlanPath, drawPlanDeparture, drawPlanArrival, removePlanEntity } = getSharedState()

  for (const plan of plans) {
    await removePlanEntity(App, plan.id)
    await drawPlanPath(App, plan)
    await drawPlanDeparture(App, plan)
    await drawPlanArrival(App, plan)
  }
}

async function addPlan(plan) {
  const { getApp, isSceneReady, drawPlanPath, drawPlanDeparture, drawPlanArrival } = getSharedState()

  const App = getApp()
  if (!App || !isSceneReady.value) return

  await drawPlanPath(App, plan)
  await drawPlanDeparture(App, plan)
  await drawPlanArrival(App, plan)
}

async function removePlan(id) {
  const { getApp, isSceneReady, removePlanEntity } = getSharedState()

  const App = getApp()
  if (!App || !isSceneReady.value) return

  await removePlanEntity(App, id)
}

// ============================================================
//  禁飞区 — 增 / 删
// ============================================================

async function drawAllZones(App, zones) {
  const { drawNoFlyZone, removeZoneEntity } = getSharedState()

  for (const zone of zones) {
    await removeZoneEntity(App, zone.id)
    await drawNoFlyZone(App, zone)
  }
}

async function addZone(zone) {
  const { getApp, isSceneReady, drawNoFlyZone } = getSharedState()

  const App = getApp()
  if (!App || !isSceneReady.value) return

  await drawNoFlyZone(App, zone)
}

async function removeZone(id) {
  const { getApp, isSceneReady, removeZoneEntity } = getSharedState()

  const App = getApp()
  if (!App || !isSceneReady.value) return

  await removeZoneEntity(App, id)
}

// ============================================================
//  冲突事件 — 增 / 删
// ============================================================

async function drawAllConflicts(App, conflicts) {
  const { drawConflictPoint, removeConflictEntity } = getSharedState()

  const active = conflicts.filter(c => c.status !== 'resolved')

  for (const c of active) {
    await removeConflictEntity(App, c.id)
    await drawConflictPoint(App, c)
  }
}

async function addConflict(conflict) {
  const { getApp, isSceneReady, drawConflictPoint } = getSharedState()

  const App = getApp()
  if (!App || !isSceneReady.value) return

  await drawConflictPoint(App, conflict)
}

async function removeConflict(id) {
  const { getApp, isSceneReady, removeConflictEntity } = getSharedState()

  const App = getApp()
  if (!App || !isSceneReady.value) return

  await removeConflictEntity(App, id)
}

// ============================================================
//  增量同步回调（供 WdpViewer.vue watch 使用）
// ============================================================

async function onPlansChange(newPlans, oldPlans) {
  const { getApp, isSceneReady, drawPlanPath, drawPlanDeparture, drawPlanArrival, removePlanEntity } = getSharedState()
  const App = getApp()
  if (!isSceneReady.value || !App) return

  const oldMap = new Map((oldPlans || []).map(p => [p.id, p]))
  const newMap = new Map(newPlans.map(p => [p.id, p]))

  for (const [id] of oldMap) {
    if (!newMap.has(id)) {
      await removePlanEntity(App, id)
    }
  }

  for (const [id, plan] of newMap) {
    const existed = oldMap.has(id)
    if (existed) {
      await removePlanEntity(App, id)
    }
    await drawPlanPath(App, plan)
    await drawPlanDeparture(App, plan)
    await drawPlanArrival(App, plan)
  }
}

async function onNoFlyChange(newZones, oldZones) {
  const { getApp, isSceneReady, drawNoFlyZone, removeZoneEntity } = getSharedState()
  const App = getApp()
  if (!isSceneReady.value || !App) return

  const oldMap = new Map((oldZones || []).map(z => [z.id, z]))
  const newMap = new Map(newZones.map(z => [z.id, z]))

  for (const [id] of oldMap) {
    if (!newMap.has(id)) {
      await removeZoneEntity(App, id)
    }
  }

  for (const [id, zone] of newMap) {
    if (oldMap.has(id)) {
      await removeZoneEntity(App, id)
    }
    await drawNoFlyZone(App, zone)
  }
}

async function onConflictsChange(newConflicts, oldConflicts) {
  const { getApp, isSceneReady, drawConflictPoint, removeConflictEntity } = getSharedState()
  const App = getApp()
  if (!isSceneReady.value || !App) return

  const oldMap = new Map((oldConflicts || []).map(c => [c.id, c]))
  const newMap = new Map(newConflicts.map(c => [c.id, c]))

  for (const [id] of oldMap) {
    if (!newMap.has(id)) {
      await removeConflictEntity(App, id)
    }
  }

  for (const [id, conflict] of newMap) {
    if (oldMap.has(id)) {
      await removeConflictEntity(App, id)
    }
    await drawConflictPoint(App, conflict)
  }
}

// ============================================================
//  内部共享状态
// ============================================================

let _shared = null

function getSharedState() {
  if (!_shared) {
    _shared = useWdpEntities()
  }
  return _shared
}

// ============================================================
//  对外导出
// ============================================================

export function useOverlayManager() {
  return {
    fetchAllData,
    initOverlays,
    clearOverlays,
    addPlan,
    removePlan,
    addZone,
    removeZone,
    addConflict,
    removeConflict,
    onPlansChange,
    onNoFlyChange,
    onConflictsChange
  }
}
