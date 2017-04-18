
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const {app, runServer, closeServer} = require('../server');


chai.use(chaiHttp);

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
	before(function(){
		return runServer();
	});

	after(function(){
		return closeServer();
	})

	it('should return list of threads', function(){
		return chai.request(app)
		.get('/threads')
		.then((res) => {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.all.keys('movieThreads');
			res.body.movieThreads[0].should.have.all.keys('_id', 'title', 'author', 'posts', 'date')
		})

	})
})
