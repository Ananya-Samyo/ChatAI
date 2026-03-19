<template>
  <div v-if="!loading" class="min-h-screen bg-[#F8FAFC]">
    <nav class="bg-white/80 backdrop-blur-md shadow-sm px-6 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100">
      <div class="flex items-center gap-2">
        <img src="/logo-aiia-chat.png" alt="AIIA chat Logo" class="h-10 w-auto object-contain" />
        <h1 class="text-xl font-extrabold bg-gradient-to-r from-[#2563EB] to-[#10B981] bg-clip-text text-transparent hidden sm:block">
          AIIA World
        </h1>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
          <span class="text-lg">💰</span>
          <span class="font-bold text-yellow-700">{{ userProfile?.coins || 0 }}</span>
        </div>

        <div class="flex items-center gap-3 pl-2 border-l border-gray-200">
          <div class="text-right hidden xs:block">
            <p class="text-xs font-bold text-gray-900">{{ userProfile?.name }}</p>
            <p class="text-[10px] text-blue-600 font-medium">Lv.{{ userProfile?.level }} Creator</p>
          </div>
          <img :src="userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.name}`" 
               class="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-2 ring-blue-50" />
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto p-6 space-y-8">
      <section class="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl bg-gradient-to-br from-[#1E40AF] via-[#3B82F6] to-[#10B981]">
        <div class="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="max-w-md text-center md:text-left">
            <h2 class="text-3xl font-black mb-3">สร้างสายสัมพันธ์ที่ไร้ขีดจำกัด 🌌</h2>
            <p class="text-blue-50 opacity-90 mb-6 leading-relaxed">
              {{ randomMessage }} ยิ่งคุยมาก ยิ่งสนิทมาก พร้อมปลดล็อกเรื่องราวสุดพิเศษหรือยัง?
            </p>
            <div class="flex flex-wrap gap-3 justify-center md:justify-start">
              <button @click="$router.push('/create-character')" 
                class="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2">
                <span>➕</span> สร้าง AI ตัวละครใหม่
              </button>
              <button class="bg-blue-700/30 backdrop-blur-md border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-all">
                🎁 รับโบนัสรายวัน
              </button>
            </div>
          </div>
          <div class="hidden md:block">
             <div class="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 w-64">
                <p class="text-xs font-medium uppercase tracking-wider opacity-70 mb-4">Creator Progress</p>
                <div class="flex justify-between text-sm mb-2 font-bold">
                   <span>Level {{ userProfile?.level }}</span>
                   <span>{{ (myCharacters.length % 5) * 20 }}%</span>
                </div>
                <div class="w-full bg-black/20 rounded-full h-2.5">
                   <div class="bg-green-400 h-2.5 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" :style="{ width: (myCharacters.length % 5) * 20 + '%' }"></div>
                </div>
                <p class="text-[10px] mt-3 opacity-80 text-center italic">สร้างอีก {{ 5 - (myCharacters.length % 5) }} ตัวเพื่อเลื่อนระดับ!</p>
             </div>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div v-for="stat in stats" :key="stat.label" class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-2">
            <span class="text-2xl">{{ stat.icon }}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600">{{ stat.trend }}</span>
          </div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-tight">{{ stat.label }}</p>
          <h2 class="text-2xl font-black text-gray-800">{{ stat.value }}</h2>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <section>
            <div class="flex justify-between items-center mb-5">
              <h3 class="text-lg font-black text-gray-800 flex items-center gap-2">
                🎭 สตูดิโอของคุณ <span class="text-sm font-normal text-gray-400">({{ myCharacters.length }})</span>
              </h3>
            </div>

            <div v-if="myCharacters.length === 0" class="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center">
              <p class="text-gray-400 font-medium">ยังไม่มี AI ในสังกัด เริ่มสร้างตัวแรกเลย!</p>
              <button @click="$router.push('/create-character')" class="mt-4 text-blue-600 font-bold text-sm underline">สร้างตัวละครแรกของคุณ</button>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="char in myCharacters" :key="char.id" 
                class="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all group cursor-pointer"
                @click="goChat(char)">
                <div class="flex gap-4">
                  <img :src="char.image_url" class="w-20 h-20 rounded-xl object-cover shadow-inner group-hover:scale-105 transition-transform" />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-gray-900 truncate">{{ char.name }}</h4>
                    <p class="text-xs text-gray-500 line-clamp-1 mb-1">{{ char.short_description }}</p>
                    <div class="flex flex-wrap gap-1 mb-2">
                       <span v-for="cat in char.categories" :key="cat" class="text-[9px] bg-blue-50 text-blue-500 px-1.5 rounded-full">#{{ cat }}</span>
                    </div>
                    <div class="flex gap-3 text-[10px] font-bold text-gray-400">
                      <span>❤️ {{ char.likes_count || 0 }}</span>
                      <span>👁️ {{ char.views_count || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-lg font-black text-gray-800 mb-5 flex items-center gap-2">🔥 ตัวละครยอดนิยม</h3>
            <div class="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
              <div v-for="(char, index) in globalPopular" :key="char.id"
                class="min-w-[200px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer relative"
                @click="goChat(char)">
                <img :src="char.image_url" class="w-full h-32 object-cover" />
                <div v-if="index < 3" class="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black shadow-sm">
                    ⭐ TOP {{ index + 1 }}
                </div>
                <div class="p-3">
                  <h4 class="text-sm font-bold text-gray-900 truncate">{{ char.name }}</h4>
                  <p class="text-[10px] text-blue-500 font-bold mb-2">{{ char.categories?.[0] }}</p>
                  <p class="text-[9px] text-gray-400 line-clamp-1">{{ char.short_description }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="space-y-8">
          <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-black text-gray-800 mb-4 flex items-center gap-2">🔔 กิจกรรมล่าสุด</h3>
            <div class="space-y-4">
              <div v-if="activities.length === 0" class="text-center py-4 text-xs text-gray-400 italic">ไม่มีกิจกรรมล่าสุด</div>
              <div v-for="(item, i) in activities" :key="i" class="flex gap-3 items-start border-l-2 border-blue-100 pl-3">
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-gray-800">{{ item.text }}</p>
                  <p class="text-[10px] text-gray-400">{{ item.time }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db, auth } from '../../../firebase/config.js'
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  setDoc, // ย้ายมาไว้ตรงนี้
  serverTimestamp // แนะนำให้ใช้ตัวนี้สำหรับเวลาใน Firebase
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const router = useRouter()
const userProfile = ref(null)
const myCharacters = ref([])
const globalPopular = ref([])
const activities = ref([])
const loading = ref(true)

// --- 1. ตรวจสอบสถานะการ Login และดึงข้อมูลผู้ใช้ ---
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid)
      
      onSnapshot(userRef, async (snap) => {
        if (snap.exists()) {
          userProfile.value = { id: snap.id, ...snap.data() }
        } else {
          // สร้างข้อมูลเริ่มต้นถ้ายังไม่มีในระบบ
          const newUser = {
            name: user.displayName || 'Explorer',
            email: user.email,
            coins: 100, 
            level: 1,
            photoURL: user.photoURL,
            created_at: serverTimestamp() // ใช้เวลาจาก Server จะแม่นยำกว่า
          }
          try {
            await setDoc(userRef, newUser)
            userProfile.value = newUser
          } catch (e) {
            console.error("Error creating initial user:", e)
          }
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

// --- 2. ฟังก์ชันดึงข้อมูล Firestore ---

const fetchMyCharacters = (uid) => {
  // หมายเหตุ: การใช้ orderBy ร่วมกับ where อาจต้องทำ Index ใน Firebase Console ก่อนนะครับ
  const q = query(
    collection(db, 'characters'),
    where('creator_id', '==', uid),
    orderBy('created_at', 'desc')
  )
  onSnapshot(q, (snap) => {
    myCharacters.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
}

const fetchPopularCharacters = () => {
  const q = query(
    collection(db, 'characters'),
    orderBy('views_count', 'desc'),
    limit(5)
  )
  onSnapshot(q, (snap) => {
    globalPopular.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
}

const fetchActivities = (uid) => {
  const q = query(
    collection(db, 'activities'),
    where('user_id', '==', uid),
    orderBy('time', 'desc'),
    limit(5)
  )
  onSnapshot(q, (snap) => {
    activities.value = snap.docs.map(doc => doc.data())
  })
}

// --- 3. ส่วนการคำนวณ Stats ---

const stats = computed(() => [
  { label: 'AI Characters', value: myCharacters.value.length, icon: '🎭', trend: 'Owned' },
  { label: 'Coins', value: userProfile.value?.coins || 0, icon: '💰', trend: 'Wallet' },
  { label: 'My Total Likes', value: myCharacters.value.reduce((acc, cur) => acc + (cur.likes_count || 0), 0), icon: '❤️', trend: 'Popularity' },
  { label: 'Reputation', value: `Lv.${userProfile.value?.level || 1}`, icon: '🏆', trend: 'Rank' }
])

const messages = ["AI ของคุณกำลังรอข้อความใหม่นะ 💕", "พร้อมคุยหรือยัง?", "โลกใบนี้สร้างขึ้นมาเพื่อคุณโดยเฉพาะ 🌌"]
const randomMessage = computed(() => messages[Math.floor(Math.random() * messages.length)])

const goChat = (char) => {
  router.push(`/chat/${char.id}`)
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>