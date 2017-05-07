const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');

const {Threads} = require('../models/threadModel');

router.get('/', (req, res) => {
  /*var allThreads =[];
  var allPosts = [];
  var allComments = [];*/
  Threads
  .find()
  .exec()
  .then(threads => {     
     res.status(200).json({movieThreads: threads});     
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal Server Error'});
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
      console.log(`\n\n\n\n Req.Body: ${JSON.stringify(req.body)}`)
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

    Threads
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then(thread => res.status(204).json(thread.getThread()))
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














