<template>
  <div class="flex flex-col h-screen bg-slate-50">
    <header class="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <button @click="$router.push('/dashboard')" class="p-2 hover:bg-slate-100 rounded-full">⬅️</button>
        <img :src="character?.image_url" class="w-10 h-10 rounded-full object-cover border-2 border-blue-500" />
        <div>
          <h2 class="font-bold text-slate-800">{{ character?.name }}</h2>
          <p class="text-[10px] text-green-500 font-bold">Online</p>
        </div>
      </div>
      
      <div class="flex flex-col items-end gap-1">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-pink-500">❤️ {{ relationshipScore }}%</span>
        </div>
        <div class="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-pink-400 to-rose-500 h-full transition-all duration-500" 
               :style="{ width: relationshipScore + '%' }"></div>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto p-4 space-y-4" id="chat-window">
      <div v-for="(msg, index) in chatHistory" :key="index" 
           :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
        <div :class="['max-w-[80%] p-3 rounded-2xl shadow-sm text-sm', 
                    msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none']">
          {{ msg.text }}
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
          <div class="dot-bounce"></div>
          <div class="dot-bounce delay-100"></div>
          <div class="dot-bounce delay-200"></div>
        </div>
      </div>
    </div>

    <footer class="p-4 bg-white border-t border-slate-100">
      <div class="flex gap-2">
        <input v-model="userInput" @keyup.enter="sendMessage"
               placeholder="พิมพ์อะไรบางอย่าง..." 
               class="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        <button @click="sendMessage" 
                class="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all">
          🚀
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '../../../firebase/config.js'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import axios from 'axios' 
import Swal from 'sweetalert2'

const route = useRoute()
const character = ref(null)
const userInput = ref('')
const relationshipScore = ref(0)
const chatHistory = ref([])
const isLoading = ref(false)

// ฟังก์ชันดึงข้อมูลตัวละคร
onMounted(async () => {
  const charId = route.params.id
  try {
    const docSnap = await getDoc(doc(db, "characters", charId))
    if (docSnap.exists()) {
      character.value = docSnap.data()
      relationshipScore.value = character.value.relationship_base || 0
      
      chatHistory.value.push({ 
        role: 'ai', 
        text: `สวัสดี! เราคือ ${character.value.name} (${character.value.short_description}) ยินดีที่ได้รู้จักนะ!` 
      })
    }
  } catch (error) {
    console.error("Error fetching character:", error)
  }
})

// ฟังก์ชันส่งข้อความ
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return
  
  const text = userInput.value.trim()
  chatHistory.value.push({ role: 'user', text: text })
  userInput.value = ''
  
  // เริ่มแสดงจุดเด้ง (Loading)
  isLoading.value = true
  await scrollToBottom()

  // --- 💖 1. ระบบเช็ค Keyword เพื่อเพิ่มหัวใจ ---
  const prefs = character.value.preferences
  let bonus = 0
  if (text.includes(prefs.food)) bonus += 5
  if (text.includes(prefs.activity)) bonus += 10
  
  if (bonus > 0) {
    try {
      await updateDoc(doc(db, "characters", route.params.id), {
        relationship_base: increment(bonus)
      })
      relationshipScore.value += bonus
      
      Swal.fire({
        title: 'ความสัมพันธ์เพิ่มขึ้น!',
        text: `คุณพูดถึงสิ่งที่ ${character.value.name} ชอบ ❤️`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        icon: 'success'
      })
    } catch (err) {
      console.error("Update Relationship Error:", err)
    }
  }

  // --- 🤖 2. เรียกใช้ Gemini AI ผ่าน Backend ---
  try {
    const response = await axios.post('http://localhost:3000/api/chat', {
      message: text,
      characterId: route.params.id,
      relationshipLevel: relationshipScore.value
    })

    if (response.data && response.data.text) {
      chatHistory.value.push({ role: 'ai', text: response.data.text })
    }
  } catch (error) {
    console.error("AI Error:", error)
    chatHistory.value.push({ 
      role: 'ai', 
      text: "ขอโทษทีนะ เหมือนระบบเราจะขัดข้องนิดหน่อย ลองใหม่อีกครั้งนะ!" 
    })
  } finally {
    // ปิดจุดเด้ง (Loading) เมื่อได้คำตอบแล้ว
    isLoading.value = false
    scrollToBottom() 
  }
}

const scrollToBottom = async () => {
  await nextTick()
  const chatWindow = document.getElementById('chat-window')
  if (chatWindow) {
    chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' })
  }
}
</script>

<style scoped>
/* สไตล์สำหรับจุดเด้ง (Typing Animation) */
.dot-bounce {
  width: 6px;
  height: 6px;
  background-color: #94a3b8; /* สี slate-400 */
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}
</style>