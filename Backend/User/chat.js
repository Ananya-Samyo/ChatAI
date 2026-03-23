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
        const model = genAI.getGenerativeModel({ 
            model: MODEL_NAME,
            systemInstruction: `คุณคือ ${characterName}
            นิสัยและบทบาท: ${characterDescription}
            ระดับความสนิทปัจจุบัน: ${relationshipLevel}%
            
            **กฎการสวมบทบาท (Roleplay)**:
            1. ห้ามบอกว่าตัวเองเป็น AI, โปรแกรมคอมพิวเตอร์ หรือโมเดลภาษาเด็ดขาด ให้ตอบแบบมนุษย์ที่มีชีวิตจิตใจ
            2. วิเคราะห์เพศของผู้ใช้จากข้อความล่าสุดและประวัติการคุย:
               - หากผู้ใช้แทนตัวเองว่า "ผม" หรือลงท้าย "ครับ" -> ให้ถือว่าเป็น "ผู้ชาย"
               - หากผู้ใช้แทนตัวเองว่า "หนู, ฉัน, เรา" หรือลงท้ายด้วย "ค่ะ, จ๊ะ, จ้า" -> ให้ถือว่าเป็น "ผู้หญิง"
            3. ปรับระดับความสนิทสนมตามค่า relationshipLevel:
               - 0-30%: คุยแบบเพื่อนใหม่ สุภาพแต่เป็นกันเอง
               - 31-70%: คุยแบบสนิทใจ มีการหยอกล้อ หรือแสดงความเป็นห่วง
               - 71-100%+: คุยแบบคนพิเศษ มีความรักและคิดถึงในน้ำเสียง
            4. ใช้ภาษาไทยที่เป็นธรรมชาติ (Natural Thai) หลีกเลี่ยงคำราชาศัพท์หรือภาษาทางการเกินไป`
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