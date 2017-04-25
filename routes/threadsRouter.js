const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');

const {Threads} = require('../models');


router.get('/threads', (req, res) => {
  Threads
  .find()
  .exec()
  .then(threads => {
  	  console.log('responding')
      res.json({movieThreads: threads})
  })  
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal Server Error'})
  })
})

router.get('/threads/:id', (req, res) => {
  Threads
  .findById(req.params.id)
  .exec()
  .then(thread => {
    console.log('Receiving Thread');
    res.json(thread);
  })
})

router.post('/threads/new-thread', (req, res) => {
   const requiredFields = ['title', 'posts', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Threads
    .create({
      title: req.body.title,
      posts: req.body.posts,
      author: req.body.author
    })
    .then(thread => res.status(201).json(thread)
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    }));
})

router.put('/threads/new-post/:id', (req, res) => {
  if(!(req.params.id === req.body._id)){
    res.status(400).json({
      error: 'Request Path ID and Request Body ID Must Match'
    });
  }
 
  const requiredFields = ['user', 'content'];
  for(let i = 0; i < requiredFields.length; i++){
      const field = requiredFields[i];
      if(!(field in req.body)){
        const message = `Missing \`${field}\` in request body`;
        console.error(message);
        return res.status(400).send(message);
      }
    }
    
    const post = {
      content: req.body.content,
      user: req.body.user,
      likes: 0
      
    }

    console.log(`Inside put route: ${JSON.stringify(post)}`)

    Threads
    .findByIdAndUpdate(req.params.id, {$push: {posts: {$each: [post], $position: 0}}},{new: true})
    .exec()
    .then(thread => res.status(201).json(thread.posts[0]))//(thread > res.status(201).json(thread.posts[0]))
    .catch(err => res.status(500).json({message: 'Something went wrong'}));
});

module.exports = router;














