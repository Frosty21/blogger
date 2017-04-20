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

// sign in page route 
router.post('/users/signin', function(req, res) {
  User
    .findOne({
      username: req.body.username
    })
    .select({
      __v: 0,
      updatedAt: 0,
      createdAt: 0
    }) //make sure to not return password (although it is hashed using bcrypt)
    .exec(function(err, user) {
      if (err)
        throw err;

      if (!user) {
        return res.status(404).json({
          error: true,
          message: 'Username or Password is Wrong'
        });
      }


      bcrypt.compare(req.body.password, user.password, function(err, valid) {
        if (!valid) {
          return res.status(404).json({
            error: true,
            message: 'Username or Password is Wrong'
          });
        }

        // dont pass anything in the token that might be used in other parts of the app
        var token = utils.generateToken(user);

        user = utils.getCleanUser(user);

        res.json({
          user: user,
          token: token
        });
      });
    });
});

// sign up route
router.post('/users/signup', function(req, res, next) {
  var body = req.body;


  var errors = utils.validateSignUpForm(body);
  if (errors) {
    return res.status(403).json(errors);
  }

  isUserUnique(body, function(err) {
    if (err) {
      return res.status(403).json(err);
    }

    var hash = bcrypt.hashSync(body.password.trim(), 10);
    var user = new User({
      name: body.name.trim(),
      username: body.username.trim(),
      email: body.email.trim(),
      password: hash,
      admin: false,
      isEmailVerified: false
    });


    user.save(function(err, user) {
      if (err)
        throw err;

      //sends welcome email w verification token
      email.sendWelcomeEmail(user, req.headers.host); 

      var token = utils.generateToken(user);

      user = utils.getCleanUser(user);

      res.json({
        user: user,
        token: token
      });
    });

  });
});

// check for no duplicates
router.post('/users/validate/fields', function(req, res, next) {
  var body = req.body;

  isUserUnique(body, function(err) {
    if (err) {
      return res.status(403).json(err);
    } else {
      return res.json({});
    }
  });
});

//check token from current user
router.get('/me/from/token', function(req, res, next) {

// check for token in post/url params or header
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (!token) {
    return res.status(401).json({
      message: 'Must pass token'
    });
  }

  // decode and check token
  jwt.verify(token, process.env.JWT_SECRET, function(err, user) {
    if (err)
      throw err;

    //return user id from within the JSON token
    User.findById({
      '_id': user._id
    }, function(err, user) {
      if (err)
        throw err;

      //remove password and any userinfo
      user = utils.getCleanUser(user); 
      
      // side note: token can be renewed from creating a new one via refresh but this is passing the old token back/

      res.json({
        user: user,
        token: token
      });

    });
  });
});