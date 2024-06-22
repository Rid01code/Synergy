const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()
const userModel = require('../Models/userModel')
const { validateEmail, validatePhone } = require('../utilities/validation')
const authenticateToken = require('../Auth/auth')




router.use(express.json())

//Sign Up
router.post('/sign-in', async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const existingEmail = await userModel.findOne({ email: email })
      const existingPhone = await userModel.findOne({ phone: phone })

      if (existingEmail) { 
        return res.status(400).json({message : 'Email already exists'})
      }
      if (existingPhone) {
        return res.status(400).json({message : 'Phone number already exists'})
      }
      
      const user = new userModel({
        name: name,
        email: email,
        phone: phone,
        password: hashedPassword,
      })
      await user.save()
      return res.status(200).json({message : 'Signed In Successfully'})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Internal Server Error'})
    }
})
  

//Log In
router.post('/log-in', async (req, res) => {
  const { emailOrPhone, password } = req.body

  try {
    let user;
    if (validateEmail(emailOrPhone)) {
      user = await userModel.findOne({ email: emailOrPhone })
    } else if (validatePhone(emailOrPhone)) {
      user = await userModel.findOne({ phone: emailOrPhone })
    } else {
      return res.status(400).json({ message: "Email or Phone Number Does Not Exist , Please Sign In" })
    }

    if (!user) {
      return res.status(400).json({ message: "Email or Phone Number Does Not Exist , Please Sign In" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong Password" })
    }
    const authClaims = [{ user : user.id   }, { jti: jwt.sign({}, 'Iamrid150') }];
    const token = jwt.sign({ authClaims }, 'Iamrid150', { expiresIn: "1d" });
    res.status(200).json({ id: user._id, token: token })
  } catch (error) {
    console.log(error)
  }
});

//Get User Info
router.get('/user-info',authenticateToken ,  async (req, res) => { 
  try {
    const userId = req.headers.id
    const user = await userModel.findById(userId)
    if (!user) {
      return res.status(400).json({ message: "User Not Found" })
    }
    const userInfo = {
      name : user.name,
      email : user.email,
      phone : user.phone
    }
    return res.status(200).json({userInfo})
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

// Get Other users Info
router.get('/user-info-byId/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  if(!userId){
    return res.status(404).json({message : "User Not Found"})
  }
  try {
    const user = await userModel.findById(userId)
    return res.status(200).json({user})
  } catch (error) {
    console.log(error)
    return res.status(200).json({message : "Internal Server Error"})
  }
})

module.exports = router