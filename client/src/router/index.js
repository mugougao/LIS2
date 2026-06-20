import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../views/MainLayout.vue';
import AgentView from '../views/AgentView.vue';
import SituationMonitoringPage from '../views/SituationMonitoringPage.vue';
import InfrastructureView from '../views/InfrastructureView.vue';

const routes = [
  { path: '/', name: 'main', component: MainLayout },
  { path: '/conflict', name: 'conflict', component: SituationMonitoringPage },
  { path: '/infrastructure', name: 'infrastructure', component: InfrastructureView },
  { path: '/agent', name: 'agent-list', component: () => import('../views/AgentListView.vue') },
  { path: '/agent/:conflictId', name: 'agent', component: AgentView, props: true }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
