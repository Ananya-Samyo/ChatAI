<template>
  <div v-if="false">
    </div>
</template>

<script setup>
import { db, auth } from '../../../firebase/config.js'
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import Swal from 'sweetalert2'

const props = defineProps(['userProfile'])

const showModal = async () => {
  if (!props.userProfile) return

  const totalDays = props.userProfile.checkInCount || 0
  const lastCheck = props.userProfile.lastCheckIn?.toDate()
  const now = new Date()
  const isAlreadyChecked = lastCheck && lastCheck.toDateString() === now.toDateString()
  
  const nextMilestone = totalDays < 7 ? 7 : (totalDays < 30 ? 30 : 60)
  const progressPercent = Math.min((totalDays / nextMilestone) * 100, 100)

  return Swal.fire({
    title: '🎁 โบนัสรายวัน',
    html: `
      <div class="text-left space-y-4 p-2">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
            <p class="text-[10px] uppercase text-blue-500 font-bold">เช็คอินสะสม</p>
            <p class="text-2xl font-black text-blue-700">${totalDays} วัน</p>
          </div>
          <div class="bg-green-50 p-3 rounded-xl border border-green-100 text-center">
            <p class="text-[10px] uppercase text-green-500 font-bold">เป้าหมายต่อไป</p>
            <p class="text-2xl font-black text-green-700">${nextMilestone} วัน</p>
          </div>
        </div>

        <div class="space-y-1">
          <div class="flex justify-between text-[11px] font-bold text-gray-500">
            <span>ความคืบหน้ารางวัลใหญ่</span>
            <span>${totalDays}/${nextMilestone} วัน</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-500 to-green-400 h-full" style="width: ${progressPercent}%"></div>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <p>⭐ ครบ 7 วัน: <b>+50 Coins</b></p>
          <p>💎 ครบ 1 เดือน: <b>+200 Coins</b></p>
          <p>👑 ครบ 2 เดือน: <b>+500 Coins</b></p>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: isAlreadyChecked ? 'วันนี้รับไปแล้ว' : 'กดรับรางวัลวันนี้',
    cancelButtonText: 'ไว้ทีหลัง',
    confirmButtonColor: isAlreadyChecked ? '#94a3b8' : '#2563eb',
    showLoaderOnConfirm: !isAlreadyChecked,
    preConfirm: async () => {
      if (isAlreadyChecked) return false
      
      try {
        const userRef = doc(db, 'users', props.userProfile.id)
        let reward = 10
        const newTotal = totalDays + 1
        let bonusText = ""

        if (newTotal % 60 === 0) { reward += 500; bonusText = "👑 ครบ 2 เดือน!" }
        else if (newTotal % 30 === 0) { reward += 200; bonusText = "💎 ครบ 1 เดือน!" }
        else if (newTotal % 7 === 0) { reward += 50; bonusText = "⭐ ครบสัปดาห์!" }

        await updateDoc(userRef, {
          coins: increment(reward),
          checkInCount: increment(1),
          lastCheckIn: serverTimestamp()
        })
        
        return { reward, bonusText }
      } catch (error) {
        Swal.showValidationMessage(`Error: ${error.message}`)
      }
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: `ได้รับ ${result.value.reward} Coins ${result.value.bonusText}`,
        confirmButtonColor: '#2563eb'
      })
    }
  })
}

// เปิดให้ Component พ่อเรียกใช้ฟังก์ชันนี้ได้
defineExpose({ showModal })
</script>