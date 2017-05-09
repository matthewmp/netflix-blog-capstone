const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');

const {Threads} = require('../models/threadModel');




router.put('/:postId', (req, res) => {
	console.log('posting comment')
	if(!(req.params.postId === req.body.postId) || (req.params.postId === undefined)){
		res.status(400).json({message: 'Request Path and Body IDs Must Match'});
	}
	
	const postId = req.body.postId;
	const comment = {
		user: req.body.user,
		comment: req.body.comment
	}
 	
 	console.log()

	Threads
	//.update({"_id": threadId, "posts._id": postId}, {$push: {"comments": comment}})
	.findOneAndUpdate({"posts._id": postId}, {"$push": {"posts.$.comments": comment}}, {new: true})
	.exec()
	.then((thread) => res.status(201).json(thread.getThread()))//res.status(201).json(thread.getThread()))
	.catch(err => res.status(500).json({message: 'Internal server error'}));
})
/*
router.delete('/comments/:threadId', (req, res) => {
	if(req.params.threadId !== req.body.threadId){
		console.log("MISSMATCH")
		res.status(400).json({
      		error: 'Request Path ID and Request Body ID Must Match'
    	});
	}

	const threadId = req.params.threadId;
	//const postId = req.body.postId
	const commentId = req.body.commentId;

	Threads
	.findByIdAndUpdate(threadId, {$pull: {posts: {comments: commentId}}})
	.exec()
 	.then(() => res.status(204).end()) 
  	.catch(err => res.status(500).json({message: 'Internal server error'}));
})
*/


module.exports = router;