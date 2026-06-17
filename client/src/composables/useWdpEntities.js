/**
 * useWdpEntities.js — WDP 3D 场景实体绘制层（抽象接口）
 *
 * 职责：定义基础绘制函数，内部实现由业务方自行填充。
 *       不包含数据获取、状态管理、实体缓存等逻辑。
 *
 * 引用者：useOverlayManager.js
 *
 * 依赖：useWdpEngine → 获取 WDP App 实例
 */

import { useWdpEngine } from './useWdpEngine'

// ============================================================
//  批量添加辅助
//  说明：将待添加实体按 calculateCoordZ 选项分组，每组调用一次
//        App.Scene.Add(objs, opt) 批量添加（参考批量创建方法）。
//        分组可保留各实体不同的贴地高度，同时大幅减少调用次数。
// ============================================================

async function batchAddEntities(App, descriptors) {
  if (!App || !descriptors || !descriptors.length) return
  const groups = new Map()
  for (const { obj, opt } of descriptors) {
    if (!obj) continue
    const key = opt ? JSON.stringify(opt) : ''
    if (!groups.has(key)) groups.set(key, { opt, objs: [] })
    groups.get(key).objs.push(obj)
  }
  for (const { opt, objs } of groups.values()) {
    try {
      const res = opt ? await App.Scene.Add(objs, opt) : await App.Scene.Add(objs)
      console.log('批量添加覆盖物成功', objs.length, res)
    } catch (e) {
      console.warn('[WdpEntities] 批量添加覆盖物失败:', e)
    }
  }
}

// ============================================================
//  构建函数（仅创建实体对象 + 坐标选项，不直接 Add）
//  返回 descriptor 数组：[{ obj, opt }, ...]，交由 batchAddEntities 批量添加
// ============================================================

function buildPlanDescriptors(App, plan) {
  const descriptors = []

  let coords = []
  if (plan.waypoints) {
    const geoJson = typeof plan.waypoints === 'string' ? JSON.parse(plan.waypoints) : plan.waypoints
    coords = geoJson.coordinates || []
  }

  const path = new App.Path({
    "polyline": {
      "coordinates": coords
    },
    "pathStyle": {
      "type": "arrow",
      "width": 50,
      "speedupFactor": 1,
      "opacity": 1,
      "color": "b4fed7",
      "passColor": "ffb3deff"
    },
    "entityName": `plan-${plan.id}`,
    "customId": `plan-path-${plan.id}`,
    "customData": {
      "data": plan.id
    }
  })
  descriptors.push({
    obj: path,
    opt: { calculateCoordZ: { coordZRef: "Ground" } }
  })

  const departure = new App.Poi({
    "location": [plan.start_lon, plan.start_lat, plan.start_alt],
    "poiStyle": {
      markerVisible: true,
      markerNormalUrl: 'http://42.121.160.120:5151/UP.png',
      markerActivateUrl: 'http://42.121.160.120:5151/UP.png',
      markerSize: [80, 100],
      labelVisible: true,
      labelContent: [plan.plan_name || plan.id.substring(0, 8), 'FFFFFFFF', '12'],
      labelBgImageUrl: 'http://42.121.160.120:5151/lable.png',
      labelBgSize: [80, 20],
      labelBgOffset: [-40, 125],
      textBoxWidth: 80,
      labelContentJustification: 'Center',
      labelContentOffset: [0, 3],
      labelTop: true
    },
    customId: `plan-departure-${plan.id}`,
    bVisible: true
  })
  descriptors.push({
    obj: departure,
    opt: { calculateCoordZ: { coordZRef: "ground", coordZOffset: plan.start_alt } }
  })

  const arrival = new App.Poi({
    "location": [plan.end_lon, plan.end_lat, plan.end_alt],
    "poiStyle": {
      markerVisible: true,
      markerNormalUrl: 'http://42.121.160.120:5151/Down.png',
      markerActivateUrl: 'http://42.121.160.120:5151/Down.png',
      markerSize: [80, 100],
      labelVisible: true,
      labelContent: [plan.plan_name || plan.id.substring(0, 8), 'FFFFFFFF', '12'],
      labelBgImageUrl: 'http://42.121.160.120:5151/lable.png',
      labelBgSize: [80, 20],
      labelBgOffset: [-40, 125],
      textBoxWidth: 80,
      labelContentJustification: 'Center',
      labelContentOffset: [0, 3],
      labelTop: true
    },
    customId: `plan-arrival-${plan.id}`,
    bVisible: true
  })
  descriptors.push({
    obj: arrival,
    opt: { calculateCoordZ: { coordZRef: "ground", coordZOffset: plan.end_alt } }
  })

  return descriptors
}

function buildZoneDescriptors(App, zone) {
  let geometry = zone.geometry
  if (typeof geometry === 'string') {
    try { geometry = JSON.parse(geometry) } catch { return [] }
  }
  if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
    console.warn('[WdpEntities] 禁飞区几何数据无效:', zone.id)
    return []
  }
  const coords = geometry.coordinates[0]
  if (!coords || coords.length < 3) {
    console.warn('[WdpEntities] 禁飞区多边形点数不足:', zone.id)
    return []
  }

  const minAlt = zone.min_alt || 0
  const maxAlt = zone.max_alt || 500
  const height = maxAlt - minAlt

  const range = new App.Range({
    "polygon2D": {
      "coordinates": [coords]
    },
    "rangeStyle": {
      "shape": "polygon",
      "type": "loop_line",
      "fillAreaType": "block",
      "height": height,
      "strokeWeight": 10,
      "color": "ff3772ff",
      "fillAreaColor": "fa34008f",
      "bBlocked": false
    },
    "bVisible": true,
    "entityName": zone.name || zone.id.substring(0, 8),
    "customId": `nofly-${zone.id}`,
    "customData": {
      "data": zone.id
    }
  })

  let centerLon = 0
  let centerLat = 0
  coords.forEach(([lon, lat]) => {
    centerLon += lon
    centerLat += lat
  })
  centerLon /= coords.length
  centerLat /= coords.length

  const label = new App.Poi({
    "location": [centerLon, centerLat, minAlt + height / 2],
    "poiStyle": {
      markerVisible: false,
      labelVisible: true,
      labelContent: [zone.name || zone.id.substring(0, 8), 'FFFFFFFF', '12'],
      labelBgImageUrl: 'http://42.121.160.120:5151/lable.png',
      labelBgSize: [80, 20],
      labelBgOffset: [-40, 0],
      textBoxWidth: 80,
      labelContentJustification: 'Center',
      labelContentOffset: [0, 3]
    },
    customId: `nofly-label-${zone.id}`,
    bVisible: true
  })

  return [
    { obj: range, opt: { calculateCoordZ: { coordZRef: "surface", coordZOffset: minAlt } } },
    { obj: label, opt: { calculateCoordZ: { coordZRef: "surface", coordZOffset: minAlt + height / 2 } } }
  ]
}

async function drawConflictPoint(App, c) {
  // TODO: 在冲突位置绘制圆形标记，按严重程度着色
}

// ============================================================
//  空域 Range 绘制
// ============================================================

// 列表颜色名 → WDP 颜色（HEXA，前6位颜色，后2位透明度）
const AIRSPACE_COLOR_HEX = {
  green: '17e18a',
  yellow: 'ffc333',
  red: 'ff4d42',
  cyan: '20d7ff',
  blue: '4a9fff',
  muted: '7c9090'
}

// 空域中心 label 文字：名称 · 状态
function airspaceLabelText(airspace) {
  const name = airspace.name || airspace.id
  return airspace.status ? `${name} · ${airspace.status}` : name
}

function buildAirspaceDescriptors(App, airspace) {
  const coords = airspace.boundary
  if (!coords || coords.length < 3) {
    console.warn('[WdpEntities] 空域边界数据无效:', airspace.id)
    return []
  }

  const minAlt = airspace.minAltitude || 0
  const maxAlt = airspace.maxAltitude || 300
  const height = Math.max(maxAlt - minAlt, 1)
  const hex = AIRSPACE_COLOR_HEX[airspace.color] || AIRSPACE_COLOR_HEX.cyan

  const range = new App.Range({
    "polygon2D": {
      "coordinates": [coords]
    },
    "rangeStyle": {
      "shape": "polygon",
      "type": "box_wave",
      "fillAreaType": "block",
      "height": height,
      "strokeWeight": 8,
      "color": hex + '33',
      "fillAreaColor": hex + '33',
      "bBlocked": false
    },
    "bVisible": true,
    "entityName": airspace.name || airspace.id,
    "customId": `airspace-${airspace.id}`,
    "customData": {
      "data": airspace.id
    }
  })

  // 中心点标签
  let centerLon = 0
  let centerLat = 0
  coords.forEach(([lon, lat]) => {
    centerLon += lon
    centerLat += lat
  })
  centerLon /= coords.length
  centerLat /= coords.length

  const label = new App.Poi({
    "location": [centerLon, centerLat, minAlt + height / 2],
    "poiStyle": {
      markerVisible: false,
      labelVisible: true,
      labelContent: [airspaceLabelText(airspace), 'FFFFFFFF', '12'],
      labelBgImageUrl: 'http://42.121.160.120:5151/lable.png',
      labelBgSize: [160, 20],
      labelBgOffset: [-80, 0],
      textBoxWidth: 160,
      labelContentJustification: 'Center',
      labelContentOffset: [0, 3]
    },
    "customId": `airspace-label-${airspace.id}`,
    bVisible: true
  })

  return [
    { obj: range, opt: { calculateCoordZ: { coordZRef: "Ground", coordZOffset: minAlt } } },
    { obj: label, opt: { calculateCoordZ: { coordZRef: "surface", coordZOffset: minAlt + height / 2 } } }
  ]
}

async function removeAirspaceEntity(App, id) {
  const ids = [`airspace-${id}`, `airspace-label-${id}`]
  try {
    await App.Scene.ClearByCustomId(ids)
  } catch (e) {
    console.warn(`ClearByCustomId(${ids}) 失败:`, e)
  }
}

// 更新单个空域 Range 的高度（切换航线/空域 tab 时用）
async function setAirspaceRangeHeight(App, airspace) {
  try {
    const hex = AIRSPACE_COLOR_HEX[airspace.color] || AIRSPACE_COLOR_HEX.cyan
    await App.Scene.UpdateByCustomId([`airspace-${airspace.id}`], {
      rangeStyle: { "type": "none", fillAreaType: "dot3",fillAreaColor: hex+'55'}
    })
  } catch (e) {
    console.warn('[WdpEntities] 更新空域高度失败:', airspace.id, e)
  }
}

// 更新单个空域 Range 的颜色（拖动时间轴、空域状态变化时用）
// 同步更新 range 颜色与中心 label 文字（名称 · 状态）
async function setAirspaceRangeColor(App, airspace) {
  try {
    const hex = AIRSPACE_COLOR_HEX[airspace.color] || AIRSPACE_COLOR_HEX.cyan
    await App.Scene.UpdateByCustomId([`airspace-${airspace.id}`], {
      rangeStyle: { color: hex + '33', fillAreaColor: hex + '33' }
    })
    await App.Scene.UpdateByCustomId([`airspace-label-${airspace.id}`], {
      poiStyle: { labelContent: [airspaceLabelText(airspace), 'FFFFFFFF', '12'] }
    })
  } catch (e) {
    console.warn('[WdpEntities] 更新空域颜色失败:', airspace.id, e)
  }
}

// ============================================================
//  航线 Path 绘制
// ============================================================

// 按梯形剖面为航线各点分配高度：起降段在 minAlt，巡航段在 maxAlt
function buildRouteCoordsWithAlt(path, minAlt, maxAlt) {
  const n = path.length
  if (n === 0) return []
  if (n === 1) return [[path[0][0], path[0][1], maxAlt]]
  return path.map(([lon, lat], i) => {
    const t = i / (n - 1)
    let ratio
    if (t < 0.2) ratio = t / 0.2
    else if (t > 0.8) ratio = (1 - t) / 0.2
    else ratio = 1
    const alt = minAlt + (maxAlt - minAlt) * ratio
    return [lon, lat, Math.round(alt)]
  })
}

function buildRouteDescriptors(App, route) {
  const path = route.path
  if (!path || path.length < 2) {
    console.warn('[WdpEntities] 航线坐标数据无效:', route.id)
    return []
  }

  const minAlt = route.minAltitude || 0
  const maxAlt = route.maxAltitude || 150
  const hex = AIRSPACE_COLOR_HEX[route.color] || AIRSPACE_COLOR_HEX.cyan
  const coords = buildRouteCoordsWithAlt(path, minAlt, maxAlt)

  const pathEntity = new App.Path({
    "polyline": {
      "coordinates": coords
    },
    "pathStyle": {
      "type": "arrow_dashed",
      "width": 60,
      "speedupFactor": 1,
      "opacity": 0.5,
      "color": hex+"0f",
      "passColor": hex
    },
    "entityName": route.name || route.id,
    "customId": `route-${route.id}`,
    "customData": {
      "data": route.id
    }
  })

  return [
    { obj: pathEntity, opt: { calculateCoordZ: { coordZRef: "Ground", coordZOffset: 100 } } }
  ]
}

async function removeRouteEntity(App, id) {
  try {
    await App.Scene.ClearByCustomId([`route-${id}`])
  } catch (e) {
    console.warn(`ClearByCustomId(route-${id}) 失败:`, e)
  }
}

// ============================================================
//  飞行器飞行动画（POI 沿路径移动 — Bound）
// ============================================================

// 飞行器类型 → POI marker 图片
const AIRCRAFT_MARKER = {
  '多旋翼无人机': 'http://42.121.160.120:5151/duozhou.png',
  '多旋翼': 'http://42.121.160.120:5151/duozhou.png',
  '直升机': 'http://42.121.160.120:5151/zhishengji.png'
}

const AIRCRAFT_SPEED = 15 // 移动速度（米/秒）

// 两个经纬度坐标间的球面距离（米）
function haversineMeters([lon1, lat1], [lon2, lat2]) {
  const R = 6371000
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

// 航线总长度（米）
function pathLengthMeters(coords) {
  let len = 0
  for (let i = 1; i < coords.length; i++) {
    len += haversineMeters(coords[i - 1], coords[i])
  }
  return len
}

// 绘制单架飞行器并沿路径循环移动；返回用于显隐控制的 POI 对象
async function drawAircraftFlight(App, flight, route) {
  const coords2d = route?.path
  if (!coords2d || coords2d.length < 2) {
    console.warn('[WdpEntities] 飞行器航线坐标无效:', flight.id)
    return null
  }

  const alt = flight.altitude || 100
  const coords = coords2d.map(([lon, lat]) => [lon, lat, alt])

  // 1. 路径（arrow 样式，不可见，用于绑定移动）
  const path = new App.Path({
    "polyline": { "coordinates": coords },
    "pathStyle": {
      "type": "arrow",
      "width": 40,
      "speedupFactor": 1,
      "opacity": 1,
      "color": "b4fed7",
      "passColor": "ffb3deff"
    },
    "customId": `aircraft-path-${flight.id}`,
    "bVisible": false
  })
  const pathRes = await App.Scene.Add(path, {
    calculateCoordZ: { coordZRef: "Ground", coordZOffset: alt }
  })
  if (!pathRes?.success) {
    console.warn('[WdpEntities] 飞行器路径添加失败:', flight.id)
    return null
  }

  // 2. 飞行器 POI
  const markerUrl = AIRCRAFT_MARKER[flight.type] || AIRCRAFT_MARKER['多旋翼无人机']
  const poi = new App.Poi({
    "location": [coords[0][0], coords[0][1], alt],
    "poiStyle": {
      markerVisible: true,
      markerNormalUrl: markerUrl,
      markerActivateUrl: markerUrl,
      markerSize: [50, 70],
      labelVisible: true,
      labelContent: [flight.name || flight.id, 'FFFFFFFF', '12'],
      labelBgImageUrl: 'http://42.121.160.120:5151/lable.png',
      labelBgSize: [80, 20],
      labelBgOffset: [-40, 110],
      textBoxWidth: 80,
      labelContentJustification: 'Center',
      labelContentOffset: [0, 3],
      labelTop: true
    },
    customId: `aircraft-${flight.id}`,
    bVisible: true
  })
  const poiRes = await App.Scene.Add(poi, {
    calculateCoordZ: { coordZRef: "Ground", coordZOffset: alt }
  })
  const poiObj = poiRes?.result?.object || poi

  // 3. 沿路径移动（Bound）：时长 = 航线长度 / 速度
  const time = Math.max(Math.round(pathLengthMeters(coords2d) / AIRCRAFT_SPEED), 1)
  const moveObj = new App.Bound({
    "moving": poiObj,
    "path": path,
    "boundStyle": {
      "time": time,
      "bLoop": true,
      "bReverse": false,
      "state": "play"
    },
    "customId": `aircraft-bound-${flight.id}`
  })
  await App.Scene.Add(moveObj)

  console.log('添加飞行器飞行动画成功', flight.id)
  return poiObj
}

async function removeAircraftEntity(App, id) {
  const ids = [`aircraft-${id}`, `aircraft-path-${id}`, `aircraft-bound-${id}`]
  try {
    await App.Scene.ClearByCustomId(ids)
  } catch (e) {
    console.warn(`ClearByCustomId(${ids}) 失败:`, e)
  }
}

// ============================================================
//  删除函数（通过 customId 调用 WDP Scene API）
// ============================================================

async function removePlanEntity(App, id) {
  console.log('删除计划覆盖物', id)
  const ids = [`plan-path-${id}`, `plan-departure-${id}`, `plan-arrival-${id}`]

    try {
      await App.Scene.ClearByCustomId(ids)
    } catch (e) {
      console.warn(`ClearByCustomId(${ids}) 失败:`, e)
    }
  
}

async function removeZoneEntity(App, id) {
  const ids = [`nofly-${id}`, `nofly-label-${id}`]
  try {
    await App.Scene.ClearByCustomId(ids)
    } catch (e) {
      console.warn(`ClearByCustomId(${ids}) 失败:`, e)
    }
  }


async function removeConflictEntity(App, id) {
  try {
    await App.Scene.ClearByCustomId(['conflict-${id}'])
  } catch (e) {
    console.warn(`ClearByCustomId(['conflict-${id}']) 失败:`, e)
  }
}

// ============================================================
//  POI / 实体 双向绑定（聚焦 + 点击）
// ============================================================

// customId 前缀 → 业务类型/ID 解析
// 注意：aircraft id 含连字符（如 UAV-021），需先匹配更长前缀
function parseEntityCustomId(customId) {
  if (!customId || typeof customId !== 'string') return null
  const rules = [
    ['airspace-label-', 'airspace'],
    ['airspace-', 'airspace'],
    ['aircraft-path-', 'aircraft'],
    ['aircraft-bound-', 'aircraft'],
    ['aircraft-', 'aircraft'],
    ['route-', 'route']
  ]
  for (const [prefix, type] of rules) {
    if (customId.startsWith(prefix)) {
      return { type, id: customId.slice(prefix.length) }
    }
  }
  return null
}

// 业务类型 + ID → 场景实体 customId
function entityCustomId(type, id) {
  if (type === 'airspace') return `airspace-${id}`
  if (type === 'route') return `route-${id}`
  if (type === 'aircraft') return `aircraft-${id}`
  return null
}

// 通过 customId 聚焦实体（卡片选中 / POI 点击时调用）
async function focusEntity(App, type, id) {
  const customId = entityCustomId(type, id)
  if (!App || !customId) return
  try {
    await App.CameraControl.FocusByCustomId([customId], {
      rotation: { pitch: -45, yaw: 0 },
      distanceFactor: 0.5,
      flyTime: 1
    })
  } catch (e) {
    console.warn('[WdpEntities] 聚焦实体失败:', customId, e)
  }
}

// 镜头跟随实体（飞行器沿路径移动时调用，传入 POI 对象）
async function followEntity(App, entity) {
  if (!App || !entity) return
  try {
    await App.CameraControl.Follow({
      followRotation: { pitch: -25, yaw: 0 },
      useRelativeRotation: true,
      distance: 300,
      bFPS: false,
      entity
    })
  } catch (e) {
    console.warn('[WdpEntities] 跟随实体失败:', e)
  }
}

// 停止镜头跟随
async function stopFollow(App) {
  if (!App) return
  try {
    await App.CameraControl.Stop()
  } catch (e) {
    console.warn('[WdpEntities] 停止跟随失败:', e)
  }
}

// 注册场景实体点击事件；callback({ type, id }) 由业务方处理选中
function registerEntityClick(App, callback) {
  if (!App) return
  App.Renderer.RegisterSceneEvent([{
    name: 'OnEntityClicked',
    func: async (res) => {
      const obj = res?.result?.object
      if (!obj) return
      let customId = obj.customId
      if (!customId && obj.GetCustomId) {
        try { customId = (await obj.GetCustomId())?.result } catch { /* ignore */ }
      }
      const parsed = parseEntityCustomId(customId)
      if (parsed) callback(parsed)
    }
  }])
}

// ============================================================
//  对外导出
// ============================================================

export function useWdpEntities() {
  const { getApp, isSceneReady } = useWdpEngine()

  return {
    getApp,
    isSceneReady,
    batchAddEntities,
    buildPlanDescriptors,
    buildZoneDescriptors,
    buildAirspaceDescriptors,
    buildRouteDescriptors,
    drawConflictPoint,
    removePlanEntity,
    removeZoneEntity,
    removeAirspaceEntity,
    removeConflictEntity,
    setAirspaceRangeHeight,
    setAirspaceRangeColor,
    removeRouteEntity,
    drawAircraftFlight,
    removeAircraftEntity,
    focusEntity,
    followEntity,
    stopFollow,
    registerEntityClick
  }
}
