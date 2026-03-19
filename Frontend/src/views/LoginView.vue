<template>
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
    
    <div class="absolute inset-0 flex gap-6 animate-scroll opacity-20">
      <img src="https://picsum.photos/200/300?1" class="rounded-xl" />
      <img src="https://picsum.photos/200/300?2" class="rounded-xl" />
    </div>

    <div class="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
    
    <div class="relative w-full max-w-md bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl text-center z-10">
      <h1 class="text-2xl font-bold mb-2">📖 AI Novel</h1>
      <p class="text-gray-500 mb-5 text-sm">เข้าสู่ระบบเพื่อเริ่มสร้างเรื่องราว</p>

      <button @click="loginWithGoogle" class="w-full flex items-center justify-center gap-3 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 transition mb-4">
        <img src="https://developers.google.com/identity/images/g-logo.png" class="w-5"/>
        Continue with Google
      </button>

      <div class="my-4 text-gray-400 text-sm">OR</div>

      <div class="text-left mb-4">
        <input 
          v-model="email"
          id="login-email"
          name="email"
          type="email" 
          placeholder="Email"
          class="w-full border border-gray-300 p-2.5 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input 
          v-model="password"
          id="login-password"
          name="password"
          type="password" 
          placeholder="Password"
          class="w-full border border-gray-300 p-2.5 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button 
        @click="handleLogin"
        class="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition font-semibold"
      >
        Login
      </button>

      <p class="mt-4 text-sm text-gray-500">
        ยังไม่มีบัญชี? <span class="text-blue-500 cursor-pointer hover:underline">สมัครสมาชิก</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from "../../firebase/config.js"; // Path ที่เราคุยกัน
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const router = useRouter()
const email = ref('')
const password = ref('')

// ฟังก์ชันบันทึก/อัปเดตข้อมูลผู้ใช้ใน Firestore (Auto-Register)
const saveUserToFirestore = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    // ถ้าเป็น User ใหม่ -> สร้างข้อมูลเริ่มต้น
    await setDoc(userRef, {
      name: user.displayName || "AI User",
      email: user.email,
      photoURL: user.photoURL || "",
      is_admin: false, // ค่าเริ่มต้นเป็น User
      coins: 100,
      level: 1,
      createdAt: serverTimestamp()
    });
    return 'user';
  } else {
    // ถ้ามีอยู่แล้ว -> คืนค่า role ตามที่มีใน DB
    return snap.data().is_admin ? 'admin' : 'user';
  }
};

// 1. Login ด้วย Google
const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const role = await saveUserToFirestore(result.user);
    
    // ย้ายไปหน้าตาม Role
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  } catch (error) {
    console.error("Google Login Error:", error);
    alert("การเข้าสู่ระบบผ่าน Google ล้มเหลว");
  }
};

// 2. Login ด้วย Email & Password
const handleLogin = async () => {
  if (!email.value || !password.value) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email.value, password.value);
    const role = await saveUserToFirestore(result.user);

    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  } catch (error) {
    console.error("Login Error:", error);
    alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }
}
</script>