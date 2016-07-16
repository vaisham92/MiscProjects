/**
 * twitter-core.js
 * 
 * @author Vaishampayan Reddy
 */
var dbHelper = require('./db-helper');
var sqlQueryList = require('./sqlQueries');
var helperFunctions = require('./helper-functions');
var encryption = require('./encryption-helper');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/twitterdb";

exports.isLoggedIn = function(request, callback) {
};

exports.logIn_handle = function(request, callback) {
	try {
		mongo.connect(mongoURL, function() {
	        var Users = mongo.collection('Users');
	        dbHelper.readOne(Users, {
                "email": request.email
            }, null, function(cursor) {
            	if(cursor === null) {
            		callback({
                		"status": 401, 
                		"message": "Error: No Account exists for the given email"
                	});
            	}
            	else {
            		if(encryption.encrypt(request.password)===cursor.password) {
                    	callback({
                    		"status": 200, 
                    		"message": "Logged in Successfully",
                    		"id" : cursor._id
                    	});
                    }
            	}
            });
	    });
	}
	catch (err) {
		callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
	}
};

exports.logOut = function(request, callback) {
    callback({
        "status": 200,
        "message": "logged out"
    });
};

exports.signUp_handle = function(request, callback) {
	try {
		mongo.connect(mongoURL, function() {
			var Users = mongo.collection('Users');
			var User_profiles = mongo.collection('User_profiles');
			dbHelper.doesExistInDb(Users, {
				"email" : request.email
			}, function() {
				callback({
					"status" : 400,
					"message" : "Error: Email already exists"
				});
			}, function() {
				dbHelper.insertIntoCollection(Users, {
					"email" : request.email,
					"password" : encryption.encrypt(request.password)
				}, function() {
					dbHelper.readOne(Users, {
						"email" : request.email
					}, null, function(user) {
						//console.log("User: " + user);
						dbHelper.insertIntoCollection(User_profiles, {
							"handle" : request.handle,
							"first_name" : request.first_name,
							"last_name" : request.last_name,
							"phone" : request.phone,
							"city" : request.city,
							"birthday" : request.birthday,
							"puid" : user._id.toString()
						}, function() {
							callback({
								"status" : 201,
								"message" : "user created and signed up"
							});
						});
					});
				});
			});
		});
	} catch (err) {
		callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
	}
};

exports.getMyProfile_handle = function(request, callback) {
   	try {
		mongo.connect(mongoURL, function() {
			var User_profiles = mongo.collection('User_profiles');
			dbHelper.readOne(User_profiles, {"puid": request.puid}, null, function(data){
				var profile = {};
				profile.first_name = data.first_name;
				profile.last_name = data.last_name;
				profile.handle = data.handle;
				profile.phone = data.phone;
				profile.city = data.city;
				profile.birthday = data.birthday;
				var followers = mongo.collection('Followers');
					dbHelper.count(followers, {
						"puid" : request.puid
					}, 
					function(followersCount){
						profile.followerscount = followersCount;
						dbHelper.count(followers, {
							"followerid" : request.puid
						},
						function(followingCount) {
							profile.followingcount = followingCount;
							var tweets = mongo.collection("Tweets");
							dbHelper.count(tweets, {
								"puid" : request.puid
							},
							function(tweetCount) {
								profile.tweetscount = tweetCount;
								profile.self_url = "/profile/me";
								callback({
									"status" : 200,
									"profile" : profile
								});
							});
						});
					});
				});
			});
	}
	catch(error) {
		callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + error
		});
	}
};

exports.postNewTweet_handle = function(request, callback) {
    try {
    	mongo.connect(mongoURL, function() {
    		var tweets = mongo.collection('Tweets');
            dbHelper.insertIntoCollection(tweets, {
            	"puid": request.puid,
                "tweet": request.tweet,
                "handle": request.handle,
                "first_name": request.first_name,
                "last_name": request.last_name
            },
            function() {
            	if (request.tweet.indexOf('#') >= 0) {
            		var hashtag = helperFunctions.getHashTag(request.tweet, request.tweet.indexOf('#'));
                    var hashtags = mongo.collection("HashTags");
                    dbHelper.doesExistInDb(
                    		hashtags, 
                            {
                                "hashtag": hashtag
                            },
                            function() {
                            	dbHelper.readOne(
                                        hashtags,
                                        null,
                                        null,
                                        function(hashtagInfo) {
                                        	dbHelper.readOne(
                                        			tweets, {
                                        				"tweet": request.tweet
                                        			},
                                        			null,
                                        			function(tweetInfo) {
                                        				var hashtagTweets = mongo.collection("HashTagTweets");
                                        				dbHelper.insertIntoCollection(hashtagTweets, {
                                        					"tweetid": tweetInfo._id.toString(),
                                        					"hashid": hashtagInfo._id.toString()
                                        				}, function() {
                                        					callback({
                                        						"status": 201,
                                        						"message": "Tweet posted successfully"
                                        					});
                                                });
                                            });
                                        });
                            }, 
                            function() {
                            	dbHelper.insertIntoCollection(hashtags, {
                                    "hashtag": hashtag
                                }, function() {
                                    dbHelper.readOne(hashtags,
                                        null,
                                        null,
                                        function(hashtagInfo) {
                                            dbHelper.readOne(tweets, {
                                                    "tweet": request.tweet
                                                },
                                                null,
                                                function(tweetInfo) {
                                                    var hashtagTweets = mongo.collection("HashTagTweets");
                                                    dbHelper.insertIntoCollection(hashtagTweets, {
                                                        "tweetid": tweetInfo._id.toString(),
                                                        "hashid": hashtagInfo._id.toString()
                                                    }, function() {
                                                        callback({
                                                            "status": 201,
                                                            "message": "Tweet posted successfully"
                                                        });
                                                    });
                                                });
                                        });
                                });
                            });
            	}
            	else {
            		callback({
            			"status": 201,
            			"message": "Tweet posted successfully"
            		});
            	}
            });
    	});
    }
    catch (err) {
    	callback({
    		"status": 500,
    		"message": "Error: Cannot connect to mongodb: " + err
    	});
    }
};
  
exports.getTweets_handle = function(request, callback) {
	try {
		var tweets = mongo.collection("Tweets");
		dbHelper.read(tweets, {
			"puid": request.puid
		},
		null,
		{
			"limit" : 20,
			"skip" : 0
		}, 
		function(selfTweets){
			for(var index = 0; index < selfTweets.length; index++) {
				selfTweets[index].self_url = "/profile/me";
			}
			var followers = mongo.collection("Followers");
			dbHelper.read(followers, {
				"puid" : request.puid 
			},
			{
				"_id" : 1
			},
			null, function(followingIds) {
				var followingTweets = [];
				for(var followingId in followingIds) {
					dbHelper.read(tweets, {
						"puid": followingId._id
					}, 
					null, 
					null, 
					function(followingIdTweets){
						followingTweets = followingTweets.concat(followingIdTweets);
					});
				}
				for(var index = 0; index < followingTweets.length; index++) {
					followingTweets[index].self_url = "/profile/" + followingTweets[index].puid; 
				}
				selfTweets = selfTweets.concat(followingTweets);
				callback({
					"status": 200,
					"tweets": selfTweets
				});
			});
		});
	}
	catch (err) {
		callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
	}
};

exports.getProfilesToFollow_handle = function(request, callback) {
	try {
		mongo.connect(mongoURL, function() {
			var followers = mongo.collection('Followers');
			dbHelper.read(followers, 
					{
				"puid" : request.puid
				}, 
					{
					"followerid": 1
				}, 
				null,
				function(dataArray) {
					var followers = [];
					for(var item in dataArray) {
						followers.push(item.followerid);
					}
					var searchData = {};
					searchData["$nin"] = followers;
					var User_profiles = mongo.collection('User_profiles');
					dbHelper.read(User_profiles,{
						"puid" : searchData, 
					},
					null, 
					{
						"limit" : 3
					}, 
					function(profiles) {
						for(var index = 0; index < profiles.length; index++) {
							profiles[index].self_url = "/profile/" + profiles[index].puid;
						}
						callback({
							"status" : 200,
							"profiles" : profiles
						});
					});
				});
			});
		}
	catch (err) {
		callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
	}
};
  

exports.getProfileToFollow_handle = function(request, callback) {
	try {
		mongo.connect(mongoURL, function() {
			var followers = mongo.collection('Followers');
			dbHelper.read(followers, 
					{
				"puid" : request.puid
				}, 
					{
					"followerid": 1
				}, 
				null,
				function(dataArray) {
					var followers = [];
					for(var item in dataArray) {
						followers.push(item.followerid);
					}
					var searchData = {};
					searchData["$nin"] = followers;
					var User_profiles = mongo.collection('User_profiles');
					dbHelper.read(User_profiles,{
						"puid" : searchData, 
					},
					null, 
					{
						"limit" : 1
					}, 
					function(profiles) {
						for(var index = 0; index < profiles.length; index++) {
							profiles[index].self_url = "/profile/" + profiles[index].puid;
						}
						callback({
							"status" : 200,
							"profile" : profiles
						});
					});
				});
			});
		}
	catch (err) {
		callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
	}
};

exports.follow_handle = function(request, callback) { 
	try {
		mongo.connect(mongoURL, function() {
			var followers = mongo.collection('Followers');
        	dbHelper.insertIntoCollection(followers, {
        		"puid" : request.puid,
        		"followerid" : request.followerid
        	}, function() {
        		callback({
        			"status": 200,
        			"message": "Following user"
        		});
        	});
		});
	}
	catch (err) {
		callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
	}
};
  
exports.getHashTags_handle = function(request, callback) {
    try {
    	var hashTags = mongo.collection("HashTags");
    	dbHelper.read(hashTags,
    			null,
    			null,
    			null,
    			function(hashTags){
    				if(hashTags !== null) {
    					for(var index = 0; index < hashTags.length; index++) {
	        				hashTags[index].self_url = "/hashtag/" + hashTags[index]._id;
	        			}
	        			callback({
        					"status": 200,
        					"hashtagsInfo": hashTags
        				});
    				}
    				else {
    					callback({
        					"status": 200,
        					"hashtagsInfo": []
        				});
    				}
    	});
    }
    catch (err) {
    	callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
    }
};
  
exports.getTweetsForPuid_handle = function(request, callback) {
	try {
		var tweets = mongo.collection("Tweets");
		dbHelper.read(tweets, {
			"puid" : request.puid
		}, 
		null, 
		null, 
		function(tweets) {
			for(var index = 0; index < tweets.length; index++) {
				tweets[index].self_url = "/profile/" + tweets[index].puid;
			}
			callback({
				"status" : 200,
				"tweets" : tweets
			});
		});
	}
	catch (err) {
		callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
	}
};

exports.getProfileForPuid_handle = function(request, callback) {
	try {
		mongo.connect(mongoURL, function() {
			var User_profiles = mongo.collection('User_profiles');
			dbHelper.readOne(User_profiles, {"puid": request.puid}, null, function(data){
				var profile = {};
				profile.first_name = data.first_name;
				profile.last_name = data.last_name;
				profile.handle = data.handle;
				profile.phone = data.phone;
				profile.city = data.city;
				profile.birthday = data.birthday;
				profile.puid = data.puid;
				var followers = mongo.collection('Followers');
					dbHelper.count(followers, {
						"puid" : request.puid
					}, 
					function(followersCount){
						profile.followerscount = followersCount;
						dbHelper.count(followers, {
							"followerid" : request.puid
						},
						function(followingCount) {
							profile.followingcount = followingCount;
							var tweets = mongo.collection("Tweets");
							dbHelper.count(tweets, {
								"puid" : request.puid
							},
							function(tweetCount) {
								profile.tweetscount = tweetCount;
								profile.self_url = "/profile/" + data.puid;
								callback({
									"status" : 200,
									"profile" : profile
								});
							});
						});
					});
				});
			});
	}
	catch (err) {
		callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
	}
};

exports.getHashTagTweets_handle = function(request, callback) {
	try {
		var hashTagTweets = mongo.collection("HashTagTweets");
		dbHelper.read(hashTagTweets, 
				{
					"hashid" : request.hashid
				},
				function(TweetIds) {
					var Tweets = [];
					var tweets = mongo.collection("Tweets");
					for(var TweetId in TweetIds) {
						dbHelper.read(tweets, {
							"_id" : TweetId.tweetId
						}, 
						function(tweet) {
							tweet[0].self_url = "/profile/" + tweet[0].puid;
							Tweets = Tweets.concat(tweet);
						});
					}
					callback(Tweets);
				});
	}
	catch(err) {
		callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
	}
};
  
exports.getHashTagMsg_handle = function(request, callback) {
	try {
		var hashTags = mongo.collection("HashTags");
		dbHelper.read(hashTags,{
			"_id" : request.hashid
		},
		null,
		null,
		function(hashtag){
			callback({
				"status": 200,
				"hashtag" : hashtag
			});
		});
	}
	catch(err) {
		callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
	}
};
  
exports.getHashTagId_handle = function(request, callback) {
	try {
		var hashTags = mongo.collection("HashTags");
		dbHelper.readOne(hashTags, {
			"hashtag" : request.hashtag
		},
		function(hashid) {
			callback({
				"status" : 200,
				"hashid" : hashid.hashid
			});
		});
	}
	catch(err) {
		callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
	}
};
  
exports.getProfileByName_handle = function(request, callback) {
	try {
		var User_profiles = mongo.collection("User_profiles");
		dbHelper.readOne(User_profiles, {
			"$or" : [
			         {"first_name" : "/.*" + request.name + ".*/"},
			         {"last_name" : "/.*" + request.name + ".*/"},
			         {"handle" : "/.*" + request.name + ".*/"}
			     ]
		},
		function(profile){
			callback({
				"status": 200,
				"profile" : profile
			});
		});
	}
	catch(err) {
		callback({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});    			
	}
};