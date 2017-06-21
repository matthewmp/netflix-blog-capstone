const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');

const {Threads} = require('../models/threadModel');
const {Posts} = require('../models/postModel');

// Return All Posts
router.get('/', (req, res)=>{  
  getPosts()
  .then((posts)=>{
    res.json(posts);
  })
});

// Add a new post to a thread
router.post('/:threadId', (req, res) =>{
  if(!(req.params.threadId === req.body.threadId)){
    res.status(400).json({
      error: 'Request Path ID and Request Body ID must match.'
    });
  }

  const requiredFields = ['user', 'content', 'threadId'];
  for(let i = 0; i < requiredFields.length; i++){
    const field = requiredFields[i];
    if(!(field in req.body)){
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  let threadId = req.body.threadId;            

  addPost(req, threadId)
  .then((response) =>{
    res.json(response);
  });
});

// Edit Existing Post Within Thread
router.put('/:id', (req, res) => {
  if(req.params.id !== req.body.postId){
    res.status(400).json({error: 'Request Path ID Must Match Request Body ID'});
  }

  const toUpdate = {};
  const requiredFields = ['postId', 'user', 'content'];
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

	editPost(req, toUpdate)
  .then((response)=>{
    res.json(response);
  });
});

// Delete Post
router.delete('/:postId', (req, res)=>{
  if(req.params.postId !== req.body.postId){
    res.status(400).json({error: 'Request Path ID Must Match Request Body ID'});
  }

  deletePost(req)
  .then((response)=>{
    res.json(response);
  })
});

/*   HTTP Request Functions   */

// Return All Posts.
function getPosts(){
  return new Promise(function(resolve, reject){
    Posts
    .find()
    .then((posts)=>{
      resolve(posts);
    })
    .catch((err)=>{
      reject(err);
    })
  })
}

// Add New Post to Thread.
function addPost(req, threadId){
  return new Promise(function(resolve, reject){
    let postId;

    Posts
    .create({
      user: req.body.user,
      content: req.body.content,
    })
    .then((post) => {
      postId = post._id;
      
      Threads
      .findByIdAndUpdate(threadId, {$push: {posts: postId}}, {new: true})
      .then((response) => {
        resolve(response);
      })
    })
    .catch(err => {
      reject(err);
    })
  });
}

// Edit Existing Post in Thread.
function editPost(req, toUpdate){
  return new Promise(function(resolve, reject){

    Posts
    .findByIdAndUpdate(req.body.postId, {$set: toUpdate}, {new: true})
    .exec()
    .then((response)=>{
      resolve(response);
    })
    .catch(err => reject(err));
  });
}

// Delete Post
function deletePost(req){
  return new Promise(function(resolve, reject){
    Posts
    .findByIdAndRemove(req.params.postId)
    .exec()
    .then((response)=>{
      resolve('Deleted Post');
    })
    .catch(err => reject(err));
  });
}


module.exports = {
  router,
  addPost,
  getPosts,
  editPost,
  deletePost
};