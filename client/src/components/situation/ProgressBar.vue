<template>
  <div class="progress-bar">
    <span :style="{ width: `${value}%` }" :class="tone"></span>
  </div>
</template>

<script setup>
defineProps({
  value: { type: Number, required: true },
  tone: { type: String, default: 'green' }
})
</script>

<style scoped>
.progress-bar {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(148, 175, 164, 0.16);
}
.progress-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  box-shadow: 0 0 12px currentColor;
}
.green { color: var(--green-hover); background: linear-gradient(90deg, var(--green-primary), var(--green-hover)); }
.yellow { color: #ffc333; background: currentColor; }
.red { color: #ff4d42; background: currentColor; }
.cyan { color: var(--cyan-primary); background: currentColor; }
.blue { color: #4a9fff; background: currentColor; }
.muted { color: #607477; background: currentColor; }
</style>
