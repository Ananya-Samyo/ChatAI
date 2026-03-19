<template>
  <div v-if="!loading" class="min-h-screen bg-[#F8FAFC]">
    <nav class="bg-white px-4 md:px-6 py-3 shadow-sm sticky top-0 z-50 border-b border-gray-100 flex items-center gap-4">
      <button @click="$router.back()" class="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
      </button>
      <h1 class="text-xl font-black text-gray-900">ตั้งค่าโปรไฟล์ Creator</h1>
    </nav>

    <main class="max-w-4xl mx-auto p-4 md:p-8 space-y-10">
      <section class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <div class="relative flex-shrink-0 group">
          <img :src="userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.name}`" 
               class="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md ring-4 ring-blue-50 object-cover" />
          <button class="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.83z" />
            </svg>
          </button>
        </div>
        
        <div class="flex-1 min-w-0 text-center md:text-left space-y-4">
          <div class="space-y-1">
            <input v-model="userProfile.name" type="text" class="text-2xl font-extrabold text-gray-950 bg-transparent border-b border-dashed border-gray-200 focus:border-blue-300 focus:outline-none focus:ring-0 p-1 rounded w-full md:w-auto" />
            <p class="text-xs text-gray-400 italic">UID: {{ userProfile?.id }}</p>
          </div>
          
          <div class="flex flex-wrap gap-2 justify-center md:justify-start">
            <span class="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">Lv.{{ userProfile?.level || 1 }} Creator</span>
            <span v-if="userProfile?.is_admin" class="text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-100">🛡️ Admin สิทธิ์ครบ</span>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="font-black text-gray-800 flex items-center gap-2">💰 กระเป๋าเหรียญ</h3>
            <span class="text-3xl font-black text-yellow-600 tracking-tight">{{ userProfile?.coins || 0 }}</span>
          </div>
          <div class="space-y-3">
            <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
               <div class="bg-yellow-400 h-full rounded-full transition-all duration-1000" :style="{ width: (userProfile?.coins > 1000 ? 100 : (userProfile?.coins/10)) + '%' }"></div>
            </div>
            <p class="text-[11px] text-gray-400 italic">coins: {{ userProfile?.coins || 0 }} (max view display 1000)</p>
          </div>
          <button class="w-full bg-yellow-50 text-yellow-700 py-3 rounded-xl font-bold text-sm hover:bg-yellow-100 transition-all flex items-center justify-center gap-2 active:scale-95">
             เติมเงิน / ซื้อ coins
          </button>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="font-black text-gray-800 flex items-center gap-2">🏆 เลเวล & Reputation</h3>
            <span class="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">Level {{ userProfile?.level || 1 }}</span>
          </div>
          <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
            <p class="text-xs text-gray-500 font-medium">ความคืบหน้าการสร้างตัวละคร (สำหรับอัปเลเวล)</p>
            <div class="w-full bg-black/5rounded-full h-2.5">
              <div class="bg-gradient-to-r from-blue-500 to-green-400 h-2.5 rounded-full shadow-inner shadow-black/10 transition-all duration-500" 
                   :style="{ width: progressToNextLevel + '%' }"></div>
            </div>
            <p class="text-[10px] opacity-80 text-center italic text-gray-400">สร้างครบ 5 ตัวละครเพื่อเลื่อนระดับ</p>
          </div>
        </div>
      </section>

      <section class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <h3 class="font-black text-gray-800 text-base flex items-center gap-2">🔐 บัญชีและความปลอดภัย</h3>
        
        <div class="space-y-5">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">อีเมลที่ใช้งาน</label>
            <p class="text-base font-bold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100 cursor-not-allowed">{{ userProfile?.email || 'N/A' }}</p>
          </div>
          
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">เปลี่ยนรหัสผ่าน</label>
            <button class="flex w-full md:w-auto items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors active:scale-95">
              🗝️ ขอส่งลิงก์เปลี่ยนรหัสผ่านไปทางอีเมล
            </button>
          </div>
        </div>
      </section>

      <footer class="text-right">
        <button class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2">
          <span>💾</span> บันทึกการตั้งค่า
        </button>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db, auth } from '../../../firebase/config.js' // path ถอยตามโครงสร้างรูป
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const router = useRouter()
const userProfile = ref({}) // เริ่มต้นด้วย Object ว่างเพื่อรองรับ v-model
const loading = ref(true)

// Mockup data (ในระบบจริงต้องดึงจากคอลเลกชัน characters ของผู้ใช้)
const charactersOwnedCount = ref(1) // สมมติว่าสร้างแล้ว 1 ตัว

// --- 1. ตรวจสอบสถานะและดึงข้อมูลโปรไฟล์แบบ Real-time ---
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid)
      
      // ดึงข้อมูล Real-time เพื่อให้หน้าจอนี้อัปเดตตลอด
      onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          userProfile.value = { id: snap.id, ...snap.data() }
          // คำนวณความคืบหน้าเลเวล
          // ... สามารถเพิ่ม Logic ดึงจำนวน characters จริงตรงนี้ ...
          loading.value = false 
        }
      })
    } else {
      router.push('/') // ดีดกลับถ้าไม่ได้ Login
    }
  })
})

// --- 2. การคำนวณ Stats ---

// คำนวณเปอร์เซ็นต์ความคืบหน้าของ Creator Level (สร้าง 5 ตัว = อัป 1 เลเวล)
const progressToNextLevel = ref((charactersOwnedCount.value % 5) * 20)
</script>