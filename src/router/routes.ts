import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/loginAnimated.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: false,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/register.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: false,
    },
  },
  {
    path: '/simple-login',
    name: 'SimpleLogin',
    component: () => import('@/pages/simpleLogin.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: false,
    },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/pages/index.vue'),
    meta: {
      layout: 'default',
      requiresAuth: false,
    },
  },
  {
    path: '/pandavideo',
    name: 'PandaVideo',
    component: () => import('@/pages/pandavideo.vue'),
    meta: {
      layout: 'default',
      requiresAuth: true,
    },
  },
  {
    path: '/video/:id',
    name: 'Video',
    component: () => import('@/pages/video/[id].vue'),
    meta: {
      layout: 'default',
      requiresAuth: true,
    },
    props: true,
  },
  {
    path: '/',
    redirect: '/home',
  },
]
