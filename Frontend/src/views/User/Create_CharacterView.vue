<template>
  <div class="min-h-screen bg-[#F8FAFC] pb-12">
    <div class="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
      <button @click="$router.back()" class="p-2 hover:bg-gray-100 rounded-full transition">⬅️</button>
      <h1 class="text-xl font-bold text-gray-800">สร้างตัวละครใหม่</h1>
    </div>

    <div class="max-w-2xl mx-auto mt-8 px-6">
      <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8 text-center">
        <div class="relative w-32 h-32 mx-auto mb-4 group">
          <img :src="form.image_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=AIIA'" 
               class="w-full h-full rounded-3xl object-cover shadow-inner bg-blue-50 border-2 border-blue-100" />
        </div>
        <h2 class="text-lg font-bold text-gray-800">{{ form.name || 'ชื่อตัวละคร' }}</h2>
        <p class="text-sm text-gray-500 italic mb-2">{{ form.short_description || 'คำโปรยสั้นๆ...' }}</p>
        <div class="flex flex-wrap justify-center gap-2">
          <span v-for="cat in form.categories" :key="cat" class="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] rounded-full font-bold">
            #{{ cat }}
          </span>
        </div>
      </div>

      <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 space-y-6">
        
        <div class="border-b border-gray-50 pb-4">
          <h3 class="font-bold text-blue-600 text-sm mb-4">📍 ข้อมูลพื้นฐาน</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">ชื่อตัวละคร (Name)</label>
              <input v-model="form.name" type="text" placeholder="เช่น น้องเอไอ ขี้อ้อน" class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">คำโปรยสั้นๆ (Short Tagline)</label>
              <input v-model="form.short_description" type="text" maxlength="50" placeholder="สูงสุด 50 ตัวอักษร" class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">หมวดหมู่ (เลือกได้หลายอย่าง)</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                <button v-for="option in categoryOptions" :key="option.value" @click="toggleCategory(option.value)"
                  :class="form.categories.includes(option.value) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200'"
                  class="px-3 py-2 border rounded-xl text-[10px] font-bold transition-all text-center">
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="border-b border-gray-50 pb-4">
          <h3 class="font-bold text-pink-500 text-sm mb-4">💖 สิ่งที่ชอบ (AI Preferences)</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 mb-1 uppercase">อาหารที่ชอบ (Favorite Food)</label>
              <input v-model="form.fav_food" type="text" placeholder="เช่น ชานมไข่มุก, สเต็ก" class="w-full px-4 py-2 text-sm rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-400" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 mb-1 uppercase">กิจกรรมที่ชอบ (Activity)</label>
              <input v-model="form.fav_activity" type="text" placeholder="เช่น ดูหนัง, เล่นเกม" class="w-full px-4 py-2 text-sm rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-400" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-[10px] font-bold text-gray-400 mb-1 uppercase">คีย์เวิร์ด/สิ่งที่ชอบอื่นๆ (Keywords)</label>
              <input v-model="form.fav_general" type="text" placeholder="เช่น แมว, ทะเล, ท้องฟ้า (ใช้จุลภาคคั่น)" class="w-full px-4 py-2 text-sm rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-400" />
            </div>
          </div>
          <p class="text-[10px] text-gray-400 mt-3 italic">* หาก User พิมพ์คีย์เวิร์ดเหล่านี้ในการแชท ค่าความสัมพันธ์จะเพิ่มขึ้น!</p>
        </div>

        <div class="space-y-4">
           <div>
            <label class="block text-xs font-bold text-gray-500 mb-1">ประวัติ/นิสัย (Full Description)</label>
            <textarea v-model="form.description" rows="3" placeholder="อธิบายรายละเอียดตัวละครของคุณ..." class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1">ลิงก์รูปภาพ (Image URL)</label>
            <input v-model="form.image_url" type="text" placeholder="https://..." class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <button @click="createCharacter" :disabled="loading" class="w-full bg-gradient-to-r from-[#2563EB] to-[#10B981] text-white py-4 rounded-2xl font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
          {{ loading ? 'กำลังสร้าง...' : '🚀 ปลุกชีวิตให้ตัวละคร' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2' 
import { db, auth } from '../../../firebase/config.js'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const router = useRouter()
const loading = ref(false)

// ตัวเลือกหมวดหมู่
const categoryOptions = [
  { label: 'Romantic ❤️', value: 'Romantic' },
  { label: 'Comedy 😂', value: 'Comedy' },
  { label: 'Action 🔥', value: 'Action' },
  { label: 'Fantasy 🌌', value: 'Fantasy' },
  { label: 'Horror 👻', value: 'Horror' },
  { label: 'Yaoi/Yuri 🌈', value: 'LGBTQ' }
]

// ข้อมูลในฟอร์ม
const form = ref({
  name: '',
  short_description: '',
  description: '',
  categories: [],
  image_url: '',
  fav_food: '',
  fav_activity: '',
  fav_general: ''
})

// ฟังก์ชันเลือก/ยกเลิกหมวดหมู่ (เลือกได้หลายอย่าง)
const toggleCategory = (val) => {
  if (form.value.categories.includes(val)) {
    form.value.categories = form.value.categories.filter(c => c !== val)
  } else {
    form.value.categories.push(val)
  }
}

// ฟังก์ชันหลักในการสร้างตัวละคร
const createCharacter = async () => {
  // 1. ตรวจสอบข้อมูลเบื้องต้น
  if (!form.value.name || !form.value.short_description || form.value.categories.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'ข้อมูลไม่ครบถ้วน',
      text: 'กรุณากรอกชื่อตัวละคร คำโปรย และเลือกหมวดหมู่ด้วยนะครับ',
      confirmButtonColor: '#2563EB',
      customClass: { popup: 'rounded-3xl' }
    })
    return
  }

  loading.value = true
  
  try {
    // 2. ส่งข้อมูลไปที่ Firestore
    await addDoc(collection(db, "characters"), {
      name: form.value.name,
      short_description: form.value.short_description,
      description: form.value.description,
      categories: form.value.categories,
      image_url: form.value.image_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=AIIA',
      // ✨ Preferences สำหรับระบบความสัมพันธ์ (Relationship)
      preferences: {
        food: form.value.fav_food,
        activity: form.value.fav_activity,
        general_keywords: form.value.fav_general
      },
      likes_count: 0,
      views_count: 0,
      relationship_base: 0,
      creator_id: auth.currentUser.uid,
      created_at: serverTimestamp()
    })

    // 3. แจ้งเตือนเมื่อสำเร็จแบบสวยๆ
    await Swal.fire({
      icon: 'success',
      title: 'ปลุกชีวิตสำเร็จ! 🎉',
      text: `ตอนนี้ ${form.value.name} กำลังรอพบคุณที่หน้า Dashboard`,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      customClass: { popup: 'rounded-3xl' }
    })

    // 4. กลับไปหน้า Dashboard
    router.push('/dashboard')

  } catch (error) {
    console.error("Error creating character:", error)
    
    // แจ้งเตือนเมื่อเกิด Error
    Swal.fire({
      icon: 'error',
      title: 'ล้มเหลว!',
      text: 'เกิดข้อผิดพลาด: ' + error.message,
      confirmButtonColor: '#EF4444',
      customClass: { popup: 'rounded-3xl' }
    })
  } finally {
    loading.value = false
  }
}
</script>