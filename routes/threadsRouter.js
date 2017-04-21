const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');

const {Threads} = require('../models');


router.get('/', (req, res) => {
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

router.get('/:id', (req, res) => {
  Threads
  .findById(req.params.id)
  .exec()
  .then(thread => {
    console.log('Receiving Thread');
    res.json(thread);
  })
})

router.post('/new-thread', (req, res) => {
  console.log('In New Thread');
   const requiredFields = ['title', 'posts', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
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

module.exports = router;














