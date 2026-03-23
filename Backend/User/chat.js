const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { db } = require('../config/firebase');

// ตั้งค่า Gemini 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

// --- 💬 Route สำหรับ Chat ---
router.post('/', async (req, res) => {
  try {
    const { message, characterId, relationshipLevel } = req.body;
    
    // 1. ดึงข้อมูลตัวละครจาก Firestore มาก่อน (ต้องทำก่อนใช้ชื่อตัวละคร)
    const charDoc = await db.collection('characters').doc(characterId).get();
    
    if (!charDoc.exists) {
      return res.status(404).json({ error: "ไม่พบข้อมูลตัวละคร" });
    }

    const charData = charDoc.data();
    // ✅ ประกาศตัวแปรเหล่านี้เพื่อให้ข้างล่างเรียกใช้ได้
    const characterName = charData.name; 
    const characterDescription = charData.description;

    // 2. ดึงประวัติแชท (History)
    const messagesRef = db.collection('chats').doc(characterId).collection('messages');
    const snapshot = await messagesRef.orderBy('created_at', 'asc').limitToLast(10).get();
    
    let history = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      history.push({
        role: data.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: data.text }],
      });
    });

    // 3. สร้าง Model พร้อมใส่ System Instruction
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: `คุณคือ ${characterName}. 
      นิสัยและบทบาท: ${characterDescription}. 
      ระดับความสนิท: ${relationshipLevel}%.
      กฎ: ตอบเป็นภาษาไทย ห้ามบอกว่าตัวเองเป็น AI ให้แสดงบทบาทตามนิสัยที่กำหนดไว้เสมอ`
    });

    // 4. เริ่มแชท
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const aiText = result.response.text();

        // 3. บันทึกประวัติลง Firebase
        const timestamp = new Date();
        await messagesRef.add({
            sender: 'user',
            text: message,
            created_at: timestamp
        });

        await messagesRef.add({
            sender: 'ai',
            text: aiText,
            created_at: new Date()
        });

        // 4. อัปเดตข้อมูลภาพรวม
        await db.collection('chats').doc(characterId).set({
            last_chat: timestamp,
            relationship_score: relationshipLevel
        }, { merge: true });

        res.json({ text: aiText });
    } catch (err) {
        console.error("Chat Error:", err);
        res.status(500).json({ error: "AI หลับพักผ่อนครับ" });
    }
});

module.exports = router;