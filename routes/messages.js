var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var expressJwt = require('express-jwt');

// need to set data  
var postSchema = mongoose.Schema({
  title: String,
  categories: [String],
  content: String,
  authorName: String,
  authorUsername: String,
  authorId: String,
  dateCreated: Date,
  dateUpdated: Date,

});
// need to check this this doesnt look correct or in the right folder should be spererate like in a knex seed file.

db.Post.insert(
{
id: 1,
title: "default",
categories: "default",
content: "Knock-knock",
dateCreated: "2016-10-25T04:45:47.802339Z",
dateUpdated: "2016-10-25T04:45:47.802339Z"
},
{
id: 2,
title: "default",
categories: "default",
content: "Who's there?",
authorName: "String",
authorUsername: "String",
dateCreated: "2016-10-25T04:55:47.802339Z",
dateUpdated: "2016-10-25T04:55:47.802339Z"
},
{
id: 3,
title: "default",
categories: "default",
text: "I asked the librarian for a book on Pavlov's dog and Schrödinger's cat. She said it rang a bell, but she wasn't sure if it was on the shelf or not.",
dateCreated: "2016-10-23T01:55:47.802339Z",
dateUpdated: "2016-10-25T04:55:47.802339Z"
},
{
id: 4,
title: "default",
categories: "default",
content: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had everything before us, we had nothing before us, we were all going direct to Heaven, we were all going direct the other way – in short, the period was so far like the present period, that some of its noisiest authorities insisted on its being received, for good or for evil, in the superlative degree of comparison only.",
dateCreated: "2016-10-24T03:55:47.802339Z",
dateUpdated: "2016-10-25T04:55:47.802339Z"
},
{
id: 5,
title: "default",
categories: "default",
content: "How many programmers does it take to change a light bulb?",
dateCreated: "2016-10-25T05:10:51.483017Z",
dateUpdated: "2016-10-25T04:55:47.802339Z"
  }
);


postSchema.plugin(timestamps);

var Post = mongoose.model('Post', postSchema);



router.get('/messages', function(req, res, next) {
  Post
    .find({})
    .select({
      content: 0,
      __v: 0,
      updatedAt: 0,
      createdAt: 0
    })
    .limit(100)
    .sort({
      createdAt: -1
    })
    .exec(function(err, messages) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: 'Could not retrieve messages'
        });
      }
      res.json(messages);
    });

});

router.post('/messages', function(req, res, next) {
  var user = req.user;
  if (!user) {
    return res.status(401).json({
      message: 'Permission Denied!'
    });
  } else if (!user.isEmailVerified) {
    return res.status(401).json({
      message: 'Permission Denied! Please verify your email.'
    });
  }

  console.dir(req.user);

  var body = req.body;
  var title = body.title;
  var categories = body.categories;
  var content = body.content;
  
  var dateCreated = isUndefined(dateCreated) ? null : dateCreated;
  var dateUpdated = isUndefined(dateUpdated) ? null : dateUpdated;;

  //simulate error if title, categories and content are all "test"
  //This is demo field-validation error upon submission. 
  if (title === 'test' && categories === 'test' && content === 'test') {
    return res.status(403).json({
      message: {
        title: 'Title Error - Cant use "test" in all fields!',
        categories: 'Categories Error',
        content: 'Content Error',
        submitmessage: 'Final Error near the submit button!'
      }
    });
  }

  if (!title || !categories || !content) {
    return res.status(400).json({
      message: 'Error title, categories and content are all required!'
    });
  }

  var post = new Post({
    title: title,
    categories: categories.split(','),
    content: content,
    authorName: req.user.name,
    authorUsername: req.user.username,
    dateCreated: new Date(),
    dateUpdated: dateUpdated
  });

    var postUpdate = new Post({
    title: title,
    categories: categories.split(','),
    content: content,
    authorName: req.user.name,
    authorUsername: req.user.username,
    dateCreated: dateCreated,
    dateUpdated: new Date()
  });

// updated  from post to postUpdate in order to renew the dateUpdated timestamp
  post.save(function(err, postUpdate) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: 'Could not save post'
      });
    }
    res.json(postUpdate);
  });
});

router.get('/messages/:id', function(req, res, next) {
  Post.findById({
    '_id': req.params.id
  }, function(err, post) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: 'Could not retrieve post w/ that id'
      });
    }
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      })
    }
    res.json(post);
  });
});

router.delete('/messages/:id', function(req, res, next) {
  if (!req.user || !req.user.isEmailVerified) {
    return res.status(401).json({
      message: 'Permission Denied!'
    });
  }

  var id = req.params.id;
  if (id.length != 24) {
    return res.json({
      message: 'id must be a valid 24 char hex string'
    });
  }
  var id = mongoose.Types.ObjectId(req.params.id); //convert to objectid
  Post.findByIdAndRemove(id, function(err, post) {
    if (err)
      throw err;

    if (!post) {
      return res.status(404).json({
        message: 'Could not delete post'
      });
    }

    res.json({
      result: 'Post was deleted'
    });

  });
});

router.post('/messages/validate/fields', function(req, res, next) {
  var body = req.body;
  var title = body.title ? body.title.trim() : '';

  Post.findOne({
    'title': new RegExp(title, "i")
  }, function(err, post) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: 'Could not find post for title uniqueness'
      });
    }
    if (post) {
      res.json({
        title: 'Title "' + title + '" is not unique!'
      });
    } else {
      return res.json({});
    }

  });
});


module.exports = router;