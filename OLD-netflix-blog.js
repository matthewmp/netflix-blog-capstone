
'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const {Threads} = require('../models/threadModel');
const {Posts} = require('../models/postsModel');
const {Comments} = require('../models/commentsModel');

mongoose.Promise = global.Promise;

chai.use(chaiHttp);

const thread_Data = [];
const post_Data = [];
const comment_Data = [];



function seedForumData(){
	console.log('Creating Threads Array');
	
	for(let i = 0; i < 5; i++){
		thread_Data.push(generateThreadData());
	}	
		
	console.log('Creating Post Array')
	
	for(let i = 0; i < 5; i++){
		post_Data.push(generatePostData());
	}
	for(let i = 0; i < 5; i++){
		post_Data[i].threadId = thread_Data[i]._id
	}

	console.log('Creating Comments Array');
	for(let i = 0; i < 5; i++){
		comment_Data.push(generateCommentData());
	}
	for(let i = 0; i < 5; i++){
		comment_Data[i].postId = post_Data[i]._id
	}	
}

function seedThreads(){
	return Threads.insertMany(thread_Data)					
}

function reformatThreads(){
	Threads.find()
	.exec()
	.then(function(threads){
			thread_Data.length = 0;
			threads.map(function(thread){						
			thread_Data.push(thread.getThread());					
			thread_Data.forEach(val => val._id += "");											
		})
	})
	.then(() => {
		//Threads.remove({})
		//thread_Data[0].testing = '123';
		//console.log(`Threads: ${JSON.stringify(thread_Data, null, 4)}`)					
	})	
}

function seedPosts(){
	return Posts.insertMany(post_Data);
}

function reformatPosts(){
	post_Data.length = 0;
	Posts.find()
	.exec()
	.then(function(posts){						
		posts.map(function(post){						
		post_Data.push(post.getPost());					
		post_Data.forEach(val => val._id += "");											
		})		
	})
	.then(()=>{				
		for(let i = 0; i < 5; i++){			
			post_Data[i].threadId = thread_Data[i]._id
		}	
		//console.log(`Posts: ${JSON.stringify(post_Data, null, 4)}`)						
	})	
}

function seedComments(){	
	return Comments.insertMany(comment_Data);
}

function reformatComments(){	
	comment_Data.length = 0;	
	Comments.find()
	.exec()
	.then(function(comments){													
		console.log(comment_Data)
		comments.map(function(comm){			
		comment_Data.push(comm.getComment());					
		comment_Data.forEach(val => val._id += "");											
		})		
	})
	.then(()=>{				
		for(let i = 0; i < 5; i++){			
			comment_Data[i].postId = post_Data[i]._id
		}	
		console.log(`COMM: ${JSON.stringify(comments, null, 4)}`)	
	})	
}

function generateThreadData(){
	let thread = {
		title: `${faker.lorem.sentence()}`,
		date: `${faker.date.recent()}`,
		author: `${faker.name.findName()}`,
		content: `${faker.lorem.paragraph()}`		
	}
	return thread;
}

function generatePostData(){
	let post = {
		threadId: '',
		created: `${faker.date.recent()}`,
		user: `${faker.name.findName()}`,
		content: `${faker.lorem.paragraph()}`,
		likes: `${faker.random.number()}`		
	}
	return post;
}

function generateCommentData(){
	let comment = {		
		postId: '',
		created: `${faker.date.recent()}`,
		user: `${faker.name.findName()}`,
		content: `${faker.lorem.paragraph()}`,
		likes: `${faker.random.number()}`		
	}	
	return comment;
}


function tearDown(){
	console.warn('Deleting DB');
	return mongoose.connection.dropDatabase();
}


describe('Forum API Resource', function(){
	before(function(){
		return runServer(TEST_DATABASE_URL);
	})

	beforeEach(function(){
		console.log("seedForum");
		return seedForumData();
	});

	beforeEach(function(){
		console.log("Seed Thread");
		return seedThreads();
	})

	beforeEach(function(){
		console.log("Format Thread");
		return reformatThreads();
	})

	beforeEach(function(){
		console.log("Seed Post");
		return seedPosts();
	})

	beforeEach(function(){
		console.log("format post");
		return reformatPosts();
	})
	
	beforeEach(function(){	
		console.log("Seed C");
		//console.log(JSON.stringify(comment_Data));	
		return seedComments();
	});

	beforeEach(function(){
		console.log(" Format C");
		//console.log(JSON.stringify(comment_Data, null, 4));
		return reformatComments();
	});

	beforeEach(function(){			
		return tearDown();
	});

	beforeEach(function(){
		console.log("Seed Thread");
		return seedThreads();
	})

	beforeEach(function(){
		console.log("Seed Post");
		return seedPosts();
	})

	beforeEach(function(){	
		console.log("Seed C");	
		return seedComments();
	});

	afterEach(function(){		
		return tearDown();
	});

	after(function(){
		return closeServer();
	});
	
	

		
		it('should receive status 200', function(){		
			return chai.request(app)		
			.get('/threads')
			.then((res) => {				
				res.should.have.status(200);	
				//console.log(`\n\n\n\n\n\n BODY: ${JSON.stringify(res.body, null, 4)}`)
				res.body.should.have.keys('movieThreads');
				res.body.movieThreads[0].should.contain.keys('posts')
				res.body.movieThreads[0].posts[0].should.contain.keys('comments')
			});						
		});
	

	/*it('should receive status 200', function(){		
				return chai.request(app)		
				.get('/')
				.then((res) => {				
					res.should.have.status(200);	
					//console.log(`\n\n Threads: ${JSON.stringify(thread_Data)} \n\n\n Posts: ${JSON.stringify(post_Data)} \n\n\n Comment: ${JSON.stringify(comment_Data, null, 4)}`)							
				});			
			});
		
	*/
		

	

	/*describe('checkpoint 2', function(){
		it('checking', function(){
			return chai.request(app)
			.get('/threads')
			.then((res)=>{
				console.log('done')
			})
		})
	})*/
		
/*
	describe('/threads', function(){		
		it('should return list of threads', function(){							
			return chai.request(app)					
			.get('/threads')
			.then((res) => {	
				//console.log('test')				
				//res.should.have.status(200);
				//res.should.be.json;
				//res.should.be.a('object');
				//res.body.should.be.a('object')
				//res.body.should.have.all.keys('movieThreads');
				//res.body.movieThreads.should.be.a('array');
				//res.body.movieThreads.should.have.length.of.at.least(5);
				//res.body.movieThreads[0].should.contain.all.keys('_id', 'title', 'author', 'posts', 'date')
			
			})
		});
	}); */
/*
	describe('/threads/:id', function(){		
		it('should return a single thread from id', function(){					
			return chai.request(app)
			.get('/threads')
			.then((res => {
				const ID = res.body.movieThreads[0]._id;					

				return chai.request(app)
				.get(`/threads/${ID}`)
				.then((res => {
					res.should.have.status(200);					
					res.body.should.contain.all.keys('_id', 'title', 'author', 'posts', 'date')
				}))			
			}))			

		})
	})

	describe('/threads/new-thread', function(){
		it('should create a new thread and return it', function(){
			const newThread = generateForumData();			
			return chai.request(app)
			.post('/threads/new-thread')
			.send(newThread)
			.then(res => {				
				res.should.have.status(201);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.contain.keys('_id', 'title', 'author', 'posts', 'date');
				res.body.posts.should.be.a('array');
				res.body.posts.should.have.length.least(1);
				res.body.posts[0].comments.should.be.a('array');
			})
		})
	})
	
	describe('/threads/:id', function(){
		it('should create a new post and return it', function(){
			
			const newPost = {
					"user": "matt",
					"content": "NEW STUFF"
				}		

			return Threads
			.findOne()
			.exec()
			.then((res => {

				newPost.id = res.id;
				
				
				
				return chai.request(app)
				.put(`/threads/${res.id}`)
				.send(newPost)
			}))			
			.then(res => {								
				res.should.have.status(204);
				
				return Threads.findById(newPost.id).exec();
			})
			.then(function(thread) {

				console.log(thread)

				console.log(thread.posts)

			    thread.posts[0].user.should.equal(newPost.user);
			    thread.posts[0].content.should.equal(newPost.content);
			});
		})
	})
	*/
})













