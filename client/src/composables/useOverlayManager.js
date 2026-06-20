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

  await clearOverlayEntityTypes(App)

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
  await clearOverlayEntityTypes(App)
}

async function clearOverlayEntityTypes(App) {
  try {
    await App?.Scene?.ClearByTypes?.(['Path', 'Range', 'Poi'])
  } catch (e) {
    console.warn('[OverlayManager] 清理 Path/Range/Poi 失败:', e)
  }
}

// ============================================================
//  飞行计划 — 增 / 删
// ============================================================

async function drawAllPlans(App, plans) {
  const { buildPlanDescriptors, batchAddEntities } = getSharedState()

  const ids = []
  const descriptors = []
  for (const plan of plans) {
    ids.push(`plan-path-${plan.id}`, `plan-departure-${plan.id}`, `plan-arrival-${plan.id}`)
    descriptors.push(...buildPlanDescriptors(App, plan))
  }

  if (ids.length) {
    try { await App.Scene.ClearByCustomId(ids) } catch (e) { console.warn('ClearByCustomId 失败:', e) }
  }
  await batchAddEntities(App, descriptors)
}

async function addPlan(plan) {
  const { getApp, isSceneReady, buildPlanDescriptors, batchAddEntities } = getSharedState()

  const App = getApp()
  if (!App || !isSceneReady.value) return

  await batchAddEntities(App, buildPlanDescriptors(App, plan))
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
  const { buildZoneDescriptors, batchAddEntities, removeZoneEntity } = getSharedState()

  const ids = []
  const descriptors = []
  for (const zone of zones) {
    ids.push(`nofly-${zone.id}`, `nofly-label-${zone.id}`)
    descriptors.push(...buildZoneDescriptors(App, zone))
  }

  if (ids.length) {
    try { await App.Scene.ClearByCustomId(ids) } catch (e) { console.warn('ClearByCustomId 失败:', e) }
  }
  await batchAddEntities(App, descriptors)
}

async function addZone(zone) {
  const { getApp, isSceneReady, buildZoneDescriptors, batchAddEntities } = getSharedState()

  const App = getApp()
  if (!App || !isSceneReady.value) return

  await batchAddEntities(App, buildZoneDescriptors(App, zone))
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
  const { getApp, isSceneReady, buildPlanDescriptors, batchAddEntities, removePlanEntity } = getSharedState()
  const App = getApp()
  if (!isSceneReady.value || !App) return

  const oldMap = new Map((oldPlans || []).map(p => [p.id, p]))
  const newMap = new Map(newPlans.map(p => [p.id, p]))

  for (const [id] of oldMap) {
    if (!newMap.has(id)) {
      await removePlanEntity(App, id)
    }
  }

  const descriptors = []
  for (const [id, plan] of newMap) {
    if (oldMap.has(id)) {
      await removePlanEntity(App, id)
    }
    descriptors.push(...buildPlanDescriptors(App, plan))
  }
  await batchAddEntities(App, descriptors)
}

async function onNoFlyChange(newZones, oldZones) {
  const { getApp, isSceneReady, buildZoneDescriptors, batchAddEntities, removeZoneEntity } = getSharedState()
  const App = getApp()
  if (!isSceneReady.value || !App) return

  const oldMap = new Map((oldZones || []).map(z => [z.id, z]))
  const newMap = new Map(newZones.map(z => [z.id, z]))

  for (const [id] of oldMap) {
    if (!newMap.has(id)) {
      await removeZoneEntity(App, id)
    }
  }

  const descriptors = []
  for (const [id, zone] of newMap) {
    if (oldMap.has(id)) {
      await removeZoneEntity(App, id)
    }
    descriptors.push(...buildZoneDescriptors(App, zone))
  }
  await batchAddEntities(App, descriptors)
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
