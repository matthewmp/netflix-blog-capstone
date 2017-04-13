
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const {app} = require('../server');


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
