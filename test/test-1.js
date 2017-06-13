'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const {Threads} = require('../models/threadModel');
const {Posts} = require('../models/postModel');
const {Comments} = require('../models/commentModel');
const {User} = require('../models/userModel')

var threadArray = [];
mongoose.Promise = global.Promise;

chai.use(chaiHttp);

let threadIdArr = [];
let postIdArr = [];
let commentIdArr = [];

function generateThreadData(){
	return new Promise(function(res, rej){
		var threads = [];
		for(var i = 0; i < 5; i++){
			let thread = {
				title: `Thread # ${i}`,			
				author: faker.name.findName(),
				content: faker.lorem.paragraph()			
			}
			threads.push(thread);		
		}
		Threads.insertMany(threads)		
		.then((resp) => {			
			res(resp);
		})
		.catch(err => {
			rej(err);
		});
	});
}

function generatePostData(){
	var threadIds = [];
	Threads.find()

	return new Promise(function(res, rej){
		var posts = [];
		for(var i = 0; i < 5; i++){
			let post = {						
				user: faker.name.findName(),
				content: `Post # ${i}`					
			}
			posts.push(post);
		}
		Posts.insertMany(posts)
		.then((posts) => {
			res(posts)
		})
		.catch(err => {
			rej(new Error('Posts Not Created'))
		});
	});
}

function generateCommentData(){
	return new Promise(function(res, rej){
		var comments = [];
		for(var i = 0; i < 5; i++){
			let comment = {								
				user: faker.name.findName(),
				comment: `Comment # ${i}`				
			}	
		comments.push(comment);	
		}
		Comments.insertMany(comments)
		.then((comments) => {			
			res(comments)
		})
		.catch(err => {
			rej(new Error('Comments Not Created'))
		})

		Posts.find({}, {"_id": 1})
		.lean()
		.then((postIds)=>{
			postIdArr = postIds;			
		});

	});
}

function getThreadIds(){
	return new Promise(function(res, rej){
		Threads.find({}, {"_id": 1})
		.lean()
		.then((threads)=>{
			threadIdArr = threads;
			res(threads)
		});	
	});
}

function getPostIds(){
	return new Promise(function(res, rej){
		Posts.find({}, {"_id": 1})
		.lean()
		.then((posts)=>{
			postIdArr = posts;
			res(posts)
		});
	});
}

function getCommentIds(){
	return new Promise(function(res, rej){
		Comments.find({}, {"_id": 1})
		.lean()
		.then((comments)=>{
			commentIdArr = comments;
			res(comments)
		});
	});
}

function insertPostIds(){
	return new Promise(function(res, rej){
		for(let i = 0; i < postIdArr.length; i++){
			Threads
			.findByIdAndUpdate(threadIdArr[i]._id, {$push: {posts: postIdArr[i]._id}})
			.exec()
			.then((result)=>{
				res(result)
			});
		}
	});
}

function insertCommentIds(){
	return new Promise(function(res, rej){
		for(let i = 0; i < commentIdArr.length; i++){
			Posts
			.findByIdAndUpdate(postIdArr[i]._id, {$push: {comments: commentIdArr[i]._id}})
			.exec()
			.then((result)=>{
				res(result)
			});
		}
	});
}

function createUser(){
	User.create({
		username: 'Matt',
		password: 'matt'
	})
}

// Drop DB
function tearDown(){
	console.warn('Deleting DB');
	return mongoose.connection.dropDatabase();
}


// Load Initial Array Data
function init_data(){
	generateThreadData();
}

createUser();

describe('Forum API Resource', function(){
	before(function(){
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function(done){
		generateThreadData()
		.then(()=>{
			done();
		});
	});

	beforeEach(function(done){
		generatePostData()
		.then(()=>{
			done()
		});
	});

	beforeEach(function(done){
		generateCommentData()
		.then(()=>{
			done();
		});
	});

	beforeEach(function(done){
		getThreadIds()
		.then(()=>{
			done();
		});
	});

	beforeEach(function(done){
		getPostIds()
		.then(()=>{
			done();
		});
	});

	beforeEach(function(done){
		getCommentIds()
		.then(()=>{
			done();
		});
	});

	beforeEach(function(done){
		insertPostIds()
		.then(()=>{
			done();
		});
	});

	beforeEach(function(done){
		insertCommentIds()
		.then(()=>{
			done();
		});
	});

	afterEach(function(){		
		return tearDown();
	});

	after(function(){
		return closeServer();
	});

	// Thread Tests
	describe('/threads', function(){
		it('returns all threads', function(){
			let res;
			return chai.request(app)
			.get('/threads')			
			.then((_res)=>{
				res = _res;				
				res.should.have.status(200);				
				res.body.movieThreads.should.be.a('array'); 
				res.body.movieThreads.should.have.length.of.at.least(5);
				res.body.movieThreads[0].should.contain.keys('_id', 'title', 'content', 'author', 'posts');
				res.body.movieThreads[0].posts.should.be.a('array');							
				res.body.movieThreads[0].posts[0].comments.should.be.a('array');
				res.body.movieThreads[0].posts.should.have.length.of.at.least(1);
				res.body.movieThreads[0].posts[0].comments.should.have.length.of.at.least(1);
				res.body.movieThreads[0].posts[0].should.contain.keys('_id', 'content', 'user', 'comments', 'likes');
				res.body.movieThreads[0].posts[0].comments[0].should.contain.keys('_id', 'created', 'user', 'comment', 'likes');
			});			
		});
	});


	describe('GET /threads/:id', function(){
	it('should return single thread by id', function(){	
			
			return chai.request(app)
			.get('/threads')
			.then((res)=>{
				const threadId = res.body.movieThreads[0]._id;
				const title = res.body.movieThreads[0].title;
				const author = res.body.movieThreads[0].author;				
				const content = res.body.movieThreads[0].content;				

				return chai.request(app)
				.get(`/threads/${threadId}`)			
				.then((res) => {													
					res.should.have.status(200);											
					res.body.should.contain.keys('_id', 'title', 'author', 'posts', 'content');
					res.body.should.be.a('object');					
					res.body.posts.should.be.a('array');
					res.body.posts.should.have.length.of.at.least(1);
					res.body.posts[0].comments.should.have.length.of.at.least(1);
					res.body.posts[0].comments.should.be.a('array');	
					res.body.title.should.equal(title);
					res.body.author.should.equal(author);					
					res.body.content.should.equal(content);

				});	

			});
					
		});		
	});

	describe('DELETE /threads/:id', function(){
		it('should delete thread by id', function(){
			let threadId;
			return chai.request(app)
			.get('/threads')
			.then((res) => {				
				threadId = res.body.movieThreads[0]._id;
				return chai.request(app)
				.delete(`/threads/${threadId}`)
			})
			.then((res) => {
				return chai.request(app)
				.get(`/threads`)
				.then((res) => {					
					res.body.movieThreads[0]._id.should.not.equal(threadId)
				});
			});

		});
	});

	
	describe('POST /threads/new-thread', function(){
		it('should post a new thread and return that thread', function(){			
			const newThread = {
				title: "Mocha Test New Thread",
				author: "Mocha",
				content: "Mocha Late is my favorite"
			}

			return chai.request(app)
			.post('/threads/new-thread')
			.send(newThread)
			.then((res) => {
				res.should.have.status(201);
				res.should.be.a('object');
				res.body.should.contain.keys('title', 'author', 'content', '_id', 'date', 'posts');
				res.body.title.should.equal(newThread.title);
				res.body.author.should.equal(newThread.author);
				res.body.content.should.equal(newThread.content);
			});
		});
	});


	describe('PUT /threads/:id', function(){
		it('should update existing thread', function(){
			const updatedThread = {
				title: "PUTTING",
				author: "NEW AUTHOR",
				content: "HERE IS AN EDITED THREAD"
			}

			return chai.request(app)
			.get('/threads')
			.then((res) => {
				const threadId = res.body.movieThreads[0]._id;
				updatedThread.id = threadId;
				return chai.request(app)
				.put(`/threads/${threadId}`)
				.send(updatedThread)
				.then((res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.contain.keys('title', 'author', '_id', 'content');
					res.body.title.should.equal(updatedThread.title);
					res.body.author.should.equal(updatedThread.author);
					res.body.content.should.equal(updatedThread.content);					
				});
			});	
		});
	});

	

	// Posts Tests
	describe('POST /posts', function(){
		it('should create and return', function(){
			return chai.request(app)
			.get('/threads')
			.then((res) => {
				const post = {
					threadId: res.body.movieThreads[0]._id,
					user: "NEW USER",
					content: "NEW POST MADE"
				}
				
				return chai.request(app)
				.post(`/posts/${post.threadId}`)
				.send(post)
				.then((res) => {										
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.user.should.equal(post.user);
					res.body.content.should.equal(post.content);					
				});

			});						
		});
	});

	describe('PUT /posts', function(){
		it('should update existing post', function(){
			return chai.request(app)
			.get('/threads')
			.then((res) =>{
				let postId = res.body.movieThreads[0].posts[0]._id;
				const editedPost ={
					postId: postId,
					user: "Ralph Cramden",
					content: "The Honey Mooners"
				};

				return chai.request(app)
				.put(`/posts/${postId}`)
				.send(editedPost)
				.then((res) => {					
					res.body.post.user.should.equal(editedPost.user);
					res.body.post._id.should.equal(editedPost.postId);
					res.body.post.content.should.equal(editedPost.content);										
				});
			});
		});
	});



	describe('DELETE /posts', function(){
		it('should delete individual post', function(){
			return chai.request(app)
			.get('/threads')
			.then((res) => {
				// Get Post's Id				
				let threadId = res.body.movieThreads[0]._id;
				let postId = res.body.movieThreads[0].posts[0]._id;				

				let del = {
					threadId: threadId,
					postId: postId
				};
								
				return chai.request(app)
				.delete(`/posts/${postId}`)
				.send(del)
				.then((res) => {					
					return chai.request(app)
					.get('/threads')
					.then((res)=>{											
						res.body.movieThreads[0].posts.should.be.empty;
					});
				});
			});
		});
	});
	

	// Comments Tests
	describe('POST /comments', function(){
		it('should create new comment within posts array', function(){

			return chai.request(app)
			.get('/threads')
			.then((res)=>{
				
				let postId = res.body.movieThreads[0].posts[0]._id;				
				let comment = {
					postId: postId,
					user: 'Lucy Ball',
					comment: 'I Love Lucy!'
				};
				  
				return chai.request(app)
				.post(`/comments/${comment.postId}`)
				.send(comment)
				.then((res)=>{	
					res.should.have.status(201);
					res.body.should.be.a('object');	
					res.body.user.should.equal(comment.user);
					res.body.comment.should.equal(comment.comment);																	
				});
			});			
		});
	});



	describe('POST /likes/:postId', function(){
		it('should like a post', function(){
			return chai.request(app)
			.get('/threads')
			.then((res)=>{
				let postId = res.body.movieThreads[0].posts[0]._id;
				let like = {postId: postId, user: 'Conan Obrien'};

				return chai.request(app)
				.put(`/likes/${postId}`)
				.send(like)
				.then((res)=>{
					res.body.should.be.a('object');
					res.body.likes.count.should.equal(1);
					res.body.likes.users[0].should.equal('Conan Obrien');

				});
			});
		});
	});

	describe('POST /likes/:postId', function(){
		it('should unlike a post', function(){
			return chai.request(app)
			.get('/threads')
			.then((res)=>{
				let postId = res.body.movieThreads[0].posts[0]._id;
				let like = {postId: postId, user: 'Conan Obrien'};

				return chai.request(app)
				.put(`/likes/unlike/${postId}`)
				.send(like)
				.then((res)=>{
					res.body.should.be.a('object');
					res.body.likes.count.should.equal(-1);
					res.body.likes.users.should.be.empty;
				});
			});	
		});
	});

});



















