import { defineStore } from 'pinia';
import { api } from '../utils/api';

export const useNoFlyStore = defineStore('nofly', {
  state: () => ({
    zones: [],
    loading: false
  }),
  actions: {
    async fetchZones() {
      this.loading = true;
      try {
        this.zones = await api.getNoFlyZones();
      } finally {
        this.loading = false;
      }
    },
    async createZone(data) {
      const zone = await api.createNoFlyZone(data);
      await this.fetchZones();
      return zone;
    },
    async updateZone(id, data) {
      const zone = await api.updateNoFlyZone(id, data);
      await this.fetchZones();
      return zone;
    },
    async deleteZone(id) {
      await api.deleteNoFlyZone(id);
      await this.fetchZones();
    }
  }
});
