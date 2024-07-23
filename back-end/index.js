const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')
require('./Connection/conn')
const usersApi = require('./Routes/users')
const postApi = require('./Routes/post')
const chatApi = require('./Routes/chatMessage.js')
require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000

app.use(cors());


app.use('/app/user', usersApi)
app.use('/app/post', postApi)
app.use('/app/chat', chatApi)

app.get('/' , (req, res) => {
  res.send('Hello World!')
})

// const server = http.createServer(app)

const server = app.listen(port,() => {
  console.log(`Listening on port ${port}`)
})

const io = socketIo(server, {
  cors: {
    origin: "*", // Replace with your frontend URL
    methods: ["GET", "POST"],
  }
})

chatApi.initializeSocket(io);