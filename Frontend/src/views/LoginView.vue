<template>
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
    
    <!-- Background Cards -->
    <div class="absolute inset-0 flex gap-6 animate-scroll opacity-20">
      <img src="https://picsum.photos/200/300?1" class="rounded-xl" />
      <img src="https://picsum.photos/200/300?2" class="rounded-xl" />
      <img src="https://picsum.photos/200/300?3" class="rounded-xl" />
      <img src="https://picsum.photos/200/300?4" class="rounded-xl" />
    </div>

    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
    
    <!-- Login Card -->
    <div class="relative w-full max-w-md bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl text-center z-10">
      
      <h1 class="text-2xl font-bold mb-2">📖 AI Novel</h1>
      <p class="text-gray-500 mb-5 text-sm">
        เข้าสู่ระบบเพื่อเริ่มสร้างเรื่องราว
      </p>

      <!-- Google Login -->
      <button 
        @click="loginWithGoogle"
        class="w-full flex items-center justify-center gap-3 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 transition"
      >
        <img src="https://developers.google.com/identity/images/g-logo.png" class="w-5"/>
        Continue with Google
      </button>

      <!-- Divider -->
      <div class="my-4 text-gray-400 text-sm">OR</div>

      <!-- Email -->
      <input 
        type="email" 
        placeholder="Email"
        class="w-full border border-gray-300 p-2.5 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <!-- Password -->
      <input 
        type="password" 
        placeholder="Password"
        class="w-full border border-gray-300 p-2.5 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <!-- Login -->
      <button 
        class="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition"
      >
        Login
      </button>

      <!-- Register -->
      <p class="mt-4 text-sm text-gray-500">
        ยังไม่มีบัญชี? 
        <span class="text-blue-500 cursor-pointer hover:underline">
          สมัครสมาชิก
        </span>
      </p>

    </div>

  </div>
</template>

<script setup>
const loginWithGoogle = () => {
  window.location.href = 'http://localhost:3000/api/auth/google'
}
</script>