<template>
  <header class="situation-topbar">
    <div class="brand">
      <img class="brand-logo" :src="logoUrl" alt="51LIS" />
      <span>51LIS低空智能监管系统</span>
    </div>
    <label class="search">
      <span>⌕</span>
      <input v-model="globalSearchQuery" placeholder="搜索空域、航线、飞行器、计划..." @keydown.enter="commitSearch" />
    </label>
    <nav class="module-nav">
      <router-link to="/conflict" class="module-link" :class="{ active: route.name === 'conflict' }">态势监控</router-link>
      <router-link to="/infrastructure" class="module-link" :class="{ active: route.name === 'infrastructure' }">基础设施</router-link>
      <router-link to="/" class="module-link" :class="{ active: route.name === 'main' }">规划管理</router-link>
    </nav>
    <div class="layer-switch">
      <button :class="{ active: windLayer }" @click="windLayer = !windLayer">风场</button>
      <button :class="{ active: beidouGrid }" :disabled="beidouGridBusy" @click="toggleBeidouGrid">北斗网格</button>
    </div>
    <div class="status-strip">
      <span>2024-05-24&nbsp;&nbsp;10:32:45</span>
      <span class="sun">☼</span>
      <span>24°C</span>
      <span class="dot red"></span><span>告警 <b>3</b></span>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWdpEngine } from '../../composables/useWdpEngine'
import { useGlobalSearch } from '../../composables/useGlobalSearch'
import { useSceneLayers } from '../../composables/useSceneLayers'
import logoUrl from '../../assets/logo.svg'

const route = useRoute()
const router = useRouter()
const { getApp, isSceneReady } = useWdpEngine()
const { globalSearchQuery } = useGlobalSearch()
const { windLayer } = useSceneLayers()
const beidouGrid = ref(false)
const beidouGridBusy = ref(false)
const beidouGridEids = ref([])

const BEIDOU_GRID_CREATE_PAYLOAD = {
  apiClassName: 'WdpSceneAPI',
  apiFuncName: 'CreateEntities',
  args: {
    createEntityParams: [
      {
        EntityType: 'BP_SpatialGrid_C',
        BasicInfoAtom: {
          entityName: 'myName1',
          customId: 'my-heatmap-id',
          customData: '{"data":"myCustomData"}'
        },
        SpatialGridAtom: {
          location: [113.93985159904898, 22.52340627715, 18.256940267753663],
          GridSize: 120,
          GridNumber: [100, 50, 5]
        }
      }
    ],
    operations: {
      calculateCoordZ: {
        coordZRef: 'surface',
        coordZOffset: 12
      }
    },
    guid: '1a7575d0-6bee-11f1-a001-bbd7954c13cd'
  }
}

function commitSearch() {
  const query = globalSearchQuery.value.trim()
  if (!query) return
  if (/基础|设施|雷达|5g|5G|反无人机|通信|识别|Remote/i.test(query)) {
    router.push('/infrastructure')
    return
  }
  if (/态势|空域|飞行器|监控/.test(query)) {
    router.push('/conflict')
    return
  }
  router.push('/')
}

async function toggleBeidouGrid() {
  if (beidouGridBusy.value) return
  const App = getApp()
  if (!App || !isSceneReady.value) {
    console.warn('[TopBar] WDP 场景未就绪，无法切换北斗网格')
    beidouGrid.value = false
    return
  }

  beidouGridBusy.value = true
  try {
    if (!beidouGrid.value) {
      const res = await App.Customize.RunCustomizeApi(BEIDOU_GRID_CREATE_PAYLOAD)
      const eids = res.result?.eids || []
      if (!eids.length) {
        console.warn('[TopBar] 北斗网格创建成功但未读取到 eid:', res)
      }
      beidouGridEids.value = eids
      beidouGrid.value = true
      return
    }

    if (beidouGridEids.value.length) {
      await App.Customize.RunCustomizeApi({
        apiClassName: 'WdpSceneAPI',
        apiFuncName: 'RemoveEntityByEids',
        args: {
          guid: '42b5b870-6bee-11f1-a001-bbd7954c13cd',
          eids: beidouGridEids.value
        }
      })
    }
    beidouGridEids.value = []
    beidouGrid.value = false
  } catch (e) {
    console.warn('[TopBar] 北斗网格切换失败:', e)
    beidouGrid.value = beidouGridEids.value.length > 0
  } finally {
    beidouGridBusy.value = false
  }
}

function collectEids(value, result = []) {
  if (!value || typeof value !== 'object') return result
  if (Array.isArray(value)) {
    for (const item of value) collectEids(item, result)
    return [...new Set(result)]
  }
  for (const [key, item] of Object.entries(value)) {
    if (key.toLowerCase() === 'eid' && (typeof item === 'string' || typeof item === 'number')) {
      result.push(String(item))
    } else if (item && typeof item === 'object') {
      collectEids(item, result)
    }
  }
  return [...new Set(result)]
}
</script>

<style scoped>
.situation-topbar {
  display: grid;
  grid-template-columns: 330px 300px minmax(300px, 1fr) 178px auto;
  align-items: center;
  gap: 14px;
  height: var(--ui-topbar-height);
  padding: 0 20px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(168, 255, 37, 0.16);
  background:
    linear-gradient(90deg, rgba(2, 7, 6, 0.98), rgba(6, 15, 13, 0.94) 50%, rgba(2, 7, 6, 0.98)),
    radial-gradient(circle at 42% 0%, rgba(118, 185, 0, 0.16), transparent 36%);
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.34), inset 0 -1px 0 rgba(255, 255, 255, 0.035);
  backdrop-filter: blur(14px);
  z-index: 30;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: #f4fffb;
  font-family: 'AlimamaShuHeiTi-Bold', 'Microsoft YaHei', 'PingFang SC', sans-serif;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0;
  white-space: nowrap;
}
.brand-logo {
  position: relative;
  top: 2px;
  width: 58px;
  height: 44px;
  flex: 0 0 auto;
  object-fit: contain;
  filter: drop-shadow(0 0 12px rgba(168, 255, 37, 0.12));
}
.brand span {
  flex: 0 0 auto;
}
.search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(148, 175, 164, 0.24);
  border-radius: 8px;
  background: rgba(5, 13, 12, 0.72);
  color: #8da49d;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.search:focus-within {
  border-color: rgba(168, 255, 37, 0.58);
  box-shadow: 0 0 0 3px rgba(118, 185, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.045);
}
.search span {
  position: relative;
  width: 15px;
  height: 15px;
  flex: 0 0 15px;
  font-size: 0;
}
.search span::before {
  content: '';
  position: absolute;
  inset: 1px 4px 4px 1px;
  border: 1.8px solid currentColor;
  border-radius: 50%;
}
.search span::after {
  content: '';
  position: absolute;
  right: 1px;
  bottom: 1px;
  width: 6px;
  height: 1.8px;
  border-radius: 999px;
  background: currentColor;
  transform: rotate(45deg);
}
.search input {
  width: 100%;
  border: 0;
  outline: 0;
  color: #dceeed;
  background: transparent;
}
.module-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.module-link,
.layer-switch button {
  border: 0;
  background: transparent;
  color: #b7c9c8;
  cursor: pointer;
  font: inherit;
  text-decoration: none;
}
.layer-switch button:disabled {
  color: #6d8585;
  cursor: wait;
}
.module-link {
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  font-weight: 700;
}
.module-link:hover {
  color: #eafff6;
  border-color: rgba(168, 255, 37, 0.18);
  background: rgba(118, 185, 0, 0.08);
}
.module-link.active {
  color: #eafff6;
  border-color: rgba(168, 255, 37, 0.28);
  background: linear-gradient(180deg, rgba(118, 185, 0, 0.24), rgba(118, 185, 0, 0.08));
  box-shadow: 0 0 24px rgba(118, 185, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
.module-link.active::after {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--green-hover), transparent);
  box-shadow: 0 0 12px rgba(168, 255, 37, 0.5);
}
.layer-switch {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  height: 36px;
  border: 1px solid rgba(148, 175, 164, 0.24);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(5, 13, 12, 0.72);
}
.layer-switch .active {
  color: #f7fff6;
  background: linear-gradient(180deg, rgba(118, 185, 0, 0.48), rgba(118, 185, 0, 0.2));
  box-shadow: inset 0 0 0 1px rgba(168, 255, 37, 0.26);
}
.status-strip {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #d6e1df;
  white-space: nowrap;
}
.sun {
  color: #ffc12e;
  font-size: 20px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.red { background: #ef433f; }
b {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ff665b, #ef433f);
  color: white;
  font-size: 12px;
  box-shadow: 0 0 12px rgba(239, 67, 63, 0.32);
}
@media (max-width: 1500px) {
  .situation-topbar {
    grid-template-columns: 286px 220px minmax(260px, 1fr) 158px;
  }
  .status-strip {
    display: none;
  }
  .brand {
    gap: 10px;
    font-size: 20px;
  }
  .brand-logo {
    width: 48px;
    height: 37px;
  }
}
</style>
