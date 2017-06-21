const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');

const { Threads } = require('../models/threadModel');

// Returns All Threads.
router.get('/', passport.authenticate('basic', { session: true }), (req, res) => {
  getThreads()
  .then((allThreads)=>{
    res.json({movieThreads: allThreads}); 
  })  
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
  let newThread = {
    title: req.body.title,
    author: req.body.author,
    content: req.body.content
  }

  createThread(newThread)
  .then((thread)=>{
    res.json(thread);
  })
});

// Edit Thread.
router.put('/:id', (req, res) => {
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

  editThread(toUpdate)
  .then((response)=>{
    res.json(response)
  })
});

// Delete Thread.
router.delete('/:id', (req, res) => {
  deleteThread(req.params.id)
  .then((response)=>{
    res.json({message: 'Deleted Thread'})
  })
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
function createThread(req){

  return new Promise(function(resolve, reject){

    const requiredFields = ['title', 'author', 'content'];
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (!(field in req)) {
        const message = `Missing \`${field}\` in request body`;
        console.error(message);
        return message;
      }
    }
  
    Threads
      .create({
        title: req.title,
        author: req.author,
        content: req.content
      })
      .then(thread => {
        resolve(thread);
      })
      .catch(err => {
        reject(err);
      });
  });
}

// Edit Thread.
function editThread(toUpdate){

  return new Promise(function(resolve, reject){

  Threads
    .findByIdAndUpdate(toUpdate.id, { $set: toUpdate }, { new: true })    
    .then((thread) => {
      resolve(thread);
    })
    .catch((err) => {
      reject(err);
    });
  });
}

// Delete Thread. 
function deleteThread(id){

  return new Promise(function(resolve, reject){

    Threads
      .findByIdAndRemove(id)
      .exec()
      .then((response)=>{
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
    });
}




module.exports = {
  router,
  getThreads,
  getThreadById,
  deleteThread,
  createThread,
  editThread
}















