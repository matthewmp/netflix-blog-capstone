const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');

const {Comments} = require('../models/commentModel');
const {Posts} = require('../models/postModel');

// Get All Comments.
router.get('/', (req, res)=>{
	getComments()
	.then((comments)=>{
		res.json(comments);
	})
})

// Post Comment
router.post('/:postId', (req, res) => {
	console.log('posting comment')
	if(!(req.params.postId === req.body.postId) || (req.params.postId === undefined)){
		res.status(400).json({message: 'Request Path and Body IDs Must Match'});
	}

	postComment(req)
	.then((response)=>{
		res.json(response);
	})
})

/*  HTTP Request Functions  */

// Get All Comments
function getComments(req){
	return new Promise(function(resolve, reject){
		Comments.find()
		.then((comments)=>{
			resolve(comments);
		})
		.catch(err => reject(err));
	});
}

// Post Comment
function postComment(req){
	return new Promise(function(resolve, reject){

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
	    	})
			.then((response)=>{
	  			resolve(comment);
	  		})
		    .catch(err => {
		    	reject(err);
		  	});
	  	});	  	
	});
}

module.exports = {
	router,
	getComments,
	postComment
};