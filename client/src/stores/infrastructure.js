import { defineStore } from 'pinia'
import { api } from '../utils/api'

export const useInfrastructureStore = defineStore('infrastructure', {
  state: () => ({
    summary: null,
    facilities: [],
    alerts: [],
    orders: [],
    selectedFacilityId: null,
    coverageEvaluation: null,
    loading: false
  }),
  getters: {
    selectedFacility(state) {
      return state.facilities.find(item => item.id === state.selectedFacilityId) || null
    },
    activeAlerts(state) {
      return state.alerts.filter(item => !['resolved', 'closed'].includes(item.status))
    },
    pendingOrders(state) {
      return state.orders.filter(item => !['completed', 'closed'].includes(item.status))
    }
  },
  actions: {
    async fetchAll(params = {}) {
      this.loading = true
      try {
        const [summary, facilities, alerts, orders] = await Promise.all([
          api.getInfrastructureSummary(),
          api.getFacilities(params),
          api.getFacilityAlerts(),
          api.getMaintenanceOrders()
        ])
        this.summary = summary
        this.facilities = facilities
        this.alerts = alerts
        this.orders = orders
        if (!this.selectedFacilityId && facilities.length) {
          this.selectedFacilityId = facilities[0].id
        }
      } finally {
        this.loading = false
      }
    },
    async fetchFacilities(params = {}) {
      this.facilities = await api.getFacilities(params)
      if (!this.facilities.some(item => item.id === this.selectedFacilityId)) {
        this.selectedFacilityId = this.facilities[0]?.id || null
      }
    },
    selectFacility(id) {
      this.selectedFacilityId = id
    },
    async updateFacilityStatus(id, data) {
      const facility = await api.updateFacilityStatus(id, data)
      const index = this.facilities.findIndex(item => item.id === id)
      if (index >= 0) this.facilities[index] = facility
      this.summary = await api.getInfrastructureSummary()
      return facility
    },
    async closeAlert(id) {
      const alert = await api.updateFacilityAlert(id, { status: 'closed' })
      const index = this.alerts.findIndex(item => item.id === id)
      if (index >= 0) this.alerts[index] = alert
      this.summary = await api.getInfrastructureSummary()
      return alert
    },
    async createOrderFromAlert(alert) {
      const order = await api.createMaintenanceOrder({
        facility_id: alert.facility_id,
        alert_id: alert.id,
        order_type: alert.alert_type === 'maintenance' ? 'inspection' : 'repair',
        priority: alert.severity === 'high' ? 'high' : 'medium',
        status: 'pending',
        assignee: alert.facility?.type === 'radar' ? '雷达运维组' : '综合运维组',
        description: alert.description || alert.title
      })
      this.orders = await api.getMaintenanceOrders()
      return order
    },
    async completeOrder(id, result = '设备状态已恢复，完成现场复核。') {
      const order = await api.updateMaintenanceOrder(id, { status: 'completed', result })
      const index = this.orders.findIndex(item => item.id === id)
      if (index >= 0) this.orders[index] = order
      this.summary = await api.getInfrastructureSummary()
      return order
    },
    async evaluateRoute(route) {
      this.coverageEvaluation = await api.evaluateInfrastructureCoverage({
        route,
        required_capabilities: ['communication', 'surveillance', 'identification']
      })
      return this.coverageEvaluation
    }
  }
})
