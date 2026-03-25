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

        // 1. ดึงข้อมูลตัวละคร
        const charDoc = await db.collection('characters').doc(characterId).get();
        if (!charDoc.exists) {
            return res.status(404).json({ error: "ไม่พบข้อมูลตัวละคร" });
        }

        const charData = charDoc.data();
        const { name: characterName, description: characterDescription, gender: aiGender, first_message: firstScene } = charData;

        // 2. ดึงประวัติแชท 10 ข้อความล่าสุด
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

        // 3. ตั้งค่า Model (อย่าลืมเช็ค MODEL_NAME ให้ถูก เช่น gemini-1.5-flash)
       const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", 
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
        const chat = model.startChat({ history });

        // 4. คุยกับ AI
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const aiText = response.text();

        // 5. บันทึกข้อมูลลง Firebase (ทำทุกอย่างให้เสร็จก่อนส่ง Response)
        const timestamp = new Date();
        const batch = db.batch(); // ใช้ Batch เพื่อความเร็วและชัวร์

        // บันทึก User Message
        const userMsgRef = messagesRef.doc();
        batch.set(userMsgRef, { sender: 'user', text: message, created_at: timestamp });

        // บันทึก AI Message
        const aiMsgRef = messagesRef.doc();
        batch.set(aiMsgRef, { sender: 'ai', text: aiText, created_at: new Date() });

        // อัปเดตข้อมูลภาพรวมแชท
        const chatMainRef = db.collection('chats').doc(characterId);
        batch.set(chatMainRef, {
            last_chat: timestamp,
            relationship_score: relationshipLevel
        }, { merge: true });

        await batch.commit();

        // 6. ส่งคำตอบกลับไปที่ Frontend (ส่งแค่ครั้งเดียวที่ท้ายสุด)
        return res.json({ text: aiText });

    } catch (error) {
        console.error("Chat Error:", error);

        // จัดการ Error แบ่งตามประเภท
        if (error.status === 429 || error.message?.includes('429')) {
            return res.json({ text: "*ตัวละครกำลังใช้ความคิดอย่างหนัก... (โควต้าเต็มชั่วคราว ลองใหม่อีกครั้งนะ)*" });
        }

        return res.status(500).json({ error: "ระบบขัดข้องนิดหน่อย ลองใหม่อีกครั้งนะ" });
    }
});

module.exports = router;