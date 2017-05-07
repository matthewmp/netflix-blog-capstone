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
	})

	beforeEach(function(){
		console.log(`\n\n Initializing Data`);
		return init_data();
	})

	//==================
	afterEach(function(){		
		return tearDown();
	});

	after(function(){
		return closeServer();
	});

	describe('Testing', function(){
	it('should receive status 200', function(){	
			return chai.request(app)
			.get('/threads')			
			.then((res) => {				
				res.should.have.status(200);							
				res.body.should.have.keys('movieThreads');	
				res.body.movieThreads[0].should.contain.keys('_id', 'title', 'author', 'posts', 'date');
				res.body.movieThreads.should.be.a('array');
				res.body.movieThreads[0].posts.should.be.a('array');
				res.body.movieThreads[0].posts[0].comments.should.be.a('array');
				res.body.movieThreads.should.have.length.of.at.least(5);
			});						
		});		
	})
	

})




















