import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import { auth, db } from '../../firebase/config.js'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import UserProfileView from '@/views/User/User_Profile.vue'

// ฟังก์ชันพิเศษสำหรับรอเช็คสถานะจาก Firebase ให้เสร็จก่อน
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        removeListener();
        resolve(user);
      },
      reject
    );
  });
};

const routes = [
  { path: '/', name: 'login', component: LoginView },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/User/User_DashboardView.vue'),
    meta: { requiresAuth: true, role: 'user' }
  },
  ,
  {
    path: '/profile',
    name: 'profile',
    component: UserProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-character',
    name: 'create-character',
    component: () => import('@/views/User/Create_CharacterView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat/:id',
    name: 'Chat',
    component: () => import('../views/User/ChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/views/Admin/Admin_DashboardView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// แก้ไขเป็น async เพื่อใช้ await
router.beforeEach(async (to, from) => {
  // 1. รอเช็คสถานะจาก Firebase Auth จริงๆ ไม่ใช้แค่ localStorage
  const firebaseUser = await getCurrentUser();

  // 2. ถ้ามี User ใน Auth ให้ไปดึง Role จาก Firestore มาเช็คด้วย
  let userRole = null;
  if (firebaseUser) {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      userRole = userDoc.data().is_admin ? 'admin' : 'user';
    }
  }

  const isLoggedIn = !!firebaseUser;

  // -- LOGIC การตรวจสอบ --

  // 1. ถ้าหน้าต้องการ Auth แต่ยังไม่ได้ Login -> ไปหน้า Login
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login' };
  }

  // 2. ถ้าเข้าหน้าที่มีการกำหนด Role (เช่น admin) แต่สิทธิ์ไม่ถึง
  if (to.meta.role === 'admin' && userRole !== 'admin') {
    return { name: 'dashboard' };
  }

  // 3. ถ้า Login แล้ว แต่อยากไปหน้า Login อีก -> ดีดออกไปหน้าที่ควรอยู่
  if (to.name === 'login' && isLoggedIn) {
    return userRole === 'admin' ? { name: 'admin-dashboard' } : { name: 'dashboard' };
  }

  return true;
});

export default router