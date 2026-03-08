import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/LoginPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/RegisterPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('../layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../pages/SpaceListPage.vue'),
        },
        {
          path: 'spaces/:id',
          name: 'space-detail',
          component: () => import('../pages/SpaceDetailPage.vue'),
        },
        {
          path: 'spaces/:id/tasks',
          name: 'tasks',
          component: () => import('../pages/TaskListPage.vue'),
        },
        {
          path: 'spaces/:id/journals',
          name: 'journals',
          component: () => import('../pages/JournalPage.vue'),
        },
        {
          path: 'spaces/:id/ai',
          name: 'ai-suggest',
          component: () => import('../pages/AiSuggestPage.vue'),
        },
        {
          path: 'spaces/:id/random',
          name: 'random-pick',
          component: () => import('../pages/RandomPickPage.vue'),
        },
        {
          path: 'recommend',
          name: 'recommend',
          component: () => import('../pages/RecommendPage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.user && !auth.checked) {
    await auth.fetchMe()
  }

  if (to.meta.requiresAuth && !auth.user) {
    return { name: 'login' }
  }
  if (to.meta.guest && auth.user) {
    return { name: 'home' }
  }
})

export default router
