const express = require('express')
const cors = require('cors')
require('./Connection/conn')
const usersApi = require('./Routes/users')
const postApi = require('./Routes/post')
require('dotenv').config();

const app = express()

const port = 5000

app.use(cors());

app.use('/app/user', usersApi)
app.use('/app/post' , postApi)

app.get('/' , (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})