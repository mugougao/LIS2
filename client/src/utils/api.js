const BASE_URL = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  getOperators: () => request('/operators'),
  createOperator: (data) => request('/operators', { method: 'POST', body: JSON.stringify(data) }),

  getInfrastructureSummary: () => request('/infrastructure/summary'),
  getFacilities: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/infrastructure/facilities${qs ? '?' + qs : ''}`);
  },
  getFacility: (id) => request(`/infrastructure/facilities/${id}`),
  createFacility: (data) => request('/infrastructure/facilities', { method: 'POST', body: JSON.stringify(data) }),
  updateFacility: (id, data) => request(`/infrastructure/facilities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFacility: (id) => request(`/infrastructure/facilities/${id}`, { method: 'DELETE' }),
  updateFacilityStatus: (id, data) => request(`/infrastructure/facilities/${id}/status`, { method: 'POST', body: JSON.stringify(data) }),
  getFacilityStatusHistory: (id, limit = 30) => request(`/infrastructure/facilities/${id}/status?limit=${limit}`),
  getFacilityAlerts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/infrastructure/alerts${qs ? '?' + qs : ''}`);
  },
  createFacilityAlert: (data) => request('/infrastructure/alerts', { method: 'POST', body: JSON.stringify(data) }),
  updateFacilityAlert: (id, data) => request(`/infrastructure/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getMaintenanceOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/infrastructure/maintenance/orders${qs ? '?' + qs : ''}`);
  },
  createMaintenanceOrder: (data) => request('/infrastructure/maintenance/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateMaintenanceOrder: (id, data) => request(`/infrastructure/maintenance/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  evaluateInfrastructureCoverage: (data) => request('/infrastructure/coverage/evaluate', { method: 'POST', body: JSON.stringify(data) }),

  getPlans: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/plans${qs ? '?' + qs : ''}`);
  },
  getPlan: (id) => request(`/plans/${id}`),
  createPlan: (data) => request('/plans', { method: 'POST', body: JSON.stringify(data) }),
  updatePlan: (id, data) => request(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePlan: (id) => request(`/plans/${id}`, { method: 'DELETE' }),

  getNoFlyZones: () => request('/nofly'),
  getNoFlyZone: (id) => request(`/nofly/${id}`),
  createNoFlyZone: (data) => request('/nofly', { method: 'POST', body: JSON.stringify(data) }),
  updateNoFlyZone: (id, data) => request(`/nofly/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNoFlyZone: (id) => request(`/nofly/${id}`, { method: 'DELETE' }),

  routePlan: (start, end, avoidanceZones) =>
    request('/routing/plan', { method: 'POST', body: JSON.stringify({ start, end, avoidance_zones: avoidanceZones }) }),
  replanRoute: (planId, avoidanceZones) =>
    request('/routing/replan', { method: 'POST', body: JSON.stringify({ planId, avoidance_zones: avoidanceZones }) }),

  detectGlobal: () => request('/conflicts/detect'),
  detectPair: (planId1, planId2) =>
    request('/conflicts/detect-pair', { method: 'POST', body: JSON.stringify({ planId1, planId2 }) }),
  getConflicts: () => request('/conflicts'),
  getConflict: (id) => request(`/conflicts/${id}`),
  deleteConflict: (id) => request(`/conflicts/${id}`, { method: 'DELETE' }),

  createSession: (conflictEventId) =>
    request('/agent/session', { method: 'POST', body: JSON.stringify({ conflictEventId }) }),
  getSession: (id) => request(`/agent/session/${id}`)
};
