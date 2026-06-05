<template>
  <div class="main-layout">
    <div class="sidebar">
      <div class="sidebar-tabs">
        <button :class="{ active: activeTab === 'plans' }" @click="activeTab = 'plans'">飞行计划</button>
        <button :class="{ active: activeTab === 'nofly' }" @click="activeTab = 'nofly'">禁飞区</button>
        <button :class="{ active: activeTab === 'conflicts' }" @click="activeTab = 'conflicts'">冲突管理</button>
      </div>
      <div class="sidebar-content">
        <PlanPanel v-show="activeTab === 'plans'" />
        <NoFlyPanel v-show="activeTab === 'nofly'" />
        <ConflictPanel v-show="activeTab === 'conflicts'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import PlanPanel from '../components/PlanPanel.vue';
import NoFlyPanel from '../components/NoFlyPanel.vue';
import ConflictPanel from '../components/ConflictPanel.vue';
import { useWdpEngine } from '../composables/useWdpEngine';
import { useOverlayManager } from '../composables/useOverlayManager';
import { usePlansStore } from '../stores/plans';
import { useNoFlyStore } from '../stores/nofly';
import { useConflictStore } from '../stores/conflict';

const activeTab = ref('plans');

// —— 仅在「规划管理（/）」页面挂载覆盖物 ——
const { isSceneReady } = useWdpEngine();
const {
  initOverlays,
  clearOverlays,
  onPlansChange,
  onNoFlyChange,
  onConflictsChange,
} = useOverlayManager();

const plansStore = usePlansStore();
const noflyStore = useNoFlyStore();
const conflictStore = useConflictStore();

let stopWatchers = null;

function setupOverlayWatchers() {
  const w1 = watch(() => plansStore.plans, (n, o) => onPlansChange(n, o), { deep: true });
  const w2 = watch(() => noflyStore.zones, (n, o) => onNoFlyChange(n, o), { deep: true });
  const w3 = watch(() => conflictStore.conflicts, (n, o) => onConflictsChange(n, o), { deep: true });
  return () => { w1(); w2(); w3(); };
}

async function activateOverlays() {
  await initOverlays();
  stopWatchers = setupOverlayWatchers();
}

onMounted(() => {
  if (isSceneReady.value) {
    activateOverlays();
  } else {
    const stop = watch(isSceneReady, (v) => {
      if (v) {
        activateOverlays();
        stop();
      }
    });
  }
});

onBeforeUnmount(async () => {
  if (stopWatchers) {
    stopWatchers();
    stopWatchers = null;
  }
  await clearOverlays();
});
</script>

<style scoped>
.main-layout {
  position: absolute;
  left: 0;
  top: 0;
  width: 25%;
  min-width: 320px;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}
.sidebar {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(8, 25, 27, 0.94), rgba(4, 17, 18, 0.92));
  color: var(--text-primary);
  border: 1px solid rgba(83, 119, 120, 0.32);
  border-left: 0;
  border-radius: 0 6px 6px 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 0 28px rgba(0, 0, 0, 0.28);
  overflow: hidden;
  pointer-events: auto;
}
.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid rgba(83, 119, 120, 0.32);
  background: rgba(3, 14, 15, 0.66);
}
.sidebar-tabs button {
  flex: 1;
  padding: 14px 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all var(--transition-fast);
  position: relative;
}
.sidebar-tabs button:hover {
  color: var(--green-hover);
}
.sidebar-tabs button.active {
  color: var(--green-primary);
  background: rgba(23, 225, 138, 0.15);
}
.sidebar-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: var(--green-primary);
  box-shadow: 0 0 12px var(--green-glow);
}
.sidebar-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 14px 24px 14px;
}
</style>
