<template>
  <aside class="altitude-axis">
    <div class="axis-card">
      <h3>高度轴</h3>
      <div
        ref="axisRef"
        class="axis"
        @pointerdown="onTrackPointerDown"
      >
        <button
          v-for="tick in ticks"
          :key="tick"
          class="tick"
          :class="{ active: tick >= range.min && tick <= range.max }"
          :style="{ bottom: `${toPercent(tick)}%` }"
          @click.stop="setNearestBound(tick)"
        >
          <span></span>{{ tick }}
        </button>
        <div class="axis-line"></div>
        <div
          class="range-fill"
          :style="{
            bottom: `${toPercent(range.min)}%`,
            height: `${toPercent(range.max) - toPercent(range.min)}%`
          }"
        ></div>
        <button
          class="thumb thumb-min"
          :style="{ bottom: `${toPercent(range.min)}%` }"
          aria-label="最低高度"
          @pointerdown.stop="startDrag('min', $event)"
        >
          <span>{{ range.min }}m</span>
        </button>
        <button
          class="thumb thumb-max"
          :style="{ bottom: `${toPercent(range.max)}%` }"
          aria-label="最高高度"
          @pointerdown.stop="startDrag('max', $event)"
        >
          <span>{{ range.max }}m</span>
        </button>
      </div>
      <p>当前筛选：{{ range.min }} - {{ range.max }}m</p>
    </div>

  </aside>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const maxAltitude = 1200
const step = 10
const ticks = [0, 100, 200, 300, 500, 800, 1200]
const axisRef = ref(null)
const dragging = ref(null)

const range = computed(() => ({
  min: clamp(props.modelValue?.min ?? 0),
  max: clamp(props.modelValue?.max ?? 300)
}))

function clamp(value) {
  return Math.min(maxAltitude, Math.max(0, Math.round(value / step) * step))
}

function toPercent(value) {
  return (clamp(value) / maxAltitude) * 100
}

function updateRange(nextPart) {
  let nextMin = nextPart.min ?? range.value.min
  let nextMax = nextPart.max ?? range.value.max

  nextMin = clamp(nextMin)
  nextMax = clamp(nextMax)

  if (nextMin > nextMax) {
    if (Object.prototype.hasOwnProperty.call(nextPart, 'min')) nextMax = nextMin
    else nextMin = nextMax
  }

  emit('update:modelValue', { min: nextMin, max: nextMax })
}

function valueFromPointer(event) {
  const rect = axisRef.value?.getBoundingClientRect()
  if (!rect) return 0
  const ratio = 1 - (event.clientY - rect.top) / rect.height
  return clamp(ratio * maxAltitude)
}

function setNearestBound(value) {
  const distanceToMin = Math.abs(value - range.value.min)
  const distanceToMax = Math.abs(value - range.value.max)
  updateRange(distanceToMin <= distanceToMax ? { min: value } : { max: value })
  // 离散点击为一次性交互，立即提交
  emit('change', { ...range.value })
}

function onTrackPointerDown(event) {
  setNearestBound(valueFromPointer(event))
}

function startDrag(bound, event) {
  dragging.value = bound
  event.currentTarget.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', stopDrag, { once: true })
}

function onPointerMove(event) {
  if (!dragging.value) return
  updateRange({ [dragging.value]: valueFromPointer(event) })
}

function stopDrag() {
  dragging.value = null
  window.removeEventListener('pointermove', onPointerMove)
  // 拖动结束后再提交一次，避免拖动过程中频繁触发
  emit('change', { ...range.value })
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', stopDrag)
})
</script>

<style scoped>
.altitude-axis {
  position: absolute;
  z-index: 9;
  top: 0;
  right: 0;
  bottom: 0;
  width: 116px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 10px 0;
}
.axis-card,
.filter {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: rgba(5, 13, 12, 0.78);
  color: #cde0df;
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(14px) saturate(1.05);
}
.axis-card {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 14px 8px 10px;
}
h3 {
  flex: 0 0 auto;
  margin: 0 0 14px;
  text-align: center;
  font-size: 15px;
}
.axis {
  position: relative;
  flex: 1 1 auto;
  min-height: 180px;
  margin: 0 auto;
  width: 100%;
  touch-action: none;
}
.axis-line,
.range-fill {
  position: absolute;
  left: 24px;
  width: 2px;
  border-radius: 999px;
}
.axis-line {
  top: 0;
  bottom: 0;
  background: rgba(168, 187, 187, 0.34);
}
.range-fill {
  background: linear-gradient(#f3ffe9, var(--green-hover), var(--green-primary));
  box-shadow: 0 0 14px rgba(118, 185, 0, 0.75);
}
button {
  font: inherit;
}
.tick {
  position: absolute;
  left: 6px;
  display: flex;
  align-items: center;
  gap: 22px;
  width: 96px;
  border: 0;
  background: transparent;
  color: #a8bbbb;
  cursor: pointer;
  transform: translateY(50%);
}
.tick span {
  width: 12px;
  height: 2px;
  background: currentColor;
}
.tick.active {
  color: var(--green-hover);
  font-weight: 800;
}
.thumb {
  position: absolute;
  left: 16px;
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green-hover), var(--green-primary));
  box-shadow: 0 0 16px rgba(168, 255, 37, 0.72);
  cursor: grab;
  transform: translateY(50%);
}
.thumb:active {
  cursor: grabbing;
}
.thumb span {
  position: absolute;
  left: 22px;
  top: 50%;
  min-width: 44px;
  padding: 1px 5px;
  border: 1px solid rgba(168, 255, 37, 0.4);
  border-radius: var(--radius-sm);
  background: rgba(5, 13, 12, 0.92);
  color: #eafff8;
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
  transform: translateY(-50%);
}
p {
  flex: 0 0 auto;
  margin: 10px 0 0;
  color: #8ba4a3;
  font-size: 12px;
  text-align: center;
}
.filter {
  flex: 0 0 48px;
  cursor: pointer;
}
</style>
