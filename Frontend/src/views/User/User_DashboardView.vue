<template>
  <div v-if="!loading" class="min-h-screen bg-[#F8FAFC]">
    <nav class="bg-white/80 backdrop-blur-md shadow-sm px-4 md:px-8 py-2 md:py-3 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100">
      <div class="flex items-center gap-2">
        <img src="/logo-aiia-chat.png" alt="Logo" class="h-7 md:h-10 w-auto object-contain" />
        <h1 class="text-base md:text-xl font-extrabold bg-gradient-to-r from-[#2563EB] to-[#10B981] bg-clip-text text-transparent hidden xs:block tracking-tight">
          AIIA World
        </h1>
      </div>

      <div class="flex items-center gap-2 md:gap-4">
        <div class="flex items-center gap-1 bg-yellow-50 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-yellow-200 shrink-0">
          <span class="text-xs md:text-base">💰</span>
          <span class="font-bold text-yellow-700 text-xs md:text-base">{{ userProfile?.coins || 0 }}</span>
        </div>

        <div class="flex items-center gap-2 md:gap-3 pl-2 border-l border-gray-200 relative">
          <div class="text-right hidden sm:block">
            <p class="text-xs font-bold text-gray-900 line-clamp-1">{{ userProfile?.name }}</p>
            <p class="text-[10px] text-blue-600 font-medium">Lv.{{ userProfile?.level }} Creator</p>
          </div>

          <div class="relative inline-block text-left">
            <button @click.stop="showDropdown = !showDropdown" class="flex items-center focus:outline-none">
              <img :src="userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.id || 'guest'}`"
                class="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm ring-2 ring-blue-50 object-cover" />
            </button>
            <transition name="fade-slide">
              <div v-if="showDropdown" v-click-outside="() => showDropdown = false"
                class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[100]">
                <button @click="$router.push('/profile')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2">
                  <span>⚙️</span> ตั้งค่าโปรไฟล์
                </button>
                <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
                  <span>🚪</span> ออกจากระบบ
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-10">
      <section class="relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 text-white shadow-xl bg-gradient-to-br from-[#1E40AF] via-[#3B82F6] to-[#10B981]">
        <div class="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div class="max-w-xl text-center lg:text-left">
            <h2 class="text-2xl md:text-4xl font-black mb-4 leading-tight">สร้างสายสัมพันธ์ที่ไร้ขีดจำกัด 🌌</h2>
            <p class="text-blue-50 text-sm md:text-lg opacity-90 mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
              {{ randomMessage }} ยิ่งคุยมาก ยิ่งสนิทมาก พร้อมปลดล็อกเรื่องราวสุดพิเศษหรือยัง?
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button @click="$router.push('/create-character')"
                class="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base">
                <span>➕</span> สร้าง AI ใหม่
              </button>
              <button @click="handleDailyCheckIn"
                class="bg-white/10 backdrop-blur-md border border-white/30 px-8 py-3.5 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center text-sm md:text-base">
                🎁 โบนัสรายวัน
              </button>
            </div>
          </div>

          <div class="hidden md:block w-full max-w-[260px]">
            <div class="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 mb-4 text-center">Creator Progress</p>
              <div class="flex justify-between text-sm mb-2 font-black">
                <span>Level {{ userProfile?.level }}</span>
                <span>{{ (myCharacters.length % 5) * 20 }}%</span>
              </div>
              <div class="w-full bg-black/20 rounded-full h-2.5">
                <div class="bg-green-400 h-2.5 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.6)] transition-all duration-700"
                  :style="{ width: (myCharacters.length % 5) * 20 + '%' }"></div>
              </div>
              <p class="text-[11px] mt-4 opacity-80 text-center italic font-medium">สร้างอีก {{ 5 - (myCharacters.length % 5) }} ตัวเพื่อเลื่อนระดับ!</p>
            </div>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div v-for="stat in stats" :key="stat.label"
          class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div class="flex justify-between items-center mb-3">
            <span class="text-xl md:text-3xl">{{ stat.icon }}</span>
            <span class="text-[9px] md:text-[11px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-600 uppercase">{{ stat.trend }}</span>
          </div>
          <p class="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{{ stat.label }}</p>
          <h2 class="text-lg md:text-3xl font-black text-gray-800">{{ stat.value }}</h2>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8 md:gap-12">
        <div class="lg:col-span-2 space-y-10">
          <section>
            <div class="flex justify-between items-end mb-6 px-1">
              <h3 class="text-lg md:text-xl font-black text-gray-800 flex items-center gap-2">
                🎭 สตูดิโอของคุณ <span class="text-xs md:text-sm font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{{ myCharacters.length }}</span>
              </h3>
            </div>

            <div v-if="myCharacters.length === 0" class="bg-white rounded-3xl border-2 border-dashed border-gray-200 py-16 text-center shadow-inner">
              <div class="text-4xl mb-4">✨</div>
              <p class="text-gray-400 text-sm font-bold">ยังไม่มี AI ในสังกัด เริ่มสร้างตัวแรกเลย!</p>
              <button @click="$router.push('/create-character')" class="mt-4 text-blue-600 font-black text-sm hover:underline tracking-wide uppercase">สร้างตัวละครแรก</button>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="char in myCharacters" :key="char.id"
                class="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-50 hover:border-blue-300 hover:shadow-xl transition-all group cursor-pointer active:scale-[0.97]"
                @click="goChat(char)">
                <div class="flex gap-4">
                  <div class="relative shrink-0">
                    <img :src="char.image_url" class="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300" />
                    <div class="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-sm">
                      <div class="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 class="font-black text-gray-900 truncate text-base md:text-lg mb-0.5">{{ char.name }}</h4>
                    <p class="text-xs text-gray-500 line-clamp-1 mb-2 font-medium">{{ char.short_description }}</p>
                    <div class="flex items-center gap-4 text-[11px] font-black text-slate-400">
                      <span class="flex items-center gap-1"><i class="text-rose-500">❤️</i> {{ char.likes_count || 0 }}</span>
                      <span class="flex items-center gap-1"><i>👁️</i> {{ char.views_count || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-lg md:text-xl font-black text-gray-800 mb-6 px-1 flex items-center gap-2">🔥 ตัวละครยอดนิยม</h3>
            <div class="flex gap-4 overflow-x-auto pb-6 px-1 no-scrollbar snap-x scroll-smooth w-full">
              <div v-for="(char, index) in globalPopular" :key="char.id"
                class="min-w-[180px] md:min-w-[240px] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer snap-start relative active:scale-95 group"
                @click="goChat(char)">
                <div class="relative h-32 md:h-40 overflow-hidden">
                  <img :src="char.image_url" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  <div v-if="index < 3" class="absolute top-3 left-3 bg-yellow-400 text-black px-2.5 py-1 rounded-xl text-[10px] font-black shadow-lg">
                    RANK #{{ index + 1 }}
                  </div>
                </div>
                <div class="p-4">
                  <h4 class="text-sm md:text-base font-black text-gray-900 truncate mb-1">{{ char.name }}</h4>
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase">{{ char.categories?.[0] }}</span>
                    <span class="text-[10px] font-bold text-gray-400 italic">Popular</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="space-y-8">
          <section class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 class="font-black text-gray-800 mb-6 text-base md:text-lg flex items-center gap-2">
              <span class="p-2 bg-blue-50 rounded-xl">🔔</span> กิจกรรมล่าสุด
            </h3>
            <div class="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              <div v-if="activities.length === 0" class="text-center py-8 text-xs text-gray-400 italic font-medium">ไม่มีกิจกรรมล่าสุด</div>
              <div v-for="(item, i) in activities" :key="i" class="relative flex gap-4 items-start pl-1">
                <div class="z-10 w-[10px] h-[10px] mt-1.5 rounded-full bg-blue-500 ring-4 ring-white shadow-sm"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs md:text-sm font-bold text-gray-800 leading-snug">{{ item.text }}</p>
                  <p class="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{{ item.time }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <DailyBonusModal ref="dailyBonusModalRef" :userProfile="userProfile" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2' 
import { db, auth } from '../../../firebase/config.js'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import {
  doc, onSnapshot, collection, query, where,
  orderBy, limit, setDoc, serverTimestamp
} from 'firebase/firestore'

// --- 1. Import DailyBonusModal ---
import DailyBonusModal from '../User/DailyBonusModal.vue'

const router = useRouter()
const userProfile = ref(null)
const myCharacters = ref([])
const globalPopular = ref([])
const activities = ref([])
const loading = ref(true)
const showDropdown = ref(false)

// ตัวแปรสำหรับอ้างอิงถึง Component Modal
const dailyBonusModalRef = ref(null)

// --- 2. Auth & Profile Sync ---
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid)

      onSnapshot(userRef, async (snap) => {
        if (snap.exists()) {
          userProfile.value = { id: snap.id, ...snap.data() }
        } else {
          const newUser = {
            name: user.displayName || `Explorer_${Math.floor(Math.random() * 1000)}`,
            email: user.email,
            coins: 100,
            level: 1,
            checkInCount: 0,
            photoURL: user.photoURL || null,
            created_at: serverTimestamp()
          }
          await setDoc(userRef, newUser)
          userProfile.value = newUser
        }

        fetchMyCharacters(user.uid)
        fetchActivities(user.uid)
        loading.value = false
      })
    } else {
      router.push('/')
    }
    fetchPopularCharacters()
  })
})

// --- 3. Logic Functions ---

// ฟังก์ชันเรียกใช้ Modal จากไฟล์ DailyBonusModal.vue
const handleDailyCheckIn = () => {
  if (dailyBonusModalRef.value) {
    dailyBonusModalRef.value.showModal()
  }
}

const handleLogout = async () => {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
    await signOut(auth)
    router.push('/')
  }
}

const fetchMyCharacters = (uid) => {
  const q = query(collection(db, 'characters'), where('creator_id', '==', uid), orderBy('created_at', 'desc'))
  onSnapshot(q, (snap) => {
    myCharacters.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
}

const fetchPopularCharacters = () => {
  const q = query(collection(db, 'characters'), orderBy('views_count', 'desc'), limit(5))
  onSnapshot(q, (snap) => {
    globalPopular.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
}

const fetchActivities = (uid) => {
  const q = query(collection(db, 'activities'), where('user_id', '==', uid), orderBy('time', 'desc'), limit(5))
  onSnapshot(q, (snap) => {
    activities.value = snap.docs.map(doc => doc.data())
  })
}

// Custom directive สำหรับคลิกข้างนอกแล้วปิด dropdown
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

// --- 4. Computed Stats ---
const stats = computed(() => [
  { label: 'AI Characters', value: myCharacters.value.length, icon: '🎭', trend: 'Owned' },
  { label: 'Coins', value: userProfile.value?.coins || 0, icon: '💰', trend: 'Wallet' },
  { label: 'My Total Likes', value: myCharacters.value.reduce((acc, cur) => acc + (cur.likes_count || 0), 0), icon: '❤️', trend: 'Popularity' },
  { label: 'Reputation', value: `Lv.${userProfile.value?.level || 1}`, icon: '🏆', trend: 'Rank' }
])

const messages = ["AI ของคุณกำลังรอข้อความใหม่นะ 💕", "พร้อมคุยหรือยัง?", "โลกใบนี้สร้างขึ้นมาเพื่อคุณโดยเฉพาะ 🌌"]
const randomMessage = computed(() => messages[Math.floor(Math.random() * messages.length)])

const goChat = (char) => router.push(`/chat/${char.id}`)
</script>

<style scoped>
/* 1. ล็อค Container หลักไม่ให้ไถลออกนอกจอ */
.min-h-screen {
  overflow-x: hidden; /* ล็อคแกน X ทั้งหน้าจอ */
  width: 100%;
  position: relative;
}

/* 2. จัดการ Main Content ให้พอดีขอบเสมอ */
main {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

/* 3. แก้ไขจุดที่มักจะดันหน้าจอ (Popular Characters) */
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
  display: flex;
  width: 100%; /* บังคับให้กว้างเท่าที่พ่อแม่ยอมให้เป็น */
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* ให้เลื่อนในมือถือลื่นๆ */
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* 4. ปรับขนาด Card ใน Mobile ให้เล็กลงเพื่อไม่ให้เบียดขอบ */
@media (max-width: 640px) {
  .min-w-\[180px\] {
    min-w: 145px !important; 
  }
  
  main {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }

  h2, h3, h4, p {
    overflow-wrap: break-word;
    word-break: break-word;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>