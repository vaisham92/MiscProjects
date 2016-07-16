/**
 * twitter-core.js
 * 
 * @author Vaishampayan Reddy
 */

var dbHelper = require('./db-helper');
var mysql = require('./mysql');
var sqlQueryList = require('./sqlQueries');
var helperFunctions = require('./helper-functions');
var encryption = require('./encryption-helper');

exports.isLoggedIn = function(request, response) {
	if(request.session) {
		if(request.session.isLoggedIn){
			response.send({"status":200, "message":"logged in"});
		}
		else {
			response.send({"status":401, "message":"logged out"});
		}
	}
	else {
		response.send({"status":401, "message":"logged out"});
	}
};

exports.logIn = function(request, response) {
	mysql.getConnection(function(connection) {
		var sqlQuery = sqlQueryList.getPasswordForEmailQuery(request.body.email);
		dbHelper.executeQuery(connection,sqlQuery,function(userdata){
			console.log(encryption.encrypt(userdata[0].password));
			if(JSON.stringify(userdata) === JSON.stringify([])) {
				console.log("empty response");
				dbHelper.closeConnection(connection);
				response.send({"status":401,"message":"login failure"});
			}
			else if(userdata[0].password === encryption.encrypt(request.body.password)) {
				request.session.profile = {};
				request.session.profile.puid = userdata[0].puid;
				request.session.profile.email = userdata[0].email;
				console.log("login is success");
				request.session.isLoggedIn = true;
				sqlQuery = sqlQueryList.getQueryForUserProfileByPuid(userdata[0].puid);
				dbHelper.executeQuery(connection,sqlQuery,function(profile){
					if(profile[0]) {
						console.log(profile[0]);
						request.session.profile.handle = profile[0].handle;
						request.session.profile.first_name = profile[0].first_name;
						request.session.profile.last_name = profile[0].last_name;
						request.session.profile.phone = profile[0].phone;
						request.session.profile.city = profile[0].city;
						request.session.profile.birthday = profile[0].birthday;
						dbHelper.closeConnection(connection);
						response.send({"status" : 200, "message" : "login success", "profile" : request.session.profile});
					}
					else {
						response.send({"status": 401, "message" : "profile data not found"});
					}
				});
			}
			else {
				dbHelper.closeConnection(connection);
				console.log("Login is failure");
				response.send({"status":401, "message":"login failure"});
			}
		},function(error){
			dbHelper.closeConnection(connection);
			response.send(error);
		});
	}, function(error){
		response.send(error);
	});
};

exports.logOut = function(request, response) {
	request.session.reset();
	response.send({"status":200, "message":"logged out"});
};

exports.signUp = function(request, response) {
	mysql.getConnection(function(connection) {
		console.log("pass: " + request.body.password);
		console.log(encryption.encrypt(request.body.password));
		var sqlQuery = sqlQueryList.getQueryForUserCreation(request.body.email, encryption.encrypt(request.body.password));
		dbHelper.executeQuery(connection,sqlQuery,function(rows){
			if(rows.hasOwnProperty('affectedRows') && rows.hasOwnProperty('affectedRows') == 1) {
				console.log("User created with email: " + request.body.email);
				sqlQuery = sqlQueryList.getUserPuidByEmailQuery(request.body.email);
				dbHelper.executeQuery(connection,sqlQuery,
						function(puidData){
							sqlQuery = sqlQueryList.getQueryForUserProfileCreation(
									puidData[0].puid, 
									request.body.handle,
									request.body.first_name,
									request.body.last_name,
									request.body.phone,
									request.body.city,
									request.body.birthday);
							dbHelper.executeQuery(connection,sqlQuery,
									function(result){
										dbHelper.closeConnection(connection);
										if(result.hasOwnProperty('affectedRows') && result.hasOwnProperty('affectedRows') == 1) {
											response.send({"status":201, "message":"user created"});
										}
										else {
											response.send({"status":400, "message":"user not created"});
										}
									},function(error){
										dbHelper.closeConnection(connection);
										response.send(error);
									});
						}, function(error){
							dbHelper.closeConnection(connection);
							response.send(error);
						});
			}
			else {
				dbHelper.closeConnection(connection);
				console.log("Login is failure");
				response.send({"message":"login failure"});
			}
		},function(error){
			dbHelper.closeConnection(connection);
			response.send(error);
		});
	},function(error){
		response.send(error);
	});
};

exports.getMyProfile = function(request, response) {
	if(request.session) {
		mysql.getConnection(function(connection) {
			var sqlQuery = sqlQueryList.getFollowerCountByPuid(request.session.profile.puid);
			dbHelper.executeQuery(connection,sqlQuery,function(followerCount){
				console.log(followerCount);
				request.session.profile.followerscount = followerCount[0].count;
				sqlQuery = sqlQueryList.getFollowingCountByPuid(request.session.profile.puid);
				dbHelper.executeQuery(connection,sqlQuery,function(followingCount){
					console.log(followingCount);
					request.session.profile.followingcount = followingCount[0].count;
					sqlQuery = sqlQueryList.getTweetsCountByPuid(request.session.profile.puid);
					dbHelper.executeQuery(connection,sqlQuery,function(tweetCount){
						dbHelper.closeConnection(connection);
						console.log(tweetCount);
						request.session.profile.tweetscount = tweetCount[0].count;
						request.session.profile.self_url = "/profile/me";
						response.send({"status":200,  "profile": request.session.profile});
					});
				});
			});
		});
	}
};

exports.postNewTweet = function(request, response) {
	if(request.session) {
		mysql.getConnection(function(connection) {
			var sqlQuery = sqlQueryList.getQueryForTweetCreation(request.session.profile.puid, request.body.tweet, request.session.profile.handle, request.session.profile.first_name, request.session.profile.last_name);
			dbHelper.executeQuery(connection,sqlQuery,function(createdTweet){
				console.log("Create Query Tweet: " + sqlQuery);
				console.log("Tweet created: " + createdTweet);
				if(createdTweet.affectedRows == 1) {
					if(request.body.tweet.indexOf('#') >= 0){
						var hashtag = helperFunctions.getHashTag(request.body.tweet, request.body.tweet.indexOf('#'));
						sqlQuery = sqlQueryList.getQueryForHashTagByHashtag(hashtag);
						dbHelper.executeQuery(connection,sqlQuery,function(hashTagId){
							if(hashTagId.length > 0){
								sqlQuery = sqlQueryList.getQueryForHashTagTweetsCreation(createdTweet.insertId, hashTagId[0].hashid);
								dbHelper.executeQuery(connection,sqlQuery,function(hashtagTweetInsertion){
									console.log(hashtagTweetInsertion);
									dbHelper.closeConnection(connection);
								});
							}
							else{
								sqlQuery = sqlQueryList.getQueryForHashTagEntryCreation(hashtag);
								dbHelper.executeQuery(connection,sqlQuery,function(hashTagInsertion){
									if(hashTagInsertion.affectedRows !== 0){
										var hashtagid = hashTagInsertion.insertId;
										sqlQuery = sqlQueryList.getQueryForHashTagTweetsCreation(createdTweet.insertId, hashtagid);
										dbHelper.executeQuery(connection,sqlQuery,function(hashtagTweetInsertion){
											console.log(hashtagTweetInsertion);
											dbHelper.closeConnection(connection);
										});
									}
								});
							}
						});
					}
					response.send({"status":200});
				}
				else {
					response.send({"status":404,"message":"ERROR NOT FOUND"});
				}
			});
		});
	}
};

exports.getTweets = function(request, response) {
	if(request.session) {
		mysql.getConnection(function(connection) {
			var sqlQuery = sqlQueryList.getQueryForGetMyTweets(request.session.profile.puid);
			dbHelper.executeQuery(connection,sqlQuery,function(mytweets){
				if(mytweets) {
					for(var index = 0; index < mytweets.length; index++){
						mytweets[index].self_url = "/profile/me";
					}
					sqlQuery = sqlQueryList.getQueryForFollowerTweets(request.session.profile.puid);
					dbHelper.executeQuery(connection,sqlQuery,function(followersTweets){
						for(var index = 0; index < followersTweets.length; index++){
							followersTweets[index].self_url = "/profile/" + followersTweets[index].puid;
						}
						mytweets = mytweets.concat(followersTweets);
						if(followersTweets.length !== 0) {
							dbHelper.closeConnection(connection);
							console.log(mytweets);
							response.send(mytweets);
							}
						else {
							dbHelper.closeConnection(connection);
							response.send(mytweets);
						}
					});
				}
			});
		});
	}
};

exports.getProfilesToFollow = function(request, response) {
	if(request.session) {
		mysql.getConnection(function(connection) {
			var sqlQuery = sqlQueryList.getQueryForNewUsersByPuid(request.session.profile.puid, 3);
			dbHelper.executeQuery(connection,sqlQuery,function(newProfiles){
				if(newProfiles) {
					console.log(newProfiles);
					dbHelper.closeConnection(connection);
					response.send(newProfiles);
				}
				else {
					dbHelper.closeConnection(connection);
					response.send({"status": 400, "message":"no profiles to show"});
				}
			});
		});
	}
};

exports.getProfileToFollow = function(request, response) {
	if(request.session) {
		mysql.getConnection(function(connection) {
			var sqlQuery = sqlQueryList.getQueryForNewUsersByPuid(request.session.profile.puid, 1);
			dbHelper.executeQuery(connection,sqlQuery,function(newProfiles){
				if(newProfiles) {
					console.log(newProfiles);
					dbHelper.closeConnection(connection);
					response.send(newProfiles);
				}
			});
		});
	}
};

exports.follow = function(request, response) {
	if(request.session) {
		mysql.getConnection(function(connection) {
			var sqlQuery = sqlQueryList.getQueryForUserFollowerCreation(request.session.profile.puid, request.body.followerid);
			dbHelper.executeQuery(connection,sqlQuery,function(followedResult){
				dbHelper.closeConnection(connection);
				response.send({"status": 200});
			});
		});
	}
};

exports.getHashTags = function(request, response) {
	if(request.session) {
		mysql.getConnection(function(connection) {
			var sqlQuery = sqlQueryList.getQueryForHashTagsInfo();
			dbHelper.executeQuery(connection,sqlQuery,function(hashtagsInfo){
				dbHelper.closeConnection(connection);
				response.send({"status": 200, "hashtagsInfo" : hashtagsInfo});
			});
		});
	}
};

exports.getTweetsForPuid = function(request, response) {
	if(request.session) {
		mysql.getConnection(function(connection) {
			var sqlQuery = sqlQueryList.getQueryForGetMyTweets(request.params.puid);
			dbHelper.executeQuery(connection,sqlQuery,function(mytweets){
				if(mytweets) {
					for(var index = 0; index < mytweets.length; index++){
						mytweets[index].self_url = "/profile/" + request.params.puid;
					}
					response.send(mytweets);
				}
				dbHelper.closeConnection(connection);
			});
		});
	}
};

exports.getProfileForPuid = function(request, response) {
	if(request.session) {
		mysql.getConnection(function(connection) {
			var sqlQuery = sqlQueryList.getQueryForUserProfileByPuid(request.params.puid);
			dbHelper.executeQuery(connection,sqlQuery,function(profile){
				sqlQuery = sqlQueryList.getFollowerCountByPuid(request.params.puid);
				dbHelper.executeQuery(connection,sqlQuery,function(followerCount){
					console.log(followerCount);
					profile[0].followerscount = followerCount[0].count;
					sqlQuery = sqlQueryList.getFollowingCountByPuid(request.params.puid);
					dbHelper.executeQuery(connection,sqlQuery,function(followingCount){
						console.log(followingCount);
						profile[0].followingcount = followingCount[0].count;
						sqlQuery = sqlQueryList.getTweetsCountByPuid(request.params.puid);
						dbHelper.executeQuery(connection,sqlQuery,function(tweetCount){
							dbHelper.closeConnection(connection);
							profile[0].tweetscount = tweetCount[0].count;
							profile[0].self_url = "/profile/" + request.params.puid;
							response.send({"status":200,  "profile": profile});
						});
					});
				});
			});
		});
	}
};

exports.getHashTagTweets = function(request, response) {
	if(request.session) {
		mysql.getConnection(function(connection) {
			var sqlQuery = sqlQueryList.getQueryForHashTagTweets(request.params.hashid);
			dbHelper.executeQuery(connection,sqlQuery,function(hashtagTweets){
				dbHelper.closeConnection(connection);
				for(var index = 0; index < hashtagTweets.length; index++){
					hashtagTweets[index].self_url = "/profile/" + hashtagTweets[index].puid;
				}
				response.send(hashtagTweets);
			});
		});
	}
};

exports.getHashTagMsg = function(request, response) {
	if(request.session) {
		mysql.getConnection(function(connection) {
			var sqlQuery = sqlQueryList.getQueryForHashTagMessage(request.params.hashid);
			dbHelper.executeQuery(connection,sqlQuery,function(hashtag){
				dbHelper.closeConnection(connection);
				response.send(hashtag);
			});
		});
	}
};

exports.getHashTagId = function(request, response) {
	if(request.session) {
		mysql.getConnection(function(connection) {
			var sqlQuery = sqlQueryList.getQueryForHashTagId(request.params.hashtag);
			dbHelper.executeQuery(connection,sqlQuery,function(hashid){
				dbHelper.closeConnection(connection);
				response.send(hashid);
			});
		});
	}
};

exports.getProfileByName = function(request, response) {
	if(request.session) {
		mysql.getConnection(function(connection) {
			var sqlQuery = sqlQueryList.getQueryforProfileIdbyName(request.params.name);
			dbHelper.executeQuery(connection,sqlQuery,function(profileid){
				dbHelper.closeConnection(connection);
				response.send(profileid);
			});
		});
	}
};