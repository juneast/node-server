const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')
var config = require('../config')

const User = new Schema({
    createTime : Date,
    userId: String,
    password: String,
    admin: { type: Boolean, default: false },
})

// create new User document
User.statics.create = function(userId, password) {
  const encrypted = crypto.createHmac('sha1', config.secret)
                    .update(password)
                    .digest('base64')

  const user = new this({
      userId,
      password: encrypted
  })

  // return the Promise
  return user.save()
}

// find one user by using username
User.statics.findOneByUserId = function(userId) {
    return this.findOne({
        userId
    }).exec()
}
User.statics.findOneByObjectId = function(id) {
    return this.findOne({
        _id : id
    })
}
// verify the password of the User documment
User.methods.verify = function(password) {
  const encrypted = crypto.createHmac('sha1', config.secret)
                    .update(password)
                    .digest('base64')

  return this.password === encrypted
}

User.methods.assignAdmin = function() {
    this.admin = true
    return this.save()
}


module.exports = mongoose.model('User', User)