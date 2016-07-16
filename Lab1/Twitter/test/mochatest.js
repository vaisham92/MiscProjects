var request = require('request')
, express = require('express')
,assert = require("assert")
,http = require("http");

describe('twitter application tests', function(){

	it('Twitter should return 200 status on index page', function(done){
		http.get('http://twitter-mock.com', function(response) {
			assert.equal(200, response.statusCode);
			done();
		})
	});

	it('Twitter should return 200 status on login page', function(done){
		http.get('http://twitter-mock.com/login', function(response) {
			assert.equal(200, response.statusCode);
			done();
		})
	});
	
	it('Twitter should return 200 status on signup page', function(done){
		http.get('http://twitter-mock.com/signup', function(response) {
			assert.equal(200, response.statusCode);
			done();
		})
	});
	
	it('Twitter should do login for valid credentials', function(done){
		
		var options = {
				  uri: 'http://twitter-mock.com/login',
				  method: 'POST',
				  json: {"email":  "vaisham@qwerty.com", "password" :"sairam"},
				  headers: {
					  'Content-type': 'application/json'
				  }
				};
		
		request.post(options, 
				function(error, response, body){
			    	assert.equal(200, response.body.status);
			    	done();
		});
	});

	it('Twitter should fail login for invalid credentials', function(done){
		var options = {
				  uri: 'http://twitter-mock.com/login',
				  method: 'POST',
				  json: {"email": "vaisham@qwerty.com", "password" :"kfjdshfkjdshgkj"},
				  headers: {
					  'Content-type': 'application/json'
				  }
				};
		
		request.post(options, 
				function(error, response, body){
			    	assert.equal(401, response.body.status);
			    	done();
		});
	});
});