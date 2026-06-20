const express = require('express');
const router = express.Router();
const operatorService = require('../services/operatorService');
const planService = require('../services/planService');
const noflyService = require('../services/noflyService');
const conflictService = require('../services/conflictService');
const routingService = require('../services/routingService');
const agentService = require('../services/agentService');
const infrastructureService = require('../services/infrastructureService');

// Operators
router.get('/operators', (req, res) => {
  res.json(operatorService.listOperators());
});

// Infrastructure
router.get('/infrastructure/summary', (req, res) => {
  res.json(infrastructureService.getSummary());
});

router.get('/infrastructure/facilities', (req, res) => {
  res.json(infrastructureService.listFacilities(req.query));
});

router.get('/infrastructure/facilities/:id', (req, res) => {
  const facility = infrastructureService.getFacility(req.params.id);
  if (!facility) return res.status(404).json({ error: '基础设施不存在' });
  res.json(facility);
});

router.post('/infrastructure/facilities', (req, res) => {
  try {
    const facility = infrastructureService.createFacility(req.body);
    res.status(201).json(facility);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/infrastructure/facilities/:id', (req, res) => {
  try {
    const facility = infrastructureService.updateFacility(req.params.id, req.body);
    if (!facility) return res.status(404).json({ error: '基础设施不存在' });
    res.json(facility);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/infrastructure/facilities/:id', (req, res) => {
  const ok = infrastructureService.deleteFacility(req.params.id);
  if (!ok) return res.status(404).json({ error: '基础设施不存在' });
  res.json({ success: true });
});

router.get('/infrastructure/facilities/:id/status', (req, res) => {
  res.json(infrastructureService.listStatusSnapshots(req.params.id, req.query.limit));
});

router.post('/infrastructure/facilities/:id/status', (req, res) => {
  const facility = infrastructureService.updateFacilityStatus(req.params.id, req.body);
  if (!facility) return res.status(404).json({ error: '基础设施不存在' });
  res.json(facility);
});

router.get('/infrastructure/alerts', (req, res) => {
  res.json(infrastructureService.listAlerts(req.query));
});

router.post('/infrastructure/alerts', (req, res) => {
  try {
    const alert = infrastructureService.createAlert(req.body);
    res.status(201).json(alert);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/infrastructure/alerts/:id', (req, res) => {
  const alert = infrastructureService.updateAlert(req.params.id, req.body);
  if (!alert) return res.status(404).json({ error: '告警不存在' });
  res.json(alert);
});

router.get('/infrastructure/maintenance/orders', (req, res) => {
  res.json(infrastructureService.listMaintenanceOrders(req.query));
});

router.post('/infrastructure/maintenance/orders', (req, res) => {
  try {
    const order = infrastructureService.createMaintenanceOrder(req.body);
    res.status(201).json(order);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/infrastructure/maintenance/orders/:id', (req, res) => {
  const order = infrastructureService.updateMaintenanceOrder(req.params.id, req.body);
  if (!order) return res.status(404).json({ error: '工单不存在' });
  res.json(order);
});

router.post('/infrastructure/coverage/evaluate', (req, res) => {
  res.json(infrastructureService.evaluateCoverage(req.body));
});

router.post('/operators', (req, res) => {
  try {
    const op = operatorService.createOperator(req.body);
    res.status(201).json(op);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Flight Plans
router.get('/plans', (req, res) => {
  res.json(planService.listPlans(req.query));
});

router.get('/plans/:id', (req, res) => {
  const plan = planService.getPlan(req.params.id);
  if (!plan) return res.status(404).json({ error: '计划不存在' });
  res.json(plan);
});

router.post('/plans', (req, res) => {
  try {
    let data = { ...req.body };
    if (!data.waypoints && data.start_lat && data.end_lat) {
      const start = [data.start_lon, data.start_lat, data.start_alt];
      const end = [data.end_lon, data.end_lat, data.end_alt];
      data.waypoints = routingService.planRouteDirect(start, end);
    }
    const plan = planService.createPlan(data);
    res.status(201).json(plan);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/plans/:id', (req, res) => {
  const plan = planService.updatePlan(req.params.id, req.body);
  if (!plan) return res.status(404).json({ error: '计划不存在' });
  res.json(plan);
});

router.delete('/plans/:id', (req, res) => {
  const ok = planService.deletePlan(req.params.id);
  if (!ok) return res.status(404).json({ error: '计划不存在' });
  res.json({ success: true });
});

// No-Fly Zones
router.get('/nofly', (req, res) => {
  res.json(noflyService.listNoFlyZones());
});

router.get('/nofly/:id', (req, res) => {
  const zone = noflyService.getNoFlyZone(req.params.id);
  if (!zone) return res.status(404).json({ error: '禁飞区不存在' });
  res.json(zone);
});

router.post('/nofly', (req, res) => {
  try {
    const zone = noflyService.createNoFlyZone(req.body);
    res.status(201).json(zone);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/nofly/:id', (req, res) => {
  const zone = noflyService.updateNoFlyZone(req.params.id, req.body);
  if (!zone) return res.status(404).json({ error: '禁飞区不存在' });
  res.json(zone);
});

router.delete('/nofly/:id', (req, res) => {
  const ok = noflyService.deleteNoFlyZone(req.params.id);
  if (!ok) return res.status(404).json({ error: '禁飞区不存在' });
  res.json({ success: true });
});

// Routing
router.post('/routing/plan', (req, res) => {
  try {
    const { start, end, avoidance_zones } = req.body;
    const result = routingService.planRouteDirect(start, end, avoidance_zones || []);
    res.json({ waypoints: result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/routing/replan', (req, res) => {
  try {
    const { planId, avoidance_zones } = req.body;
    const result = routingService.replanRoute(planId, avoidance_zones || []);
    if (!result) return res.status(404).json({ error: '计划不存在' });
    res.json({ waypoints: result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Conflicts
router.get('/conflicts/detect', (req, res) => {
  try {
    const results = conflictService.detectGlobal();
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/conflicts/detect-pair', (req, res) => {
  try {
    const { planId1, planId2 } = req.body;
    const result = conflictService.detectPair(planId1, planId2);
    if (result === null) return res.json({ hasConflict: false });
    res.json({ hasConflict: true, ...result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/conflicts', (req, res) => {
  res.json(conflictService.listConflicts());
});

router.get('/conflicts/:id', (req, res) => {
  const conflict = conflictService.getConflict(req.params.id);
  if (!conflict) return res.status(404).json({ error: '冲突不存在' });
  res.json(conflict);
});

router.delete('/conflicts/:id', (req, res) => {
  conflictService.deleteConflict(req.params.id);
  res.json({ success: true });
});

// Agent Session
router.post('/agent/session', (req, res) => {
  try {
    const session = agentService.createSession(req.body.conflictEventId);
    res.status(201).json(session);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/agent/session/:id', (req, res) => {
  const session = agentService.getSession(req.params.id);
  if (!session) return res.status(404).json({ error: '会话不存在' });
  const messages = agentService.getSessionMessages(req.params.id);
  res.json({ session, messages });
});

module.exports = router;
