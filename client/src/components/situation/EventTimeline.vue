<template>
  <footer class="event-timeline">
    <div class="timeline-head">
      <h2>空域事件轴（05-24）</h2>
      <span>当前事件：{{ selectedEvent?.title }} · {{ selectedEvent?.detail }}</span>
    </div>

    <div
      ref="scrollRef"
      class="timeline-scroll"
      :class="{ dragging: isDragging }"
      @pointerdown="startDrag"
      @pointermove="onDrag"
      @pointerup="stopDrag"
      @pointercancel="stopDrag"
      @pointerleave="stopDrag"
      @wheel.prevent="onWheel"
    >
      <div class="timeline-track">
        <div class="time-rule">
          <span
            v-for="mark in marks"
            :key="mark"
            :style="{ left: `${(mark / 24) * 100}%` }"
          >
            {{ String(mark).padStart(2, '0') }}:00
          </span>
        </div>
        <div ref="eventLineRef" class="event-line" @pointerdown.stop="startScrub">
          <div
            class="current-time"
            :class="{ dragging: isScrubbing }"
            :style="{ left: `${(currentMinute / 1440) * 100}%` }"
            @pointerdown.stop="startScrub"
          >
            <b>{{ currentTimeLabel }}</b>
          </div>
          <button
            v-for="event in events"
            :key="event.id"
            class="event-node"
            :class="[event.type, { active: selectedEventId === event.id, related: event.related.includes(selectedObjectId) }]"
            :style="{ left: `${(event.minute / 1440) * 100}%` }"
            @pointerdown.stop="stopNodePointer"
            @click="selectEvent(event.id)"
          >
            <i></i>
            <div class="event-card">
              <strong>{{ event.time }}</strong>
              <span>{{ event.title }}</span>
              <em>{{ event.detail }}</em>
            </div>
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { events } from '../../data/situationMock'

const props = defineProps({
  selectedEventId: { type: String, required: true },
  selectedObjectId: { type: String, required: true }
})

const marks = [0, 2, 4, 6, 8, 12, 14, 16, 18, 20, 22, 24]
const emit = defineEmits(['select', 'scrub'])

const scrollRef = ref(null)
const eventLineRef = ref(null)
const isDragging = ref(false)
const dragMoved = ref(false)
const dragStartX = ref(0)
const dragStartScrollLeft = ref(0)
const dragLastX = ref(0)
const dragLastTime = ref(0)
const dragVelocity = ref(0)
const inertiaFrame = ref(0)
const selectedEvent = computed(() => events.find((event) => event.id === props.selectedEventId) || events[0])

const currentMinute = ref(0)
const isScrubbing = ref(false)
const currentTimeLabel = computed(() => {
  const total = Math.round(currentMinute.value)
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

function startDrag(event) {
  const el = scrollRef.value
  if (!el || event.button !== 0) return
  cancelInertia()
  isDragging.value = true
  dragMoved.value = false
  dragStartX.value = event.clientX
  dragStartScrollLeft.value = el.scrollLeft
  dragLastX.value = event.clientX
  dragLastTime.value = performance.now()
  dragVelocity.value = 0
  el.setPointerCapture?.(event.pointerId)
}

function onDrag(event) {
  if (!isDragging.value || !scrollRef.value) return
  const delta = event.clientX - dragStartX.value
  if (Math.abs(delta) > 4) dragMoved.value = true
  scrollRef.value.scrollLeft = dragStartScrollLeft.value - delta
  const now = performance.now()
  const elapsed = Math.max(16, now - dragLastTime.value)
  dragVelocity.value = (dragLastX.value - event.clientX) / elapsed
  dragLastX.value = event.clientX
  dragLastTime.value = now
}

function stopDrag(event) {
  if (!isDragging.value) return
  isDragging.value = false
  scrollRef.value?.releasePointerCapture?.(event.pointerId)
  startInertia()
}

function cancelInertia() {
  if (!inertiaFrame.value) return
  cancelAnimationFrame(inertiaFrame.value)
  inertiaFrame.value = 0
}

function startInertia() {
  const el = scrollRef.value
  let velocity = dragVelocity.value * 16
  if (!el || Math.abs(velocity) < 0.45) return
  const step = () => {
    velocity *= 0.9
    el.scrollLeft += velocity
    if (Math.abs(velocity) > 0.25) {
      inertiaFrame.value = requestAnimationFrame(step)
    } else {
      inertiaFrame.value = 0
    }
  }
  inertiaFrame.value = requestAnimationFrame(step)
}

function onWheel(event) {
  const el = scrollRef.value
  if (!el) return
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
  cancelInertia()
  el.scrollBy({ left: delta, behavior: 'smooth' })
}

function minuteFromClientX(clientX) {
  const rect = eventLineRef.value?.getBoundingClientRect()
  if (!rect || rect.width === 0) return currentMinute.value
  const ratio = (clientX - rect.left) / rect.width
  const minute = Math.round(ratio * 1440)
  return Math.min(1440, Math.max(0, minute))
}

function startScrub(event) {
  if (event.button !== 0) return
  event.preventDefault()
  isScrubbing.value = true
  currentMinute.value = minuteFromClientX(event.clientX)
  emit('scrub', currentMinute.value)
  window.addEventListener('pointermove', onScrub)
  window.addEventListener('pointerup', stopScrub, { once: true })
}

function onScrub(event) {
  if (!isScrubbing.value) return
  currentMinute.value = minuteFromClientX(event.clientX)
  emit('scrub', currentMinute.value)
}

function stopScrub() {
  isScrubbing.value = false
  window.removeEventListener('pointermove', onScrub)
}

function stopNodePointer() {
  dragMoved.value = false
}

onBeforeUnmount(() => {
  cancelInertia()
  window.removeEventListener('pointermove', onScrub)
  window.removeEventListener('pointerup', stopScrub)
})

onMounted(() => {
  emit('scrub', currentMinute.value)
})

function selectEvent(id) {
  if (dragMoved.value) {
    dragMoved.value = false
    return
  }
  emit('select', id)
}
</script>

<style scoped>
.event-timeline {
  min-height: 166px;
  padding: 6px 18px 8px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--surface-panel-strong);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(16px) saturate(1.05);
}
.timeline-head {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 20px;
  margin-bottom: 2px;
}
h2 {
  margin: 0 10px 0 0;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.2;
  font-weight: 800;
}
button {
  font: inherit;
  cursor: pointer;
}
.timeline-head button {
  height: 28px;
  min-width: 30px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  background: rgba(5, 13, 12, 0.8);
  color: #bcd0cf;
}
.timeline-head span {
  margin-left: auto;
  color: #c8ff9d;
}
.timeline-scroll {
  position: relative;
  z-index: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding-top: 22px;
  padding-bottom: 4px;
  cursor: grab;
  user-select: none;
  touch-action: pan-x;
  scroll-behavior: smooth;
  overscroll-behavior-x: contain;
}
.timeline-scroll.dragging {
  cursor: grabbing;
  scroll-behavior: auto;
}
.timeline-scroll::-webkit-scrollbar {
  height: 6px;
}
.timeline-scroll::-webkit-scrollbar-track {
  background: rgba(148, 175, 164, 0.14);
  border-radius: 999px;
}
.timeline-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, var(--green-primary), var(--green-hover));
  border-radius: 999px;
  box-shadow: 0 0 10px rgba(118, 185, 0, 0.5);
}
.timeline-track {
  min-width: 1760px;
  padding-right: 70px;
}
.time-rule {
  position: relative;
  height: 20px;
  margin: 2px 10px 0 70px;
}
.time-rule span {
  position: absolute;
  top: 2px;
  color: #8ea7a6;
  font-size: 12px;
  transform: translateX(-50%);
}
.event-line {
  position: relative;
  height: 92px;
  margin: 0 10px 0 70px;
  border-top: 3px solid rgba(118, 185, 0, 0.52);
  cursor: ew-resize;
  touch-action: none;
}
.event-line::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -16px;
  height: 32px;
  border-radius: 999px;
  background:
    linear-gradient(90deg, transparent, rgba(168, 255, 37, 0.14), rgba(34, 215, 255, 0.1), transparent);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease;
}
.event-line:hover::before {
  opacity: 1;
}
.current-time {
  position: absolute;
  top: -26px;
  bottom: 0;
  width: 2px;
  background: transparent;
  cursor: ew-resize;
  touch-action: none;
  transition: box-shadow 0.16s ease, filter 0.16s ease;
}
.current-time::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -14px;
  right: -14px;
  z-index: 1;
  background: linear-gradient(
    90deg,
    transparent calc(50% - 1px),
    var(--green-hover) calc(50% - 1px),
    var(--green-hover) calc(50% + 1px),
    transparent calc(50% + 1px)
  );
  filter: drop-shadow(0 0 8px rgba(168, 255, 37, 0.7));
}
.current-time::after {
  content: '';
  position: absolute;
  top: 19px;
  left: 50%;
  z-index: 5;
  width: 16px;
  height: 16px;
  border: 2px solid #061006;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #f2ffd1, var(--green-hover) 58%, var(--green-primary));
  box-shadow: 0 0 0 3px rgba(168, 255, 37, 0.18), 0 0 18px rgba(168, 255, 37, 0.62);
  transform: translateX(-50%);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}
.current-time.dragging {
  cursor: grabbing;
  filter: brightness(1.1);
}
.current-time.dragging::before {
  filter: drop-shadow(0 0 12px rgba(168, 255, 37, 0.88));
}
.current-time:hover::after,
.current-time.dragging::after {
  transform: translateX(-50%) scale(1.18);
  box-shadow: 0 0 0 5px rgba(168, 255, 37, 0.18), 0 0 24px rgba(168, 255, 37, 0.72);
}
.current-time b {
  position: absolute;
  top: -13px;
  left: 50%;
  min-width: 42px;
  height: 18px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--green-hover), var(--green-primary));
  color: #061006;
  font-weight: 800;
  font-size: 12px;
  line-height: 14px;
  transform: translateX(-50%);
  z-index: 8;
  white-space: nowrap;
  box-shadow: 0 0 14px rgba(168, 255, 37, 0.28);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}
.current-time.dragging b {
  transform: translateX(-50%) translateY(-1px);
  box-shadow: 0 0 20px rgba(168, 255, 37, 0.48);
}
.event-node {
  position: absolute;
  top: -8px;
  z-index: 3;
  width: 152px;
  border: 0;
  background: transparent;
  color: var(--green-hover);
  text-align: center;
  transform: translateX(-50%);
  padding: 0;
  cursor: pointer;
}
.event-node.active,
.event-node.related {
  z-index: 4;
}
.event-node i {
  display: block;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  margin: 0 auto 4px;
  border: 3px solid currentColor;
  border-radius: 50%;
  background: #06100e;
  box-shadow: 0 0 12px currentColor;
}
.event-card {
  position: relative;
  display: grid;
  grid-template-rows: 14px 15px 1fr;
  gap: 2px;
  height: 76px;
  box-sizing: border-box;
  padding: 7px 9px 8px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background:
    linear-gradient(145deg, rgba(9, 24, 20, 0.92), rgba(5, 13, 12, 0.82)) padding-box,
    linear-gradient(135deg, color-mix(in srgb, currentColor 42%, transparent), rgba(148, 175, 164, 0.12)) border-box;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 0 16px color-mix(in srgb, currentColor 10%, transparent);
  overflow: hidden;
}
.event-card::before {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  opacity: 0.58;
}
.event-card::after {
  content: '';
  position: absolute;
  right: -18px;
  top: -22px;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, currentColor 18%, transparent), transparent 64%);
}
.event-card strong,
.event-card span,
.event-card em {
  position: relative;
  z-index: 1;
  display: block;
  text-align: left;
}
.event-card strong {
  color: currentColor;
  font-size: 11px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.event-card span {
  color: #f0fff4;
  font-weight: 800;
  font-size: 12px;
  line-height: 1.22;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.event-card em {
  color: #a7bbba;
  font-size: 11px;
  line-height: 1.25;
  font-style: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
}
.warning { color: #ffc333; }
.danger { color: #ff4d42; }
.info { color: #21d7ff; }
.active i,
.related i {
  background: currentColor;
}
.active .event-card,
.related .event-card {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 22px color-mix(in srgb, currentColor 18%, transparent);
}
.related {
  filter: brightness(1.35);
}
</style>
