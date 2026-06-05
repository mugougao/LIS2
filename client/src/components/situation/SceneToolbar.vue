<template>
  <div class="scene-toolbar">
    <button v-for="tool in tools" :key="tool"><span>{{ tool.slice(0, 1) }}</span>{{ tool }}</button>
  </div>
</template>

<script setup>
const tools = ['电子围栏', '气象叠加', '冲突检测', '轨迹回放', '告警联动', '任务计划', '规则约束', '一键定位', '目标跟踪']
</script>

<style scoped>
.scene-toolbar {
  position: absolute;
  z-index: 8;
  top: 12px;
  left: 14px;
  right: 164px;
  display: flex;
  gap: 8px;
  overflow: hidden;
}
button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 11px;
  border: 1px solid rgba(104, 134, 134, 0.35);
  border-radius: 4px;
  background: rgba(4, 14, 16, 0.8);
  color: #bcd0cf;
  font: inherit;
  white-space: nowrap;
}
span {
  color: #13e18a;
}
</style>
