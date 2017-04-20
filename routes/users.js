var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var utils = require('../utils/index');
var email = require('../utils/email');
var expressJwt = require('express-jwt');

if (!process.env.JWT_SECRET) {
  console.error('ERROR!: Please set JWT_SECRET before running the app. \n run: export JWT_SECRET=<some secret string> to set JWTSecret. ')
  process.exit();
}

var userSchema = mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  image: String,
  admin: Boolean,
  isEmailVerified: Boolean,
  verifyEmailToken: String,
  verifyEmailTokenExpires: Date
});

userSchema.plugin(timestamps);

var User = mongoose.model('User', userSchema);

//user unique func
function isUserUnique(reqBody, cb) {
  var username = reqBody.username ? reqBody.username.trim() : '';
  var email = reqBody.email ? reqBody.email.trim() : '';

  User.findOne({
    $or: [{
      'username': new RegExp(["^", username, "$"].join(""), "i")
    }, {
      'email': new RegExp(["^", email, "$"].join(""), "i")
    }]
  }, function(err, user) {
    if (err)
      throw err;

    if (!user) {
      cb();
      return;
    }

    var err;
    if (user.username === username) {
      err = {};
      err.username = '"' + username + '" is not unique';
    }
    if (user.email === email) {
      err = err ? err : {};
      err.email = '"' + email + '" is not unique';
    }

    cb(err);
  });
}

// check if user can access this route if admin
router.get('/users/?', function(req, res) {

  if (!req.user || !req.user.admin)
    return res.status(401).json({
      error: 'You must be admin to access this route.'
    });

  User
    .find({})
    .select({
      password: 0,
      __v: 0,
      updatedAt: 0,
      createdAt: 0
    }) //do not return password (even though it's hashed using bcrypt)
    .limit(100)
    .sort({
      createdAt: -1
    })
    .exec(function(err, users) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: 'Could not retrieve users'
        });
      }
      res.json(users);
    });
});