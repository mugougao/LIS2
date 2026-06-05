<template>
  <footer class="event-timeline">
    <div class="timeline-head">
      <h2>事件轴（05-24）</h2>
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
        <div ref="eventLineRef" class="event-line">
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
            @click="selectEvent(event.id)"
          >
            <i></i>
            <strong>{{ event.time }}</strong>
            <span>{{ event.title }}</span>
            <em>{{ event.detail }}</em>
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { events } from '../../data/situationMock'

const props = defineProps({
  selectedEventId: { type: String, required: true },
  selectedObjectId: { type: String, required: true }
})

const marks = [0, 2, 4, 6, 8, 12, 14, 16, 18, 20, 22, 24]
const emit = defineEmits(['select'])

const scrollRef = ref(null)
const eventLineRef = ref(null)
const isDragging = ref(false)
const dragMoved = ref(false)
const dragStartX = ref(0)
const dragStartScrollLeft = ref(0)
const selectedEvent = computed(() => events.find((event) => event.id === props.selectedEventId) || events[0])

const currentMinute = ref(632)
const isScrubbing = ref(false)
const currentTimeLabel = computed(() => {
  const total = Math.round(currentMinute.value)
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

function startDrag(event) {
  const el = scrollRef.value
  if (!el) return
  isDragging.value = true
  dragMoved.value = false
  dragStartX.value = event.clientX
  dragStartScrollLeft.value = el.scrollLeft
  el.setPointerCapture?.(event.pointerId)
}

function onDrag(event) {
  if (!isDragging.value || !scrollRef.value) return
  const delta = event.clientX - dragStartX.value
  if (Math.abs(delta) > 4) dragMoved.value = true
  scrollRef.value.scrollLeft = dragStartScrollLeft.value - delta
}

function stopDrag(event) {
  if (!isDragging.value) return
  isDragging.value = false
  scrollRef.value?.releasePointerCapture?.(event.pointerId)
}

function minuteFromClientX(clientX) {
  const rect = eventLineRef.value?.getBoundingClientRect()
  if (!rect || rect.width === 0) return currentMinute.value
  const ratio = (clientX - rect.left) / rect.width
  const minute = Math.round(ratio * 1440)
  return Math.min(1440, Math.max(0, minute))
}

function startScrub(event) {
  isScrubbing.value = true
  currentMinute.value = minuteFromClientX(event.clientX)
  window.addEventListener('pointermove', onScrub)
  window.addEventListener('pointerup', stopScrub, { once: true })
}

function onScrub(event) {
  if (!isScrubbing.value) return
  currentMinute.value = minuteFromClientX(event.clientX)
}

function stopScrub() {
  isScrubbing.value = false
  window.removeEventListener('pointermove', onScrub)
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onScrub)
  window.removeEventListener('pointerup', stopScrub)
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
  min-height: 154px;
  padding: 6px 18px 10px;
  border: 1px solid rgba(83, 119, 120, 0.32);
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(7, 23, 25, 0.94), rgba(3, 16, 17, 0.96));
}
.timeline-head {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 22px;
  margin-bottom: 2px;
}
h2 {
  margin: 0 10px 0 0;
  color: #e9fffa;
  font-size: 14px;
  line-height: 1.2;
}
button {
  font: inherit;
  cursor: pointer;
}
.timeline-head button {
  height: 28px;
  min-width: 30px;
  border: 1px solid rgba(92, 123, 124, 0.35);
  border-radius: 4px;
  background: rgba(5, 18, 20, 0.8);
  color: #bcd0cf;
}
.timeline-head span {
  margin-left: auto;
  color: #8eeac4;
}
.timeline-scroll {
  position: relative;
  z-index: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding-top: 22px;
  padding-bottom: 6px;
  cursor: grab;
  user-select: none;
  touch-action: pan-x;
}
.timeline-scroll.dragging {
  cursor: grabbing;
}
.timeline-scroll::-webkit-scrollbar {
  height: 6px;
}
.timeline-scroll::-webkit-scrollbar-track {
  background: rgba(83, 119, 120, 0.16);
  border-radius: 999px;
}
.timeline-scroll::-webkit-scrollbar-thumb {
  background: #17e18a;
  border-radius: 999px;
  box-shadow: 0 0 10px rgba(23, 225, 138, 0.5);
}
.timeline-track {
  min-width: 1760px;
  padding-right: 70px;
}
.time-rule {
  position: relative;
  height: 28px;
  margin: 4px 10px 0 70px;
}
.time-rule span {
  position: absolute;
  top: 5px;
  color: #8ea7a6;
  transform: translateX(-50%);
}
.event-line {
  position: relative;
  height: 76px;
  margin: 0 10px 0 70px;
  border-top: 3px solid rgba(32, 225, 139, 0.5);
}
.current-time {
  position: absolute;
  top: -36px;
  bottom: 0;
  width: 2px;
  background: #19e78e;
  box-shadow: 0 0 12px #19e78e;
  cursor: ew-resize;
  touch-action: none;
  z-index: 5;
}
.current-time::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -8px;
  right: -8px;
}
.current-time b {
  z-index: 6;
}
.current-time.dragging {
  cursor: grabbing;
}
.current-time b {
  position: absolute;
  top: -20px;
  left: 50%;
  padding: 2px 8px;
  border-radius: 4px;
  background: #18b878;
  color: white;
  transform: translateX(-50%);
  z-index: 6;
  white-space: nowrap;
}
.event-node {
  position: absolute;
  top: -9px;
  width: 112px;
  border: 0;
  background: transparent;
  color: #17e18a;
  text-align: center;
  transform: translateX(-50%);
}
.event-node i {
  display: block;
  width: 17px;
  height: 17px;
  margin: 0 auto 6px;
  border: 3px solid currentColor;
  border-radius: 50%;
  background: #061312;
  box-shadow: 0 0 12px currentColor;
}
.event-node strong,
.event-node span,
.event-node em {
  display: block;
}
.event-node strong {
  font-size: 12px;
}
.event-node span {
  font-weight: 800;
}
.event-node em {
  color: #a7bbba;
  font-size: 12px;
  font-style: normal;
  white-space: nowrap;
}
.warning { color: #ffc333; }
.danger { color: #ff4d42; }
.info { color: #21d7ff; }
.active i,
.related i {
  background: currentColor;
}
.related {
  filter: brightness(1.35);
}
</style>
