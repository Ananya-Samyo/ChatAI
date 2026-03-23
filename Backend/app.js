const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { db } = require('./config/firebase');
const authRoutes = require('./auth');

const app = express();

// --- ตั้งค่า Gemini ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);

// --- 🤖 Route ใหม่สำหรับ Chat กับ AI ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message, characterId, relationshipLevel } = req.body;

    // 1. ดึงข้อมูลตัวละคร
    const charDoc = await db.collection('characters').doc(characterId).get();
    if (!charDoc.exists) {
      return res.status(404).send("ไม่พบข้อมูลตัวละคร");
    }
    const charData = charDoc.data();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 🎭 สร้าง Prompt (เหมือนเดิม)
    const prompt = `
      คุณคือ: ${charData.name}
      ลักษณะนิสัย: ${charData.description}
      สิ่งที่คุณชอบกิน: ${charData.preferences?.food || 'ไม่ระบุ'}
      กิจกรรมที่ชอบ: ${charData.preferences?.activity || 'ไม่ระบุ'}
      ระดับความสนิทปัจจุบัน: ${relationshipLevel}% (0-100)
      คำสั่ง: ตอบเป็นภาษาไทยตามคาแรคเตอร์ข้างต้น 
      ข้อความจากผู้ใช้: "${message}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    res.json({ text: aiText });

  } catch (err) {
    // ถ้ายังพังเพราะ 404 ให้ลองสลับไปใช้ "gemini-pro" ในบรรทัดที่แก้ข้างบน
    console.error("AI Error:", err);
    res.status(500).json({ error: "Gemini AI รวนนิดหน่อย" });
  }
});

// --- 🧪 Route สำหรับเช็คว่า AI พร้อมทำงานไหม (ยิงผ่าน Browser ได้) ---
app.get('/test-ai', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("สวัสดี ทดสอบการเชื่อมต่อ");
    const response = await result.response;
    res.send("AI ตอบกลับมาว่า: " + response.text());
  } catch (err) {
    console.error(err);
    res.status(500).send("AI ยังไม่ทำงาน: " + err.message);
  }
});

app.listen(3000, () => console.log('Server running on port 3000 🚀'));