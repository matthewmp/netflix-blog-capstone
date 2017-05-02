const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const {Comments} = require('../models/commentsModel');


router.get('/', (req, res) => {
  Comments
  .find()
  .exec()
  .then(comments => {
  	  console.log('responding')
      
      res.json({comments: comments})
  })  
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal Server Error'})
  })
})

router.get('/:id', (req, res) => {
  Comments
  .findById(req.params.id)
  .exec()
  .then(comment => {
    console.log('Receiving Post');
    res.json(comment);
  })
})

router.post('/new-comment', (req, res) => {
   const requiredFields = ['postId', 'comment', 'user'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  console.log(req.body)

  Comments
    .create({
      postId: req.body.postId,
      comment: req.body.comment,
      user: req.body.user
    })
    .then(comment => res.status(201).json(comment)
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
  const requiredFields = ['comment', 'id'];
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

    Comments
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then(thread => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Something went wrong'}))
});

router.delete('/:id', (req, res) => {
  Comments
  .findByIdAndRemove(req.params.id)
  .exec()
  .then(() => res.status(204).end())
  .catch(err => res.status(500).json({message: 'Internal server error'}));
})


module.exports = router;