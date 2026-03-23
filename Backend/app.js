const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./auth');
const chatRoutes = require('./User/chat');

const app = express();

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

// --- 🌐 ใช้งาน Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`-----------------------------------`);
  console.log(`Server running on port ${PORT} 🚀`);
  console.log(`-----------------------------------`);
});