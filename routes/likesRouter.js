const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');

const {Posts} = require('../models/postModel');

// Like/Unlike Post
router.put('/:postId', (req, res) => {
	if(!(req.params.postId === req.body.postId)){
		return res.status(400).json({
			error: 'Request Post Id and Request Body Id must match'
		});
	}
	
	const requiredFileds = ['user', 'postId'];
	for(let i = 0; i < requiredFileds.length; i++){
		field = requiredFileds[i];
		if(!(field in req.body)){
			const message = `Missing \`${field}\` in Request Body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	likeUnlike(req)
	.then((resp)=>{
		res.json(resp);
	})
});


/* HTTP Request Function */

function likeUnlike(req){		
	return new Promise(function(resolve, reject){
		const user = req.body.user
		
		Posts.findOne({_id: req.body.postId})
		.exec()
		.then((result)=>{
			let repeatUser = false;
			result.likes.users.forEach(function(val, ind){
				if(val.trim() === user.trim()){				
					repeatUser = true;
				}
			})		

			if(repeatUser === true){
				Posts
				.findOne({_id: req.body.postId})
				.exec()
				.then((post) =>{

					Posts
					.findOneAndUpdate({_id: req.body.postId}, {$pull: {"likes.users": user}}, {new: true})
					.exec()
					.then((post)=>{
						var len = post.likes.users.length;
						console.log("NEW LENGTH: " + len)
						Posts.findOneAndUpdate({_id: req.body.postId}, {"likes.count": len}, {new: true})
						.exec()
						.then((post) => {
							resolve(post);	
						})
						.catch((err)=>{
							reject(err);
						})														
					});
				});
			}				
			else {
				Posts
				.findOne({_id: req.body.postId})
				.exec()
				.then((post) =>{
					
					Posts
					.findOneAndUpdate({_id: req.body.postId}, {$push: {"likes.users": user}}, {new: true})
					.exec()
					.then((post)=>{
						var len = post.likes.users.length;
						console.log("NEW LENGTH: " + len)
						Posts.findOneAndUpdate({_id: req.body.postId}, {"likes.count": len}, {new: true})
						.exec()
						.then((post)=>{
							resolve(post);
						})
						.catch((err)=>{
							reject(err);
						})					
					});					
				});
			}			
		});
	});
}

module.exports = {
	router,
	likeUnlike
};
