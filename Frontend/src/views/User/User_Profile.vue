<template>
    <div v-if="!loading" class="min-h-screen bg-[#F8FAFC]">
        <nav
            class="bg-white px-4 md:px-6 py-3 shadow-sm sticky top-0 z-50 border-b border-gray-100 flex items-center gap-4">
            <button @click="$router.push({ name: 'dashboard' })"
                class="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clip-rule="evenodd" />
                </svg>
            </button>
            <h1 class="text-xl font-black text-gray-900">ตั้งค่าโปรไฟล์ Creator</h1>
        </nav>

        <main class="max-w-4xl mx-auto p-4 md:p-8 space-y-10">
            <section
                class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div class="relative flex-shrink-0 group">
                    <img :src="userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.name}`"
                        class="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md ring-4 ring-blue-50 object-cover" />

                    <button @click="triggerFileInput"
                        class="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.83z" />
                        </svg>
                    </button>

                    <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" class="hidden" />
                </div>

                <div class="flex-1 min-w-0 text-center md:text-left space-y-4">
                    <div class="space-y-1">
                        <input v-model="userProfile.name" type="text" placeholder="ชื่อ Creator ของคุณ"
                            class="text-2xl font-extrabold text-gray-950 bg-transparent border-b border-dashed border-gray-200 focus:border-blue-300 focus:outline-none focus:ring-0 p-1 rounded w-full md:w-auto" />
                        <p class="text-xs text-gray-400 italic">UID: {{ userProfile?.id }}</p>
                    </div>

                    <div class="flex flex-wrap gap-2 justify-center md:justify-start">
                        <span
                            class="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                            Lv.{{ userProfile?.level || 1 }} Creator
                        </span>
                        <span v-if="userProfile?.is_admin"
                            class="text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                            🛡️ Admin สิทธิ์ครบ
                        </span>
                    </div>
                </div>
            </section>

            <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                    <div class="flex justify-between items-center">
                        <h3 class="font-black text-gray-800 flex items-center gap-2">💰 กระเป๋าเหรียญ</h3>
                        <span class="text-3xl font-black text-yellow-600 tracking-tight">
                            {{ userProfile?.coins || 0 }}
                        </span>
                    </div>
                    <div class="space-y-3">
                        <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div class="bg-yellow-400 h-full rounded-full transition-all duration-1000"
                                :style="{ width: (userProfile?.coins > 1000 ? 100 : (userProfile?.coins / 10)) + '%' }">
                            </div>
                        </div>
                        <p class="text-[11px] text-gray-400 italic">coins: {{ userProfile?.coins || 0 }} (max view
                            display 1000)</p>
                    </div>
                    <button
                        class="w-full bg-yellow-50 text-yellow-700 py-3 rounded-xl font-bold text-sm hover:bg-yellow-100 transition-all flex items-center justify-center gap-2 active:scale-95">
                        เติมเงิน / ซื้อ coins
                    </button>
                </div>

                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                    <div class="flex justify-between items-center">
                        <h3 class="font-black text-gray-800 flex items-center gap-2">🏆 เลเวล & Reputation</h3>
                        <span
                            class="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                            Level {{ userProfile?.level || 1 }}
                        </span>
                    </div>
                    <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                        <p class="text-xs text-gray-500 font-medium">ความคืบหน้าการสร้างตัวละคร (สำหรับอัปเลเวล)</p>
                        <div class="w-full bg-black/5 rounded-full h-2.5">
                            <div class="bg-gradient-to-r from-blue-500 to-green-400 h-2.5 rounded-full shadow-inner shadow-black/10 transition-all duration-500"
                                :style="{ width: progressToNextLevel + '%' }"></div>
                        </div>
                        <p class="text-[10px] opacity-80 text-center italic text-gray-400">สร้างครบ 5
                            ตัวละครเพื่อเลื่อนระดับ</p>
                    </div>
                </div>
            </section>

            <section class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <h3 class="font-black text-gray-800 text-base flex items-center gap-2">🔐 บัญชีและความปลอดภัย</h3>
                <div class="space-y-5">
                    <div class="space-y-1.5">
                        <label
                            class="text-xs font-semibold text-gray-500 uppercase tracking-wide">อีเมลที่ใช้งาน</label>
                        <p
                            class="text-base font-bold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100 cursor-not-allowed">
                            {{ userProfile?.email || 'N/A' }}
                        </p>
                    </div>
                    <div class="space-y-1.5">
                        <label
                            class="text-xs font-semibold text-gray-500 uppercase tracking-wide">เปลี่ยนรหัสผ่าน</label>
                        <button
                            class="flex w-full md:w-auto items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors active:scale-95">
                            🗝️ ขอส่งลิงก์เปลี่ยนรหัสผ่านไปทางอีเมล
                        </button>
                    </div>
                </div>
            </section>

            <section class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div class="flex justify-between items-center">
                    <h3 class="font-black text-gray-800 text-base flex items-center gap-2">📜 ประวัติการซื้อ Coin</h3>
                    <button class="text-xs text-blue-600 font-bold hover:underline">ดูทั้งหมด</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="text-[10px] uppercase text-gray-400 border-b border-gray-50">
                                <th class="pb-3 font-bold">วันที่</th>
                                <th class="pb-3 font-bold">รายการ</th>
                                <th class="pb-3 font-bold text-right">จำนวนเงิน</th>
                                <th class="pb-3 font-bold text-right">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="i in 3" :key="i" class="text-sm">
                                <td class="py-4 text-gray-500 text-xs">19 มี.ค. 2026</td>
                                <td class="py-4 font-bold text-gray-800">100 Coins</td>
                                <td class="py-4 text-right font-bold">฿35.00</td>
                                <td class="py-4 text-right">
                                    <span
                                        class="px-2 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">สำเร็จ</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <footer class="flex justify-center items-center pt-6">
                <button @click="handleSaveProfile" :disabled="isSaving"
                    class="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="!isSaving">💾</span>
                    <span v-else class="animate-spin">⏳</span>
                    {{ isSaving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการตั้งค่า' }}
                </button>
            </footer>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { db, auth, storage } from '../../../firebase/config.js'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

// นำเข้าฟังก์ชันสำหรับ Storage
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const router = useRouter()
const userProfile = ref({ name: '', photoURL: '', coins: 0, level: 1, email: '' })
const loading = ref(true)
const isSaving = ref(false)
const fileInput = ref(null)
const selectedFile = ref(null)

// Mockup data
const charactersOwnedCount = ref(1)
const progressToNextLevel = ref((charactersOwnedCount.value % 5) * 20)

onMounted(() => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid)
                const snap = await getDoc(userRef)
                if (snap.exists()) {
                    userProfile.value = { id: snap.id, ...snap.data() }
                }
            } catch (error) {
                console.error("Error fetching user profile:", error)
            } finally {
                loading.value = false
            }
        } else {
            router.push('/')
        }
    })
})

const triggerFileInput = () => {
    fileInput.value.click()
}

// --- 1. ฟังก์ชันเลือกและบีบอัดรูป ---
const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
        Swal.fire({
            title: 'กำลังเตรียมรูปภาพ...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        })

        try {
            const compressedFile = await compressImage(file)
            selectedFile.value = compressedFile

            const reader = new FileReader()
            reader.onload = (e) => {
                userProfile.value.photoURL = e.target.result
                Swal.close()
            }
            reader.readAsDataURL(compressedFile)
        } catch (error) {
            console.error(error)
            Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถประมวลผลรูปภาพได้', 'error')
        }
    }
}

// ฟังก์ชันช่วยบีบอัดรูป
const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target.result
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const MAX_WIDTH = 600
                const scaleSize = MAX_WIDTH / img.width
                canvas.width = MAX_WIDTH
                canvas.height = img.height * scaleSize
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: 'image/jpeg' }))
                }, 'image/jpeg', 0.7)
            }
        }
    })
}

// --- 2. ฟังก์ชันบันทึกข้อมูล (ที่หายไป) ---
const handleSaveProfile = async () => {
    if (!userProfile.value.id || isSaving.value) return

    isSaving.value = true

    // โชว์ Loading ตอนอัปโหลดจริง
    Swal.fire({
        title: 'กำลังบันทึกข้อมูล...',
        text: 'โปรดรอสักครู่',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    })

    try {
        let finalPhotoURL = userProfile.value.photoURL

        // ถ้ามีการเลือกรูปใหม่ (และบีบอัดแล้ว) ให้ส่งขึ้น Storage
        if (selectedFile.value) {
            const filePath = `avatars/${userProfile.value.id}_${Date.now()}`
            const fileRef = storageRef(storage, filePath)
            const snapshot = await uploadBytes(fileRef, selectedFile.value)
            finalPhotoURL = await getDownloadURL(snapshot.ref)
        }

        const userRef = doc(db, 'users', userProfile.value.id)
        await updateDoc(userRef, {
            name: userProfile.value.name,
            photoURL: finalPhotoURL || ''
        })

        Swal.fire({
            title: 'บันทึกสำเร็จ!',
            text: 'ข้อมูลโปรไฟล์ของคุณถูกอัปเดตแล้ว 🎉',
            icon: 'success',
            confirmButtonColor: '#2563eb',
            timer: 2000
        })

        selectedFile.value = null
    } catch (error) {
        console.error("Error updating profile:", error)
        Swal.fire('เกิดข้อผิดพลาด!', 'บันทึกไม่สำเร็จ: ' + error.message, 'error')
    } finally {
        isSaving.value = false
    }
}
</script>