const express = require('express')
const session = require('express-session')
const passport = require('passport')
const cors = require('cors')

const { db } = require('./config/firebase')

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

app.get('/test-firebase', async (req, res) => {

  try {

    await db.collection('test').add({
      message: "Firebase connected",
      time: new Date()
    })

    res.send("Firebase connected successfully")

  } catch (err) {

    console.error(err)
    res.status(500).send("Firebase error")

  }

})

app.listen(3000, () => console.log('Server running'))