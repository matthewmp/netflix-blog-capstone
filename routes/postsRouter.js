const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const {Posts} = require('../models/postsModel');


router.get('/', (req, res) => {
  Posts
  .find()
  .exec()
  .then(posts => {
  	  console.log('responding')
      
      res.json({posts: posts})
  })  
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal Server Error'})
  })
})

router.get('/:id', (req, res) => {
  Posts
  .findById(req.params.id)
  .exec()
  .then(post => {
    console.log('Receiving Post');
    res.json(post);
  })
})

router.post('/new-post', (req, res) => {
   const requiredFields = ['threadId', 'content', 'user'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  console.log(req.body)

  Posts
    .create({
      threadId: req.body.threadId,
      content: req.body.content,
      user: req.body.user
    })
    .then(post => res.status(201).json(post)
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    }));
})



router.put('/:id', (req, res) => {  
  if(!(req.params.id === req.body.id)){
    res.status(400).json({
      error: 'Request Path ID and Request Body ID Must Match'
    });
  }
 
  const toUpdate = {};
  const requiredFields = ['content', 'id'];
  console.log(req.params.id)
  for(let i = 0; i < requiredFields.length; i++){
      const field = requiredFields[i];
      if(!(field in req.body)){
        const message = `Missing \`${field}\` in request body`;
        console.error(message);
        return res.status(400).send(message);
      }
    }

    requiredFields.forEach(field => {
      if(field in req.body){
        toUpdate[field] = req.body[field];
      }
    })
    console.log(toUpdate)

    Posts
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then(thread => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Something went wrong'}))
});

router.delete('/:id', (req, res) => {
  Posts
  .findByIdAndRemove(req.params.id)
  .exec()
  .then(() => res.status(204).end())
  .catch(err => res.status(500).json({message: 'Internal server error'}));
})


module.exports = router;