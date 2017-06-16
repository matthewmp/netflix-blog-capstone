const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');

const {Comments} = require('../models/commentModel');
const {Posts} = require('../models/postModel');


// Get All Comments.
router.get('/', (req, res)=>{
	getComments(req, res);
})

// Post Comment
router.post('/:postId', (req, res) => {
	postComment(req, res);
})


/*  HTTP Request Functions  */

// Get All Comments
function getComments(req, res){
	Comments.find()
	.then((comments)=>{
		res.status(200).json({comments: comments})
	})
}

// Post Comment
function postComment(req, res){
	console.log('posting comment')
	if(!(req.params.postId === req.body.postId) || (req.params.postId === undefined)){
		res.status(400).json({message: 'Request Path and Body IDs Must Match'});
	}
	
	const postId = req.body.postId;	
	let commentId;	

	Comments
	.create({
		user: req.body.user,
		comment: req.body.comment
	})
	.then((comment) => {
		commentId = comment._id;

		Posts
		.findByIdAndUpdate(postId, {$push: {comments: commentId}})
		.then((post) => {
      		console.log("Post ID Loaded")
      		res.status(201).json(comment);
    	})
  	})
    .catch(err => {
    	res.status(500).json({error: err})
  	})
}

module.exports = router;