const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');

const {Threads} = require('../models/threadModel');


// Create New Post Within Existing Thread
router.put('/new-post/:id', (req, res) => {  
  if(!(req.params.id === req.body.threadId)){
    res.status(400).json({
      error: 'Request Path ID and Request Body ID Must Match'
    });
  }
 
  const toUpdate = {};
  const requiredFields = ['threadId', 'content', 'user'];
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
      	if(field !== 'id'){
      		toUpdate[field] = req.body[field];	
      	}        
      }
    })
    console.log(toUpdate);

    Threads
    .findByIdAndUpdate(req.params.id, {$push: {posts: toUpdate}}, {new: true})
    .exec()
    .then(post => res.status(201).json(post.getThread()))
    .catch(err => res.status(500).json({message: 'Something went wrong'}))
});


router.delete('/', (req, res) => {
  console.log('Deleting')
  const threadId = req.body.threadId;
  const postId = req.body.postId;
  console.log(`Post: ${postId}, Thread: ${threadId}`);
  
  Threads
  .findByIdAndUpdate(threadId, {$pull: {posts: {_id: postId}}})
  .exec()
  .then(() => res.status(204).end()) 
  .catch(err => res.status(500).json({message: 'Internal server error'}));
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
	console.log(req.params);

	Threads
	.findOneAndUpdate({"posts._id": req.params.id}, {"$set": {"posts.$.content": toUpdate.content, "posts.$.user": toUpdate.user}}, {new: true})
	.exec()
	.then(thread => res.status(200).json({thread}))
	.catch(err => res.status(500).json({message: 'Something went wrong'}))
})


module.exports = router;