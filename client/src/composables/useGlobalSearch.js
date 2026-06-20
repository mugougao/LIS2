import { ref } from 'vue'

const globalSearchQuery = ref('')

export function useGlobalSearch() {
  return { globalSearchQuery }
}
