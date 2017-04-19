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
seedForumData();
runServer(TEST_DATABASE_URL);
