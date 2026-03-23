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

        // 1. ดึงข้อมูลตัวละครจาก Firestore (เพื่อเอาชื่อและนิสัยมาทำ Prompt)
        const charDoc = await db.collection('characters').doc(characterId).get();

        if (!charDoc.exists) {
            return res.status(404).json({ error: "ไม่พบข้อมูลตัวละคร" });
        }

        const charData = charDoc.data();
        const characterName = charData.name;
        const characterDescription = charData.description;

        // 1. (ดึงข้อมูลตัวละครมาแล้วใน charData)
        const aiGender = charData.gender;
        const firstScene = charData.first_message;

        // 2. ดึงประวัติแชท 10 ข้อความล่าสุดเพื่อให้ AI จำบริบทได้
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

        // 3. สร้าง Model พร้อมใส่ System Instruction แบบระบุการแยกเพศ
        // ใน router.post('/', async (req, res) => { ...

        // 3. แก้ไขส่วนสร้าง Model ตรงนี้ครับ
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: `คุณคือ ${characterName}
    เพศของตัวละครคุณ: ${aiGender === 'male' ? 'ผู้ชาย' : aiGender === 'female' ? 'ผู้หญิง' : 'LGBTQ+'}
    นิสัยและบทบาท: ${characterDescription}
    สถานการณ์ปัจจุบัน (จุดเริ่มต้น): ${firstScene}
    ระดับความสนิทปัจจุบัน: ${relationshipLevel}%
    
    **กฎการสวมบทบาท (Roleplay)**:
    1. ห้ามบอกว่าตัวเองเป็น AI หรือโปรแกรมคอมพิวเตอร์เด็ดขาด ให้สวมบทบาทเป็นตัวละครที่มีชีวิตจิตใจ
    2. การใช้หางเสียง: 
       - หากคุณเป็น 'ผู้ชาย' ให้ลงท้ายด้วย "ครับ/นะ" 
       - หากคุณเป็น 'ผู้หญิง' ให้ลงท้ายด้วย "ค่ะ/นะ/จ๊ะ" 
       - หากเป็น 'LGBTQ+' ให้เลือกใช้ตามบุคลิกที่เหมาะสม
    3. วิเคราะห์เพศของผู้ใช้:
       - หากผู้ใช้ใช้ "ผม/ครับ" -> คุยกับเขาในฐานะผู้ชาย
       - หากผู้ใช้ใช้ "หนู/ฉัน/ค่ะ" -> คุยกับเธอในฐานะผู้หญิง
    4. ปรับระดับความสนิทสนม:
       - 0-30%: สุภาพ เป็นกันเองเหมือนเพิ่งรู้จัก
       - 31-70%: สนิทกันมากขึ้น เริ่มหยอกล้อ หรือแสดงความเป็นห่วงเป็นใย
       - 71-100%+: คุยเหมือนคนสำคัญ มีความรัก ความอ้อน และความใส่ใจเป็นพิเศษ
    5. อ้างอิง 'สถานการณ์ปัจจุบัน' เสมอหากบทสนทนายังไม่เปลี่ยนไปที่อื่น
    **กฎการจัดรูปแบบข้อความ (Formatting)**:
    1. ส่วนที่เป็น "คำพูด" ให้เขียนตามปกติ
    2. ส่วนที่เป็น "การกระทำ ความรู้สึก หรือบรรยากาศ" ให้ครอบด้วยเครื่องหมายดอกจัน เช่น *ยิ้มกว้างอย่างดีใจ* หรือ *เดินเข้ามาใกล้ๆ*
    3. ห้ามใช้ตัวหนา (Markdown Bold) ในส่วนอื่นที่ไม่จำเป็น`
        });

        // 4. เริ่มแชทและส่งข้อความ
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(message);
        const aiText = result.response.text();

        // 5. บันทึกประวัติลง Firebase (Sub-collection: messages)
        const timestamp = new Date();
        // บันทึกคำถามของ User
        await messagesRef.add({
            sender: 'user',
            text: message,
            created_at: timestamp
        });

        // บันทึกคำตอบของ AI
        await messagesRef.add({
            sender: 'ai',
            text: aiText,
            created_at: new Date()
        });

        // 6. อัปเดตข้อมูลภาพรวมใน Document หลักของแชท
        await db.collection('chats').doc(characterId).set({
            last_chat: timestamp,
            relationship_score: relationshipLevel
        }, { merge: true });

        // ส่งคำตอบกลับไปที่ Frontend
        res.json({ text: aiText });

    } catch (err) {
        console.error("Chat Error:", err);
        res.status(500).json({ error: "AI หลับพักผ่อนครับ" });
    }
});

module.exports = router;