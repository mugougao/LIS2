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
  gap: 1px;
  margin: 12px 0;
  padding: 3px;
  border: 1px solid rgba(93, 122, 123, 0.35);
  border-radius: 6px;
  background: rgba(5, 18, 18, 0.72);
}
button {
  height: 34px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #8ea9a8;
  cursor: pointer;
  font: inherit;
}
button.active {
  color: #dffff4;
  background: linear-gradient(180deg, rgba(24, 226, 139, 0.35), rgba(24, 226, 139, 0.12));
  box-shadow: inset 0 0 0 1px rgba(30, 233, 145, 0.4), 0 0 14px rgba(24, 226, 139, 0.16);
}
</style>
