<template>
  <div class="main-layout">
    <div class="sidebar">
      <div class="sidebar-tabs">
        <button :class="{ active: activeTab === 'plans' }" @click="activeTab = 'plans'">飞行计划</button>
        <button :class="{ active: activeTab === 'nofly' }" @click="activeTab = 'nofly'">禁飞区</button>
        <button :class="{ active: activeTab === 'conflicts' }" @click="activeTab = 'conflicts'">冲突管理</button>
      </div>
      <div class="sidebar-content">
        <PlanPanel v-if="activeTab === 'plans'" />
        <NoFlyPanel v-if="activeTab === 'nofly'" />
        <ConflictPanel v-if="activeTab === 'conflicts'" />
      </div>
    </div>
    <div class="map-wrapper">
      <CesiumViewer />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CesiumViewer from '../components/CesiumViewer.vue';
import PlanPanel from '../components/PlanPanel.vue';
import NoFlyPanel from '../components/NoFlyPanel.vue';
import ConflictPanel from '../components/ConflictPanel.vue';

const activeTab = ref('plans');
</script>

<style scoped>
.main-layout {
  display: flex;
  width: 100%;
  height: 100%;
}
.sidebar {
  width: 420px;
  min-width: 420px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  color: var(--text-primary);
  z-index: 10;
  border-right: 1px solid var(--border-default);
}
.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-primary);
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
  background: rgba(42, 212, 178, 0.08);
}
.sidebar-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: var(--green-primary);
  box-shadow: 0 0 6px var(--green-glow);
}
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}
.map-wrapper {
  flex: 1;
  height: 100%;
}
</style>
