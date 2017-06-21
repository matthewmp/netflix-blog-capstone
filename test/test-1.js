'use strict'

const chai = require('chai');
const mongoose = require('mongoose');
const faker = require('faker');

const should = chai.should();

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const {Threads} = require('../models/threadModel');
const {Posts} = require('../models/postModel');
const {Comments} = require('../models/commentModel');
const {User} = require('../models/userModel')

var threadArray = [];
mongoose.Promise = global.Promise;

let threadIdArr = [];
let postIdArr = [];
let commentIdArr = [];

const threadsRouter = require('../routes/threadsRouter');
const postsRouter = require('../routes/postsRouter');
const commentsRouter = require('../routes/commentsRouter');
const likesRouter = require('../routes/likesRouter');

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

// Drop DB
function tearDown(){
	console.warn('Deleting DB');
	return mongoose.connection.dropDatabase();
}

// Load Initial Array Data
function init_data(){
	generateThreadData();
}

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
			return threadsRouter.getThreads()
			.then(function(threads){
			 	threads.should.have.length(5);
			 	threads.should.be.a('array');
			 	threads[0].should.contain.keys('_id', 'title', 'content', 'author', 'posts');
			 	threads[0].posts.should.be.a('array');
			 	threads[0].posts[0].comments.should.be.a('array');
			 	threads[0].posts.should.have.length.of.at.least(1);
			 	threads[0].posts[0].comments.should.have.length.of.at.least(1);
			 	threads[0].posts[0].should.contain.keys('_id', 'content', 'user', 'comments', 'likes');
			 	threads[0].posts[0].comments[0].$toObject(true).should.contain.keys('_id', 'created', 'user', 'comment', 'likes');
			});
    	});			
	});	

	describe('GET /threads/:id', function(){
		it('should return single thread by id', function(){	
			return threadsRouter.getThreads()
			.then(function(threads){
				const threadId = threads[0]._id;				
				const title = threads[0].title;
				const author = threads[0].author;				
				const content = threads[0].content;

				return threadsRouter.getThreadById(threadId)
				.then(function(thread){
					thread.should.contain.keys('_id', 'title', 'author', 'posts', 'content');
					thread.should.be.a('object');
					thread.posts.should.be.a('array');
					thread.posts.should.have.length.of.at.least(1);
					thread.posts[0].comments.should.have.length.of.at.least(1);
					thread.posts[0].comments.should.be.a('array')
					thread.title.should.equal(title);
					thread.author.should.equal(author);					
					thread.content.should.equal(content);

				});
			});
		});
	});

	describe('DELETE /threads/:id', function(){
		it('should delete thread by id', function(){
			return threadsRouter.getThreads()
			.then((threads)=>{
				let threadId = threads[0]._id;

				return threadsRouter.deleteThread(threadId)
				.then((response)=>{					
					return threadsRouter.getThreads()
					.then((response)=>{
						response[0]._id.should.not.equal(threadId)
					});
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

			return threadsRouter.createThread(newThread)
			.then((thread)=>{
				thread.should.be.a('object');
				thread.$toObject(true).should.contain.keys('title', 'author', 'content', '_id', 'date', 'posts');
				thread.title.should.equal(newThread.title);
				thread.author.should.equal(newThread.author);
				thread.content.should.equal(newThread.content);
			});
		});
	});

	describe('PUT /threads/:id', function(){
		it('should update existing thread', function(){
			let updatedThread = {
				title: "PUTTING",
				author: "NEW AUTHOR",
				content: "HERE IS AN EDITED THREAD"
			}

			return threadsRouter.getThreads()
			.then((thread)=>{
				const threadId = thread[0]._id;
				updatedThread.id = threadId;				
				return threadsRouter.editThread(updatedThread)
				.then((thread)=>{										
					thread.should.be.a('object');
					thread.$toObject(true).should.contain.keys('title', 'author', '_id', 'content');
					thread.title.should.equal(updatedThread.title);
					thread.author.should.equal(updatedThread.author);
					thread.content.should.equal(updatedThread.content);	
				});
			});
		});
	});

	// Posts Tests
	describe('Get /posts', function(){
		it('should return all posts', function(){
			return postsRouter.getPosts()
			.then((posts)=>{				
				posts.should.be.a('array');
				posts.should.have.length(5);
				posts[0].$toObject(true).should.contain.keys('_id', 'user', 'content', 'likes', 'created');
			});
		});
	});

	describe('POST /posts', function(){
		it('should create and return', function(){
			return threadsRouter.getThreads()
			.then((threads)=>{
				const post = {};
				post.body ={
					threadId: threads[0]._id,
					user: "NEW USER",
					content: "NEW POST MADE"
				}

				return postsRouter.addPost(post, post.body.threadId)
				.then((response)=>{
					return threadsRouter.getThreadById(response._id)
					.then((res)=>{
						res.posts.should.be.a('array');
						res.posts.should.have.length(2);
						res.posts[1].user.should.equal('NEW USER');//
						res.posts[1].content.should.equal('NEW POST MADE');
					})
				});
			});
		});
	});

	describe('PUT /posts', function(){
		it('should update existing post', function(){
			return threadsRouter.getThreads()
			.then((threads)=>{
				let postId = threads[0].posts[0]._id;
				let editedPost ={					
					user: "Ralph Cramden",
					content: "The Honey Mooners",
					body: {postId: postId}					
				};
				editedPost.body.postId = postId;
				return postsRouter.editPost(editedPost, editedPost)
				.then((response)=>{
					response.user.should.equal(editedPost.user);					
					response.content.should.equal(editedPost.content);										

				});
			});
		});
	});

	describe('DELETE /posts', function(){
		it('should delete individual post', function(){
			return threadsRouter.getThreads()
			.then((post)=>{
				
				let del = {
					params: {postId: post[0]._id}					
				}

				return postsRouter.deletePost(del)
				.then((response)=>{					
					response.should.equal('Deleted Post')
				});
			});	
		});
	});

	// Comments Tests
	describe('GET /comments', function(){
		it('should return all comments', function(){
			return commentsRouter.getComments()
			.then((comments)=>{
				comments.should.be.a('array');
				comments.should.have.length(5);
				comments[0].$toObject(true).should.contain.keys('_id', 'user', 'comment', 'likes', 'created')
			});
		});
	});

	describe('POST /comments', function(){
		it('should create new comment', function(){
			return threadsRouter.getThreads()
			.then((threads)=>{

				let comment = {
					body: {
						postId: threads[0].posts[0]._id,
						user: 'Lucy Ball',
						comment: 'I Love Lucy!'	
					}
				};

				return commentsRouter.postComment(comment)
				.then((response)=>{
					response.should.be.a('object');
					response.$toObject(true).should.contain.keys('user', 'comment', '_id', 'likes', 'created');
					response.user.should.equal(comment.body.user);
					response.comment.should.equal(comment.body.comment);					
				});				
			});
		});
	});

	describe('POST /likes/:postId', function(){
		it('should like a post', function(){
			return threadsRouter.getThreads()
			.then((threads)=>{
				let like = {
					body: {
						postId: threads[0].posts[0]._id,
						user: 'Conan Obrien'
					}
				};

				return likesRouter.likeUnlike(like)
				.then((response)=>{					
					response.likes.count.should.equal(1);
					response.likes.users.should.be.a('array');
					response.likes.users[0].should.equal('Conan Obrien');
				})
				.then(()=>{
					return likesRouter.likeUnlike(like)
					.then((response)=>{						
						response.likes.count.should.equal(0);
						response.likes.users.should.be.a('array');
						response.likes.users.should.have.length(0);
					})
				})
			});
		});
	});
});
