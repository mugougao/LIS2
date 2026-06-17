<template>
  <span class="status-badge" :class="tone">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true }
})

const tone = computed(() => {
  if (['生效中', '在线', '正常', '监控', '通航'].includes(props.label)) return 'is-green'
  if (['审批中', '临时管控', '待命', '活动保障'].includes(props.label)) return 'is-yellow'
  if (['告警中', '冲突预警', '禁飞'].includes(props.label)) return 'is-red'
  if (['管制', '训练'].includes(props.label)) return 'is-blue'
  if (props.label === '执行中') return 'is-cyan'
  return 'is-muted'
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border: 1px solid currentColor;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.04);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.is-green { color: #15e284; background: rgba(21, 226, 132, 0.12); }
.is-yellow { color: #ffc333; background: rgba(255, 195, 51, 0.12); }
.is-red { color: #ff4d42; background: rgba(255, 77, 66, 0.12); }
.is-cyan { color: #22d4ff; background: rgba(34, 212, 255, 0.12); }
.is-blue { color: #4a9fff; background: rgba(74, 159, 255, 0.12); }
.is-muted { color: #8aa1a2; background: rgba(138, 161, 162, 0.1); }
</style>
