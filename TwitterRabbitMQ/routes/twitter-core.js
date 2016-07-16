/**
 * New node file
 */
var mq_client = require('../rpc/client');

exports.logIn = function(request, response) {
	var message = {};
	message.email = request.body.email;
	message.passsword = request.body.password;
	mq_client.make_request('login_queue', message, function(err, results) {
		console.log(results);
		if (err) {
			throw err;
		} else {
			request.session.profile.puid = results.id;
			response.send(results);
		}
	});
};

exports.logOut = function(request, response) {
};

exports.signUp = function(request, response) {
	var message = {};
	message.email = request.body.email;
	message.passsword = request.body.password;
	message.handle = request.body.handle;
	message.first_name = request.body.first_name;
	message.last_name = request.body.last_name;
	message.phone = request.body.phone;
	message.city = request.body.city;
	message.birthday = request.body.birthday;
	mq_client.make_request('signup_queue', message, function(err, results) {
		console.log(results);
		if (err) {
			throw err;
		} else {
			response.send(results);
		}
	});
};

exports.getMyProfile = function(request, response) {
	if (request.session) {
		if (request.session.profile) {
			var message = {};
			message.puid = request.session.profile.puid;
			mq_client
					.make_request(
							'myprofile_queue',
							message,
							function(err, results) {
								console.log(results);
								if (err) {
									throw err;
								} else {
									request.session.profile.first_name = results.profile.first_name;
									request.session.profile.last_name = results.profile.last_name;
									request.session.profile.handle = results.profile.handle;
									request.session.profile.phone = results.profile.phone;
									request.session.profile.city = results.profile.city;
									request.session.profile.birthday = results.profile.birthday;
									request.session.profile.followerscount = results.profile.followersCount;
									request.session.profile.followingcount = results.profile.followingCount;
									request.session.profile.tweetscount = results.profile.tweetCount;
									response.send(results);
								}
							});
		} else {
			response.send({
				"status" : 403,
				"message" : "Error: Cannot find user profile"
			});
		}
	} else {
		response.send({
			"status" : 403,
			"message" : "Error: Cannot find session"
		});
	}
};

exports.postNewTweet = function(request, response) {
	if (request.session) {
		if (request.session.profile) {
			var message = {};
			message.puid = request.session.profile.puid;
			message.tweet = request.body.tweet;
			message.handle = request.session.profile.handle;
			message.first_name = request.session.profile.first_name;
			message.last_name = request.session.profile.last_name;
			mq_client.make_request('post_tweet_queue', message, function(err,
					results) {
				console.log(results);
				if (err) {
					throw err;
				} else {
					response.send(results);
				}
			});
		} else {
			response.send({
				"status" : 403,
				"message" : "Error: Cannot find user profile"
			});
		}
	} else {
		response.send({
			"status" : 403,
			"message" : "Error: Cannot find session"
		});
	}
};

exports.getTweets = function(request, response) {
	if (request.session) {
		if (request.session.profile) {
			var message = {};
			message.puid = request.session.profile.puid;
			mq_client.make_request('get_my_tweet_queue', message, function(err,
					results) {
				console.log(results);
				if (err) {
					throw err;
				} else {
					response.send(results);
				}
			});
		} else {
			response.send({
				"status" : 403,
				"message" : "Error: Cannot find user profile"
			});
		}
	} else {
		response.send({
			"status" : 403,
			"message" : "Error: Cannot find session"
		});
	}
};

exports.getProfilesToFollow = function(request, response) {
	if (request.session) {
		if (request.session.profile) {
			var message = {};
			message.puid = request.session.profile.puid;
			mq_client.make_request('get_profiles_queue', message, function(err,
					results) {
				console.log(results);
				if (err) {
					throw err;
				} else {
					response.send(results);
				}
			});
		} else {
			response.send({
				"status" : 403,
				"message" : "Error: Cannot find user profile"
			});
		}
	} else {
		response.send({
			"status" : 403,
			"message" : "Error: Cannot find session"
		});
	}
};

exports.getProfileToFollow = function(request, response) {
	if (request.session) {
		if (request.session.profile) {
			var message = {};
			message.puid = request.session.profile.puid;
			mq_client.make_request('get_profile_queue', message, function(err,
					results) {
				console.log(results);
				if (err) {
					throw err;
				} else {
					response.send(results);
				}
			});
		} else {
			response.send({
				"status" : 403,
				"message" : "Error: Cannot find user profile"
			});
		}
	} else {
		response.send({
			"status" : 403,
			"message" : "Error: Cannot find session"
		});
	}
};

exports.follow = function(request, response) {
	if (request.session) {
		if (request.session.profile) {
			var message = {};
			message.puid = request.session.profile.puid;
			message.followerid = request.body.followerid;
			mq_client.make_request('follow_queue', message, function(err,
					results) {
				console.log(results);
				if (err) {
					throw err;
				} else {
					response.send(results);
				}
			});
		} else {
			response.send({
				"status" : 403,
				"message" : "Error: Cannot find user profile"
			});
		}
	} else {
		response.send({
			"status" : 403,
			"message" : "Error: Cannot find session"
		});
	}
};

exports.getHashTags = function(request, response) {
	if (request.session) {
		if (request.session.profile) {
			var message = {};
			message.puid = request.session.profile.puid;
			mq_client.make_request('get_hashtags_queue', message, function(err,
					results) {
				console.log(results);
				if (err) {
					throw err;
				} else {
					response.send(results);
				}
			});
		} else {
			response.send({
				"status" : 403,
				"message" : "Error: Cannot find user profile"
			});
		}
	} else {
		response.send({
			"status" : 403,
			"message" : "Error: Cannot find session"
		});
	}
};

exports.getTweetsForPuid = function(request, response) {
	if (request.session) {
		if (request.session.profile) {
			var message = {};
			message.puid = request.params.puid;
			mq_client.make_request('get_tweet_puid_queue', message, function(
					err, results) {
				console.log(results);
				if (err) {
					throw err;
				} else {
					response.send(results);
				}
			});
		} else {
			response.send({
				"status" : 403,
				"message" : "Error: Cannot find user profile"
			});
		}
	} else {
		response.send({
			"status" : 403,
			"message" : "Error: Cannot find session"
		});
	}
};

exports.getProfileForPuid = function(request, response) {
	if (request.session) {
		if (request.session.profile) {
			var message = {};
			message.puid = request.params.puid;
			mq_client.make_request('get_profile_puid_queue', message, function(
					err, results) {
				console.log(results);
				if (err) {
					throw err;
				} else {
					response.send(results);
				}
			});
		} else {
			response.send({
				"status" : 403,
				"message" : "Error: Cannot find user profile"
			});
		}
	} else {
		response.send({
			"status" : 403,
			"message" : "Error: Cannot find session"
		});
	}
};

exports.getHashTagTweets = function(request, response) {
	if (request.session) {
		if (request.session.profile) {
			var message = {};
			message.hashid = request.params.hashid;
			mq_client.make_request('get_hashtag_tweets_queue', message,
					function(err, results) {
						console.log(results);
						if (err) {
							throw err;
						} else {
							response.send(results);
						}
					});
		} else {
			response.send({
				"status" : 403,
				"message" : "Error: Cannot find user profile"
			});
		}
	} else {
		response.send({
			"status" : 403,
			"message" : "Error: Cannot find session"
		});
	}
};

exports.getHashTagMsg = function(request, response) {
	if (request.session) {
		if (request.session.profile) {
			var message = {};
			message.hashid = request.params.hashid;
			mq_client.make_request('get_hashtagmsg_queue', message, function(
					err, results) {
				console.log(results);
				if (err) {
					throw err;
				} else {
					response.send(results);
				}
			});
		} else {
			response.send({
				"status" : 403,
				"message" : "Error: Cannot find user profile"
			});
		}
	} else {
		response.send({
			"status" : 403,
			"message" : "Error: Cannot find session"
		});
	}
};

exports.getHashTagId = function(request, response) {
	if (request.session) {
		if (request.session.profile) {
			var message = {};
			message.hashid = request.params.hashid;
			mq_client.make_request('get_hashtagid_queue', message, function(
					err, results) {
				console.log(results);
				if (err) {
					throw err;
				} else {
					response.send(results);
				}
			});
		} else {
			response.send({
				"status" : 403,
				"message" : "Error: Cannot find user profile"
			});
		}
	} else {
		response.send({
			"status" : 403,
			"message" : "Error: Cannot find session"
		});
	}
};

exports.getProfileByName = function(request, response) {
	if (request.session) {
		if (request.session.profile) {
			var message = {};
			message.name = request.params.name;
			mq_client.make_request('get_profile_name_queue', message, function(
					err, results) {
				console.log(results);
				if (err) {
					throw err;
				} else {
					response.send(results);
				}
			});
		} else {
			response.send({
				"status" : 403,
				"message" : "Error: Cannot find user profile"
			});
		}
	} else {
		response.send({
			"status" : 403,
			"message" : "Error: Cannot find session"
		});
	}
};