<template>
  <div class="object-tabs">
    <button
      v-for="item in objectTypes"
      :key="item.key"
      :class="{ active: modelValue === item.key }"
      @click="$emit('update:modelValue', item.key)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup>
import { objectTypes } from '../../data/situationMock'

defineProps({
  modelValue: { type: String, required: true }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.object-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin: 12px 0;
  padding: 4px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: rgba(5, 13, 12, 0.72);
}
button {
  height: 34px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: #8ea9a8;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  transition: all 0.15s ease;
}
button:hover {
  color: #dffff4;
  border-color: rgba(168, 255, 37, 0.16);
  background: rgba(118, 185, 0, 0.06);
}
button.active {
  color: #f4ffe8;
  border-color: rgba(168, 255, 37, 0.36);
  background: linear-gradient(180deg, rgba(118, 185, 0, 0.34), rgba(118, 185, 0, 0.12));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.045), 0 0 16px rgba(118, 185, 0, 0.18);
}
</style>
