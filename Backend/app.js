const express = require('express')
const session = require('express-session')
const passport = require('passport')
const cors = require('cors')

const authRoutes = require('./auth')

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/api/auth', authRoutes)

app.listen(3000, () => console.log('Server running'))