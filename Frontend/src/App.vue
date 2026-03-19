<template>
  <div>
    <router-view />
  </div>
</template>

<script setup>
import { db } from '../firebase/config.js'
import { collection, addDoc } from "firebase/firestore"; 

const testFirebase = async () => {
  try {
    const docRef = await addDoc(collection(db, "test"), {
      message: "Hello Firebase!",
      time: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
    alert("เชื่อมต่อ Firebase สำเร็จแล้ว! เช็กในหน้า Console ได้เลย");
  } catch (e) {
    console.error("Error adding document: ", e);
    alert("เชื่อมต่อไม่สำเร็จ: " + e.message);
  }
}
</script>

<style>
/* ตกแต่งเล็กน้อยให้พอดูออก */
nav {
  background: #f4f4f4;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}
</style>