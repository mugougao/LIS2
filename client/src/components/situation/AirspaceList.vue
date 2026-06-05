<template>
  <div class="object-list">
    <p class="count">全部空域 {{ items.length }}</p>
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
        <div><dt>高度</dt><dd>{{ item.heightRange }}</dd></div>
        <div><dt>占用率</dt><dd>{{ item.occupancy }}%（{{ item.volume }}）</dd></div>
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
