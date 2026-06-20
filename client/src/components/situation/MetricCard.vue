<template>
  <div class="metric-card" :class="tone">
    <span class="metric-icon" :class="{ 'has-image': image }">
      <img v-if="image" :src="image" alt="" aria-hidden="true" />
      <template v-else>{{ icon }}</template>
    </span>
    <div>
      <p>{{ label }}</p>
      <strong>{{ value }}</strong>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '' },
  image: { type: String, default: '' },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  tone: { type: String, default: 'green' }
})
</script>

<style scoped>
.metric-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 150px;
  padding: 14px 18px;
  border-right: 1px solid rgba(138, 173, 174, 0.18);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.025), transparent);
}
.metric-icon {
  position: relative;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 1px solid color-mix(in srgb, currentColor 62%, transparent);
  border-radius: 8px;
  background:
    linear-gradient(145deg, color-mix(in srgb, currentColor 13%, transparent), rgba(255, 255, 255, 0.025));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 14px color-mix(in srgb, currentColor 18%, transparent);
  font-size: 0;
  overflow: hidden;
}
.metric-icon.has-image {
  border-color: color-mix(in srgb, currentColor 38%, transparent);
  background:
    radial-gradient(circle at 50% 48%, color-mix(in srgb, currentColor 16%, transparent), transparent 62%),
    linear-gradient(145deg, rgba(6, 16, 14, 0.88), rgba(4, 10, 10, 0.74));
}
.metric-icon img {
  position: relative;
  z-index: 1;
  width: 42px;
  height: 42px;
  object-fit: contain;
  filter: drop-shadow(0 0 8px color-mix(in srgb, currentColor 24%, transparent));
}
.metric-icon::before,
.metric-icon::after {
  content: '';
  position: absolute;
  display: block;
}
.metric-icon.has-image::before,
.metric-icon.has-image::after {
  content: none;
}
.metric-icon::before {
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-radius: 5px;
  transform: rotate(45deg);
}
.metric-icon::after {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 12px currentColor;
}
.metric-card:nth-child(2) .metric-icon::before {
  width: 22px;
  height: 12px;
  border: 0;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  transform: rotate(-18deg);
}
.metric-card:nth-child(2) .metric-icon::after {
  width: 20px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  transform: rotate(-18deg) translateY(5px);
}
.metric-card:nth-child(3) .metric-icon::before {
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-bottom: 20px solid currentColor;
  border-radius: 0;
  transform: rotate(90deg);
  opacity: 0.92;
}
.metric-card:nth-child(3) .metric-icon::after {
  width: 18px;
  height: 2px;
  border-radius: 999px;
  transform: rotate(90deg);
  background: rgba(0, 0, 0, 0.48);
}
.metric-card:nth-child(4) .metric-icon::before {
  width: 0;
  height: 0;
  border-left: 11px solid transparent;
  border-right: 11px solid transparent;
  border-bottom: 20px solid currentColor;
  border-radius: 0;
  transform: none;
}
.metric-card:nth-child(4) .metric-icon::after,
.metric-card:nth-child(5) .metric-icon::after {
  width: 3px;
  height: 13px;
  border-radius: 999px;
  background: #061006;
  box-shadow: 0 10px 0 -1px #061006;
}
.metric-card:nth-child(5) .metric-icon::before {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transform: none;
}
p {
  margin: 0 0 3px;
  color: var(--text-muted);
  font-size: 13px;
}
strong {
  color: currentColor;
  font-size: 24px;
  line-height: 1;
  text-shadow: 0 0 14px color-mix(in srgb, currentColor 20%, transparent);
}
.green { color: var(--green-hover); }
.yellow { color: #ffc333; }
.red { color: #ff4d42; }
.cyan { color: var(--cyan-primary); }
</style>
