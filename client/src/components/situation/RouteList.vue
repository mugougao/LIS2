<template>
  <div class="object-list">
    <p class="count">全部航线 {{ items.length }}</p>
    <button
      v-for="item in items"
      :key="item.id"
      class="list-card"
      :class="[item.color, { active: selectedId === item.id, dimmed: !isAltitudeMatched(item) }]"
      @click="$emit('select', item.id)"
    >
      <div class="card-head">
        <strong>{{ item.name }}</strong>
        <StatusBadge :label="item.status" />
      </div>
      <dl>
        <div><dt>高度范围</dt><dd>{{ item.heightRange }}</dd></div>
        <div><dt>航线类型</dt><dd>{{ item.type }}</dd></div>
        <div><dt>航线长度</dt><dd>{{ item.length }}</dd></div>
        <div><dt>点位数量</dt><dd>{{ item.waypointCount }} 个</dd></div>
      </dl>
      <ProgressBar :value="item.occupancy" :tone="item.color" />
    </button>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'
import ProgressBar from './ProgressBar.vue'

defineProps({
  items: { type: Array, required: true },
  selectedId: { type: String, required: true },
  isAltitudeMatched: { type: Function, required: true }
})

defineEmits(['select'])
</script>

<style scoped src="./list.css"></style>
