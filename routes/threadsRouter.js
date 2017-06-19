const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
// const { passport } = require('../server');
const { Threads } = require('../models/threadModel');

// Returns All Threads.
router.get('/', passport.authenticate('basic', { session: true }), (req, res) => {
  getThreads()
  .then((allThreads)=>{
    res.json({movieThreads: allThreads}); 
  })
  //.catch(err => )
  
});


// Returns Individual Thread By Id.
router.get('/:id', (req, res) => {
  getThreadById(req.params.id)
  .then((thread) => {
    res.json({thread});
  })
});


// Creates New Thread.
router.post('/new-thread', (req, res) => {
  createThread(req, res);
});


// Edit Thread.
router.put('/:id', (req, res) => {
  editThread(req, res);
});

// Delete Thread.
router.delete('/:id', (req, res) => {
  deleteThread(req, res)
})


/*   HTTP Request Functions   */

// Get All Threads.
function getThreads(){
  //let threadIdArr = Threads.find();

    return new Promise(function(resolve, reject){

    Threads
      .find()
      .lean()
      .populate({ path: 'posts' })
      .populate({ path: 'posts.comments' })

      .exec(function (err, docs) {

        var options = {
          path: 'posts.comments',
          model: 'comments'
        };

        if(err) reject(err);

        Threads.populate(docs, options, function (err, threads) {
          //
        })
        .then(threads => {
          resolve(threads);
        })
        .catch(err =>{
          reject(err);
        });
      });
    });
}

//Returns Individual thread by ID.
function getThreadById(id){
  console.log(`ID: ${id}`)
  return new Promise(function(resolve, reject){
    Threads
    .findById(id)
    .lean()
    .populate({ path: 'posts' })
    .exec(function (err, docs) {
      var options = {
        path: 'posts.comments',
        model: 'comments'
      };

      if (err) return res.json(500);
      Threads.populate(docs, options, function (err, thread) {
        //
      })
      .then(thread => {
        resolve(thread);
      })
      .catch(err => {
        reject(err);
      })
    })
  })
  
}


// Creates New Thread.
function createThread(req, res){
  const requiredFields = ['title', 'author', 'content'];
  for (let i = 0; i < requiredFields.length; i++) {
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
      res.status(500).json({ error: 'Something went wrong' });
    });
}

// Edit Thread.
function editThread(req, res){
  if (!(req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request Path ID and Request Body ID Must Match'
    });
  }

  const toUpdate = {};
  const requiredFields = ['title', 'author', 'id', 'content'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  requiredFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  })

  Threads
    .findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
    .exec()
    .then(thread => res.status(201).json(thread.getThread()))
    .catch(err => res.status(500).json({ message: 'Something went wrong' }))
}

// Delete Thread. 
function deleteThread(req, res){
  Threads
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
}




module.exports = {
  router,
  getThreads
}















