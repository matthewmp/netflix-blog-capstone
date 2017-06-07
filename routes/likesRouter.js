const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');

const {Posts} = require('../models/postModel');

router.put('/:postId', (req, res) => {
	if(!(req.params.postId === req.body.postId)){
		return res.status(400).json({
			error: 'Request Post Id and Request Body Id must match'
		});
	}

	const update = {};
	const requiredFileds = ['user', 'postId'];
	for(let i = 0; i < requiredFileds.length; i++){
		field = requiredFileds[i];
		if(!(field in req.body)){
			const message = `Missing \`${field}\` in Request Body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	requiredFileds.forEach((field) => {
		if(field in req.body){
			update[field] = req.body[field];
		}
	})

	
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
						return res.json(post);	
					})														
				})
				.catch(err => res.status(500).json({message: 'Something went wrong'}))
			})
			.catch(err => res.status(500).json({message: 'Something went wrong'}))			
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
						return res.json(post);
					})					
				})
				.catch(err => res.status(500).json({message: 'Something went wrong'}))
			})
			.catch(err => res.status(500).json({message: 'Something went wrong'}))			
		}
		
	})
})


// Unlike Post

router.put('/unlike/:postId', (req, res) => {
	
	if(!(req.params.postId === req.body.postId)){
		res.status(400).json({
			error: 'Request Post Id and Request Body Id must match'
		});
	}

	const update = {};
	const requiredFileds = ['user', 'postId'];
	for(let i = 0; i < requiredFileds.length; i++){
		field = requiredFileds[i];
		if(!(field in req.body)){
			const message = `Missing \`${field}\` in Request Body`;
			console.error(message);
			res.status(400).send(message);
		}
	}

	requiredFileds.forEach((field) => {
		if(field in req.body){
			update[field] = req.body[field];
		}
	})
	
	const user = req.body.user

	Posts
	.findOneAndUpdate({_id: req.body.postId}, {$inc: {"likes.count": -1}}, {new: true})
	.exec()
	.then((post) =>{
		Posts
		.findOneAndUpdate({_id: req.body.postId}, {$pull: {"likes.users": user}}, {new: true})
		.exec()
		.then((post)=>{
			res.send(post);
		})
		.catch(err => res.status(500).json({message: 'Something went wrong'}))
	})

	

})

module.exports = router;