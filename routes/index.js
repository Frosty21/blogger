var express = require('express');
var router = express.router

// Home page
router.get('/messages', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});
module.exports = router;