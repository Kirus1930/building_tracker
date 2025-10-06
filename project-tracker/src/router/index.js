import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

import Login from '@/components/Login.vue';
import ProjectsList from '@/components/ProjectsList.vue';
import ProjectsAdd from '@/components/ProjectsAdd.vue';
import ProjectsView from '@/components/ProjectsView.vue';
import ProjectsEdit from '@/components/ProjectsEdit.vue';

const routes = [
  { path: '/', redirect: '/projects' },

  // Экран авторизации — открытый
  { path: '/login', name: 'Login', component: Login },

  // Остальные — только для вошедших пользователей:
  {
    path: '/projects',
    name: 'ProjectsList',
    component: ProjectsList,
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/add',
    name: 'ProjectsAdd',
    component: ProjectsAdd,
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/:id',
    name: 'ProjectsView',
    component: ProjectsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/edit/:id',
    name: 'ProjectsEdit',
    component: ProjectsEdit,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Глобальная защита маршрутов:
router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth();
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Сохраняем желаемый путь для возврата после успешного входа:
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (to.name === 'Login' && isAuthenticated.value) {
    // Уже вошёл — нет смысла на логин, отправим на проекты:
    next({ name: 'ProjectsList' });
  } else {
    next();
  }
});

export default router;