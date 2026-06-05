<template>
  <div class="metric-card" :class="tone">
    <span class="metric-icon">{{ icon }}</span>
    <div>
      <p>{{ label }}</p>
      <strong>{{ value }}</strong>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  tone: { type: String, default: 'green' }
})
</script>

<style scoped>
.metric-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 150px;
  padding: 14px 18px;
  border-right: 1px solid rgba(138, 173, 174, 0.18);
}
.metric-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid currentColor;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  font-size: 22px;
}
p {
  margin: 0 0 3px;
  color: #8ca8a7;
  font-size: 13px;
}
strong {
  color: currentColor;
  font-size: 24px;
  line-height: 1;
}
.green { color: #18e18a; }
.yellow { color: #ffc333; }
.red { color: #ff4d42; }
.cyan { color: #21d7ff; }
</style>
