import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../views/MainLayout.vue';
import AgentView from '../views/AgentView.vue';

const routes = [
  { path: '/', name: 'main', component: MainLayout },
  { path: '/agent/:conflictId', name: 'agent', component: AgentView, props: true }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
