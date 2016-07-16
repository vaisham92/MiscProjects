/**
 * twitter-core.js
 * 
 * @author Vaishampayan Reddy
 */

var baseUrl = "http://localhost:8080/TwitterJava/services";
var soap = require('soap');

exports.isLoggedIn = function(request, response) {
	if (request.session) {
		if (request.session.isLoggedIn) {
			response.send({
				"status" : 200,
				"message" : "logged in"
			});
		} else {
			response.send({
				"status" : 401,
				"message" : "logged out"
			});
		}
	} else {
		response.send({
			"status" : 401,
			"message" : "logged out"
		});
	}
};

exports.logIn = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
		username : request.body.username,
		password : request.body.password
	};
	soap.createClient(url, option, function(err, client) {
		client.login(args, function(err, result) {
			console.log("data: " + result);
			response.send(result.loginReturn);
		});
	});
};

exports.logOut = function(request, response) {
	request.session.reset();
	response.send({
		"status" : 200,
		"message" : "logged out"
	});
};

exports.signUp = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	/**
	 * String email, String password, String handle, String first_name, String
	 * last_name, String phone, String location, String city, String birthday
	 */
	var args = {
		email : request.body.email,
		password : request.body.password,
		handle : request.body.handle,
		first_name : request.body.first_name,
		last_name : request.body.last_name,
		phone : request.body.phone,
		location : request.body.location,
		city : request.body.city,
		birthday : request.body.birthday
	};
	soap.createClient(url, option, function(err, client) {
		client.signIn(args, function(err, result) {
			console.log(result);
			response.send(result.signInReturn);
		});
	});
};

exports.getMyProfile = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
		puid : request.session.profile.puid
	};
	soap.createClient(url, option, function(err, client) {
		client.getMyProfile(args, function(err, result) {
			console.log(result);
			response.send(result.getMyProfileReturn);
		});
	});
};

exports.postNewTweet = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
		puid : request.session.profile.puid,
		tweet : request.body.tweet, 
		handle: request.body.handle, 
		first_name: request.session.profile.first_name, 
		last_name: request.session.profile.last_name
	};
	soap.createClient(url, option, function(err, client) {
		client.createTweet(args, function(err, result) {
			console.log(result);
			response.send(result.createTweetReturn);
		});
	});
};

exports.getTweets = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
		puid : request.session.profile.puid
	};
	soap.createClient(url, option, function(err, client) {
		client.getTweets(args, function(err, result) {
			console.log(result);
			response.send(result.getTweetsReturn);
		});
	});
};

exports.getProfilesToFollow = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
		puid : request.session.profile.puid
	};
	soap.createClient(url, option, function(err, client) {
		client.getProfilesToFollow(args, function(err, result) {
			console.log(result);
			response.send(result.getProfilesToFollowReturn);
		});
	});
};

exports.getProfileToFollow = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
		puid : request.session.profile.puid
	};
	soap.createClient(url, option, function(err, client) {
		client.getProfileToFollow(args, function(err, result) {
			console.log(result);
			response.send(result.getProfileToFollowReturn);
		});
	});
};

exports.follow = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
		puid : request.session.profile.puid,
		followerid : request.session.profile.followerid
	};
	soap.createClient(url, option, function(err, client) {
		client.follow(args, function(err, result) {
			console.log(result);
			response.send(result.followReturn);
		});
	});
};

exports.getHashTags = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
	};
	soap.createClient(url, option, function(err, client) {
		client.getHashTags(args, function(err, result) {
			console.log(result);
			response.send(result.getHashTagsReturn);
		});
	});
};

exports.getTweetsForPuid = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
		puid : request.session.profile.puid
	};	
	soap.createClient(url, option, function(err, client) {
		client.getTweetsByPuid(args, function(err, result) {
			console.log(result);
			response.send(result.getTweetsByPuidReturn);
		});
	});
};

exports.getProfileForPuid = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
		puid : request.params.puid
	};
	soap.createClient(url, option, function(err, client) {
		client.getProfileByPuid(args, function(err, result) {
			console.log(result);
			response.send(result.getProfileByPuidReturn);
		});
	});
};

exports.getHashTagTweets = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
		hashid : request.params.hashid
	};
	soap.createClient(url, option, function(err, client) {
		client.getHashTagTweetsByHashid(args, function(err, result) {
			console.log(result);
			response.send(result.getHashTagTweetsByHashidReturn);
		});
	});
};

exports.getHashTagMsg = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
		hashid : request.params.hashid
	};
	soap.createClient(url, option, function(err, client) {
		client.getHashTagMessageByHashid(args, function(err, result) {
			console.log(result);
			response.send(result.getHashTagMessageByHashidReturn);
		});
	});
};

exports.getHashTagId = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
		hashtag : request.params.hashtag
	};
	soap.createClient(url, option, function(err, client) {
		client.getHashidForHashTag(args, function(err, result) {
			console.log(result);
			response.send(result.getHashidForHashTagReturn);
		});
	});
};

exports.getProfileByName = function(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseUrl + "/TwitterCore?wsdl";
	var args = {
		name : request.params.name
	};
	soap.createClient(url, option, function(err, client) {
		client.getProfileByName(args, function(err, result) {
			console.log(result);
			response.send(result.getProfileByNameReturn);
		});
	});
};