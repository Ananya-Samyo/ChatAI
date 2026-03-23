<template>
  <div class="min-h-screen bg-[#F8FAFC] pb-12">
    <div class="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
      <button @click="$router.back()" class="p-2 hover:bg-gray-100 rounded-full transition">⬅️</button>
      <h1 class="text-xl font-bold text-gray-800">ปลุกชีวิตตัวละครใหม่</h1>
    </div>

    <div class="max-w-2xl mx-auto mt-8 px-6">
      <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8 text-center">
        <div class="relative w-32 h-32 mx-auto mb-4 group">
          <img :src="form.image_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=AIIA'" 
               class="w-full h-full rounded-3xl object-cover shadow-inner bg-blue-50 border-2 border-blue-100" />
        </div>
        <h2 class="text-lg font-bold text-gray-800">{{ form.name || 'ชื่อตัวละคร' }}</h2>
        <p class="text-sm text-gray-500 italic mb-2">{{ form.short_description || 'คำโปรยสั้นๆ...' }}</p>
        <div class="flex justify-center gap-2 mt-1">
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">
            {{ genderOptions.find(g => g.value === form.gender)?.label || 'ยังไม่ได้ระบุเพศ' }}
          </span>
        </div>
      </div>

      <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 space-y-8">
        
        <div class="border-b border-gray-50 pb-6">
          <h3 class="font-bold text-blue-600 text-sm mb-4 flex items-center gap-2">📍 ข้อมูลพื้นฐาน & อัตลักษณ์</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">ชื่อตัวละคร</label>
              <input v-model="form.name" type="text" placeholder="เช่น น้องเอไอ ขี้อ้อน" class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">คำโปรยสั้นๆ (Short Tagline)</label>
              <input v-model="form.short_description" type="text" maxlength="50" placeholder="สูงสุด 50 ตัวอักษร" class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 mb-2">เพศของ AI (Identity)</label>
              <div class="grid grid-cols-3 gap-2">
                <button v-for="gen in genderOptions" :key="gen.value" @click="form.gender = gen.value"
                  :class="form.gender === gen.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'"
                  class="px-3 py-2 border rounded-xl text-[10px] font-bold transition-all text-center">
                  {{ gen.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">หมวดหมู่เนื้อเรื่อง</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                <button v-for="option in categoryOptions" :key="option.value" @click="toggleCategory(option.value)"
                  :class="form.categories.includes(option.value) ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border-gray-200'"
                  class="px-3 py-2 border rounded-xl text-[10px] font-bold transition-all text-center">
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="border-b border-gray-50 pb-6">
          <h3 class="font-bold text-orange-500 text-sm mb-4 flex items-center gap-2">🎬 สถานการณ์เริ่มต้น (First Message)</h3>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 mb-1 uppercase">เกริ่นนำเนื้อเรื่องครั้งแรกที่เจอ</label>
            <textarea v-model="form.first_message" rows="3" 
              placeholder="เช่น [ห้องเรียนเวลา 16:05 น.] ตอนนี้เพื่อนๆ กลับกันหมดแล้ว เหลือเพียงเราสองคน..." 
              class="w-full px-4 py-3 text-sm rounded-xl border border-gray-100 bg-orange-50/30 focus:bg-white outline-none focus:ring-2 focus:ring-orange-400"></textarea>
          </div>
        </div>

        <div class="border-b border-gray-50 pb-6">
          <h3 class="font-bold text-pink-500 text-sm mb-4">💖 สิ่งที่ชอบ (AI Preferences)</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 mb-1 uppercase">อาหารที่ชอบ</label>
              <input v-model="form.fav_food" type="text" placeholder="เช่น ชานม, เค้ก" class="w-full px-4 py-2 text-sm rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-400" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 mb-1 uppercase">กิจกรรมที่ชอบ</label>
              <input v-model="form.fav_activity" type="text" placeholder="เช่น เล่นเกม, เดินสวน" class="w-full px-4 py-2 text-sm rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-400" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-[10px] font-bold text-gray-400 mb-1 uppercase">คีย์เวิร์ด/สิ่งที่ชอบอื่นๆ (Keywords)</label>
              <input v-model="form.fav_general" type="text" placeholder="เช่น แมว, ทะเล, ท้องฟ้า (ใช้จุลภาคคั่น)" class="w-full px-4 py-2 text-sm rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-400" />
            </div>
          </div>
        </div>

        <div class="space-y-4">
           <div>
            <label class="block text-xs font-bold text-gray-500 mb-1">นิสัยแบบละเอียด (Full Character Info)</label>
            <textarea v-model="form.description" rows="3" placeholder="นิสัยลึกๆ ปมหลัง หรือลักษณะการพูด..." class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1">ลิงก์รูปภาพ (Image URL)</label>
            <input v-model="form.image_url" type="text" placeholder="https://..." class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <button @click="createCharacter" :disabled="loading" class="w-full bg-gradient-to-r from-blue-600 to-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
          {{ loading ? 'กำลังสร้าง...' : '🚀 ปลุกชีวิตตัวละคร' }}
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

const categoryOptions = [
  { label: 'Romantic ❤️', value: 'Romantic' },
  { label: 'Comedy 😂', value: 'Comedy' },
  { label: 'Action 🔥', value: 'Action' },
  { label: 'Fantasy 🌌', value: 'Fantasy' },
  { label: 'School Life 🏫', value: 'School' },
  { label: 'LGBTQ 🌈', value: 'LGBTQ' }
]

// 🌈 ตัวเลือกเพศ
const genderOptions = [
  { label: 'ชาย (Male) ♂️', value: 'male' },
  { label: 'หญิง (Female) ♀️', value: 'female' },
  { label: 'Non-binary/LGBTQ+ 🌈', value: 'lgbtq' }
]

const form = ref({
  name: '',
  gender: 'female', 
  first_message: '',
  short_description: '',
  description: '',
  categories: [],
  image_url: '',
  fav_food: '',
  fav_activity: '',
  fav_general: ''
})

const toggleCategory = (val) => {
  if (form.value.categories.includes(val)) {
    form.value.categories = form.value.categories.filter(c => c !== val)
  } else {
    form.value.categories.push(val)
  }
}

const createCharacter = async () => {
  if (!form.value.name || !form.value.first_message || form.value.categories.length === 0) {
    Swal.fire({ icon: 'warning', title: 'กรอกข้อมูลไม่ครบ', text: 'อย่าลืมใส่ชื่อและสถานการณ์เริ่มต้นนะครับ' })
    return
  }

  loading.value = true
  try {
    await addDoc(collection(db, "characters"), {
      name: form.value.name,
      gender: form.value.gender, // บันทึกเพศ
      first_message: form.value.first_message, // บันทึกสถานการณ์เริ่มต้น
      short_description: form.value.short_description,
      description: form.value.description,
      categories: form.value.categories,
      image_url: form.value.image_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=AIIA',
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

    await Swal.fire({ icon: 'success', title: 'สำเร็จ!', text: 'ตัวละครของคุณพร้อมใช้งานแล้ว', timer: 2000, showConfirmButton: false })
    router.push('/dashboard')
  } catch (error) {
    console.error(error)
    Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: error.message })
  } finally {
    loading.value = false
  }
}
</script>