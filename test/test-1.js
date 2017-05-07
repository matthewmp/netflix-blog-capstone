'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const {Threads} = require('../models/threadModel');


mongoose.Promise = global.Promise;

chai.use(chaiHttp);

function generateThreadData(){
	var threads = [];
	for(var i = 0; i < 5; i++){
		let thread = {
			title: `Thread # ${i}`,
			date: faker.date.recent(),
			author: faker.name.findName(),
			content: faker.lorem.paragraph(),
			posts: generatePostData()		
		}
		threads.push(thread);
	}
	Threads.insertMany(threads);
}

function generatePostData(){
	var posts = [];
	for(var i = 0; i < 5; i++){
		let post = {			
			created: faker.date.recent(),
			user: faker.name.findName(),
			content: `Post # ${i}`,
			likes: faker.random.number(),
			comments: generateCommentData()	
		}
		posts.push(post);
	}
	return posts;
}

function generateCommentData(){
	var comments = [];
	for(var i = 0; i < 5; i++){
		let comment = {					
			created: faker.date.recent(),
			user: faker.name.findName(),
			content: `Comment # ${i}`,
			likes: faker.random.number()		
		}	
	comments.push(comment);	
	}
	return comments;
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

	beforeEach(function(){
		console.log(`\n\n Initializing Data`);
		return init_data();
	});

	//==================
	afterEach(function(){		
		return tearDown();
	});

	after(function(){
		return closeServer();
	});
/*
	describe('GET /threads', function(){
	it('should return all threads', function(){	
			return chai.request(app)
			.get('/threads')			
			.then((res) => {								
				res.should.have.status(200);							
				res.body.should.have.keys('movieThreads');	
				res.body.movieThreads[0].should.contain.keys('_id', 'title', 'author', 'posts', 'date');
				res.body.movieThreads.should.be.a('array');
				res.body.movieThreads[0].posts.should.be.a('array');
				res.body.movieThreads[0].posts[0].comments.should.be.a('array');
				//res.body.movieThreads.should.have.length.of.at.least(5);
			});						
		});		
	});

	describe('GET /threads/:id', function(){
		it('should return single thread', function(){
			return chai.request(app)
			.get('/threads')
			.then((res) => {
				const threadId = res.body.movieThreads[0]._id;
				const title = res.body.movieThreads[0].title;
				const author = res.body.movieThreads[0].author;
				return chai.request(app)
				.get(`/threads/${threadId}`)
				.then((res) => {
					res.body.should.be.a('object');
					res.body.should.contain.keys('_id', 'title', 'posts', 'date');
					res.body._id.should.equal(threadId);
					res.body.title.should.equal(title);
					res.body.author.should.equal(author);
					res.body.posts.should.be.a('array');
				});
			});
		});
	});

	describe('POST /threads', function(){
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
				});
			});	
		});
	});
	*/
	describe('PUT /posts/new-post', function(){
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
				.put(`/posts/new-post/${post.threadId}`)
				.send(post)
				.then((res) => {
					res.body._id.should.equal(post.threadId);
					res.body.posts.should.be.a('array');
					res.body.posts[res.body.posts.length - 1].user.should.equal(post.user);
					res.body.posts[res.body.posts.length - 1].content.should.equal(post.content);
				});

			});						
		});
	});

});



















