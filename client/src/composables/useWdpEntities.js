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
//  绘制函数
// ============================================================

async function drawPlanPath(App, plan) {
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

  const res = await App.Scene.Add(path, {
  "calculateCoordZ": {  //[可选] 最高优先级
    "coordZRef": "Ground",//Surface:表面;Ground:地面;Altitude:海拔
  }
})
  console.log('添加航线成功', res)
}

async function drawPlanDeparture(App, plan) {
  const poi = new App.Poi({
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

  const res = await App.Scene.Add(poi, {
    calculateCoordZ: {
      coordZRef: "ground",
      coordZOffset: plan.start_alt
    }
  });
  console.log('添加起飞点成功', res)
}

async function drawPlanArrival(App, plan) {
  const poi = new App.Poi({
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

  const res = await App.Scene.Add(poi, {
    calculateCoordZ: {
      coordZRef: "ground",
      coordZOffset: plan.end_alt
    }
  });
  console.log('添加降落点成功', res)
}

async function drawNoFlyZone(App, zone) {
  let geometry = zone.geometry
  if (typeof geometry === 'string') {
    try { geometry = JSON.parse(geometry) } catch { return }
  }
  if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
    console.warn('[WdpEntities] 禁飞区几何数据无效:', zone.id)
    return
  }
  const coords = geometry.coordinates[0]
  if (!coords || coords.length < 3) {
    console.warn('[WdpEntities] 禁飞区多边形点数不足:', zone.id)
    return
  }
  console.log(coords)

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

  const res = await App.Scene.Add(range, {
    calculateCoordZ: {
      coordZRef: "surface",
      coordZOffset: minAlt
    }
  })
  console.log('添加禁飞区成功', res)

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

  const labelRes = await App.Scene.Add(label, {
    calculateCoordZ: {
      coordZRef: "surface",
      coordZOffset: minAlt + height / 2
    }
  })
  console.log('添加禁飞区标签成功', labelRes)
}

async function drawConflictPoint(App, c) {
  // TODO: 在冲突位置绘制圆形标记，按严重程度着色
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
//  对外导出
// ============================================================

export function useWdpEntities() {
  const { getApp, isSceneReady } = useWdpEngine()

  return {
    getApp,
    isSceneReady,
    drawPlanPath,
    drawPlanDeparture,
    drawPlanArrival,
    drawNoFlyZone,
    drawConflictPoint,
    removePlanEntity,
    removeZoneEntity,
    removeConflictEntity
  }
}
