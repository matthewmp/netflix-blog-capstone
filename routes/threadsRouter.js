const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const {passport} = require('./userRouter')
const {Threads} = require('../models/threadModel');


router.get('/', (req, res) => { 


  console.log(req.user, 'user');
  let threadIdArr = Threads.find();

  Threads
  .find()
  .lean()
  .populate({path: 'posts'})
  .populate({path: 'posts.comments'})

  .exec(function(err, docs){
    
    var options = {
      path: 'posts.comments',
      model: 'comments'
    };

    if(err) return res.json(500);
    
    Threads.populate(docs, options, function(err, threads){
      res.json({movieThreads: docs});
    })    
  })
})  

router.get('/:id', (req, res) => {
  Threads
  .findById(req.params.id)
  .lean()
  .populate({path: 'posts'})
  .exec(function(err, docs){
    var options = {
      path: 'posts.comments',
      model: 'comments'
    };

    if(err) return res.json(500);
    Threads.populate(docs, options, function(err, thread){
      res.json(thread);
    })
  })
})

router.post('/new-thread', (req, res) => {
   const requiredFields = ['title', 'author', 'content'];
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
      author: req.body.author,
      content: req.body.content
    })
    .then(thread => {
      res.status(201).json(thread)
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    });
})



router.put('/:id', (req, res) => {  
  if(!(req.params.id === req.body.id)){
    res.status(400).json({
      error: 'Request Path ID and Request Body ID Must Match'
    });
  }
 
  const toUpdate = {};
  const requiredFields = ['title', 'author', 'id', 'content'];
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

    Threads
    .findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
    .exec()
    .then(thread => res.status(201).json(thread.getThread()))
    .catch(err => res.status(500).json({message: 'Something went wrong'}))
});

router.delete('/:id', (req, res) => {
  Threads
  .findByIdAndRemove(req.params.id)
  .exec()
  .then(() => res.status(204).end())
  .catch(err => res.status(500).json({message: 'Internal server error'}));
})


module.exports = router;














