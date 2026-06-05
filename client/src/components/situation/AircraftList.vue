<template>
  <div class="object-list">
    <p class="count">飞行器总数 {{ items.length }}</p>
    <button
      v-for="item in items"
      :key="item.id"
      class="list-card aircraft-card"
      :class="[item.color, { active: selectedId === item.id, dimmed: !isAltitudeMatched(item) }]"
      @click="$emit('select', item.id)"
    >
      <div class="card-head">
        <strong>{{ item.name }}</strong>
        <StatusBadge :label="item.status" />
      </div>
      <dl>
        <div><dt>机型</dt><dd>{{ item.type }}</dd></div>
        <div><dt>当前高度</dt><dd>{{ item.altitude }}m</dd></div>
        <div><dt>状态</dt><dd>{{ item.onlineStatus }}</dd></div>
        <div><dt>速度</dt><dd>{{ item.speed }}</dd></div>
      </dl>
      <ProgressBar :value="item.battery" :tone="item.color === 'muted' ? 'muted' : 'green'" />
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
