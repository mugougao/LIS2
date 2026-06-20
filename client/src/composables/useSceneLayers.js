import { ref } from 'vue'

const windLayer = ref(false)

export function useSceneLayers() {
  return { windLayer }
}
