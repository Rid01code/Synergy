const mongoose = require('mongoose')
const userModel = require('./userModel')

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "userModel",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    trim: true,
    required: true
  },
  photoUrl: {
    type: String,
    required: true
  },
  hashtags: {
    type: [String]
  },
  likes: {
    type: [{
      userId: {
        type: mongoose.Types.ObjectId,
        ref : 'userModel'
      },
    }]},
  comments: {
    type: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
      },
      text: {
        type: String,
        trim: true,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {timestamps : true})

const PostModel = mongoose.model('PostModel', postSchema)
module.exports = PostModel