const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');

const {Threads} = require('../models/threadModel');
const {Posts} = require('../models/postModel');


// Return All Posts
router.get('/', (req, res)=>{  
  Posts
  .find()
  .then((posts)=>{
    res.status(200).json({posts: posts})
  })
})


// POST a new post for a thread
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
  let postId;             
  Posts
  .create({
    user: req.body.user,
    content: req.body.content,
  })
  .then((post) => {
    postId = post._id;
    res.status(201).json(post);
    Threads
    .findByIdAndUpdate(threadId, {$push: {posts: postId}}, {new: true})
    .then(() => {
      console.log("Thread ID Loaded")
    })
  })
  .catch(err => {
    res.status(500).json({error: 'Somethig Went Wrong'})
  })
})

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

	Posts
	.findByIdAndUpdate(req.body.postId, {$set: toUpdate}, {new: true})
	.exec()
	.then(post => res.status(200).json({post}))
	.catch(err => res.status(500).json({message: 'Something went wrong'}))
})

// Delete Posts

router.delete('/:postId', (req, res)=>{

  if(req.params.postId !== req.body.postId){
    res.status(400).json({error: 'Request Path ID Must Match Request Body ID'});
  }

  Posts
  .findByIdAndRemove(req.params.postId)
  .exec()
  .then(()=>{
    res.status(204).end()
  })
  .catch(err => res.status(500).json({message: 'Internal Server Error'}));
});









module.exports = router;