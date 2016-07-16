var request = require('request')
, express = require('express')
,assert = require("assert")
,http = require("http");

describe('twitter application tests', function() {

	it('Twitter should return 200 status on home page', function(done) {
		http.get('http://twitter-mock.com/home', function(response) {
			assert.equal(200, response.statusCode);
			done();
		})
	});

	it('Twitter should return 200 status on my profile page', function(done) {
		http.get('http://twitter-mock.com/profile/me', function(response) {
			assert.equal(200, response.statusCode);
			done();
		})
	});

	it('Twitter should return 200 status on hashtag page', function(done) {
		http.get('http://twitter-mock.com/hashtags', function(response) {
			assert.equal(200, response.statusCode);
			done();
		})
	});

	it('Twitter should do signup for valid credentials', function(done) {
		var options = {
			uri: 'http://twitter-mock.com/signup',
			method: 'POST',
			json: {
				"email": "vaisham99999999@gmail.com",
				"password": "sairam",
				"birthday": "17th April, 2016",
				"handle": "vaisham999999",
				"location": "San Jose",
				"phone": "669-292-7519",
				"first_name": "vaish",
				"last_name": "reddy"
			},
			headers: {
				'Content-type': 'application/json'
			}
		};
		request.post(options,
			function(error, response, body) {
				assert.equal(201, response.body.status);
				done();
			});
	});

	it('Twitter should fail signup for invalid credentials', function(done) {
		var options = {
			uri: 'http://twitter-mock.com/signup',
			method: 'POST',
			json: {
				"email": "vaisham99999999@gmail.com",
				"password": "sairam",
				"birthday": "17th April, 2016",
				"handle": "vaisham999999",
				"location": "San Jose",
				"phone": "669-292-7519",
				"first_name": "vaish",
				"last_name": "reddy"
			},
			headers: {
				'Content-type': 'application/json'
			}
		};
		request.post(options,
			function(error, response, body) {
				assert.equal(400, response.body.status);
				done();
			});
	});
});