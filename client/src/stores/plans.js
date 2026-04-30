import { defineStore } from 'pinia';
import { api } from '../utils/api';

export const usePlansStore = defineStore('plans', {
  state: () => ({
    plans: [],
    operators: [],
    loading: false
  }),
  actions: {
    async fetchPlans(params = {}) {
      this.loading = true;
      try {
        this.plans = await api.getPlans(params);
      } finally {
        this.loading = false;
      }
    },
    async fetchOperators() {
      this.operators = await api.getOperators();
    },
    async createPlan(data) {
      const plan = await api.createPlan(data);
      await this.fetchPlans();
      return plan;
    },
    async updatePlan(id, data) {
      const plan = await api.updatePlan(id, data);
      await this.fetchPlans();
      return plan;
    },
    async deletePlan(id) {
      await api.deletePlan(id);
      await this.fetchPlans();
    }
  }
});
