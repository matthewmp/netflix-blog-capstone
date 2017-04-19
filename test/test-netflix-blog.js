
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const {Threads} = require('../models.js');

chai.use(chaiHttp);

function seedForumData(){
	console.log('Seeding DB');
	const seedData = [];

	for(let i = 0; i < 10; i++){
		seedData.push(generateForumData());
	}	
	return Threads.insertMany(seedData);
}

function generateForumData(){
	let thread = {
		title: `${faker.lorem.sentence()}`,
		date: `${faker.date.recent()}`,
		author: `${faker.name.findName()}`,
		posts: [
			{
				content: `${faker.lorem.paragraph()}`,
				user: `${faker.internet.userName()}`,
				created: `${faker.date.recent()}`,
				likes: `${faker.random.number()}`,
				comments: [
					{
						comment: `${faker.lorem.sentence()}`,
						user: `${faker.internet.userName()}`,
						likes: `${faker.random.number()}`
					}
				]
			}
		]
	}
	return thread;
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
		return seedForumData();
	});

	afterEach(function(){
		return tearDown();
	});

	after(function(){
		return closeServer();
	});

	describe('connect to index.html', function(){
		it('should receive status 200', function(){		
			return chai.request(app)		
			.get('/')
			.then((res) => {
				res.should.have.status(200);								
			})
		});
	});

	describe('/threads', function(){
		it('should return list of threads', function(){		
			return chai.request(app)		
			.get('/threads')
			.then((res) => {
				console.log(res.body);
				res.should.have.status(200);
				res.should.be.json;
				res.should.be.a('object');
				res.body.should.be.a('object')
				res.body.should.have.all.keys('movieThreads');
				res.body.movieThreads.should.be.a('array');
				res.body.movieThreads.should.have.length.of.at.least(10);
				res.body.movieThreads[0].should.contain.all.keys('_id', 'title', 'author', 'posts', 'date')
			
			})

		});
	}); 

	describe('/threads/:id', function(){		
		it('should return a single thread from id', function(){					
			return chai.request(app)
			.get('/threads')
			.then((res => {
				const ID = res.body.movieThreads[0]._id;
				console.log(res.body.movieThreads[0]._id)	

				return chai.request(app)
				.get(`/threads/${ID}`)
				.then((res => {
					res.should.have.status(200);
					console.log(res.body)
					res.body.should.contain.all.keys('_id', 'title', 'author', 'posts', 'date')
				}))			
			}))			

		})
	})
})

















