const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { db } = require('./config/firebase');
const authRoutes = require('./auth');

const app = express();

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Error: ไม่พบ GEMINI_API_KEY ในไฟล์ .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash"; 

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);

// --- 💬 Route สำหรับ Chat ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message, characterId, relationshipLevel } = req.body;

    const charDoc = await db.collection('characters').doc(characterId).get();
    if (!charDoc.exists) return res.status(404).send("ไม่พบตัวละคร");
    
    const charData = charDoc.data();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // ใช้ความสามารถของ 2.5 ในการวิเคราะห์คาแรคเตอร์ที่ซับซ้อนขึ้น
    const prompt = `
      บทบาท: คุณคือ ${charData.name}
      นิสัย: ${charData.description}
      ความชอบ: ${charData.preferences?.food || 'ทั่วไป'}
      ระดับความสนิท: ${relationshipLevel}%
      
      กฎการตอบ:
      - ตอบเป็นภาษาไทยตามนิสัยข้างต้น
      - ห้ามตอบยาวเกินไป ให้เหมือนคุยแชทจริง
      - ถ้าความสนิทสูง ให้ใช้คำแทนตัวที่ดูสนิทสนม
      
      ผู้ใช้พิมพ์มาว่า: "${message}"
    `;

    const result = await model.generateContent(prompt);
    res.json({ text: result.response.text() });

  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "Gemini 2.5 พักผ่อนชั่วคราว" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`-----------------------------------`);
  console.log(`Server running on port ${PORT} 🚀`);
  console.log(`Model Active: ${MODEL_NAME}`);
  console.log(`-----------------------------------`);
});