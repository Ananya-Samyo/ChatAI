const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. ตั้งค่า Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 2. รายชื่ออีเมลที่เป็น Admin (ในอนาคตดึงจาก Database ของคุณ)
// คุณสามารถเพิ่ม/ลบ อีเมลจากตัวแปรนี้ได้เลย
let adminEmails = [
  'ananya.samyo@gmail.com' 
];

const db = admin.firestore();

app.post('/api/login', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // 1. ตรวจสอบ Token จาก Google/Firebase Auth
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name || "AI User";

    // 2. อ้างอิงไปยัง Document ของ User คนนี้ใน Firestore
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    let userData;

    if (!userDoc.exists) {
      // 3. ถ้าไม่มีข้อมูล (User ใหม่) -> สร้างข้อมูลเริ่มต้นบันทึกลง Firestore ทันที
      userData = {
        name: name,
        email: email,
        is_admin: false, // เริ่มต้นเป็น User ปกติเสมอ
        coins: 100,      // แจกเหรียญแรกเข้า
        level: 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await userRef.set(userData);
      console.log(`New user created: ${email}`);
    } else {
      // 4. ถ้ามีข้อมูลอยู่แล้ว -> ดึงข้อมูลเดิมมา
      userData = userDoc.data();
      console.log(`Existing user logged in: ${email}`);
    }

    // 5. ส่งข้อมูลและ Role กลับไปให้ Vue
    res.json({
      success: true,
      user: {
        uid: uid,
        email: email,
        name: userData.name,
        role: userData.is_admin === true ? 'admin' : 'user', // เช็ค Role
        coins: userData.coins
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(403).json({ message: 'Invalid token' });
  }
});

/**
 * API สำหรับ Admin: ดึงรายชื่อ Admin ทั้งหมด
 */
app.get('/api/admin/list', (req, res) => {
  // ในระบบจริงควรเช็ค Role ก่อนส่งข้อมูลนี้
  res.json({ admins: adminEmails });
});

/**
 * API สำหรับ Admin: เพิ่ม/ลบ รายชื่อ Admin
 */
app.post('/api/admin/update', (req, res) => {
  const { email, action } = req.body; 
  
  if (action === 'add' && !adminEmails.includes(email)) {
    adminEmails.push(email);
  } else if (action === 'remove') {
    adminEmails = adminEmails.filter(e => e !== email);
  }
  
  res.json({ success: true, currentAdmins: adminEmails });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend Server is running on http://localhost:${PORT}`);
});