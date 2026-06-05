<template>
  <header class="situation-topbar">
    <div class="brand">51LIS低空智能监管系统</div>
    <label class="search">
      <span>⌕</span>
      <input placeholder="搜索空域、航线、飞行器、计划..." />
    </label>
    <nav class="module-nav">
      <router-link to="/conflict" class="module-link" :class="{ active: route.name === 'conflict' }">态势监控</router-link>
      <router-link to="/agent" class="module-link" :class="{ active: isInfrastructure }">基础设施</router-link>
      <router-link to="/" class="module-link" :class="{ active: route.name === 'main' }">规划管理</router-link>
    </nav>
    <div class="mode-switch">
      <button :class="{ active: sceneMode === '2D' }" @click="$emit('update:sceneMode', '2D')">2D</button>
      <button :class="{ active: sceneMode === '3D' }" @click="$emit('update:sceneMode', '3D')">3D</button>
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  sceneMode: { type: String, default: '3D' }
})

defineEmits(['update:sceneMode'])

const route = useRoute()
const isInfrastructure = computed(() => route.name === 'agent-list' || route.name === 'agent')
</script>

<style scoped>
.situation-topbar {
  display: grid;
  grid-template-columns: 300px 330px 1fr 116px auto;
  align-items: center;
  gap: 16px;
  height: 76px;
  padding: 0 18px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(28, 226, 148, 0.14);
  background: linear-gradient(180deg, #020708, #061413);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.26);
  z-index: 30;
}
.brand {
  color: #f4fffb;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0;
  white-space: nowrap;
}
.search {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(93, 122, 123, 0.35);
  border-radius: 5px;
  background: rgba(10, 25, 25, 0.86);
  color: #7f9998;
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
  gap: 8px;
  min-width: 0;
}
.module-link,
.mode-switch button {
  border: 0;
  background: transparent;
  color: #b7c9c8;
  cursor: pointer;
  font: inherit;
  text-decoration: none;
}
.module-link {
  display: inline-flex;
  align-items: center;
  height: 44px;
  padding: 0 18px;
  border-bottom: 2px solid transparent;
  border-radius: 4px 4px 0 0;
}
.module-link:hover {
  color: #eafff6;
  background: rgba(23, 225, 138, 0.08);
}
.module-link.active {
  color: #eafff6;
  border-color: #17e18a;
  background: rgba(23, 225, 138, 0.15);
  box-shadow: 0 0 20px rgba(23, 225, 138, 0.18);
}
.mode-switch {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  height: 34px;
  border: 1px solid rgba(93, 122, 123, 0.35);
  border-radius: 5px;
  overflow: hidden;
}
.mode-switch .active {
  color: #ffffff;
  background: rgba(23, 225, 138, 0.4);
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
  font-size: 24px;
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
  background: #ef433f;
  color: white;
  font-size: 12px;
}
@media (max-width: 1500px) {
  .situation-topbar {
    grid-template-columns: 260px 240px 1fr 100px;
  }
  .status-strip {
    display: none;
  }
  .brand {
    font-size: 20px;
  }
}
</style>
