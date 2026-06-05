<template>
  <div class="ring" :style="{ '--value': `${value * 3.6}deg` }">
    <div class="ring-inner">
      <strong>{{ value }}%</strong>
      <span>{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  value: { type: Number, required: true },
  label: { type: String, default: '占用率' }
})
</script>

<style scoped>
.ring {
  width: 104px;
  aspect-ratio: 1;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background:
    conic-gradient(#18e18a var(--value), rgba(22, 224, 136, 0.14) 0),
    radial-gradient(circle, rgba(12, 30, 27, 0.96) 57%, transparent 59%);
  box-shadow: 0 0 26px rgba(24, 225, 138, 0.18);
}
.ring-inner {
  width: 74px;
  aspect-ratio: 1;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #071211;
  border: 1px solid rgba(33, 231, 144, 0.24);
}
strong {
  font-size: 22px;
  line-height: 1;
  color: #eafff7;
}
span {
  margin-top: -16px;
  font-size: 11px;
  color: #86aaa8;
}
</style>
