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

exports.isLoggedIn = function(request, response) {
    if (request.session) {
        if (request.session.isLoggedIn) {
            response.send({
                "status": 200,
                "message": "logged in"
            });
        } else {
            response.send({
                "status": 401,
                "message": "logged out"
            });
        }
    } else {
        response.send({
            "status": 401,
            "message": "logged out"
        });
    }
};

exports.logIn = function(request, response) {
	try {
		mongo.connect(mongoURL, function() {
	        //console.log('Connected to mongo at: ' + mongoURL);
	        var Users = mongo.collection('Users');
	        dbHelper.readOne(Users, {
                "email": request.body.email
            }, null, function(cursor) {
            	if(cursor === null) {
            		response.send({
                		"status": 401, 
                		"message": "Error: No Account exists for the given email"
                	});
            	}
            	else {
            		if(encryption.encrypt(request.body.password)===cursor.password) {
                    	request.session.profile = {};
                    	request.session.profile.puid = cursor._id;
                    	//console.log("request.session.profile.puid = cursor._id: " + cursor._id);
                    	request.session.profile.email = request.body.password;
                    	response.send({
                    		"status": 200, 
                    		"message": "Logged in Successfully"
                    	});
                    }
            	}
            });
	    });
	}
	catch (err) {
		response.send({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
	}
};

exports.logOut = function(request, response) {
    request.session.reset();
    response.send({
        "status": 200,
        "message": "logged out"
    });
};

exports.signUp = function(request, response) {
	try {
		mongo.connect(mongoURL, function() {
			//console.log('Connected to mongo at: ' + mongoURL);
			var Users = mongo.collection('Users');
			var User_profiles = mongo.collection('User_profiles');
			dbHelper.doesExistInDb(Users, {
				"email" : request.body.email
			}, function() {
				response.send({
					"status" : 400,
					"message" : "Error: Email already exists"
				});
			}, function() {
				dbHelper.insertIntoCollection(Users, {
					"email" : request.body.email,
					"password" : encryption.encrypt(request.body.password)
				}, function() {
					dbHelper.readOne(Users, {
						"email" : request.body.email
					}, null, function(user) {
						//console.log("User: " + user);
						dbHelper.insertIntoCollection(User_profiles, {
							"handle" : request.body.handle,
							"first_name" : request.body.first_name,
							"last_name" : request.body.last_name,
							"phone" : request.body.phone,
							"city" : request.body.city,
							"birthday" : request.body.birthday,
							"puid" : user._id.toString()
						}, function() {
							response.send({
								"status" : 201,
								"message" : "user created and signed up"
							});
						});
					});
				});
			});
		});
	} catch (err) {
		response.send({
			"status" : 500,
			"message" : "Error: Cannot connect to mongodb: " + err
		});
	}
};

  exports.getMyProfile = function(request, response) {
	  //console.log("In get My profile");
	    if (request.session && request.session.profile) {
	    	//console.log("session is created");
	    	try {
	    		mongo.connect(mongoURL, function() {
		    		//console.log('Connected to mongo at: ' + mongoURL);
					var User_profiles = mongo.collection('User_profiles');
					dbHelper.readOne(User_profiles, {"puid": request.session.profile.puid}, null, function(data){
						request.session.profile.first_name = data.first_name;
						request.session.profile.last_name = data.last_name;
						request.session.profile.handle = data.handle;
						request.session.profile.phone = data.phone;
						request.session.profile.city = data.city;
						request.session.profile.birthday = data.birthday;
						var followers = mongo.collection('Followers');
							dbHelper.count(followers, {
								"puid" : request.session.profile.puid
							}, 
							function(followersCount){
								request.session.profile.followerscount = followersCount;
								dbHelper.count(followers, {
									"followerid" : request.session.profile.puid
								},
								function(followingCount) {
									request.session.profile.followingcount = followingCount;
									var tweets = mongo.collection("Tweets");
									dbHelper.count(tweets, {
										"puid" : request.session.profile.puid
									},
									function(tweetCount) {
										request.session.profile.tweetscount = tweetCount;
										request.session.profile.self_url = "/profile/me";
										response.send({
											"status" : 200,
											"profile" : request.session.profile
										});
									});
								});
							});
						});
	    			});
	    		}
		    	catch(error) {
					response.send({
						"status" : 500,
						"message" : "Error: Cannot connect to mongodb: " + error
					});
		    	}
	    }
	    else {
	    	response.send({
	    		"status" : 403,
	    		"message" : "Error: Cannot find session"
	    	});
	    }
};

exports.postNewTweet = function(request, response) {
    if (request.session) {
        if (request.session.profile) {
            try {
            	mongo.connect(mongoURL, function() {
            		var tweets = mongo.collection('Tweets');
                    dbHelper.insertIntoCollection(tweets, {
                    	"puid": request.session.profile.puid,
                        "tweet": request.body.tweet,
                        "handle": request.session.profile.handle,
                        "first_name": request.session.profile.first_name,
                        "last_name": request.session.profile.last_name
                    },
                    function() {
                    	if (request.body.tweet.indexOf('#') >= 0) {
                    		var hashtag = helperFunctions.getHashTag(request.body.tweet, request.body.tweet.indexOf('#'));
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
                                                				"tweet": request.body.tweet
                                                			},
                                                			null,
                                                			function(tweetInfo) {
                                                				var hashtagTweets = mongo.collection("HashTagTweets");
                                                				dbHelper.insertIntoCollection(hashtagTweets, {
                                                					"tweetid": tweetInfo._id.toString(),
                                                					"hashid": hashtagInfo._id.toString()
                                                				}, function() {
                                                					response.send({
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
                                                            "tweet": request.body.tweet
                                                        },
                                                        null,
                                                        function(tweetInfo) {
                                                            var hashtagTweets = mongo.collection("HashTagTweets");
                                                            dbHelper.insertIntoCollection(hashtagTweets, {
                                                                "tweetid": tweetInfo._id.toString(),
                                                                "hashid": hashtagInfo._id.toString()
                                                            }, function() {
                                                                response.send({
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
                    		response.send({
                    			"status": 201,
                    			"message": "Tweet posted successfully"
                    		});
                    	}
                    });
            	});
            }
            catch (err) {
            	response.send({
            		"status": 500,
            		"message": "Error: Cannot connect to mongodb: " + err
            	});
            }
        }
        else {
        	response.send({
        		"status": 403,
        		"message": "Error: Cannot find user profile"
        	});
        }
	} 
    else {
    	response.send({
    		"status": 403,
    		"message": "Error: Cannot find session"
    	});
	}
};
  
exports.getTweets = function(request, response) {
    if (request.session) {
        if(request.session.profile) {
        	try {
        		var tweets = mongo.collection("Tweets");
        		dbHelper.read(tweets, {
        			"puid": request.session.profile.puid
        		},
        		null,
        		{
        			"limit" : 20,
        			"skip" : request.body.selfTweetCount
        		}, 
        		function(selfTweets){
        			//console.log("selfTweets: " + JSON.stringify(selfTweets));
        			for(var index = 0; index < selfTweets.length; index++) {
        				selfTweets[index].self_url = "/profile/me";
        			}
        			var followers = mongo.collection("Followers");
        			dbHelper.read(followers, {
        				"puid" : request.session.profile.puid 
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
        						//console.log("followingIdTweets: " + JSON.stringify(followingIdTweets));
        						followingTweets = followingTweets.concat(followingIdTweets);
        					});
        				}
        				for(var index = 0; index < followingTweets.length; index++) {
        					followingTweets[index].self_url = "/profile/" + followingTweets[index].puid; 
        				}
        				selfTweets = selfTweets.concat(followingTweets);
        				response.send({
        					"status": 200,
        					"tweets": selfTweets
        				});
        			});
        		});
        	}
        	catch (err) {
        		response.send({
	    			"status" : 500,
	    			"message" : "Error: Cannot connect to mongodb: " + err
	    		});
        	}
        }
        else {
        	response.send({
    			"status" : 403,
    			"message" : "Error: Cannot find user profile"
    		});
        } 
    }
    else {
    	response.send({
    		"status" : 403,
    		"message" : "Error: Cannot find session"
    	});
    }
};

exports.getProfilesToFollow = function(request, response) {
	if (request.session) {
    	if(request.session.profile) {
    		try {
	    		mongo.connect(mongoURL, function() {
		    		//console.log('Connected to mongo at: ' + mongoURL);
					var followers = mongo.collection('Followers');
					dbHelper.read(followers, 
							{
						"puid" : request.session.profile.puid
						}, 
							{
							"followerid": 1
						}, 
						null,
						function(dataArray) {
							//console.log("dataArray: " + dataArray);
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
								//console.log("profiles: " + profiles);
								for(var index = 0; index < profiles.length; index++) {
									profiles[index].self_url = "/profile/" + profiles[index].puid;
								}
								response.send({
									"status" : 200,
									"profiles" : profiles
								});
							});
						});
					});
				}
			catch (err) {
				
			}
    	}
    	else {
    		response.send({
    			"status" : 403,
    			"message" : "Error: Cannot find user profile"
    		});
    	}
    }
    else {
    	response.send({
    		"status" : 403,
    		"message" : "Error: Cannot find user session"
    	});
    }
};
  

exports.getProfileToFollow = function(request, response) {
	if (request.session) {
    	if(request.session.profile) {
    		try {
	    		mongo.connect(mongoURL, function() {
		    		//console.log('Connected to mongo at: ' + mongoURL);
					var followers = mongo.collection('Followers');
					dbHelper.read(followers, 
							{
						"puid" : request.session.profile.puid
						}, 
							{
							"followerid": 1
						}, 
						null,
						function(dataArray) {
							//console.log("dataArray: " + dataArray);
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
								//console.log("profiles: " + profiles);
								for(var index = 0; index < profiles.length; index++) {
									profiles[index].self_url = "/profile/" + profiles[index].puid;
								}
								response.send({
									"status" : 200,
									"profile" : profiles
								});
							});
						});
					});
				}
			catch (err) {
				
			}
    	}
    	else {
    		response.send({
    			"status" : 403,
    			"message" : "Error: Cannot find user profile"
    		});
    	}
    }
    else {
    	response.send({
    		"status" : 403,
    		"message" : "Error: Cannot find user session"
    	});
    }
};

exports.follow = function(request, response) { 
    if (request.session) {
        if (request.session.profile) {
        	try {
        		mongo.connect(mongoURL, function() {
        			//console.log('Connected to mongo at: ' + mongoURL);
        			var followers = mongo.collection('Followers');
                	dbHelper.insertIntoCollection(followers, {
                		"puid" : request.session.profile.puid,
                		"followerid" : request.body.followerid
                	}, function() {
                		response.send({
                			"status": 200,
                			"message": "Following user"
                		});
                	});
        		});
        	}
        	catch (err) {
        		response.send({
        			"status" : 500,
        			"message" : "Error: Cannot connect to mongodb: " + err
        		});
        	}
        } 
        else {
        	response.send({
    			"status" : 403,
    			"message" : "Error: Cannot find user profile"
    		});
        }
    } else {
    	response.send({
			"status" : 403,
			"message" : "Error: Cannot find user session"
		});
    }
};
  
exports.getHashTags = function(request, response) {
    if (request.session) {
    	if(request.session.profile) {
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
			        				console.log(JSON.stringify(hashTags));
			        				console.log(index);
			        			}
			        			response.send({
		        					"status": 200,
		        					"hashtagsInfo": hashTags
		        				});
	        				}
	        	});
	        }
	        catch (err) {
	        	response.send({
        			"status" : 500,
        			"message" : "Error: Cannot connect to mongodb: " + err
        		});
	        }
    	}
    	else {
    		response.send({
    			"status" : 403,
    			"message" : "Error: Cannot find user profile"
    		});
    	}
    }
    else {
    	response.send({
			"status" : 403,
			"message" : "Error: Cannot find user session"
		});
    }
};
  
exports.getTweetsForPuid = function(request, response) {
    if (request.session) {
    	if(request.session.profile) {
    		try {
    			var tweets = mongo.collection("Tweets");
    			dbHelper.read(tweets, {
    				"puid" : request.params.puid
    			}, 
    			null, 
    			null, 
    			function(tweets) {
    				for(var index = 0; index < tweets.length; index++) {
    					tweets[index].self_url = "/profile/" + tweets[index].puid;
    				}
    				response.send({
    					"status" : 200,
    					"tweets" : tweets
    				});
    			});
    		}
    		catch (err) {
    			response.send({
        			"status" : 500,
        			"message" : "Error: Cannot connect to mongodb: " + err
        		});
    		}
    	}
    	else {
    		response.send({
    			"status" : 403,
    			"message" : "Error: Cannot find user profile"
    		});
    	}
    }
    else {
    	response.send({
			"status" : 403,
			"message" : "Error: Cannot find user session"
		});
    }
};

exports.getProfileForPuid = function(request, response) {
    if (request.session) {
        if(request.session.profile) {
        	try {
        		mongo.connect(mongoURL, function() {
		    		//console.log('Connected to mongo at: ' + mongoURL);
					var User_profiles = mongo.collection('User_profiles');
					dbHelper.readOne(User_profiles, {"puid": request.params.puid}, null, function(data){
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
								"puid" : request.params.puid
							}, 
							function(followersCount){
								request.session.profile.followerscount = followersCount;
								dbHelper.count(followers, {
									"followerid" : request.params.puid
								},
								function(followingCount) {
									request.session.profile.followingcount = followingCount;
									var tweets = mongo.collection("Tweets");
									dbHelper.count(tweets, {
										"puid" : request.params.puid
									},
									function(tweetCount) {
										profile.tweetscount = tweetCount;
										profile.self_url = "/profile/" + data.puid;
										response.send({
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
        		response.send({
        			"status" : 500,
        			"message" : "Error: Cannot connect to mongodb: " + err
        		});
        	}
        }
        else {
        	response.send({
    			"status" : 403,
    			"message" : "Error: Cannot find user profile"
    		});
        }
    }
    else {
    	response.send({
			"status" : 403,
			"message" : "Error: Cannot find user session"
		});
    }
};

exports.getHashTagTweets = function(request, response) {
    if (request.session) {
        if(request.session.profile) {
        	try {
        		var hastTagTweets = mongo.collection("HashTagTweets");
        		dbHelper.read(hashTagTweets, 
        				{
        					"hashid" : request.params.hashid
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
        					response.send(Tweets);
        				});
        	}
        	catch(err) {
        		response.send({
        			"status" : 500,
        			"message" : "Error: Cannot connect to mongodb: " + err
        		});
        	}
        }
        else {
        	response.send({
    			"status" : 403,
    			"message" : "Error: Cannot find user profile"
    		});
        }
    }
    else {
    	response.send({
			"status" : 403,
			"message" : "Error: Cannot find user session"
		});
    }
};
  
exports.getHashTagMsg = function(request, response) {
    if (request.session) {
        if(request.session.profile) {
        	try {
        		var hashTags = mongo.collection("HashTags");
        		dbHelper.read(hashTags,{
        			"_id" : request.params.hashid
        		},
        		null,
        		null,
        		function(hashtag){
        			response.send({
        				"status": 200,
        				"hashtag" : hashtag
        			});
        		});
        	}
        	catch(err) {
        		response.send({
        			"status" : 500,
        			"message" : "Error: Cannot connect to mongodb: " + err
        		});
        	}
        }
        else {
        	response.send({
    			"status" : 403,
    			"message" : "Error: Cannot find user profile"
    		});
        }
    }
    else {
    	response.send({
			"status" : 403,
			"message" : "Error: Cannot find user session"
		});
    }
};
  
exports.getHashTagId = function(request, response) {
    if (request.session) {
    	if(request.session.profile) {
    		try {
    			var hashTags = mongo.collection("HashTags");
    			dbHelper.readOne(hashTags, {
    				"hashtag" : request.params.hashtag
    			},
    			function(hashid) {
    				response.send({
    					"status" : 200,
    					"hashid" : hashid.hashid
    				});
    			});
    		}
    		catch(err) {
    			response.send({
        			"status" : 500,
        			"message" : "Error: Cannot connect to mongodb: " + err
        		});
    		}
    	}
    	else {
    		response.send({
    			"status" : 403,
    			"message" : "Error: Cannot find user profile"
    		});
    	}
    }
    else {
    	response.send({
			"status" : 403,
			"message" : "Error: Cannot find user session"
		});
    }
};
  
exports.getProfileByName = function(request, response) {
    if (request.session) {
    	if(request.session.profile) {
    		try {
    			var User_profiles = mongo.collection("User_profiles");
    			dbHelper.readOne(User_profiles, {
    				"$or" : [
    				         {"first_name" : "/.*" + request.params.name + ".*/"},
    				         {"last_name" : "/.*" + request.params.name + ".*/"},
    				         {"handle" : "/.*" + request.params.name + ".*/"}
    				     ]
    			},
    			function(profile){
    				response.send({
    					"status": 200,
    					"profile" : profile
    				});
    			});
    		}
    		catch(err) {
    			response.send({
        			"status" : 500,
        			"message" : "Error: Cannot connect to mongodb: " + err
        		});    			
    		}
    	}
    	else {
    		response.send({
    			"status" : 403,
    			"message" : "Error: Cannot find user profile"
    		});
    	}
    }
    else {
    	response.send({
			"status" : 403,
			"message" : "Error: Cannot find user session"
		});
    }
};