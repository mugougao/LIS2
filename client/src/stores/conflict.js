import { defineStore } from 'pinia';
import { api } from '../utils/api';

export const useConflictStore = defineStore('conflict', {
  state: () => ({
    conflicts: [],
    loading: false,
    currentConflict: null
  }),
  actions: {
    async fetchConflicts() {
      this.loading = true;
      try {
        this.conflicts = await api.getConflicts();
      } finally {
        this.loading = false;
      }
    },
    async detectGlobal() {
      const results = await api.detectGlobal();
      await this.fetchConflicts();
      return results;
    },
    async detectPair(planId1, planId2) {
      return await api.detectPair(planId1, planId2);
    },
    async fetchConflict(id) {
      this.currentConflict = await api.getConflict(id);
      return this.currentConflict;
    },
    async deleteConflict(id) {
      await api.deleteConflict(id);
      await this.fetchConflicts();
    }
  }
});
