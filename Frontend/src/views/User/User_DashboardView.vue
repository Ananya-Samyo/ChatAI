<template>
  <div class="min-h-screen bg-gray-100">

    <!-- Navbar -->
    <div class="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <h1 class="text-xl font-bold">🌌 AI World</h1>

      <div class="flex items-center gap-3">
        <img src="https://i.pravatar.cc/40" class="w-8 h-8 rounded-full" />
        <span class="text-sm font-medium">{{ user?.name || 'User' }}</span>
      </div>
    </div>

    <div class="p-6 space-y-6">

      <!-- 🌌 WORLD BANNER -->
      <div class="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg
        bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500">

        <div class="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

        <div class="relative z-10">
          <h2 class="text-2xl font-bold mb-2">🌌 โลกของคุณกำลังมีชีวิต</h2>
          <p class="opacity-90 mb-4">{{ randomMessage }}</p>

          <button
            @click="$router.push('/create-character')"
            class="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium shadow hover:scale-105 transition">
            ➕ สร้างตัวละครใหม่
          </button>
        </div>

        <!-- glow -->
        <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
      </div>

      <!-- 📊 STATS -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
          <p class="text-xs text-gray-500">🎭 Characters</p>
          <h2 class="text-xl font-bold">{{ myCharacters.length }}</h2>
        </div>

        <div class="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
          <p class="text-xs text-gray-500">❤️ Likes</p>
          <h2 class="text-xl font-bold">{{ totalLikes }}</h2>
        </div>

        <div class="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
          <p class="text-xs text-gray-500">👁️ Views</p>
          <h2 class="text-xl font-bold">{{ totalViews }}</h2>
        </div>

        <div class="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
          <p class="text-xs text-gray-500">💬 Chats</p>
          <h2 class="text-xl font-bold">128</h2>
        </div>
      </div>

      <!-- 🎭 MY CHARACTERS -->
      <div>
        <h3 class="font-semibold mb-3">🎭 ตัวละครของคุณ</h3>

        <div v-if="myCharacters.length === 0" class="text-center py-10 text-gray-500">
          ยังไม่มีตัวละคร
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="char in myCharacters" :key="char.id"
            class="bg-white rounded-xl shadow hover:shadow-2xl transition cursor-pointer group/card"
            @click="goChat(char)">

            <div class="relative">
              <img :src="char.avatar"
                class="w-full h-32 object-cover rounded-t-xl group-hover/card:scale-105 transition" />

              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 flex items-center justify-center transition">
                <span class="text-white text-sm">💬 คุยกับฉันสิ</span>
              </div>
            </div>

            <div class="p-3">
              <h4 class="text-sm font-medium">{{ char.name }}</h4>
              <p class="text-xs text-gray-500 line-clamp-2">{{ char.personality }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 💬 LIVE ACTIVITY -->
      <div>
        <h3 class="font-semibold mb-3">💬 ความเคลื่อนไหว</h3>

        <div class="bg-white rounded-xl shadow p-4 space-y-2 text-sm">
          <div v-for="(item, i) in activities" :key="i"
            class="flex justify-between border-b pb-2 last:border-0">
            <span>{{ item.text }}</span>
            <span class="text-gray-400 text-xs">{{ item.time }}</span>
          </div>
        </div>
      </div>

      <!-- 🔥 EXPLORE -->
      <div>
        <h3 class="font-semibold mb-3">🔥 ตัวละครยอดนิยม</h3>

        <div class="flex gap-4 overflow-x-auto no-scrollbar">

          <div v-for="(char, index) in sortedCharacters" :key="char.id"
            class="min-w-[180px] bg-white rounded-xl shadow hover:shadow-2xl transition cursor-pointer group/card"
            @click="goChat(char)">

            <div class="relative">
              <img :src="char.avatar"
                class="w-full h-28 object-cover rounded-t-xl group-hover/card:scale-105 transition" />

              <!-- TOP BADGE -->
              <div v-if="index < 3"
                class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                🔥 TOP {{ index + 1 }}
              </div>
            </div>

            <div class="p-2">
              <h4 class="text-sm font-medium">{{ char.name }}</h4>
              <div class="text-xs text-gray-500 flex justify-between mt-1">
                <span>❤️ {{ char.likes }}</span>
                <span>👁️ {{ char.views }}</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- 🎯 PROGRESS -->
      <div>
        <h3 class="font-semibold mb-3">🎯 ความคืบหน้า</h3>

        <div class="bg-white rounded-xl shadow p-4">
          <p class="text-sm mb-2">Level 2 Creator</p>

          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-purple-500 h-2 rounded-full" style="width: 60%"></div>
          </div>

          <p class="text-xs text-gray-500 mt-2">
            อีก 2 ตัวละครจะปลดล็อก Level ถัดไป 🚀
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const user = ref(null)

const myCharacters = ref([
  {
    id: 1,
    name: 'AI แฟนสาว',
    personality: 'ขี้อ้อน น่ารัก',
    avatar: 'https://picsum.photos/300/200?1',
    likes: 200,
    views: 900
  }
])

const exploreCharacters = ref([
  {
    id: 2,
    name: 'CEO สายโหด',
    avatar: 'https://picsum.photos/300/200?2',
    likes: 300,
    views: 1500
  },
  {
    id: 3,
    name: 'ไอดอลคิ้วท์',
    avatar: 'https://picsum.photos/300/200?3',
    likes: 500,
    views: 2000
  }
])

// 🌌 random message
const messages = [
  "AI ของคุณกำลังคิดถึงคุณ 💕",
  "มีคนกำลังดูตัวละครคุณ 👀",
  "วันนี้จะสร้างใครดี?",
  "โลกของคุณกำลังรอ..."
]

const randomMessage = computed(() => {
  return messages[Math.floor(Math.random() * messages.length)]
})

// 📊 stats
const totalLikes = computed(() =>
  myCharacters.value.reduce((sum, c) => sum + (c.likes || 0), 0)
)

const totalViews = computed(() =>
  myCharacters.value.reduce((sum, c) => sum + (c.views || 0), 0)
)

// 🔥 sorted
const sortedCharacters = computed(() => {
  return [...exploreCharacters.value].sort((a, b) => b.views - a.views)
})

// 💬 activity
const activities = ref([
  { text: "มีคนกด ❤️ ตัวละครคุณ", time: "2 นาทีที่แล้ว" },
  { text: "มีคนเข้าชม +120", time: "10 นาทีที่แล้ว" },
  { text: "มีคนเริ่มแชทกับ AI แฟนสาว", time: "1 ชั่วโมงที่แล้ว" }
])

const goChat = (char) => {
  router.push(`/chat/${char.id}`)
}

onMounted(() => {
  user.value = JSON.parse(localStorage.getItem('user'))
})
</script>

<style>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  scrollbar-width: none;
}
</style>